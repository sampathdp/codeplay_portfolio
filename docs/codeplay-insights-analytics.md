# CodePlay Insights — Analytics & Article Performance (Phase 8)

## Principle

Optional and privacy-conscious. No analytics script is requested unless
explicitly configured. When configured, we send only what is needed to
answer the questions below.

## Integrations

| Signal | Where it lives | Notes |
| --- | --- | --- |
| Page views + events | **GA4** (optional) | `lib/insights/analytics.ts`. Loaded only when `VITE_GA4_ID` is set. Reuses an existing `gtag` if the site already has one — never a second tag. `anonymize_ip`, SPA `page_view` sent manually on each Insights route change. |
| Per-article view count | **Supabase** | `insights_record_view(slug)` RPC (Phase 7), bumped once per session from `lib/insights/views.ts`. Powers *most read* / *trending* in the admin dashboard and on-site. |
| Editorial funnel | **Supabase** | `insights_admin_action_logs`, `insights_content_generation_jobs`, `insights_ai_usage` — drive the admin KPIs. |

There is **no third analytics tool** and no custom event backend. If GA4
is not wanted, the Supabase view counter alone still answers "what's
popular".

## Tracked events (GA4, when enabled)

| Event | Fired from | Key params |
| --- | --- | --- |
| `article_view` | article page mount | `article_slug`, `article_category` |
| `scroll_depth` | article page (25/50/75/100 %) | `article_slug`, `percent_scrolled` |
| `article_share` | `ShareControls` (LinkedIn/X/Facebook/copy) | `article_slug`, `method` |
| `source_click` | `SourcesList` outbound link | `article_slug`, `link_url` |
| `related_article_click` | `RelatedStories` card | `from_slug`, `to_slug` |
| `codeplay_cta_click` | `BusinessCta` + `RelatedServices` | `cta_context`, `link_url` |
| `category_view` | category page mount | `article_category`, `result_count` |
| `search` | search page (debounced) | `search_term`, `result_count` |

## Answering the performance questions

| Question | How |
| --- | --- |
| Most viewed articles | Supabase `insights_articles.view_count`; GA4 `article_view` by `article_slug`. |
| Trending articles | GA4 `article_view` over a rolling window vs. baseline; `trending` flag in the admin. |
| Top categories | GA4 `category_view` + `article_view` grouped by `article_category`. |
| Top entry pages | GA4 *Landing page* dimension filtered to `/insights/`. |
| CTR to CodePlay contact | GA4 `codeplay_cta_click` ÷ `article_view` (optionally by category). |
| Articles generating business leads | Mark the `/contact` submission as a GA4 conversion; segment by landing page = `/insights/*` and by `codeplay_cta_click` referral. Contact form wiring is out of scope for this phase — the events are in place for it. |

## Configuration

Repository variable (GitHub → Settings → Variables), consumed at build
time:

```
VITE_GA4_ID = G-XXXXXXXXXX
```

Unset ⇒ `analyticsEnabled()` is `false`, every helper is a no-op, no
script is loaded. Verified by `analytics.test.ts`.
