# CodePlay Insights — Database & Admin API (Phase 2)

Companion to `docs/codeplay-insights-architecture.md`. Covers what Phase 2
actually built: the Supabase schema, RLS model, and the typed admin API
layer. **No news crawling or Gemini generation is implemented** — those
are Phase 3.

---

## 1. Migrations

All under `supabase/migrations/`, applied in order (`supabase db push`).

| # | File | Contents |
|---|------|----------|
| 1 | `20260827000100_insights_enums_and_taxonomy.sql` | 5 enum types; `insights_categories`, `insights_authors`, `insights_tags`; `insights_touch_updated_at()` |
| 2 | `20260827000200_insights_articles.sql` | `insights_articles`, `insights_article_tags`, `insights_article_sources`, `insights_article_quality` + indexes + status/timestamp CHECK constraints |
| 3 | `20260827000300_insights_pipeline.sql` | `insights_news_sources`, `insights_news_candidates`, `insights_content_generation_jobs`, `insights_admins`, `insights_admin_action_logs`; adds `insights_articles.candidate_id` |
| 4 | `20260827000400_insights_functions_triggers.sql` | identity helpers, `insights_slugify()`, `insights_article_unique_slug()`, article write trigger (slug + reading time), `source_count` sync trigger, audit helper, **authorized workflow RPCs** |
| 5 | `20260827000500_insights_rls.sql` | `enable row level security` on all 12 tables + policies + role/function grants |
| 6 | `20260827000600_insights_seed.sql` | idempotent seed: 16 categories (name/slug/description/SEO), 1 editorial author. **Tags are not seeded.** |

Enums:

```
insights_article_status   idea | researching | draft | review | scheduled | published | rejected | archived
insights_content_type     news | analysis | explainer | opinion | roundup | tutorial
insights_source_kind      official | rss | api | community | release_feed
insights_candidate_status discovered | filtered | selected | rejected | converted
insights_job_status       queued | running | succeeded | failed | cancelled
```

---

## 2. Schema summary

### `insights_articles`
`id, title, slug (unique), subtitle, excerpt, content, content_html,
content_format, category_id→categories, author_id→authors, candidate_id→news_candidates,
featured_image_url, featured_image_alt, image_prompt, image_is_ai_generated,
status, content_type, featured, trending, breaking, source_count,
quality_score, viral_score, seo_score, reading_time, view_count, share_count,
developer_take, business_impact, developer_impact, risks_limitations,
why_it_matters, recommendations, published_at, scheduled_at, created_by,
created_at, updated_at`

- `slug` is auto-derived from `title` when blank and always de-duplicated
  by the BEFORE-write trigger (`-2`, `-3`, …).
- `reading_time` is recomputed from `content` (~200 wpm) on every write.
- CHECK: `status='published'` ⇒ `published_at` set; `status='scheduled'` ⇒
  `scheduled_at` set. Score columns constrained to 0–100.

### `insights_article_sources`
`id, article_id, source_name, source_url, source_type (checked set),
source_author, source_published_at, primary_source, verified, notes,
created_at`. **Reference metadata + short factual notes only** — a table
comment and the architecture doc both state full third-party bodies are
never stored here. `source_count` on the parent article is trigger-maintained.

### `insights_categories` / `insights_authors` / `insights_tags`
Categories carry `seo_title` + `seo_description`. Authors carry
`bio, avatar_url, role, expertise text[], social_links jsonb, is_team,
user_id` (nullable link to `auth.users`). Tags are `name` + `slug` only,
created on demand.

### `insights_news_candidates`
`id, external_id, title, url (unique), source, source_type, news_source_id,
summary, category, published_at, discovered_at,
engagement_score, freshness_score, authority_score, relevance_score,
community_score, novelty_score, viral_score,
duplicate_group_id, status, rejection_reason, article_id, timestamps`.
Unique on `url`, and on `(source, external_id)` when `external_id` is set.

### `insights_news_sources`
`id, name (unique), base_url, feed_url, source_type, category, enabled,
trust_score (0–100), priority, last_checked_at, configuration jsonb, timestamps`.

### `insights_content_generation_jobs`
`id, candidate_id, article_id, status, step (research|draft|image|quality|
finalize), model, prompt_tokens, completion_tokens, total_tokens, cost_usd,
error, attempt_count, max_attempts, started_at, completed_at, timestamps`.

### `insights_article_quality` (1:1 with article)
`article_id (pk), fact_check_score, source_quality_score, originality_score,
readability_score, seo_score, overall_quality_score, checks jsonb,
checked_at, timestamps`.

### `insights_admins`
`user_id (pk → auth.users), email, role (editor|admin), created_at`.

### `insights_admin_action_logs`
`id (identity), actor → auth.users, actor_email, action, entity_type,
entity_id, metadata jsonb, created_at`. Written only by the
security-definer helper `insights_log_admin_action()`.

---

## 3. Security / RLS

**Threat model:** the browser only ever holds the anon key. Authorization
is 100% database-side.

| Role | Access |
|------|--------|
| `anon`, `authenticated` (non-admin) | `SELECT` only, and only **published** articles (`status='published' AND published_at <= now()`) plus their tags/sources, plus all categories / authors / tags. Nothing else is visible. |
| `authenticated` **in `insights_admins`** | Full `SELECT/INSERT/UPDATE/DELETE` on every Insights table via `*_admin` policies gated by `insights_is_admin()`. |
| `service_role` (CI build, cron) | Bypasses RLS. Used by the Phase 3 content build step and the scheduled-publish job. Never shipped to a client. |

Key policies:

- `insights_articles_read_published` — the only public window into articles.
- `insights_article_tags_read` / `insights_article_sources_read` — join
  rows visible only when the parent article is publicly visible.
- `insights_article_quality`, `insights_news_*`, `insights_content_generation_jobs`,
  `insights_admin_action_logs` — **no public policy at all** (admin only).
- `insights_admins_self_read` — a signed-in user may read *their own* row
  so the client can tell whether it is an admin; only admins can modify
  the roster.

**Authorized workflow RPCs** (all `security definer`, `set search_path`,
first line `perform insights_require_admin()` which raises `42501` if the
caller is not an admin — so authorization never depends on the client):

| RPC | Effect |
|-----|--------|
| `insights_publish_article(uuid)` | → `published`, sets `published_at` |
| `insights_unpublish_article(uuid)` | → `draft`, clears timestamps |
| `insights_schedule_article(uuid, timestamptz)` | → `scheduled` (rejects past times) |
| `insights_archive_article(uuid)` | → `archived` |
| `insights_approve_candidate(uuid)` | candidate → `selected` |
| `insights_reject_candidate(uuid, text)` | candidate → `rejected` + reason |

Each RPC writes an `insights_admin_action_logs` row.

**Service-role-only functions** — `execute` revoked from `public`:

- `insights_publish_due_scheduled()` → flips due `scheduled` articles to
  `published`; called by cron.
- `insights_grant_admin(email, role)` → bootstraps an admin from an
  existing `auth.users` row.

**Secrets:** `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `CRON_SECRET`
appear only in `.env.example` and server/CI docs. A unit test
(`client/src/lib/insights/security.test.ts`) scans `client/src/**` on
every `npm test` and fails the build if any of those names, a
`process.env` reference, or a non-allow-listed `import.meta.env` key
appears in client code.

---

## 4. Admin API (`client/src/lib/insights/admin/`)

A thin typed layer over the anon-key Supabase client. It performs **no**
authorization of its own — RLS + the RPCs do. Every function throws on
error.

| Module | Functions |
|--------|-----------|
| `articles.ts` | `createArticle`, `updateArticle`, `getArticle`, `getArticleBySlug`, `listArticles`, `listDrafts`, `listPublished`, `listScheduled`, `setArticleTags`, `deleteArticle`, `archiveArticle`, `publishArticle`, `unpublishArticle`, `scheduleArticle` |
| `candidates.ts` | `listCandidates`, `listNewCandidates`, `approveCandidate`, `rejectCandidate` |
| `sources.ts` | `listSources`, `createSource`, `updateSource`, `setSourceEnabled`, `deleteSource` |
| `taxonomy.ts` | `listCategories`, `createCategory`, `updateCategory`, `listTags`, `createTag`, `deleteTag`, `ensureTags` |
| `audit.ts` | `listAuditLogs` |

Supporting: `schemas.ts` (Zod validation for all admin input),
`slug.ts` (`slugify`, `ensureUniqueSlug` — mirrors the SQL),
`readingTime.ts`, `scoring.ts` (`compositeViralScore`, `overallQualityScore`),
`records.ts` (row types), `supabase.ts` (lazy anon client),
`auth.ts` (magic-link sign-in + `getAdminProfile`).

UI: `components/insights/RequireAdmin.tsx` gates `/admin/insights`
(client-side UX only; RLS is the real gate). `AdminInsights.tsx` is
wrapped in it.

### Slugs

`slugify("Google Launches New Gemini Model")` → `google-launches-new-gemini-model`.
Collisions get `-2`, `-3`, … (never `-1`). Max 80 chars, no trailing
hyphen after truncation. Enforced both client-side (preview) and in the
DB trigger (source of truth).

---

## 5. Configuration

Set in `.env` / CI. When `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
are **absent**, `isInsightsConfigured()` is false, the admin page shows
"not configured", and `@supabase/supabase-js` is tree-shaken out of the
bundle entirely (verified: main chunk unchanged vs Phase 1). `main.yml`
passes both from optional GitHub secrets.

---

## 6. Tests

`npm test` (Vitest, `vitest.config.ts`). 44 tests / 6 files:
`slug`, `readingTime`, `scoring`, `schemas`, `admin/articles` (stubbed
Supabase client), `security` (bundle secret scan).

---

## 7. Not in Phase 2

News discovery, dedupe, ranking, Gemini calls, image generation, the
build-time SSG step, RSS/sitemap generation, the admin UI screens
themselves. See architecture doc §13.
