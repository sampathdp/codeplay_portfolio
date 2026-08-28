-- CodePlay Insights — Phase 2
-- Migration 3/6: source registry, news candidates, generation jobs,
-- admin membership, audit log, and the articles<->candidate link.

-- ---------------------------------------------------------------------------
-- news_sources — registry of approved upstream feeds
-- ---------------------------------------------------------------------------

create table if not exists insights_news_sources (
  id              uuid primary key default gen_random_uuid(),
  name            text not null unique,
  base_url        text not null,
  feed_url        text,
  source_type     insights_source_kind not null,
  category        text,                         -- loose category hint
  enabled         boolean not null default true,
  trust_score     numeric(5,2) not null default 50 check (trust_score between 0 and 100),
  priority        integer not null default 100,
  last_checked_at timestamptz,
  configuration   jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists trg_insights_news_sources_touch on insights_news_sources;
create trigger trg_insights_news_sources_touch
  before update on insights_news_sources
  for each row execute function insights_touch_updated_at();

-- ---------------------------------------------------------------------------
-- news_candidates — discovered stories awaiting triage
-- Stores metadata + a SHORT factual summary only. No copied article bodies.
-- ---------------------------------------------------------------------------

create table if not exists insights_news_candidates (
  id                 uuid primary key default gen_random_uuid(),
  external_id        text,
  title              text not null,
  url                text not null,
  source             text not null,             -- source name / domain
  source_type        insights_source_kind,
  news_source_id     uuid references insights_news_sources(id) on delete set null,
  summary            text not null default '',
  category           text,
  published_at       timestamptz,
  discovered_at      timestamptz not null default now(),

  engagement_score   numeric(5,2) not null default 0 check (engagement_score between 0 and 100),
  freshness_score    numeric(5,2) not null default 0 check (freshness_score  between 0 and 100),
  authority_score    numeric(5,2) not null default 0 check (authority_score  between 0 and 100),
  relevance_score    numeric(5,2) not null default 0 check (relevance_score  between 0 and 100),
  community_score    numeric(5,2) not null default 0 check (community_score  between 0 and 100),
  novelty_score      numeric(5,2) not null default 0 check (novelty_score    between 0 and 100),
  viral_score        numeric(5,2) not null default 0 check (viral_score      between 0 and 100),

  duplicate_group_id uuid,

  status             insights_candidate_status not null default 'discovered',
  rejection_reason   text,
  article_id         uuid references insights_articles(id) on delete set null,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  constraint insights_news_candidates_url_key unique (url)
);

create unique index if not exists insights_news_candidates_ext_key
  on insights_news_candidates(source, external_id)
  where external_id is not null;

create index if not exists insights_news_candidates_status_idx on insights_news_candidates(status);
create index if not exists insights_news_candidates_dupe_idx   on insights_news_candidates(duplicate_group_id);
create index if not exists insights_news_candidates_viral_idx  on insights_news_candidates(viral_score desc);

drop trigger if exists trg_insights_news_candidates_touch on insights_news_candidates;
create trigger trg_insights_news_candidates_touch
  before update on insights_news_candidates
  for each row execute function insights_touch_updated_at();

-- Link articles back to the candidate they were converted from.
alter table insights_articles
  add column if not exists candidate_id uuid
    references insights_news_candidates(id) on delete set null;

create index if not exists insights_articles_candidate_idx on insights_articles(candidate_id);

-- ---------------------------------------------------------------------------
-- content_generation_jobs — one row per generation attempt for a candidate
-- ---------------------------------------------------------------------------

create table if not exists insights_content_generation_jobs (
  id                uuid primary key default gen_random_uuid(),
  candidate_id      uuid references insights_news_candidates(id) on delete cascade,
  article_id        uuid references insights_articles(id) on delete set null,
  status            insights_job_status not null default 'queued',
  step              text not null default 'research'
                      check (step in ('research', 'draft', 'image', 'quality', 'finalize')),
  model             text,
  prompt_tokens     integer,
  completion_tokens integer,
  total_tokens      integer,
  cost_usd          numeric(10,4),
  error             text,
  attempt_count     integer not null default 0 check (attempt_count >= 0),
  max_attempts      integer not null default 3 check (max_attempts >= 1),
  started_at        timestamptz,
  completed_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists insights_gen_jobs_candidate_idx on insights_content_generation_jobs(candidate_id);
create index if not exists insights_gen_jobs_status_idx     on insights_content_generation_jobs(status);

drop trigger if exists trg_insights_gen_jobs_touch on insights_content_generation_jobs;
create trigger trg_insights_gen_jobs_touch
  before update on insights_content_generation_jobs
  for each row execute function insights_touch_updated_at();

-- ---------------------------------------------------------------------------
-- insights_admins — who is allowed to run admin operations
-- ---------------------------------------------------------------------------

create table if not exists insights_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  role       text not null default 'editor' check (role in ('editor', 'admin')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- admin_action_logs — audit trail for every admin mutation
-- ---------------------------------------------------------------------------

create table if not exists insights_admin_action_logs (
  id          bigint generated always as identity primary key,
  actor       uuid references auth.users(id) on delete set null,
  actor_email text,
  action      text not null,
  entity_type text not null,
  entity_id   text,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists insights_admin_logs_entity_idx
  on insights_admin_action_logs(entity_type, entity_id);
create index if not exists insights_admin_logs_actor_idx
  on insights_admin_action_logs(actor);
create index if not exists insights_admin_logs_created_idx
  on insights_admin_action_logs(created_at desc);
