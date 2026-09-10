# CodePlay Insights — Research & Article Generation (Phase 4)

Companion to `docs/codeplay-insights-architecture.md`,
`-database.md`, `-discovery.md`.

Phase 4 turns a **selected trending cluster** into an **original CodePlay
Insights draft** using Gemini. It is not "AI-rewritten news": every step
works from a structured research bundle, every article carries genuine
CodePlay analysis, and nothing is ever auto-published — drafts land as
`review`. **Image generation is not implemented** (Phase 5); the pipeline
only emits an image *concept*.

---

## 1. Where it runs

Server-side only, in `insights-engine/`. The worker
(`insights-engine/src/generation/run.ts`) is invoked by GitHub Actions
(`.github/workflows/insights-generate.yml`, ~30 min after each discovery
run) and processes queued `insights_content_generation_jobs`. The
browser never holds `GEMINI_API_KEY` — only `insights-engine/src/gemini/
client.ts` touches it, and it is not imported by `client/src`.

```
npm run insights:generate                 # process queued jobs
npm run insights:generate -- --cluster ID  # queue + generate one cluster
npm run insights:generate -- --limit 2
```

---

## 2. Gemini architecture

- SDK: **`@google/genai` v2** (official, current). `RealGeminiClient`
  wraps `ai.models.generateContent`.
- Model IDs are **never hardcoded** — `insights-engine/src/config.ts`
  holds real defaults, all overridable by env:

  | Env var | Default | Used for |
  |---|---|---|
  | `GEMINI_TEXT_MODEL` | `gemini-3.6-flash` | outline, draft |
  | `GEMINI_FAST_MODEL` | `gemini-3.5-flash-lite` | research, verification, fact-check, SEO, quality |
  | `GEMINI_IMAGE_MODEL` | `gemini-3.1-flash-image` | Phase 5 (unused) |
  | `GEMINI_API_KEY` | — | required; server/CI only |

- `GeminiClient` is an **interface**. The pipeline depends only on it, so
  tests inject `MockGeminiClient` and never make a paid call.
- `generateJson()` — every step asks for `application/json`, extracts the
  object (strips fences / prose), validates with Zod, and **repairs once**
  on failure. After two bad attempts it throws — nothing partial is stored.

---

## 3. Cost control

`insights-engine/src/gemini/budget.ts` — `BudgetedGeminiClient` wraps the
real client:

- caps: `dailyUsdCap`, `dailyCallCap`, `perRunCallCap`, `perArticleCallCap`
  (config key `ai_budget`; defaults $4/day, 400 calls/day, 14 calls/article).
- pre-call check → `BudgetExceededError` (pipeline aborts cleanly, no
  partial article).
- every call → an `insights_ai_usage` row: model, request count, tokens,
  `estimated_cost_usd` (from a configurable per-model pricing table —
  "approximate, verify against current Gemini pricing"), status
  (`ok`/`error`/`blocked`).
- the worker reads today's `insights_ai_usage` to seed the running total.

---

## 4. Article workflow

```
selected cluster
  → research bundle          (Gemini, cheap; merges REAL source URLs)
  → source verification      (Gemini + deterministic official-domain floor)
      └─ insufficient → NEEDS_REVIEW, stop (no draft, no spend on drafting)
  → article-type decision    (bundle suggestion / theme+category default)
  → outline                  (Gemini; required sections re-inserted if dropped)
  → draft                    (Gemini; JSON sections + 7 original-value blocks)
  → fact check               (Gemini; classifies every claim)
  → SEO + ~5 headlines       (Gemini; picks the strongest, non-clickbait)
  → deterministic style pass (banned phrases, forbidden claims, sensationalism)
  → quality scores           (Gemini, 8 dimensions) + blended readability
  → quality gates            (configurable thresholds)
  → assemble + final Zod validation
  → persist as `review` draft (or `draft` on hard-fail) — never published
```

### Research bundle (`schema.ts` → `researchBundleSchema`)

`topic, eventDate, knownFacts[], entities{companies,people,products},
primarySources[], secondarySources[], communitySignals[], technicalContext[],
historicalContext[], uncertainties[], claimsRequiringCaution[],
suggestedArticleType, recommendedWordCount`.

Gemini is told to use **only** the supplied headline+metadata items — no
outside facts, thin material goes in `uncertainties`. The real source URLs
from the cluster are merged in afterwards so the model can't drop or
invent citations.

### Article types (11) → section templates

`breaking_news, tech_analysis, developer_guide, explainer, gaming_news,
gaming_community, game_development, ai_news, product_launch,
security_alert, industry_analysis`.

Each has a recommended, ordered section list (`articleTypes.ts`). The
outline step may drop non-fitting sections and add better ones, but every
type keeps a required **CodePlay Verdict**, a CodePlay-analysis section,
and ≥2 original-value sections. Gaming types use *Why Players Care /
Community Reaction / Developer Perspective*; AI/dev types use *Technical
Breakdown / Developer Impact / Business Impact / Example*. Sections are
never forced when irrelevant.

### CodePlay original value

Every draft carries seven structured blocks (`originalValueSchema`):
`developerTake, businessImpact, developerImpact, technicalExplanation,
risksAndLimitations, whyItMatters, actionableRecommendations` — stored in
the existing `insights_articles` columns. The house-style system prompt
**forbids** "we tested / we used / our developers found" and requires
"From a development perspective… / For teams building… / A likely
implication is…".

### Factual safety

- The house prompt requires distinguishing confirmed fact / analysis /
  prediction / community opinion / rumor.
- If source verification says **insufficient** → the pipeline returns
  `needs_review` *before* drafting; the cluster is flagged, the job
  succeeds with a reason, no article row is created.
- The fact-check step classifies every claim and lists
  `unsupportedFactualClaims` + `rumorsPresentedAsFact`.
- **Hard fail** (article kept as `draft`, `needs_review`, never
  `review`): fact-check verdict `fail`, any rumor-as-fact, any forbidden
  hands-on claim, hallucination risk far over threshold.

### Citations

Sources come from the cluster + bundle (deduped, primary first). The
rendered markdown ends with a **"Sources & Further Reading"** section
linking each one, primary sources labelled. `insights_article_sources`
rows are written. Citations are never invented — the URL set is the real
one discovered in Phase 3.

### Length & style

Default 800–1,500 words; important stories (viral ≥78 or breaking)
1,500–2,500. Deterministic checks (`style.ts`) flag banned marketing
phrases ("game changer", "revolutionary", "delve", "ever-evolving
landscape", …), hype punctuation/ALL-CAPS, and sensational verbs; a Flesch
readability proxy is blended with the model's readability score.

### Headlines

The SEO step generates ~5 candidates, each scored on clarity / accuracy /
curiosity / search potential / CTR / clickbait risk, then picks one with a
reason. Clickbait style is explicitly rejected in the prompt.

---

## 5. Quality gates (`quality.ts`)

`evaluateGates()` combines the model's 8 scores, the fact-check verdict,
source verification and the deterministic style report. Thresholds
(config key `generation.thresholds`, all overridable):

| Gate | Default |
|---|---|
| overall quality | ≥ 70 |
| factual confidence | ≥ 65 |
| source quality | ≥ 55 |
| original value | ≥ 60 |
| readability | ≥ 45 |
| duplication risk | ≤ 35 |
| sensationalism | ≤ 30 |
| hallucination risk | ≤ 25 |
| sources | ≥ 2 |
| primary sources | ≥ 1 |

Outcome: **pass** → `review` (`needs_review=false`); **soft fail** →
`review` (`needs_review=true`, reasons listed); **hard fail** → `draft`
(`needs_review=true`). Never published automatically in any case.

Overall quality is a weighted blend: `+`factual .28, original .24, source
.16, readability .12, seo .08; `−`hallucination .2, duplication .18,
sensationalism .12 (`+30` baseline, clamped 0–100).

---

## 6. Structured output

`generatedArticleSchema` validates the final object before any DB write:
`articleType, title, headlineOptions, subtitle, excerpt, slug, category,
tags, content (markdown), sections[], quickSummary[], originalValue{7},
seo{title,description}, sources[], factCheck, quality, overallQuality,
wordCount, readingMinutes, imageConcept{prompt,altText}, needsReview,
reviewReasons`. A malformed assembly → status `failed`, nothing stored.

Persisted (`persist.ts`, service role) to: `insights_articles` (status
`review`/`draft`, all 7 original-value columns, `article_type`,
`headline_options`, `sections`, `fact_check`, `needs_review`,
`generation_job_id`), `insights_article_quality` (10 scores + gate
outcome), `insights_article_sources`, `insights_tags` + `article_tags`,
`insights_ai_usage`, and the cluster is set to `converted`.

---

## 7. Admin actions

`client/src/lib/insights/admin/generation.ts` (RLS + RPC gated):

| Action | How |
|---|---|
| Generate Article | `requestArticleGeneration(clusterId)` → queues a `full_article` job |
| Regenerate Section | `regenerateSection(articleId, key, instruction?)` → job writes a **proposal**; `applySectionProposal(jobId, force?)` applies it |
| Improve Title / SEO / Summary, Run Fact Check | queue the matching job kind (proposal-only) |
| Approve | `approveArticle(id)` → clears `needs_review`, stamps `approved_at`; does not publish |
| Reject / Schedule / Publish / Unpublish | Phase 2 RPCs (`insights_*_article`) |
| (editor) mark edits | `markSectionsEdited(id, keys)` — protects those sections |

**Regenerating a section never auto-overwrites a human edit.** The worker
only writes a proposal to the job; `insights_apply_section` refuses to
apply over a key in `articles.human_edited_sections` unless `force`.

Reads: `listGenerationJobs`, `getGenerationJob`, `aiSpendToday`,
`aiSpendSince`.

---

## 8. Daily quantity

The worker stops taking `full_article` jobs once
`insights_settings.scheduler.maxArticlesPerDay` (3) AI-generated articles
exist for the UTC day. Selection (Phase 3) already refuses to nominate
weak stories, so the quota is a ceiling, not a target.

---

## 9. Migration (Phase 4)

`20260828000400_insights_phase4_generation.sql`:

- widens `insights_content_generation_jobs.step`; adds `kind`, `cluster_id`,
  `article_type`, `params`, `bundle`, `result`, `needs_review`,
  `review_reason`, `requested_by`
- `insights_ai_usage` (cost ledger) + RLS
- `insights_articles`: `article_type`, `headline_options`, `sections`,
  `fact_check`, `needs_review`, `review_reasons`, `generation_job_id`,
  `human_edited_sections`, `approved_at`, `approved_by`
- `insights_article_quality`: `duplication_risk_score`,
  `sensationalism_score`, `hallucination_risk_score`, `gate_passed`,
  `gate_reasons`
- `insights_settings` seed: `generation`, `ai_budget`
- RPCs: `insights_request_generation`, `insights_apply_section`,
  `insights_approve_article`, `insights_mark_sections_edited`

---

## 10. Environment configuration

Server / CI only (never `VITE_`-prefixed, never in the bundle):

```
GEMINI_API_KEY=            # required
GEMINI_TEXT_MODEL=         # optional — default gemini-3.6-flash
GEMINI_FAST_MODEL=         # optional — default gemini-3.5-flash-lite
GEMINI_IMAGE_MODEL=        # optional — Phase 5
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

`insights_settings` (editable by admins via `insights_set_setting`):
`generation` (word counts, headline count, temperatures, thresholds,
banned phrases, forbidden claims) and `ai_budget` (caps + pricing table).

GitHub: add `GEMINI_API_KEY` to repo **secrets**; optionally set
`GEMINI_TEXT_MODEL` / `GEMINI_FAST_MODEL` as repo **variables**.

---

## 11. Tests & build

`npm test` — **144 passing / 20 files** (40 new). All Gemini calls mocked
(`MockGeminiClient`), no network, no paid calls. New coverage:

- `gemini/json` — fence/prose extraction, repair-once, failure, usage accumulation
- `gemini/budget` — cost estimate, per-run / daily USD / daily call caps, error/blocked records
- `generation/style` — banned phrases, forbidden hands-on claims, sensationalism, readability
- `generation/articleTypes` — required + original-value sections per type, theme→type mapping
- `generation/quality` — overall blend, gate pass / soft-fail / hard-fail, insufficient sources
- `generation/pipeline` — full happy path (schema-valid `review` draft), NEEDS_REVIEW on thin sources (stops pre-draft), hard-reject on rumor-as-fact, soft NEEDS_REVIEW on weak scores, clean fail on unrepairable JSON, clean fail on budget exceeded, slug de-dup

`npm run check:engine` — clean. `npm run check` — 7 **pre-existing**
unrelated errors, **0 new**. `npm run build` — succeeds; browser bundle
unchanged (`@google/genai` + engine are server-only).

Dependency added: `@google/genai` (official Gemini SDK).
