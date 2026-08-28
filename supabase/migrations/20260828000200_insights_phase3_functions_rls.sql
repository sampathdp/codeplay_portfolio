-- CodePlay Insights — Phase 3
-- Cluster triage RPCs, settings write RPC, and RLS for the new tables.

-- ---------------------------------------------------------------------------
-- RLS: every Phase 3 table is admin-only (no public exposure). The
-- discovery engine writes with the service role, which bypasses RLS.
-- ---------------------------------------------------------------------------

alter table insights_settings         enable row level security;
alter table insights_topic_clusters   enable row level security;
alter table insights_ingestion_runs   enable row level security;

drop policy if exists insights_settings_admin on insights_settings;
create policy insights_settings_admin on insights_settings
  for all using (insights_is_admin()) with check (insights_is_admin());

drop policy if exists insights_topic_clusters_admin on insights_topic_clusters;
create policy insights_topic_clusters_admin on insights_topic_clusters
  for all using (insights_is_admin()) with check (insights_is_admin());

drop policy if exists insights_ingestion_runs_admin on insights_ingestion_runs;
create policy insights_ingestion_runs_admin on insights_ingestion_runs
  for all using (insights_is_admin()) with check (insights_is_admin());

grant select, insert, update, delete on
  insights_settings, insights_topic_clusters, insights_ingestion_runs
to authenticated;

grant all on
  insights_settings, insights_topic_clusters, insights_ingestion_runs
to service_role;

-- ---------------------------------------------------------------------------
-- Cluster triage RPCs — authorized, audited. Mirror the Phase 2 pattern:
-- security definer + pinned search_path + insights_require_admin().
-- ---------------------------------------------------------------------------

create or replace function insights_select_cluster(p_id uuid, p_reason text default null)
returns insights_topic_clusters
language plpgsql
security definer
set search_path = public
as $$
declare v_row insights_topic_clusters;
begin
  perform insights_require_admin();

  update insights_topic_clusters
     set status           = 'selected',
         selection_reason = coalesce(p_reason, selection_reason, 'selected by admin')
   where id = p_id
   returning * into v_row;

  if not found then
    raise exception 'cluster % not found', p_id using errcode = 'P0002';
  end if;

  perform insights_log_admin_action('select', 'topic_cluster', p_id::text,
    jsonb_build_object('title', v_row.title, 'viral_score', v_row.viral_score));
  return v_row;
end;
$$;

create or replace function insights_reject_cluster(p_id uuid, p_reason text default null)
returns insights_topic_clusters
language plpgsql
security definer
set search_path = public
as $$
declare v_row insights_topic_clusters;
begin
  perform insights_require_admin();

  update insights_topic_clusters
     set status           = 'rejected',
         rejection_reason = p_reason
   where id = p_id
   returning * into v_row;

  if not found then
    raise exception 'cluster % not found', p_id using errcode = 'P0002';
  end if;

  perform insights_log_admin_action('reject', 'topic_cluster', p_id::text,
    jsonb_build_object('reason', p_reason));
  return v_row;
end;
$$;

create or replace function insights_ignore_cluster(p_id uuid, p_reason text default null)
returns insights_topic_clusters
language plpgsql
security definer
set search_path = public
as $$
declare v_row insights_topic_clusters;
begin
  perform insights_require_admin();

  update insights_topic_clusters
     set status           = 'ignored',
         rejection_reason = coalesce(p_reason, rejection_reason)
   where id = p_id
   returning * into v_row;

  if not found then
    raise exception 'cluster % not found', p_id using errcode = 'P0002';
  end if;

  perform insights_log_admin_action('ignore', 'topic_cluster', p_id::text,
    jsonb_build_object('reason', p_reason));
  return v_row;
end;
$$;

create or replace function insights_force_research_cluster(p_id uuid)
returns insights_topic_clusters
language plpgsql
security definer
set search_path = public
as $$
declare v_row insights_topic_clusters;
begin
  perform insights_require_admin();

  update insights_topic_clusters
     set research_forced   = true,
         status            = 'selected',
         selection_reason  = coalesce(selection_reason, 'research forced by admin')
   where id = p_id
   returning * into v_row;

  if not found then
    raise exception 'cluster % not found', p_id using errcode = 'P0002';
  end if;

  perform insights_log_admin_action('force_research', 'topic_cluster', p_id::text, '{}'::jsonb);
  return v_row;
end;
$$;

-- Merge cluster p_source into p_target: reassign its candidates, sum the
-- source counts, retire the source cluster.
create or replace function insights_merge_clusters(p_source uuid, p_target uuid)
returns insights_topic_clusters
language plpgsql
security definer
set search_path = public
as $$
declare v_row insights_topic_clusters;
begin
  perform insights_require_admin();

  if p_source = p_target then
    raise exception 'cannot merge a cluster into itself' using errcode = '22023';
  end if;

  update insights_news_candidates
     set cluster_id = p_target
   where cluster_id = p_source;

  update insights_topic_clusters t
     set source_count = (
       select count(*) from insights_news_candidates c where c.cluster_id = t.id
     ),
         last_seen_at = greatest(t.last_seen_at, (
           select coalesce(max(discovered_at), t.last_seen_at)
           from insights_news_candidates c where c.cluster_id = t.id
         ))
   where t.id = p_target
   returning * into v_row;

  update insights_topic_clusters
     set status = 'filtered',
         rejection_reason = 'merged into ' || p_target::text,
         source_count = 0
   where id = p_source;

  perform insights_log_admin_action('merge', 'topic_cluster', p_source::text,
    jsonb_build_object('into', p_target));
  return v_row;
end;
$$;

-- Admin write for engine configuration.
create or replace function insights_set_setting(p_key text, p_value jsonb)
returns insights_settings
language plpgsql
security definer
set search_path = public
as $$
declare v_row insights_settings;
begin
  perform insights_require_admin();

  insert into insights_settings (key, value)
  values (p_key, p_value)
  on conflict (key) do update set value = excluded.value, updated_at = now()
  returning * into v_row;

  perform insights_log_admin_action('set_setting', 'setting', p_key, p_value);
  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

revoke all on function insights_select_cluster(uuid, text)         from public;
revoke all on function insights_reject_cluster(uuid, text)         from public;
revoke all on function insights_ignore_cluster(uuid, text)         from public;
revoke all on function insights_force_research_cluster(uuid)       from public;
revoke all on function insights_merge_clusters(uuid, uuid)         from public;
revoke all on function insights_set_setting(text, jsonb)           from public;

grant execute on function insights_select_cluster(uuid, text)      to authenticated;
grant execute on function insights_reject_cluster(uuid, text)      to authenticated;
grant execute on function insights_ignore_cluster(uuid, text)      to authenticated;
grant execute on function insights_force_research_cluster(uuid)    to authenticated;
grant execute on function insights_merge_clusters(uuid, uuid)      to authenticated;
grant execute on function insights_set_setting(text, jsonb)        to authenticated;
