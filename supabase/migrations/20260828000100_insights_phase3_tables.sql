-- CodePlay Insights — Phase 3
-- Discovery + trending engine schema: settings, topic clusters, ingestion
-- run log, adapter metadata on sources, and dedupe/classification columns
-- on candidates.

-- ---------------------------------------------------------------------------
-- insights_settings — all engine configuration lives here as jsonb, so the
-- scoring weights, selection rules and scheduler windows are never
-- scattered as hardcoded constants across the code.
-- ---------------------------------------------------------------------------

create table if not exists insights_settings (
  key         text primary key,
  value       jsonb not null,
  description text,
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_insights_settings_touch on insights_settings;
create trigger trg_insights_settings_touch
  before update on insights_settings
  for each row execute function insights_touch_updated_at();

-- ---------------------------------------------------------------------------
-- Source adapter metadata
-- ---------------------------------------------------------------------------

alter table insights_news_sources
  add column if not exists adapter text not null default 'rss',
  add column if not exists slug    text;

update insights_news_sources set slug = insights_slugify(name) where slug is null;

create unique index if not exists insights_news_sources_slug_key
  on insights_news_sources(slug) where slug is not null;

comment on column insights_news_sources.adapter is
  'Which adapter handles this source: hackernews | rss | github_releases | reddit | ...';

-- ---------------------------------------------------------------------------
-- insights_topic_clusters — the reviewable unit. Multiple source items
-- about the same event collapse into one cluster. Scoring and editorial
-- selection operate here, not on individual candidates.
-- ---------------------------------------------------------------------------

create table if not exists insights_topic_clusters (
  id                    uuid primary key default gen_random_uuid(),
  cluster_key           text not null,      -- deterministic dedupe key from the engine
  title                 text not null,
  normalized_title      text not null,
  slug                  text,
  summary               text not null default '',

  primary_theme         text,
  themes                text[] not null default '{}',
  category              text,               -- insights_categories.slug hint

  -- sub-scores (0-100) and the composite
  freshness_score       numeric(5,2) not null default 0,
  engagement_score      numeric(5,2) not null default 0,
  authority_score       numeric(5,2) not null default 0,
  cross_source_score    numeric(5,2) not null default 0,
  relevance_score       numeric(5,2) not null default 0,
  community_score       numeric(5,2) not null default 0,
  novelty_score         numeric(5,2) not null default 0,
  viral_score           numeric(5,2) not null default 0
                          check (viral_score between 0 and 100),

  source_count          integer not null default 0 check (source_count >= 0),
  breaking              boolean not null default false,
  fact_confidence       insights_fact_confidence not null default 'unverified',

  entities              text[] not null default '{}',
  keywords              text[] not null default '{}',

  status                insights_candidate_status not null default 'discovered',
  selection_reason      text,
  rejection_reason      text,
  research_forced       boolean not null default false,

  first_seen_at         timestamptz not null default now(),
  last_seen_at          timestamptz not null default now(),
  earliest_published_at timestamptz,

  article_id            uuid references insights_articles(id) on delete set null,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create unique index if not exists insights_clusters_key_uniq on insights_topic_clusters(cluster_key);
create index if not exists insights_clusters_status_idx     on insights_topic_clusters(status);
create index if not exists insights_clusters_viral_idx      on insights_topic_clusters(viral_score desc);
create index if not exists insights_clusters_last_seen_idx  on insights_topic_clusters(last_seen_at desc);
create index if not exists insights_clusters_norm_title_idx on insights_topic_clusters(normalized_title);
create index if not exists insights_clusters_theme_idx      on insights_topic_clusters(primary_theme);

drop trigger if exists trg_insights_clusters_touch on insights_topic_clusters;
create trigger trg_insights_clusters_touch
  before update on insights_topic_clusters
  for each row execute function insights_touch_updated_at();

-- ---------------------------------------------------------------------------
-- Candidates gain a cluster link + dedupe/classification metadata.
-- One candidate == one item from one source (headline + URL + metadata).
-- Full source article text is never stored here.
-- ---------------------------------------------------------------------------

alter table insights_news_candidates
  add column if not exists cluster_id       uuid references insights_topic_clusters(id) on delete set null,
  add column if not exists adapter          text,
  add column if not exists normalized_title text,
  add column if not exists normalized_url   text,
  add column if not exists dedupe_hash      text,
  add column if not exists themes           text[] not null default '{}',
  add column if not exists entities         text[] not null default '{}',
  add column if not exists keywords         text[] not null default '{}',
  add column if not exists fact_confidence  insights_fact_confidence not null default 'unverified',
  add column if not exists raw              jsonb not null default '{}'::jsonb;

create index if not exists insights_candidates_cluster_idx    on insights_news_candidates(cluster_id);
create index if not exists insights_candidates_norm_url_idx   on insights_news_candidates(normalized_url);
create index if not exists insights_candidates_dedupe_idx     on insights_news_candidates(dedupe_hash);

-- ---------------------------------------------------------------------------
-- Articles can be sourced from a cluster (Phase 4 will fill article_id back).
-- ---------------------------------------------------------------------------

alter table insights_articles
  add column if not exists cluster_id uuid references insights_topic_clusters(id) on delete set null;

create index if not exists insights_articles_cluster_idx on insights_articles(cluster_id);

-- ---------------------------------------------------------------------------
-- insights_ingestion_runs — one row per adapter execution. Failure
-- isolation: a failed adapter records here and the pipeline continues.
-- ---------------------------------------------------------------------------

create table if not exists insights_ingestion_runs (
  id            uuid primary key default gen_random_uuid(),
  adapter       text not null,
  source_id     uuid references insights_news_sources(id) on delete set null,
  source_slug   text,
  status        text not null default 'running'
                  check (status in ('running', 'succeeded', 'failed', 'skipped')),
  items_found   integer not null default 0,
  items_new     integer not null default 0,
  items_updated integer not null default 0,
  clusters_touched integer not null default 0,
  error         text,
  meta          jsonb not null default '{}'::jsonb,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  duration_ms   integer
);

create index if not exists insights_ingestion_runs_adapter_idx on insights_ingestion_runs(adapter);
create index if not exists insights_ingestion_runs_started_idx on insights_ingestion_runs(started_at desc);
