/**
 * Central route-path definitions for CodePlay Insights.
 *
 * Keeping paths in one place so `App.tsx`, navigation, the sitemap/RSS
 * build step, and the admin panel never drift apart. Public routes that
 * are not implemented yet are listed here as the agreed contract.
 */

export const INSIGHTS_BASE = "/insights";
export const ADMIN_INSIGHTS_BASE = "/admin/insights";

export const insightsRoutes = {
  home: INSIGHTS_BASE,
  article: `${INSIGHTS_BASE}/:slug`,
  category: `${INSIGHTS_BASE}/category/:slug`,
  tag: `${INSIGHTS_BASE}/tag/:slug`,
  search: `${INSIGHTS_BASE}/search`,
  // Planned — not wired into the router yet:
  trending: `${INSIGHTS_BASE}/trending`,
} as const;

export const adminInsightsRoutes = {
  dashboard: ADMIN_INSIGHTS_BASE,
  // Planned for Phase 2 — not wired into the router yet:
  articles: `${ADMIN_INSIGHTS_BASE}/articles`,
  article: `${ADMIN_INSIGHTS_BASE}/articles/:id`,
  sources: `${ADMIN_INSIGHTS_BASE}/sources`,
  settings: `${ADMIN_INSIGHTS_BASE}/settings`,
} as const;

export const SITE_ORIGIN = "https://codeplaystudios.com";

export function insightsArticlePath(slug: string): string {
  return `${INSIGHTS_BASE}/${slug}`;
}

export function insightsArticleUrl(slug: string): string {
  return `${SITE_ORIGIN}${insightsArticlePath(slug)}`;
}

export function insightsCategoryPath(slug: string): string {
  return `${INSIGHTS_BASE}/category/${slug}`;
}

export function insightsTagPath(slug: string): string {
  return `${INSIGHTS_BASE}/tag/${slug}`;
}

export function insightsSearchPath(query?: string): string {
  return query
    ? `${INSIGHTS_BASE}/search?q=${encodeURIComponent(query)}`
    : `${INSIGHTS_BASE}/search`;
}
