-- CodePlay Insights — Phase 2
-- Migration 1/6: enum types, categories, authors, tags.
--
-- Target: Supabase Postgres (relies on `auth.uid()` / `auth.jwt()`).
-- All Insights objects live in `public` and are prefixed `insights_` to
-- avoid colliding with anything the marketing site might add later.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$ begin
  create type insights_article_status as enum (
    'idea', 'researching', 'draft', 'review',
    'scheduled', 'published', 'rejected', 'archived'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type insights_content_type as enum (
    'news', 'analysis', 'explainer', 'opinion', 'roundup', 'tutorial'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type insights_source_kind as enum (
    'official', 'rss', 'api', 'community', 'release_feed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type insights_candidate_status as enum (
    'discovered', 'filtered', 'selected', 'rejected', 'converted'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type insights_job_status as enum (
    'queued', 'running', 'succeeded', 'failed', 'cancelled'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Shared "touch updated_at" trigger fn
-- ---------------------------------------------------------------------------

create or replace function insights_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------

create table if not exists insights_categories (
  id              uuid primary key default gen_random_uuid(),
  name            text not null unique,
  slug            text not null unique,
  description     text not null default '',
  seo_title       text not null default '',
  seo_description text not null default '',
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists trg_insights_categories_touch on insights_categories;
create trigger trg_insights_categories_touch
  before update on insights_categories
  for each row execute function insights_touch_updated_at();

-- ---------------------------------------------------------------------------
-- Authors (editorial identities; optionally linked to an auth user)
-- ---------------------------------------------------------------------------

create table if not exists insights_authors (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  bio          text not null default '',
  avatar_url   text,
  role         text not null default 'Editorial',
  expertise    text[] not null default '{}',
  social_links jsonb not null default '{}'::jsonb,  -- {twitter,linkedin,github,website,mastodon}
  is_team      boolean not null default true,
  user_id      uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create unique index if not exists insights_authors_user_id_key
  on insights_authors(user_id) where user_id is not null;

drop trigger if exists trg_insights_authors_touch on insights_authors;
create trigger trg_insights_authors_touch
  before update on insights_authors
  for each row execute function insights_touch_updated_at();

-- ---------------------------------------------------------------------------
-- Tags (data-driven; never hardcoded in the app)
-- ---------------------------------------------------------------------------

create table if not exists insights_tags (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  slug       text not null unique,
  created_at timestamptz not null default now()
);
