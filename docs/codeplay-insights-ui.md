# CodePlay Insights — Public UI (Phase 6)

Companion to the architecture / database / generation / images docs.
Phase 6 is the complete public-facing reader experience for
`/insights`, built to look like part of the existing CodePlay Studios
site (same `Navigation`, `Footer`, `MatrixRain` backdrop, dark theme,
cyan primary, `glass` cards, `Outfit` display type, framer-motion
scroll-reveal). No news-template design was introduced.

---

## 1. Routes (wired in `App.tsx`, lazy-loaded)

| Route | Page | Notes |
|---|---|---|
| `/insights` | `InsightsHome` | editorial home |
| `/insights/search` | `InsightsSearch` | `?q=` client-side search |
| `/insights/category/:slug` | `InsightsCategory` | one of the 16 category slugs |
| `/insights/tag/:slug` | `InsightsTag` | `noindex` when empty |
| `/insights/:slug` | `InsightsArticle` | full article |

Ordering matters — the specific routes precede `/insights/:slug`.
"Insights" was added to `Navigation` and the footer's Agency column.

---

## 2. Data layer (`client/src/lib/insights/`)

Pure functions over the **build-time snapshot** (`data/insights.generated.ts`).
When that snapshot is empty **and** running in dev, `feed.ts` serves
`data/insights.sample.ts` (9 realistic articles) so the layout can be
previewed and tested. Production always uses the real generated data —
the sample module is tree-shaken out of the production bundle (verified).

- `feed.ts` — `allArticles`, `getFeatured`, `getTrending`, `getMostRead`,
  `getLatest`, `byCategory`, `byTag`, `nonEmptyCategories`,
  `searchArticles`, `relatedArticles`, `formatDate`, `formatRelative`.
  - **Search** scores title (×10, +4 prefix), dek (×5), tags (×6),
    category (×4), body (×1), with a multi-term phrase bonus. Client-side
    over the loaded set — fast for the 2–3/day cadence, swappable for a
    Supabase full-text query later without changing callers.
  - **Related** ranks by shared category (+5), shared tags (×3), shared
    entities (×4) and a recency nudge, then tops up with latest so the
    section never looks thin.
- `markdown.ts` — minimal, **HTML-escaped-first** Markdown → HTML
  (headings w/ ids + shift, lists, quotes, fenced code, bold/italic/code,
  links with `rel="noopener noreferrer nofollow" target="_blank"` for
  external, bare for internal). No sanitiser dependency needed.
- `shareUrls.ts` — LinkedIn / Facebook / X share URLs + `copyToClipboard`.
  Plain links, **no third-party scripts**.
- `visuals.ts` — per-category gradient classes, short nav labels, and the
  category-aware business-CTA hook copy.
- `routes.ts` — `insightsTagPath`, `insightsSearchPath` added.
- `types.ts` — `InsightsArticle` extended: `keyTakeaways`, `articleType`,
  `featured`, `trending`, `breaking`, `trendingRank`, `viewCount`,
  `entities`, `authorRole`; `heroImage` gained `variants`, `aiGenerated`,
  `kind` in Phase 5.

**SSG note:** the future build step maps a Phase-4 `GeneratedArticle` +
Phase-5 image metadata onto this `InsightsArticle` shape and writes
`insights.generated.ts` (strip the body's "Sources & Further Reading"
section — the UI renders `article.sources` itself).

---

## 3. Components (`client/src/components/insights/`)

| Component | Role |
|---|---|
| `InsightsShell` | page frame: Navigation + MatrixRain + Footer + `useScrollToTopOnNavigate`, skip-to-content link, `<main id="main">` |
| `ArticleCard` | `default` / `compact` / `wide` variants — image (or category-gradient fallback), category badge, headline, optional excerpt, date · reading-time, trending / breaking indicators. `whileInView` fade, `useReducedMotion`-aware |
| `ArticleImage` | responsive `<img>` with `srcset`/`sizes` from Phase-5 variants, explicit `width`/`height` (CLS), lazy by default / `priority` eager; branded gradient fallback when no image |
| `FeaturedStory` | large split hero card — image, category (as link), breaking flag, headline, excerpt, date · reading-time, "Read the full story" CTA |
| `TrendingList` | ranked `#1 #2 #3…` `<ol>` with oversized numerals; no per-item animation |
| `MostRead` | numbered `01…` list by view count |
| `CategoryNav` | horizontal-scroll pill bar (AI, Development, Web, Gaming, Game Dev, Cybersecurity, Cloud, Hardware, Startups); `aria-current` |
| `CategorySection` | homepage row for one category — hides itself when empty |
| `ArticleGrid` | responsive `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` |
| `SectionHeader` | eyebrow + `<h2>`/`<h3>` + optional "View all" link |
| `Breadcrumb` | semantic `<nav aria-label="Breadcrumb">` + ordered list, `aria-current="page"` |
| `ArticleBody` | renders Markdown via `markdown.ts` into Tailwind Typography `prose prose-invert` + `.insights-prose` editorial refinements |
| `KeyTakeaways` | "Key Takeaways" checklist box from `article.keyTakeaways` |
| `SourcesList` | "Sources & Further Reading" — publisher + link, primary sources first, `rel="noopener noreferrer nofollow"` |
| `RelatedStories` | 3–6 ranked related cards |
| `BusinessCta` | subtle, category-aware ("Building an AI product?" / "Planning a game?" / …) → links to `/contact`. One line, not an advert block |
| `ShareControls` | LinkedIn / X / Facebook / copy-link; `compact` variant for the byline |
| `NewsletterCta` | email capture (validates + confirms; no backend wired yet) |
| `ArticleSEO` | wraps site `<SEO>` with `NewsArticle` JSON-LD (headline, dates, section, author, publisher, image) |
| `EmptyState` | professional "launching soon" / "nothing here yet" panel |

---

## 4. Page composition

**`InsightsHome`** — hero ("Technology that matters." / "Explained for
developers, gamers and businesses."), `CategoryNav` + search link,
**Featured Story**, then a two-column band: **Latest Insights** grid +
sticky sidebar (**Trending Now**, **Most Read** — shown only with ≥3
articles). Below: category rows (Artificial Intelligence, Software &
Development, Web Development, Gaming & Game Development, Gaming,
Cybersecurity, Hardware & GPUs, Startups & SaaS) — each self-hides when
empty. Then a "N articles so far" line for small libraries, and the
**Newsletter / CodePlay CTA**. Full `EmptyState` when there are 0
articles.

**`InsightsArticle`** — breadcrumb, category eyebrow, headline, dek,
byline (author, role, published date, "updated" date, reading time,
compact share), hero `<figure>` with the **"AI-generated editorial
illustration"** caption when applicable, **Key Takeaways**, article body
(`## What Happened? / What Changed? / Technical Breakdown / CodePlay
Developer Take / CodePlay Verdict …` — headings come from the generated
Markdown), **BusinessCta**, share row, **Sources & Further Reading**,
**Related Stories**.

**`InsightsCategory`** / **`InsightsTag`** — heading + description +
count, category pill bar, `ArticleGrid`, `EmptyState` fallback.

**`InsightsSearch`** — URL-synced `?q=`, live client-side results,
result count with `aria-live`, category bar when the query is short, a
`sr-only` crawlable link list, `noindex`.

---

## 5. Accessibility

- Semantic landmarks: `<main id="main">`, `<nav aria-label>`, `<article>`,
  `<figure>/<figcaption>`, `<time datetime>`, `<ol>` for ranked lists.
- One `<h1>` per page; body headings shifted to `<h2>`+ (`markdown.ts`
  `headingShift: 1`).
- Skip-to-content link (visible on focus) in `InsightsShell`.
- Visible focus: `focus-visible:ring-2 focus-visible:ring-primary` on every
  link / card / button / input.
- All images carry `alt` (generated in Phase 5); decorative gradient
  fallbacks are `aria-hidden`.
- Touch targets ≥ 44px on the newsletter and search inputs/buttons.
- `useReducedMotion` disables card reveal animation; a
  `prefers-reduced-motion` rule also neutralises `.animate-fade-in`.
- Sidebar is `sticky` only at `lg` — never obstructs mobile content.

---

## 6. Performance

- Every Insights route is `React.lazy` — chunks: Home ~11 kB, Article
  ~11 kB, Search ~3 kB, Category/Tag ~1.4 kB each. **The marketing site's
  main bundle is unchanged** (Insights UI + sample data are code-split /
  tree-shaken).
- Images: responsive `srcset`/`sizes`, explicit `width`/`height`
  (`aspect-video` reserves space → no CLS), `loading="lazy"` +
  `decoding="async"`, `priority` (eager) only on the featured/hero image.
- Fonts: uses the site's existing preconnected Google Fonts `<link>` — no
  new font requests.
- No third-party scripts added (share is plain links).
- Markdown is rendered once and `useMemo`-cached per body.

**Server rendering:** the site is a static SPA today. The SSG/prerender
step that emits per-article HTML + `sitemap-insights.xml` + RSS is the
deploy-side follow-up (architecture doc §9.2); all Phase-6 data functions
are pure and prerender-ready.

---

## 7. Empty states

Verified professional at 0, 3, 9 articles:
- 0 → full `EmptyState` on the home page; article pages 404; category/tag/
  search show their own empty panels.
- 3 / small → `MostRead` hidden below 3; category rows self-hide; a
  "N articles so far" note appears below 6; the layout never looks broken.

---

## 8. Files

**New components** (`client/src/components/insights/`): `InsightsShell`,
`ArticleCard`, `ArticleImage`, `ArticleMetaLine`, `ArticleBody`,
`ArticleSEO`, `CategoryBadge`, `CategoryNav`, `CategorySection`,
`FeaturedStory`, `TrendingList`, `MostRead`, `SectionHeader`, `Breadcrumb`,
`SourcesList`, `RelatedStories`, `KeyTakeaways`, `BusinessCta`,
`ShareControls`, `NewsletterCta`, `EmptyState`, `index.ts`.

**New lib**: `feed.ts`, `markdown.ts`, `shareUrls.ts`, `visuals.ts`
(+ tests: `feed.test.ts`, `markdown.test.ts`, `shareUrls.test.ts`).

**New data**: `data/insights.sample.ts` (dev-only).

**New pages**: `pages/insights/InsightsCategory.tsx`, `InsightsTag.tsx`,
`InsightsSearch.tsx`. **Rewritten**: `InsightsHome.tsx`, `InsightsArticle.tsx`.

**Modified**: `App.tsx` (3 routes), `Navigation.tsx` + `Footer.tsx`
(Insights link), `index.css` (`.insights-prose` + reduced-motion),
`lib/insights/{types,routes}.ts`.

---

## 9. Tests & build

`npm test` → **191 passing / 27 files** (+26 Phase-6 logic tests):
`markdown` (escaping / headings / links / lists / code fences),
`feed` (selectors, search ranking, related ranking, date formatting),
`shareUrls` (encoded params, no tracker hosts).

`npm run check` → 7 pre-existing unrelated errors, **0 new**.
`npm run check:engine` → clean. `npm run build` → **succeeds**.

Manual: the app was launched (`vite`) and driven with headless Chrome —
home, article and search pages screenshotted at desktop (1280) and mobile
(390). Desktop renders exactly on-brand. (Headless-Chrome mobile capture
clips content identically on the existing site pages too — a pre-existing
capture artifact, not an Insights regression; the responsive markup —
`grid-cols-1 sm:… lg:…`, responsive headline sizes, `flex-col sm:flex-row`,
`overflow-x-hidden`, `line-clamp`, `break-words` — is sound.) Run
Lighthouse against a real build for CWV numbers.
