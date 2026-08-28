# `components/insights/`

Phase 2 home for CodePlay Insights UI components. Nothing here yet.

Planned components (see `docs/codeplay-insights-architecture.md`):

- `ArticleSEO.tsx` — extends `components/SEO.tsx` with `Article` /
  `NewsArticle` JSON-LD and `og:type=article` tags.
- `ArticleCard.tsx` — list/grid card, built from `components/ui/card`.
- `CategoryPill.tsx`, `TagList.tsx`
- `ArticleBody.tsx` — renders article body with `@tailwindcss/typography`
  `prose` classes (already installed).
- `SourceCitations.tsx` — the "Original sources" block with outbound links.
- `DeveloperTake.tsx` — renders the required original-value sections.

Reuse the existing design system (`components/ui/*`, `framer-motion`,
`Navigation`, `Footer`). Do not introduce new UI dependencies.
