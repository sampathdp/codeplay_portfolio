# CodePlay Insights — Discovery & Trending Engine (Phase 3)

Companion to `docs/codeplay-insights-architecture.md` and
`docs/codeplay-insights-database.md`.

Phase 3 builds the engine that **detects potentially viral stories before
any article is written**. It does not generate or publish articles, and it
is not a scraper — it discovers via official APIs / approved feeds and
stores headline + URL + source + date + short metadata only.

---

## 1. Where it runs

The site is static (no server), so discovery runs as a **scheduled GitHub
Action** (`.github/workflows/insights-discover.yml`) invoking
`insights-engine/src/run.ts` via `tsx`. The engine is written to be
runtime-agnostic (Node today, a Supabase Edge Function later). It writes
to Supabase with the **service role key** (CI secret — never in the
browser bundle).

```
npm run insights:discover        # gather → dedupe → score → persist
npm run insights:discover:dry    # no DB writes, prints picks
npm run insights:schedule        # print the stored schedule config
```

---

## 2. Sources implemented

Modular adapter architecture — `insights-engine/src/adapters/`. Each source
row in `insights_news_sources` names an `adapter` and can be
enabled/disabled individually; an adapter may also refuse to run
(`canRun`) when credentials are missing.

| Adapter | Status | Needs credentials | Notes |
|---|---|---|---|
| `hackernews` | **implemented, no key** | no | Firebase API — `topstories` / `beststories` / `newstories`, "Show HN" flagged as a launch signal. Stores id/title/url/score/time only. |
| `rss` | **implemented, no key** | no | Generic RSS 2.0 + Atom. Full-content nodes are stripped before parsing. `source_type='official'` marks items first-party. |
| `github_releases` | **implemented** | optional `GITHUB_TOKEN` | GitHub REST `/repos/{repo}/releases`. Unauthenticated works for a few repos; Actions passes `github.token` automatically. |
| `reddit` | **implemented, OFF by default** | **yes** — `REDDIT_CLIENT_ID` + `REDDIT_CLIENT_SECRET` | Official OAuth API only (client-credentials). Never HTML scraping. Every item is tagged `community_rumor`. |
| `mock` | test only | — | Fixed items / forced failure for unit tests. |

### Seeded source registry (`20260828000300_insights_phase3_seed.sql`)

~35 rows. **Enabled by default** (feed URL confirmed): Hacker News, OpenAI
News, Google Keyword (AI), Google Developers Blog, Engineering at Meta,
Official Microsoft Blog, GitHub Blog, GitHub Changelog, Apple Newsroom,
NVIDIA Blog, Cloudflare Blog, Supabase Blog, AWS News Blog, GitHub Releases
(React, Next.js, Node, Deno, Bun, Vite, TypeScript, Flutter, Angular, Vue,
Svelte, Tailwind, Supabase), React Blog, Node.js Blog, Python Insider,
PlayStation.Blog, Xbox Wire.

**Seeded but disabled** (feed URL needs confirmation, or trade press, or
needs credentials — flip `enabled` in the admin panel): Anthropic News,
Google DeepMind, Meta AI Blog, Microsoft AI, NVIDIA Developer, AMD, Vercel,
Firebase, Deno Blog, Nintendo, Steam News, Epic Games Store, Unreal Engine
News, Unity Blog, GamesIndustry.biz, Reddit.

**Needs API credentials to work:** `reddit` (Reddit OAuth app).
**Optional credential (higher rate limit only):** `github_releases`
(`GITHUB_TOKEN`).

Additional adapters plug in by implementing `SourceAdapter` and calling
`registerAdapter()` — the pipeline resolves by `source.adapter`.

---

## 3. How scoring works

`insights-engine/src/scoring.ts`. Every sub-score is 0–100; the composite
is a **weight-normalized** blend, also 0–100. Weights come from
`insights_settings` key `scoring` (defaults in `config.ts`):

```
viralScore = (
    freshness           * 0.20
  + engagement          * 0.20
  + sourceAuthority     * 0.15
  + crossSourceCoverage * 0.15
  + codeplayRelevance   * 0.15
  + communityMomentum   * 0.10
  + novelty             * 0.05
) / sum(weights)
```

| Sub-score | Computation |
|---|---|
| **freshness** | exponential decay: `100 · 0.5^(ageHours / halfLife)` (halfLife 18h), 0 past `freshnessMaxAgeHours` (96h). Age = earliest published time in the cluster. |
| **engagement** | log-normalized HN points / comments and Reddit score against configurable caps; best item wins. |
| **sourceAuthority** | top `trust_score` among the cluster's sources (+ small bump for a strong second corroborator). |
| **crossSourceCoverage** | `(sourceCount−1)·34 + (distinctAdapters−1)·12`, capped 100. 1 source ⇒ 0. |
| **codeplayRelevance** | max per-item relevance. Per item: strongest matched theme's base relevance, nudged by matching source category, multi-theme hits, and named-entity presence. AI / software / web / mobile / Flutter / React / game dev / Unity / Unreal / dev tools / SaaS / security / cloud / startups / gaming score highest (theme table in `themes.ts`). |
| **communityMomentum** | from Reddit signals only (score + comments + upvote ratio); 0 when no community item; a lone thread is discounted. |
| **novelty** | heuristic: +25 for launch/announce/unveil/release language, −35 for "update / patch / roundup / weekly / vN.N", −15 per prior similar cluster. Hook for embedding-based novelty later. |

`clamp()` guards 0–100 and maps NaN → 0.

---

## 4. How duplicates are detected

`insights-engine/src/dedupe.ts`. Cheap, deterministic, no embeddings.
Pairwise similarity (0–1) combines:

- **normalized URL equality** → 1.0 (drops protocol, `www`, trailing
  slash, hash, tracking params; sorts query).
- **dedupe hash equality** (leading 4 significant title tokens) → 0.9.
- **title token Jaccard** (×0.4)
- **title character-trigram Dice coefficient** (×0.3)
- **shared named entities** Jaccard (×0.2) — with a bonus when a shared
  entity coincides with lexical overlap.
- **keyword Jaccard** (×0.1)
- optional `semanticSimilar(a,b)` hook (unused in Phase 3).

Items above the threshold (0.55) are unioned (union-find) into a
**topic cluster** (`insights_topic_clusters`). Every source item is kept
as an `insights_news_candidates` row linked by `cluster_id`, so **all
related URLs stay with the cluster**. The cluster's headline is the
earliest / most official item's title; `source_count` = distinct sources.

Admin can also merge clusters manually (`markDuplicate` →
`insights_merge_clusters` RPC).

---

## 5. Gaming & community content

- **Gaming** is first-class: official adapters for PlayStation.Blog, Xbox
  Wire (enabled), plus Nintendo / Steam / Epic / Unreal / Unity / Unity
  Blog / GamesIndustry.biz (seeded, disabled pending feed confirmation).
  Themes cover game engines, Unity, Unreal, new games, gaming
  controversies, Steam trends, console news, GPU news — mapped to the
  `gaming`, `game-development`, `gaming-community` categories.
- **Community (Reddit)** is an **optional** adapter, **disabled** until
  `REDDIT_CLIENT_ID` + `REDDIT_CLIENT_SECRET` are set and the source +
  `insights_settings.community.enabled` are flipped on. Official OAuth API
  only. Subreddits are configurable (`technology`, `artificial`,
  `LocalLLaMA`, `programming`, `webdev`, `gamedev`, `Unity3D`,
  `unrealengine`, `gaming`, `pcgaming`, `Games`, `Steam`, `indiegaming`).
- **Community posts are trend signals, not facts.** Every Reddit item is
  classified `community_rumor`. It contributes to `communityMomentum` and
  can raise a story's viral score, but:
  - a cluster is `verified` only with a first-party source,
  - `likely` needs ≥2 reputable secondary sources,
  - `community_rumor` / `unverified` clusters are **excluded from daily
    selection** (so no article is generated from a rumor) unless an admin
    explicitly force-flags research.
- Breaking classification (`breaking.ts`) never fires for
  `community_rumor` / `unverified` clusters.

---

## 6. Fact confidence

Per item (`classify.ts` → `baseConfidence`):

| Source | Confidence |
|---|---|
| `source_type='official'` feed, or `github_releases` | `verified` |
| HN link whose domain is a known first-party domain | `verified` |
| other HN links | `unverified` |
| trade-press RSS (`source_type='rss'`) | `likely` |
| Reddit / `community` | `community_rumor` |

Per cluster (`clusterConfidence`): any `verified` ⇒ `verified`; ≥2
`likely` (or 1 `likely` in a ≥3-source cluster) ⇒ `likely`; else any
community ⇒ `community_rumor`; else `unverified`.

---

## 7. Selection — `selectDailyArticleCandidates()`

`insights-engine/src/selection.ts`. Config: `insights_settings.selection`.

1. **Filter** eligible clusters: not recently used, `viralScore ≥
   minViralScore` (45), `factConfidence ∈ {verified, likely}`, within
   `lookbackHours` (36). Admin-forced clusters bypass the filter.
2. **Pass 1 — diversity slots** (best caps-valid match each):
   - slot 1 — AI / software / emerging tech / big tech
   - slot 2 — dev tools / web / mobile / cloud / open source / startups /
     SaaS / security / hardware
   - slot 3 — gaming / game dev / gaming community
3. **Pass 2** — top up to `perDay` (3) with the next best remaining,
   respecting `maxPerTheme` (1), `maxPerCategory` (2),
   `requireDistinctPrimaryTheme`.
4. **Pass 3** — if still below `minPerDay` (2), relax the theme/category
   caps (never the eligibility filter).
5. Returns 0–3 picks, each with a human `reason`, plus a `note` when the
   day is short. **Two articles about the same topic can't both be
   picked** (distinct primary theme enforced).

Selection is advisory — it produces a plan; an admin (or Phase 4) acts on
it. It does not write anything.

---

## 8. Scheduler behavior

- **Trigger:** GitHub Actions `schedule:` cron
  `0 3,7,10,14,17,21 * * *` (UTC) — 6×/day discovery, plus
  `workflow_dispatch` for manual runs (with a `dry_run` input).
- **Config, not hardcoded:** `insights_settings.scheduler` holds the
  timezone (`Asia/Colombo` default), the discovery crons, the local
  **publish windows** `08:30 / 15:30 / 22:30`, and `maxArticlesPerDay`
  (3). `scheduler.ts` reads this to compute local time / next window;
  it doesn't trigger anything itself.
- **Cadence:** collect candidates several times/day; **publish at most
  2–3 articles/day** (enforced in selection + Phase 4).
- **Concurrency:** the workflow uses a `concurrency` group so runs don't
  overlap.
- Every adapter run is logged to `insights_ingestion_runs` (status, items,
  error, duration). One failed source never aborts the run; if *every*
  source fails the job exits non-zero so the cron surfaces it.

---

## 9. Rate limiting & resilience

`insights-engine/src/http.ts`:

- per-request timeout (AbortController, 12s),
- retry with exponential backoff + jitter on 429 / 5xx / network error
  (3 retries), honoring `Retry-After`,
- 4xx (non-429) fails fast, not retried,
- per-host minimum interval (politeness),
- a descriptive `User-Agent` identifying the bot + purpose.

Failure isolation: each adapter runs in its own try/catch; the outcome is
recorded and the pipeline moves on. `github_releases` isolates per-repo;
`reddit` isolates per-subreddit; `hackernews` isolates per-stream and
per-item.

---

## 10. Admin

`client/src/lib/insights/admin/clusters.ts` + `settings.ts` (RLS + RPC
gated, no client-side authz):

- `listReviewQueue()` / `listClusters()` — headline, source count,
  category, age (`first_seen_at`), viral score, confidence, community
  score, breaking flag, `selection_reason`.
- `getClusterDetail(id)` — the cluster + **every** source item behind it.
- `selectCluster` / `rejectCluster` / `ignoreCluster` / `forceResearch`
  (bypass filters) / `markDuplicate` (merge) — RPCs
  `insights_select_cluster`, `insights_reject_cluster`,
  `insights_ignore_cluster`, `insights_force_research_cluster`,
  `insights_merge_clusters`. "Ignore source" = `setSourceEnabled(id, false)`
  (Phase 2 `sources.ts`).
- `listIngestionRuns()` — adapter health.
- `listSettings` / `getSetting` / `setSetting` — engine config
  (`insights_set_setting` RPC).

The admin UI screens are Phase 4/5.

---

## 11. Migrations added (Phase 3)

| File | Contents |
|---|---|
| `20260828000050_insights_enum_additions.sql` | `insights_fact_confidence` enum; `'ignored'` candidate status |
| `20260828000100_insights_phase3_tables.sql` | `insights_settings`, `insights_topic_clusters`, `insights_ingestion_runs`; `adapter`/`slug` on `news_sources`; `cluster_id` + dedupe/classification columns on `news_candidates`; `cluster_id` on `articles` |
| `20260828000200_insights_phase3_functions_rls.sql` | cluster triage RPCs, `insights_set_setting`, RLS + grants for the new tables |
| `20260828000300_insights_phase3_seed.sql` | `insights_settings` defaults + ~35 source rows |

---

## 12. Tests & build

`npm test` — **104 passing / 14 files** (60 new engine tests). Coverage:

- `normalize` — title/URL normalization, entity + keyword extraction, dedupe hash
- `dedupe` — similarity primitives, multi-source clustering, retains all URLs, no over-merge
- `scoring` — every sub-score, weight-normalized composite, configurable weights, 0–100 bounds
- `classify` — theme + category + relevance, fact confidence per source type, official-domain detection, cluster confidence
- `selection` — 2–3 picks, slot diversity, no duplicate theme, rumor exclusion, forced bypass, recently-used skip, stale drop
- `pipeline` — discover→cluster→score→persist, **source failure isolation**, disabled/no-adapter/`canRun=false` skips
- `http` — retry on 5xx/429/network, no-retry on 404, give-up after N
- `scheduler` — Asia/Colombo local time, next-window / wrap-past-midnight

`npm run check:engine` (`tsc -p tsconfig.engine.json`) — clean.
`npm run check` (client `tsc`) — 7 **pre-existing** unrelated errors, **0
new**.
`npm run build` — **succeeds**; main bundle unchanged (engine +
`fast-xml-parser` are not in the browser bundle).

Dependency added: `fast-xml-parser` (MIT, zero-dep) for RSS/Atom.
