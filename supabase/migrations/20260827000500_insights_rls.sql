-- CodePlay Insights — Phase 2
-- Migration 5/6: Row Level Security.
--
-- Model:
--   anon + authenticated  -> read published content only
--   insights_admins member -> full read/write on every Insights table
--   service_role           -> bypasses RLS (used by CI build + cron only)
--
-- The browser only ever holds the anon key. All privileged work happens
-- either through the admin session (gated by these policies) or the
-- service role (never shipped to the client).

-- ---------------------------------------------------------------------------
-- Enable RLS everywhere
-- ---------------------------------------------------------------------------

alter table insights_categories              enable row level security;
alter table insights_authors                 enable row level security;
alter table insights_tags                    enable row level security;
alter table insights_articles                enable row level security;
alter table insights_article_tags            enable row level security;
alter table insights_article_sources         enable row level security;
alter table insights_article_quality         enable row level security;
alter table insights_news_sources            enable row level security;
alter table insights_news_candidates         enable row level security;
alter table insights_content_generation_jobs enable row level security;
alter table insights_admins                  enable row level security;
alter table insights_admin_action_logs       enable row level security;

-- ---------------------------------------------------------------------------
-- Public read: taxonomy
-- ---------------------------------------------------------------------------

drop policy if exists insights_categories_read on insights_categories;
create policy insights_categories_read on insights_categories
  for select using (true);

drop policy if exists insights_categories_admin on insights_categories;
create policy insights_categories_admin on insights_categories
  for all using (insights_is_admin()) with check (insights_is_admin());

drop policy if exists insights_authors_read on insights_authors;
create policy insights_authors_read on insights_authors
  for select using (true);

drop policy if exists insights_authors_admin on insights_authors;
create policy insights_authors_admin on insights_authors
  for all using (insights_is_admin()) with check (insights_is_admin());

drop policy if exists insights_tags_read on insights_tags;
create policy insights_tags_read on insights_tags
  for select using (true);

drop policy if exists insights_tags_admin on insights_tags;
create policy insights_tags_admin on insights_tags
  for all using (insights_is_admin()) with check (insights_is_admin());

-- ---------------------------------------------------------------------------
-- Articles: public sees published only; admins see/do everything
-- ---------------------------------------------------------------------------

drop policy if exists insights_articles_read_published on insights_articles;
create policy insights_articles_read_published on insights_articles
  for select using (
    status = 'published'
    and published_at is not null
    and published_at <= now()
  );

drop policy if exists insights_articles_admin on insights_articles;
create policy insights_articles_admin on insights_articles
  for all using (insights_is_admin()) with check (insights_is_admin());

-- Join tables: readable only when the parent article is publicly visible.

drop policy if exists insights_article_tags_read on insights_article_tags;
create policy insights_article_tags_read on insights_article_tags
  for select using (
    exists (
      select 1 from insights_articles a
      where a.id = article_id
        and a.status = 'published'
        and a.published_at is not null
        and a.published_at <= now()
    )
  );

drop policy if exists insights_article_tags_admin on insights_article_tags;
create policy insights_article_tags_admin on insights_article_tags
  for all using (insights_is_admin()) with check (insights_is_admin());

drop policy if exists insights_article_sources_read on insights_article_sources;
create policy insights_article_sources_read on insights_article_sources
  for select using (
    exists (
      select 1 from insights_articles a
      where a.id = article_id
        and a.status = 'published'
        and a.published_at is not null
        and a.published_at <= now()
    )
  );

drop policy if exists insights_article_sources_admin on insights_article_sources;
create policy insights_article_sources_admin on insights_article_sources
  for all using (insights_is_admin()) with check (insights_is_admin());

-- ---------------------------------------------------------------------------
-- Internal tables: admin only, no public access
-- ---------------------------------------------------------------------------

drop policy if exists insights_article_quality_admin on insights_article_quality;
create policy insights_article_quality_admin on insights_article_quality
  for all using (insights_is_admin()) with check (insights_is_admin());

drop policy if exists insights_news_sources_admin on insights_news_sources;
create policy insights_news_sources_admin on insights_news_sources
  for all using (insights_is_admin()) with check (insights_is_admin());

drop policy if exists insights_news_candidates_admin on insights_news_candidates;
create policy insights_news_candidates_admin on insights_news_candidates
  for all using (insights_is_admin()) with check (insights_is_admin());

drop policy if exists insights_gen_jobs_admin on insights_content_generation_jobs;
create policy insights_gen_jobs_admin on insights_content_generation_jobs
  for all using (insights_is_admin()) with check (insights_is_admin());

-- Admin roster: a user may read their own row (so the client can tell if
-- it is an admin); only existing admins may change the roster.
drop policy if exists insights_admins_self_read on insights_admins;
create policy insights_admins_self_read on insights_admins
  for select using (user_id = auth.uid() or insights_is_admin());

drop policy if exists insights_admins_admin on insights_admins;
create policy insights_admins_admin on insights_admins
  for all using (insights_is_admin()) with check (insights_is_admin());

-- Audit log: admins read; writes only via security-definer helper.
drop policy if exists insights_admin_logs_read on insights_admin_action_logs;
create policy insights_admin_logs_read on insights_admin_action_logs
  for select using (insights_is_admin());

-- ---------------------------------------------------------------------------
-- Role grants (RLS still governs row visibility)
-- ---------------------------------------------------------------------------

grant select on
  insights_categories, insights_authors, insights_tags,
  insights_articles, insights_article_tags, insights_article_sources
to anon, authenticated;

grant select, insert, update, delete on
  insights_categories, insights_authors, insights_tags,
  insights_articles, insights_article_tags, insights_article_sources,
  insights_article_quality, insights_news_sources, insights_news_candidates,
  insights_content_generation_jobs, insights_admins
to authenticated;

grant select on insights_admin_action_logs to authenticated;

grant all on
  insights_categories, insights_authors, insights_tags,
  insights_articles, insights_article_tags, insights_article_sources,
  insights_article_quality, insights_news_sources, insights_news_candidates,
  insights_content_generation_jobs, insights_admins, insights_admin_action_logs
to service_role;

-- ---------------------------------------------------------------------------
-- Function execution grants
-- ---------------------------------------------------------------------------

-- Safe read helpers
grant execute on function insights_slugify(text)                       to anon, authenticated;
grant execute on function insights_article_unique_slug(text, uuid)     to authenticated;
grant execute on function insights_is_admin()                          to anon, authenticated;
grant execute on function insights_current_email()                     to authenticated;

-- Admin workflow RPCs — self-check insights_is_admin(); deny anon outright.
revoke all on function insights_publish_article(uuid)                  from public;
revoke all on function insights_unpublish_article(uuid)                from public;
revoke all on function insights_schedule_article(uuid, timestamptz)    from public;
revoke all on function insights_archive_article(uuid)                  from public;
revoke all on function insights_approve_candidate(uuid)               from public;
revoke all on function insights_reject_candidate(uuid, text)          from public;
revoke all on function insights_log_admin_action(text, text, text, jsonb) from public;

grant execute on function insights_publish_article(uuid)               to authenticated;
grant execute on function insights_unpublish_article(uuid)             to authenticated;
grant execute on function insights_schedule_article(uuid, timestamptz) to authenticated;
grant execute on function insights_archive_article(uuid)              to authenticated;
grant execute on function insights_approve_candidate(uuid)            to authenticated;
grant execute on function insights_reject_candidate(uuid, text)       to authenticated;

-- Service-role-only functions (cron / bootstrap)
revoke all on function insights_publish_due_scheduled()               from public;
revoke all on function insights_grant_admin(text, text)               from public;
grant execute on function insights_publish_due_scheduled()            to service_role;
grant execute on function insights_grant_admin(text, text)            to service_role;
