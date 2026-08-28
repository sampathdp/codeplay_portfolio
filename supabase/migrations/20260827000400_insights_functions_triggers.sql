-- CodePlay Insights — Phase 2
-- Migration 4/6: slug generation, article write trigger, source_count
-- maintenance, identity helpers, and the authorized admin RPCs that are
-- the "secure backend methods" for the content workflow.

-- ---------------------------------------------------------------------------
-- Identity helpers
-- ---------------------------------------------------------------------------

create or replace function insights_current_email()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email',
    null
  );
$$;

create or replace function insights_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from insights_admins where user_id = auth.uid()
  );
$$;

comment on function insights_is_admin() is
  'True when the current auth user is in insights_admins. Used by RLS and admin RPCs.';

-- ---------------------------------------------------------------------------
-- Slug generation
-- ---------------------------------------------------------------------------

create or replace function insights_slugify(p_text text)
returns text
language sql
immutable
as $$
  select trim(both '-' from
    regexp_replace(
      regexp_replace(
        lower(translate(
          coalesce(p_text, ''),
          'àáâãäåāăąèéêëēĕėęěìíîïĩīĭįòóôõöøōŏőùúûüũūŭůűųñçćčđšžýÿ',
          'aaaaaaaaaeeeeeeeeeiiiiiiiiooooooooouuuuuuuuunccccszyy'
        )),
        '[^a-z0-9]+', '-', 'g'),
      '-{2,}', '-', 'g')
  );
$$;

-- Returns a slug unique within insights_articles. Falls back to 'article'
-- for empty input and appends -2, -3 ... on collision.
create or replace function insights_article_unique_slug(
  p_desired text,
  p_exclude uuid default null
)
returns text
language plpgsql
stable
as $$
declare
  v_base text;
  v_slug text;
  v_n    integer := 1;
begin
  v_base := nullif(insights_slugify(p_desired), '');
  if v_base is null then
    v_base := 'article';
  end if;
  v_base := trim(both '-' from left(v_base, 80));
  if v_base = '' then
    v_base := 'article';
  end if;

  v_slug := v_base;
  while exists (
    select 1 from insights_articles
    where slug = v_slug
      and (p_exclude is null or id <> p_exclude)
  ) loop
    v_n := v_n + 1;
    v_slug := v_base || '-' || v_n;
  end loop;

  return v_slug;
end;
$$;

-- ---------------------------------------------------------------------------
-- Article BEFORE INSERT/UPDATE: slug + reading_time + updated_at
-- ---------------------------------------------------------------------------

create or replace function insights_articles_before_write()
returns trigger
language plpgsql
as $$
declare
  v_words integer;
begin
  -- Slug: derive from title when blank, otherwise normalise the supplied
  -- value; always de-duplicate.
  if new.slug is null or btrim(new.slug) = '' then
    new.slug := insights_article_unique_slug(new.title, new.id);
  else
    new.slug := insights_article_unique_slug(new.slug, new.id);
  end if;

  -- Reading time from word count (~200 wpm).
  if btrim(coalesce(new.content, '')) = '' then
    new.reading_time := 0;
  else
    v_words := coalesce(
      array_length(regexp_split_to_array(btrim(new.content), '\s+'), 1), 0
    );
    new.reading_time := greatest(1, ceil(v_words::numeric / 200));
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_insights_articles_before_write on insights_articles;
create trigger trg_insights_articles_before_write
  before insert or update on insights_articles
  for each row execute function insights_articles_before_write();

-- ---------------------------------------------------------------------------
-- Keep insights_articles.source_count in sync with article_sources
-- ---------------------------------------------------------------------------

create or replace function insights_sync_source_count()
returns trigger
language plpgsql
as $$
declare
  v_article uuid := coalesce(new.article_id, old.article_id);
begin
  update insights_articles a
     set source_count = (
       select count(*) from insights_article_sources s where s.article_id = v_article
     )
   where a.id = v_article;
  return null;
end;
$$;

drop trigger if exists trg_insights_article_sources_count on insights_article_sources;
create trigger trg_insights_article_sources_count
  after insert or delete on insights_article_sources
  for each row execute function insights_sync_source_count();

-- ---------------------------------------------------------------------------
-- Audit helper
-- ---------------------------------------------------------------------------

create or replace function insights_log_admin_action(
  p_action      text,
  p_entity_type text,
  p_entity_id   text,
  p_metadata    jsonb default '{}'::jsonb
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into insights_admin_action_logs (actor, actor_email, action, entity_type, entity_id, metadata)
  values (auth.uid(), insights_current_email(), p_action, p_entity_type, p_entity_id, coalesce(p_metadata, '{}'::jsonb));
$$;

-- ---------------------------------------------------------------------------
-- Authorized workflow RPCs. Each one re-checks insights_is_admin() so that
-- authorization does not depend on the client. security definer + pinned
-- search_path.
-- ---------------------------------------------------------------------------

create or replace function insights_require_admin()
returns void
language plpgsql
stable
as $$
begin
  if not insights_is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
end;
$$;

create or replace function insights_publish_article(p_id uuid)
returns insights_articles
language plpgsql
security definer
set search_path = public
as $$
declare v_row insights_articles;
begin
  perform insights_require_admin();

  update insights_articles
     set status       = 'published',
         published_at = coalesce(published_at, now()),
         scheduled_at = null
   where id = p_id
   returning * into v_row;

  if not found then
    raise exception 'article % not found', p_id using errcode = 'P0002';
  end if;

  perform insights_log_admin_action('publish', 'article', p_id::text,
    jsonb_build_object('slug', v_row.slug));
  return v_row;
end;
$$;

create or replace function insights_unpublish_article(p_id uuid)
returns insights_articles
language plpgsql
security definer
set search_path = public
as $$
declare v_row insights_articles;
begin
  perform insights_require_admin();

  update insights_articles
     set status       = 'draft',
         published_at = null,
         scheduled_at = null
   where id = p_id
   returning * into v_row;

  if not found then
    raise exception 'article % not found', p_id using errcode = 'P0002';
  end if;

  perform insights_log_admin_action('unpublish', 'article', p_id::text, '{}'::jsonb);
  return v_row;
end;
$$;

create or replace function insights_schedule_article(p_id uuid, p_when timestamptz)
returns insights_articles
language plpgsql
security definer
set search_path = public
as $$
declare v_row insights_articles;
begin
  perform insights_require_admin();

  if p_when is null or p_when <= now() then
    raise exception 'scheduled time must be in the future' using errcode = '22007';
  end if;

  update insights_articles
     set status       = 'scheduled',
         scheduled_at = p_when,
         published_at = null
   where id = p_id
   returning * into v_row;

  if not found then
    raise exception 'article % not found', p_id using errcode = 'P0002';
  end if;

  perform insights_log_admin_action('schedule', 'article', p_id::text,
    jsonb_build_object('scheduled_at', p_when));
  return v_row;
end;
$$;

create or replace function insights_archive_article(p_id uuid)
returns insights_articles
language plpgsql
security definer
set search_path = public
as $$
declare v_row insights_articles;
begin
  perform insights_require_admin();

  update insights_articles
     set status = 'archived'
   where id = p_id
   returning * into v_row;

  if not found then
    raise exception 'article % not found', p_id using errcode = 'P0002';
  end if;

  perform insights_log_admin_action('archive', 'article', p_id::text, '{}'::jsonb);
  return v_row;
end;
$$;

create or replace function insights_approve_candidate(p_id uuid)
returns insights_news_candidates
language plpgsql
security definer
set search_path = public
as $$
declare v_row insights_news_candidates;
begin
  perform insights_require_admin();

  update insights_news_candidates
     set status = 'selected'
   where id = p_id
   returning * into v_row;

  if not found then
    raise exception 'candidate % not found', p_id using errcode = 'P0002';
  end if;

  perform insights_log_admin_action('approve', 'news_candidate', p_id::text,
    jsonb_build_object('title', v_row.title, 'url', v_row.url));
  return v_row;
end;
$$;

create or replace function insights_reject_candidate(p_id uuid, p_reason text default null)
returns insights_news_candidates
language plpgsql
security definer
set search_path = public
as $$
declare v_row insights_news_candidates;
begin
  perform insights_require_admin();

  update insights_news_candidates
     set status           = 'rejected',
         rejection_reason = p_reason
   where id = p_id
   returning * into v_row;

  if not found then
    raise exception 'candidate % not found', p_id using errcode = 'P0002';
  end if;

  perform insights_log_admin_action('reject', 'news_candidate', p_id::text,
    jsonb_build_object('reason', p_reason));
  return v_row;
end;
$$;

-- Cron-only: flip scheduled articles whose time has arrived. Runs as the
-- caller; intended to be invoked with the service role (see RLS migration
-- for the grant), never from the browser.
create or replace function insights_publish_due_scheduled()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare v_count integer;
begin
  with due as (
    update insights_articles
       set status       = 'published',
           published_at = coalesce(published_at, now()),
           scheduled_at = null
     where status = 'scheduled'
       and scheduled_at is not null
       and scheduled_at <= now()
     returning id
  )
  select count(*) into v_count from due;
  return v_count;
end;
$$;

-- Bootstrapping / service-role only: promote an auth user to admin by email.
create or replace function insights_grant_admin(p_email text, p_role text default 'admin')
returns insights_admins
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid;
  v_row insights_admins;
begin
  select id into v_uid from auth.users where lower(email) = lower(p_email) limit 1;
  if v_uid is null then
    raise exception 'no auth user with email %', p_email using errcode = 'P0002';
  end if;

  insert into insights_admins (user_id, email, role)
  values (v_uid, lower(p_email), p_role)
  on conflict (user_id) do update set role = excluded.role, email = excluded.email
  returning * into v_row;

  return v_row;
end;
$$;
