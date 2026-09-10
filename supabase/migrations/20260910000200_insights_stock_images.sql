-- ---------------------------------------------------------------------------
-- Stock-photo fallback tier for featured images.
--
-- When Gemini image generation fails or is content-filtered, the pipeline
-- now tries a real editorial photograph (Pexels) before dropping to the
-- deterministic category SVG. That adds a new `featured_image_status` /
-- asset `source` value ('stock') and an attribution column.
-- ---------------------------------------------------------------------------

alter table insights_articles
  add column if not exists featured_image_credit jsonb;

comment on column insights_articles.featured_image_credit is
  'Attribution for a stock hero photo: { provider, photographer, photographerUrl, sourceUrl }. Null for generated / manual / SVG.';

-- Widen featured_image_status to allow 'stock'.
alter table insights_articles
  drop constraint if exists insights_articles_featured_image_status_check;

alter table insights_articles
  add constraint insights_articles_featured_image_status_check
  check (featured_image_status in
    ('none', 'generated', 'stock', 'manual', 'fallback', 'failed'));

-- Widen insights_image_assets.source to allow 'stock'.
alter table insights_image_assets
  drop constraint if exists insights_image_assets_source_check;

alter table insights_image_assets
  add constraint insights_image_assets_source_check
  check (source in ('generated', 'stock', 'manual', 'fallback'));
