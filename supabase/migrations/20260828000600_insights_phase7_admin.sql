-- CodePlay Insights — Phase 7
-- Editorial admin dashboard support: publishing config (autoPublish
-- default FALSE), manual source-run requests, article edit history, and a
-- public view-count RPC.

-- ---------------------------------------------------------------------------
-- Publishing settings — autoPublish MUST default to false
-- ---------------------------------------------------------------------------

insert into insights_settings (key, value, description) values
(
  'publishing',
  jsonb_build_object(
    'autoPublish', false,
    'minPerDay', 2,
    'maxPerDay', 3,
    'diversity', jsonb_build_array(
      'technology/AI/developer story',
      'broader technology/business/security story',
      'gaming/game-development/community story'
    ),
    'breakingOverridesDiversity', true,
    'note', 'When autoPublish is false the system only generates drafts; an admin approves publication. Even when true, articles failing quality gates stay in review.'
  ),
  'Daily publication target + auto-publish toggle. Default: manual approval.'
)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- SEO columns on articles (referenced since Phase 4 persist, add if missing)
-- ---------------------------------------------------------------------------

alter table insights_articles
  add column if not exists seo_title      text,
  add column if not exists seo_description text,
  add column if not exists canonical_url  text;

-- ---------------------------------------------------------------------------
-- Manual "run this source now" request flag
-- ---------------------------------------------------------------------------

alter table insights_news_sources
  add column if not exists run_requested_at timestamptz;

create or replace function insights_request_source_run(p_id uuid)
returns insights_news_sources
language plpgsql
security definer
set search_path = public
as $$
declare v_row insights_news_sources;
begin
  perform insights_require_admin();
  update insights_news_sources
     set run_requested_at = now()
   where id = p_id
   returning * into v_row;
  if not found then
    raise exception 'source % not found', p_id using errcode = 'P0002';
  end if;
  perform insights_log_admin_action('request_source_run', 'news_source', p_id::text,
    jsonb_build_object('name', v_row.name));
  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------
-- Retry a failed / cancelled generation job (re-queue a fresh copy)
-- ---------------------------------------------------------------------------

create or replace function insights_retry_job(p_id uuid)
returns insights_content_generation_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old insights_content_generation_jobs;
  v_new insights_content_generation_jobs;
begin
  perform insights_require_admin();
  select * into v_old from insights_content_generation_jobs where id = p_id;
  if not found then
    raise exception 'job % not found', p_id using errcode = 'P0002';
  end if;
  if v_old.status not in ('failed', 'cancelled') then
    raise exception 'job % is not retryable (status %)', p_id, v_old.status using errcode = '22023';
  end if;

  insert into insights_content_generation_jobs
    (cluster_id, article_id, kind, article_type, params, status, step, requested_by, max_attempts)
  values
    (v_old.cluster_id, v_old.article_id, v_old.kind, v_old.article_type,
     v_old.params, 'queued',
     case when v_old.kind = 'full_article' then 'research_bundle' else v_old.kind end,
     auth.uid(), v_old.max_attempts)
  returning * into v_new;

  perform insights_log_admin_action('retry_job', 'generation_job', v_new.id::text,
    jsonb_build_object('retry_of', p_id, 'kind', v_old.kind));
  return v_new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Article edit history — an AFTER UPDATE trigger logs edits made by a
-- signed-in admin (auth.uid() present). Service-role worker writes have
-- no auth.uid() and are skipped (the worker logs via jobs).
-- ---------------------------------------------------------------------------

create or replace function insights_articles_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_changes text[] := '{}';
begin
  if v_actor is null then
    return new; -- worker / service-role write
  end if;

  if new.status is distinct from old.status then
    insert into insights_admin_action_logs (actor, actor_email, action, entity_type, entity_id, metadata)
    values (v_actor, insights_current_email(), 'status_change', 'article', new.id::text,
            jsonb_build_object('from', old.status, 'to', new.status));
  end if;

  if new.title            is distinct from old.title            then v_changes := v_changes || 'title'; end if;
  if new.subtitle         is distinct from old.subtitle         then v_changes := v_changes || 'subtitle'; end if;
  if new.excerpt          is distinct from old.excerpt          then v_changes := v_changes || 'excerpt'; end if;
  if new.content          is distinct from old.content          then v_changes := v_changes || 'content'; end if;
  if new.category_id      is distinct from old.category_id      then v_changes := v_changes || 'category'; end if;
  if new.seo_title        is distinct from old.seo_title        then v_changes := v_changes || 'seo_title'; end if;
  if new.seo_description  is distinct from old.seo_description   then v_changes := v_changes || 'seo_description'; end if;
  if new.featured_image_url is distinct from old.featured_image_url then v_changes := v_changes || 'featured_image'; end if;

  if array_length(v_changes, 1) is not null then
    insert into insights_admin_action_logs (actor, actor_email, action, entity_type, entity_id, metadata)
    values (v_actor, insights_current_email(), 'edit', 'article', new.id::text,
            jsonb_build_object('fields', v_changes));
  end if;

  return new;
end;
$$;

drop trigger if exists trg_insights_articles_audit on insights_articles;
create trigger trg_insights_articles_audit
  after update on insights_articles
  for each row execute function insights_articles_audit();

-- ---------------------------------------------------------------------------
-- Public view counter — increments only for published articles. Cheap and
-- best-effort; abuse just inflates a vanity metric.
-- ---------------------------------------------------------------------------

create or replace function insights_record_view(p_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update insights_articles
     set view_count = view_count + 1
   where slug = p_slug
     and status = 'published'
     and published_at is not null
     and published_at <= now();
$$;

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

revoke all on function insights_request_source_run(uuid)  from public;
revoke all on function insights_retry_job(uuid)           from public;
grant execute on function insights_request_source_run(uuid) to authenticated;
grant execute on function insights_retry_job(uuid)          to authenticated;

grant execute on function insights_record_view(text) to anon, authenticated;
