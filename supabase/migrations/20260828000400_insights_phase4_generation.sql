-- CodePlay Insights — Phase 4
-- Gemini-powered research + article generation. No image generation yet.
-- Generation runs server-side (GitHub Actions worker); the browser never
-- sees GEMINI_API_KEY.

-- ---------------------------------------------------------------------------
-- Generation jobs: widen `step`, add generation context columns
-- ---------------------------------------------------------------------------

alter table insights_content_generation_jobs
  drop constraint if exists insights_content_generation_jobs_step_check;

alter table insights_content_generation_jobs
  add column if not exists kind          text not null default 'full_article',
  add column if not exists cluster_id    uuid references insights_topic_clusters(id) on delete set null,
  add column if not exists article_type  text,
  add column if not exists params        jsonb not null default '{}'::jsonb,
  add column if not exists bundle        jsonb,
  add column if not exists result        jsonb,
  add column if not exists needs_review  boolean not null default false,
  add column if not exists review_reason text,
  add column if not exists requested_by  uuid references auth.users(id) on delete set null;

alter table insights_content_generation_jobs
  add constraint insights_content_generation_jobs_step_check
  check (step in (
    'research_bundle', 'source_verification', 'outline', 'draft',
    'fact_check', 'seo', 'quality', 'persist', 'finalize',
    'research', 'image'
  ));

alter table insights_content_generation_jobs
  add constraint insights_content_generation_jobs_kind_check
  check (kind in (
    'full_article', 'regenerate_section', 'improve_title', 'improve_seo',
    'regenerate_summary', 'fact_check'
  ));

create index if not exists insights_gen_jobs_cluster_idx on insights_content_generation_jobs(cluster_id);
create index if not exists insights_gen_jobs_kind_idx    on insights_content_generation_jobs(kind);

-- ---------------------------------------------------------------------------
-- insights_ai_usage — per-call cost / token ledger for budget control
-- ---------------------------------------------------------------------------

create table if not exists insights_ai_usage (
  id                 bigint generated always as identity primary key,
  job_id             uuid references insights_content_generation_jobs(id) on delete set null,
  cluster_id         uuid references insights_topic_clusters(id) on delete set null,
  step               text not null,
  provider           text not null default 'gemini',
  model              text not null,
  request_count      integer not null default 1,
  prompt_tokens      integer not null default 0,
  completion_tokens  integer not null default 0,
  total_tokens       integer not null default 0,
  estimated_cost_usd numeric(12,6) not null default 0,
  status             text not null default 'ok' check (status in ('ok', 'error', 'blocked')),
  error              text,
  created_at         timestamptz not null default now()
);

create index if not exists insights_ai_usage_created_idx on insights_ai_usage(created_at desc);
create index if not exists insights_ai_usage_job_idx     on insights_ai_usage(job_id);

-- ---------------------------------------------------------------------------
-- Articles: generation metadata + human-edit protection
-- ---------------------------------------------------------------------------

alter table insights_articles
  add column if not exists article_type          text,
  add column if not exists headline_options      jsonb not null default '[]'::jsonb,
  add column if not exists sections              jsonb not null default '[]'::jsonb,
  add column if not exists fact_check            jsonb,
  add column if not exists needs_review          boolean not null default false,
  add column if not exists review_reasons        text[] not null default '{}',
  add column if not exists generation_job_id     uuid references insights_content_generation_jobs(id) on delete set null,
  add column if not exists human_edited_sections text[] not null default '{}',
  add column if not exists approved_at           timestamptz,
  add column if not exists approved_by           uuid references auth.users(id) on delete set null;

-- ---------------------------------------------------------------------------
-- Quality: the three extra gate scores + gate outcome
-- ---------------------------------------------------------------------------

alter table insights_article_quality
  add column if not exists duplication_risk_score numeric(5,2) check (duplication_risk_score between 0 and 100),
  add column if not exists sensationalism_score   numeric(5,2) check (sensationalism_score between 0 and 100),
  add column if not exists hallucination_risk_score numeric(5,2) check (hallucination_risk_score between 0 and 100),
  add column if not exists gate_passed            boolean,
  add column if not exists gate_reasons           text[] not null default '{}';

-- ---------------------------------------------------------------------------
-- Settings: generation rules + AI budget
-- ---------------------------------------------------------------------------

insert into insights_settings (key, value, description) values
(
  'generation',
  jsonb_build_object(
    'wordCountDefault',   jsonb_build_object('min', 800,  'max', 1500),
    'wordCountImportant', jsonb_build_object('min', 1500, 'max', 2500),
    'headlineCandidates', 5,
    'temperature', jsonb_build_object('outline', 0.5, 'draft', 0.6, 'analysis', 0.4, 'seo', 0.4),
    'thresholds', jsonb_build_object(
      'overallQuality',    70,
      'factualConfidence', 65,
      'sourceQuality',     55,
      'originalValue',     60,
      'readability',       60,
      'maxDuplicationRisk', 35,
      'maxSensationalism',  30,
      'maxHallucinationRisk', 25,
      'minSources', 2,
      'minPrimarySources', 1
    ),
    'bannedPhrases', jsonb_build_array(
      'game changer','game-changer','revolutionary','in today''s fast-paced world',
      'delve','ever-evolving landscape','in the ever-changing','landscape of',
      'seismic shift','paradigm shift','it goes without saying','needless to say',
      'at the end of the day','buckle up','look no further'
    ),
    'forbiddenClaims', jsonb_build_array('we tested','we used','our developers found','we tried','in our testing','we benchmarked'),
    'requireOriginalValue', true
  ),
  'Article generation rules: length, headline count, temperatures, quality thresholds, style bans.'
),
(
  'ai_budget',
  jsonb_build_object(
    'dailyUsdCap', 4.00,
    'dailyCallCap', 400,
    'perRunCallCap', 60,
    'perArticleCallCap', 14,
    'pricingPer1MTokensUsd', jsonb_build_object(
      'gemini-2.5-pro',   jsonb_build_object('input', 1.25, 'output', 10.00),
      'gemini-2.5-flash', jsonb_build_object('input', 0.30, 'output', 2.50),
      'default',          jsonb_build_object('input', 0.50, 'output', 4.00)
    )
  ),
  'AI spend guardrails. Pricing is approximate — verify against current Gemini pricing.'
)
on conflict (key) do update set value = excluded.value, description = excluded.description;

-- ---------------------------------------------------------------------------
-- RLS + grants for insights_ai_usage
-- ---------------------------------------------------------------------------

alter table insights_ai_usage enable row level security;

drop policy if exists insights_ai_usage_admin on insights_ai_usage;
create policy insights_ai_usage_admin on insights_ai_usage
  for select using (insights_is_admin());

grant select on insights_ai_usage to authenticated;
grant all on insights_ai_usage to service_role;

-- ---------------------------------------------------------------------------
-- Admin RPCs
-- ---------------------------------------------------------------------------

-- Queue a generation job (worker picks it up).
create or replace function insights_request_generation(
  p_cluster_id   uuid,
  p_kind         text default 'full_article',
  p_article_type text default null,
  p_params       jsonb default '{}'::jsonb
)
returns insights_content_generation_jobs
language plpgsql
security definer
set search_path = public
as $$
declare v_row insights_content_generation_jobs;
begin
  perform insights_require_admin();

  if p_kind not in ('full_article','regenerate_section','improve_title','improve_seo','regenerate_summary','fact_check') then
    raise exception 'invalid job kind %', p_kind using errcode = '22023';
  end if;

  insert into insights_content_generation_jobs
    (cluster_id, kind, article_type, params, status, step, requested_by)
  values
    (p_cluster_id, p_kind, p_article_type, coalesce(p_params, '{}'::jsonb), 'queued',
     case when p_kind = 'full_article' then 'research_bundle' else p_kind end,
     auth.uid())
  returning * into v_row;

  perform insights_log_admin_action('request_generation', 'generation_job', v_row.id::text,
    jsonb_build_object('cluster_id', p_cluster_id, 'kind', p_kind));
  return v_row;
end;
$$;

-- Apply a `regenerate_section` proposal, but NEVER over a section a human
-- has edited (unless p_force).
create or replace function insights_apply_section(p_job_id uuid, p_force boolean default false)
returns insights_articles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job     insights_content_generation_jobs;
  v_article insights_articles;
  v_section text;
  v_value   text;
begin
  perform insights_require_admin();

  select * into v_job from insights_content_generation_jobs where id = p_job_id;
  if not found then raise exception 'job % not found', p_job_id using errcode = 'P0002'; end if;
  if v_job.kind <> 'regenerate_section' or v_job.result is null then
    raise exception 'job % has no section proposal', p_job_id using errcode = '22023';
  end if;

  v_section := v_job.result ->> 'section';
  v_value   := v_job.result ->> 'content';
  if v_job.article_id is null then
    raise exception 'job % is not linked to an article', p_job_id using errcode = '22023';
  end if;

  select * into v_article from insights_articles where id = v_job.article_id;
  if not found then raise exception 'article not found' using errcode = 'P0002'; end if;

  if not p_force and v_section = any(v_article.human_edited_sections) then
    raise exception 'section "%" was edited by a human; pass force to override', v_section
      using errcode = '42501';
  end if;

  update insights_articles
     set sections = (
       select coalesce(jsonb_agg(
         case when elem ->> 'key' = v_section
           then jsonb_set(elem, '{content}', to_jsonb(v_value))
           else elem end
       ), '[]'::jsonb)
       from jsonb_array_elements(sections) elem
     )
   where id = v_article.id
   returning * into v_article;

  perform insights_log_admin_action('apply_section', 'article', v_article.id::text,
    jsonb_build_object('section', v_section, 'job_id', p_job_id, 'forced', p_force));
  return v_article;
end;
$$;

-- Mark an article human-reviewed (clears needs_review; does not publish).
create or replace function insights_approve_article(p_id uuid)
returns insights_articles
language plpgsql
security definer
set search_path = public
as $$
declare v_row insights_articles;
begin
  perform insights_require_admin();

  update insights_articles
     set needs_review = false,
         approved_at  = now(),
         approved_by  = auth.uid(),
         status       = case when status = 'review' then 'review' else status end
   where id = p_id
   returning * into v_row;

  if not found then raise exception 'article % not found', p_id using errcode = 'P0002'; end if;

  perform insights_log_admin_action('approve', 'article', p_id::text, '{}'::jsonb);
  return v_row;
end;
$$;

-- Record that a human edited specific sections (called from the editor).
create or replace function insights_mark_sections_edited(p_id uuid, p_sections text[])
returns insights_articles
language plpgsql
security definer
set search_path = public
as $$
declare v_row insights_articles;
begin
  perform insights_require_admin();
  update insights_articles
     set human_edited_sections = (
       select coalesce(array_agg(distinct s), '{}')
       from unnest(human_edited_sections || coalesce(p_sections, '{}')) s
     )
   where id = p_id
   returning * into v_row;
  if not found then raise exception 'article % not found', p_id using errcode = 'P0002'; end if;
  return v_row;
end;
$$;

revoke all on function insights_request_generation(uuid, text, text, jsonb) from public;
revoke all on function insights_apply_section(uuid, boolean)                from public;
revoke all on function insights_approve_article(uuid)                       from public;
revoke all on function insights_mark_sections_edited(uuid, text[])          from public;

grant execute on function insights_request_generation(uuid, text, text, jsonb) to authenticated;
grant execute on function insights_apply_section(uuid, boolean)                to authenticated;
grant execute on function insights_approve_article(uuid)                       to authenticated;
grant execute on function insights_mark_sections_edited(uuid, text[])          to authenticated;
