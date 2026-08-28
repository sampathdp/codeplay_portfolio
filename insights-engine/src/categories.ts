/**
 * The 16 canonical CodePlay Insights category slugs. Mirrors
 * `client/src/lib/insights/categories.ts` (kept in sync by hand — the list
 * is stable and small).
 */
export const INSIGHTS_CATEGORY_SLUGS = [
  "artificial-intelligence",
  "software-development",
  "web-development",
  "mobile-development",
  "game-development",
  "gaming",
  "gaming-community",
  "cybersecurity",
  "cloud-and-devops",
  "developer-tools",
  "hardware-and-gpus",
  "startups",
  "saas",
  "big-tech",
  "open-source",
  "emerging-technology",
] as const;

export type InsightsCategorySlug = (typeof INSIGHTS_CATEGORY_SLUGS)[number];

export function isCategorySlug(s: string): s is InsightsCategorySlug {
  return (INSIGHTS_CATEGORY_SLUGS as readonly string[]).includes(s);
}

export function coerceCategory(
  candidate: string | null | undefined,
  fallback: string | null | undefined,
): InsightsCategorySlug {
  if (candidate && isCategorySlug(candidate)) return candidate;
  if (fallback && isCategorySlug(fallback)) return fallback;
  return "software-development";
}
