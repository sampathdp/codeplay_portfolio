-- CodePlay Insights — Phase 2
-- Migration 2/6: articles, article_tags, article_sources, article_quality.

-- ---------------------------------------------------------------------------
-- Articles
-- ---------------------------------------------------------------------------

create table if not exists insights_articles (
  id                    uuid primary key default gen_random_uuid(),
  title                 text not null,
  slug                  text not null unique,
  subtitle              text,
  excerpt               text not null default '',
  -- `content` is the source of truth (markdown/mdx). `content_html` is a
  -- render cache. We never store copied third-party article bodies here.
  content               text not null default '',
  content_html          text,
  content_format        text not null default 'markdown'
                          check (content_format in ('markdown', 'mdx', 'html')),

  category_id           uuid not null references insights_categories(id) on delete restrict,
  author_id             uuid not null references insights_authors(id) on delete restrict,

  featured_image_url    text,
  featured_image_alt    text,
  image_prompt          text,
  image_is_ai_generated boolean not null default false,

  status                insights_article_status not null default 'idea',
  content_type          insights_content_type not null default 'news',

  featured              boolean not null default false,
  trending              boolean not null default false,
  breaking              boolean not null default false,

  source_count          integer not null default 0 check (source_count >= 0),
  quality_score         numeric(5,2) check (quality_score between 0 and 100),
  viral_score           numeric(5,2) check (viral_score between 0 and 100),
  seo_score             numeric(5,2) check (seo_score between 0 and 100),

  reading_time          integer not null default 0 check (reading_time >= 0),
  view_count            bigint not null default 0 check (view_count >= 0),
  share_count           bigint not null default 0 check (share_count >= 0),

  -- Original-value sections (anti content-farm rule, architecture doc §6).
  developer_take        text,
  business_impact       text,
  developer_impact      text,
  risks_limitations     text,
  why_it_matters        text,
  recommendations       text,

  published_at          timestamptz,
  scheduled_at          timestamptz,

  created_by            uuid references auth.users(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  -- A published article must have a publish timestamp.
  constraint insights_articles_published_needs_ts
    check (status <> 'published' or published_at is not null),
  -- A scheduled article must have a scheduled timestamp.
  constraint insights_articles_scheduled_needs_ts
    check (status <> 'scheduled' or scheduled_at is not null)
);

create index if not exists insights_articles_status_idx      on insights_articles(status);
create index if not exists insights_articles_category_idx     on insights_articles(category_id);
create index if not exists insights_articles_author_idx       on insights_articles(author_id);
create index if not exists insights_articles_published_at_idx on insights_articles(published_at desc);
create index if not exists insights_articles_scheduled_idx    on insights_articles(scheduled_at)
  where status = 'scheduled';
create index if not exists insights_articles_feed_idx
  on insights_articles(published_at desc)
  where status = 'published';

-- ---------------------------------------------------------------------------
-- Article <-> Tag (many to many)
-- ---------------------------------------------------------------------------

create table if not exists insights_article_tags (
  article_id uuid not null references insights_articles(id) on delete cascade,
  tag_id     uuid not null references insights_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (article_id, tag_id)
);

create index if not exists insights_article_tags_tag_idx on insights_article_tags(tag_id);

-- ---------------------------------------------------------------------------
-- Article sources — references + short factual notes ONLY.
-- Never store full third-party article text in this table.
-- ---------------------------------------------------------------------------

create table if not exists insights_article_sources (
  id                  uuid primary key default gen_random_uuid(),
  article_id          uuid not null references insights_articles(id) on delete cascade,
  source_name         text not null,
  source_url          text not null,
  source_type         text not null default 'article'
                        check (source_type in (
                          'article', 'official_blog', 'press_release',
                          'documentation', 'research_paper', 'release_notes',
                          'video', 'forum', 'social', 'repo', 'other'
                        )),
  source_author       text,
  source_published_at timestamptz,
  primary_source      boolean not null default false,
  verified            boolean not null default false,
  -- short factual notes / quotes used for attribution — not the article body
  notes               text,
  created_at          timestamptz not null default now()
);

create index if not exists insights_article_sources_article_idx
  on insights_article_sources(article_id);

comment on table insights_article_sources is
  'Reference metadata and short factual notes for attribution. Do not store copied third-party article bodies.';

-- ---------------------------------------------------------------------------
-- Article quality metadata (1:1 with an article)
-- ---------------------------------------------------------------------------

create table if not exists insights_article_quality (
  article_id            uuid primary key references insights_articles(id) on delete cascade,
  fact_check_score      numeric(5,2) check (fact_check_score between 0 and 100),
  source_quality_score  numeric(5,2) check (source_quality_score between 0 and 100),
  originality_score     numeric(5,2) check (originality_score between 0 and 100),
  readability_score     numeric(5,2) check (readability_score between 0 and 100),
  seo_score             numeric(5,2) check (seo_score between 0 and 100),
  overall_quality_score numeric(5,2) check (overall_quality_score between 0 and 100),
  checks                jsonb not null default '{}'::jsonb,
  checked_at            timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

drop trigger if exists trg_insights_article_quality_touch on insights_article_quality;
create trigger trg_insights_article_quality_touch
  before update on insights_article_quality
  for each row execute function insights_touch_updated_at();
