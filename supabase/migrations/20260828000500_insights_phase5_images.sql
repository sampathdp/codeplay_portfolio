-- CodePlay Insights — Phase 5
-- Gemini-powered editorial featured images. Server-side generation, stored
-- in Supabase Storage (bucket `insights-media`, public read). One image
-- per selected article by default; manual uploads are never auto-replaced.

-- ---------------------------------------------------------------------------
-- Storage bucket + policies
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('insights-media', 'insights-media', true, 15728640,
        array['image/webp', 'image/png', 'image/jpeg', 'image/svg+xml'])
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists insights_media_public_read on storage.objects;
create policy insights_media_public_read on storage.objects
  for select using (bucket_id = 'insights-media');

drop policy if exists insights_media_admin_write on storage.objects;
create policy insights_media_admin_write on storage.objects
  for all
  using (bucket_id = 'insights-media' and insights_is_admin())
  with check (bucket_id = 'insights-media' and insights_is_admin());

-- ---------------------------------------------------------------------------
-- Article image metadata
-- ---------------------------------------------------------------------------

alter table insights_articles
  add column if not exists featured_image_status       text not null default 'none'
    check (featured_image_status in ('none', 'generated', 'manual', 'fallback', 'failed')),
  add column if not exists featured_image_is_manual     boolean not null default false,
  add column if not exists featured_image_model         text,
  add column if not exists featured_image_generated_at  timestamptz,
  add column if not exists featured_image_width         integer,
  add column if not exists featured_image_height        integer,
  add column if not exists featured_image_bytes         integer,
  add column if not exists featured_image_storage_path  text,
  add column if not exists featured_image_variants      jsonb not null default '[]'::jsonb;

comment on column insights_articles.image_is_ai_generated is
  'True for Gemini-generated editorial illustrations. Surface an "AI-generated editorial illustration" label where shown.';

-- ---------------------------------------------------------------------------
-- insights_image_assets — every stored variant, kept across regenerations
-- ---------------------------------------------------------------------------

create table if not exists insights_image_assets (
  id            uuid primary key default gen_random_uuid(),
  article_id    uuid not null references insights_articles(id) on delete cascade,
  job_id        uuid references insights_content_generation_jobs(id) on delete set null,
  label         text not null,                       -- primary | og | w1200 | w800 | w400 | fallback
  url           text not null,
  storage_path  text,
  content_type  text not null default 'image/webp',
  width         integer,
  height        integer,
  bytes         integer,
  is_primary    boolean not null default false,
  source        text not null default 'generated'
                  check (source in ('generated', 'manual', 'fallback')),
  model         text,
  prompt        text,
  alt_text      text,
  created_at    timestamptz not null default now()
);

create index if not exists insights_image_assets_article_idx on insights_image_assets(article_id);
create index if not exists insights_image_assets_primary_idx  on insights_image_assets(article_id) where is_primary;

alter table insights_image_assets enable row level security;

drop policy if exists insights_image_assets_read on insights_image_assets;
create policy insights_image_assets_read on insights_image_assets
  for select using (
    insights_is_admin()
    or exists (
      select 1 from insights_articles a
      where a.id = article_id and a.status = 'published'
        and a.published_at is not null and a.published_at <= now()
    )
  );

drop policy if exists insights_image_assets_admin on insights_image_assets;
create policy insights_image_assets_admin on insights_image_assets
  for all using (insights_is_admin()) with check (insights_is_admin());

grant select on insights_image_assets to anon, authenticated;
grant select, insert, update, delete on insights_image_assets to authenticated;
grant all on insights_image_assets to service_role;

-- ---------------------------------------------------------------------------
-- Generation job kinds: add image kinds
-- ---------------------------------------------------------------------------

alter table insights_content_generation_jobs
  drop constraint if exists insights_content_generation_jobs_kind_check;

alter table insights_content_generation_jobs
  add constraint insights_content_generation_jobs_kind_check
  check (kind in (
    'full_article', 'regenerate_section', 'improve_title', 'improve_seo',
    'regenerate_summary', 'fact_check', 'generate_image', 'regenerate_image'
  ));

-- ---------------------------------------------------------------------------
-- Settings: image generation block + pricing
-- ---------------------------------------------------------------------------

update insights_settings
   set value = value || jsonb_build_object(
     'image', jsonb_build_object(
       'enabled', true,
       'autoGenerateOnReview', true,
       'aspectRatio', '16:9',
       'variants', jsonb_build_array(
         jsonb_build_object('label', 'primary', 'width', 1600, 'height', 900),
         jsonb_build_object('label', 'og',      'width', 1200, 'height', 630),
         jsonb_build_object('label', 'w1200',   'width', 1200, 'height', 675),
         jsonb_build_object('label', 'w800',    'width', 800,  'height', 450),
         jsonb_build_object('label', 'w400',    'width', 400,  'height', 225)
       ),
       'webpQuality', 82
     )
   )
 where key = 'generation';

update insights_settings
   set value = jsonb_set(
     value,
     '{imagePricingUsd}',
     jsonb_build_object(
       'gemini-2.5-flash-image', 0.04,
       'imagen-3.0-generate-002', 0.03,
       'default', 0.04
     )
   )
 where key = 'ai_budget';

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------

create or replace function insights_request_image(
  p_article_id uuid,
  p_kind       text default 'generate_image',
  p_prompt     text default null
)
returns insights_content_generation_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row     insights_content_generation_jobs;
  v_article insights_articles;
begin
  perform insights_require_admin();
  if p_kind not in ('generate_image', 'regenerate_image') then
    raise exception 'invalid image job kind %', p_kind using errcode = '22023';
  end if;

  select * into v_article from insights_articles where id = p_article_id;
  if not found then raise exception 'article % not found', p_article_id using errcode = 'P0002'; end if;

  -- A manual image is never auto-replaced; require explicit removal first.
  if v_article.featured_image_is_manual then
    raise exception 'article has a manual image; remove it before generating'
      using errcode = '42501';
  end if;

  insert into insights_content_generation_jobs
    (article_id, cluster_id, kind, params, status, step, requested_by)
  values
    (p_article_id, v_article.cluster_id, p_kind,
     jsonb_build_object('article_id', p_article_id, 'prompt_override', p_prompt),
     'queued', 'image', auth.uid())
  returning * into v_row;

  perform insights_log_admin_action('request_image', 'generation_job', v_row.id::text,
    jsonb_build_object('article_id', p_article_id, 'kind', p_kind));
  return v_row;
end;
$$;

create or replace function insights_set_image_prompt(p_article_id uuid, p_prompt text)
returns insights_articles
language plpgsql
security definer
set search_path = public
as $$
declare v_row insights_articles;
begin
  perform insights_require_admin();
  update insights_articles set image_prompt = p_prompt where id = p_article_id
    returning * into v_row;
  if not found then raise exception 'article % not found', p_article_id using errcode = 'P0002'; end if;
  perform insights_log_admin_action('edit_image_prompt', 'article', p_article_id::text, '{}'::jsonb);
  return v_row;
end;
$$;

create or replace function insights_set_manual_image(
  p_article_id  uuid,
  p_url         text,
  p_storage_path text,
  p_alt         text,
  p_width       integer,
  p_height      integer,
  p_bytes       integer,
  p_content_type text default 'image/webp'
)
returns insights_articles
language plpgsql
security definer
set search_path = public
as $$
declare v_row insights_articles;
begin
  perform insights_require_admin();

  update insights_articles set
    featured_image_url          = p_url,
    featured_image_alt          = p_alt,
    featured_image_status       = 'manual',
    featured_image_is_manual    = true,
    image_is_ai_generated       = false,
    featured_image_model        = null,
    featured_image_generated_at = now(),
    featured_image_width        = p_width,
    featured_image_height       = p_height,
    featured_image_bytes        = p_bytes,
    featured_image_storage_path = p_storage_path,
    featured_image_variants     = '[]'::jsonb
  where id = p_article_id
  returning * into v_row;
  if not found then raise exception 'article % not found', p_article_id using errcode = 'P0002'; end if;

  delete from insights_image_assets where article_id = p_article_id and source <> 'manual';
  insert into insights_image_assets (article_id, label, url, storage_path, content_type, width, height, bytes, is_primary, source, alt_text)
  values (p_article_id, 'primary', p_url, p_storage_path, p_content_type, p_width, p_height, p_bytes, true, 'manual', p_alt);

  perform insights_log_admin_action('upload_manual_image', 'article', p_article_id::text, '{}'::jsonb);
  return v_row;
end;
$$;

create or replace function insights_remove_image(p_article_id uuid)
returns insights_articles
language plpgsql
security definer
set search_path = public
as $$
declare v_row insights_articles;
begin
  perform insights_require_admin();

  update insights_articles set
    featured_image_url          = null,
    featured_image_alt          = null,
    featured_image_status       = 'none',
    featured_image_is_manual    = false,
    image_is_ai_generated       = false,
    featured_image_model        = null,
    featured_image_generated_at = null,
    featured_image_width        = null,
    featured_image_height       = null,
    featured_image_bytes        = null,
    featured_image_storage_path = null,
    featured_image_variants     = '[]'::jsonb
  where id = p_article_id
  returning * into v_row;
  if not found then raise exception 'article % not found', p_article_id using errcode = 'P0002'; end if;

  delete from insights_image_assets where article_id = p_article_id;
  perform insights_log_admin_action('remove_image', 'article', p_article_id::text, '{}'::jsonb);
  return v_row;
end;
$$;

revoke all on function insights_request_image(uuid, text, text)                              from public;
revoke all on function insights_set_image_prompt(uuid, text)                                 from public;
revoke all on function insights_set_manual_image(uuid, text, text, text, integer, integer, integer, text) from public;
revoke all on function insights_remove_image(uuid)                                           from public;

grant execute on function insights_request_image(uuid, text, text)                           to authenticated;
grant execute on function insights_set_image_prompt(uuid, text)                              to authenticated;
grant execute on function insights_set_manual_image(uuid, text, text, text, integer, integer, integer, text) to authenticated;
grant execute on function insights_remove_image(uuid)                                        to authenticated;
