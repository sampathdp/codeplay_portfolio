/**
 * AUTO-GENERATED (placeholder).
 *
 * In Phase 2 this file is overwritten by
 * `scripts/insights/build-content.mjs`, which runs in CI before
 * `vite build` and pulls `status = 'published'` articles from Supabase.
 * Until then it is an empty, type-correct seed so the Insights pages
 * compile and render an empty state.
 *
 * Do not hand-edit — changes will be clobbered by the next build.
 */

import type { InsightsArticle } from "@/lib/insights/types";

export const INSIGHTS_ARTICLES: InsightsArticle[] = [];

export function getPublishedArticle(
  slug: string,
): InsightsArticle | undefined {
  return INSIGHTS_ARTICLES.find(
    (a) => a.slug === slug && a.status === "published",
  );
}
