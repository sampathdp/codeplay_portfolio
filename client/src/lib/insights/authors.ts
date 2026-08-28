/**
 * Editorial authorship for CodePlay Insights.
 *
 * CodePlay has not supplied individual journalist bios, so bylines resolve
 * to a named editorial entity rather than invented people. This keeps
 * E-E-A-T signals honest: a real, accountable publisher with a stated
 * editorial process — see `/insights/editorial-policy`.
 */

import { SITE_ORIGIN, INSIGHTS_BASE } from "./routes";

export interface InsightsAuthor {
  slug: string;
  name: string;
  /** schema.org type to emit in JSON-LD. */
  type: "Organization" | "Person";
  role: string;
  bio: string;
  url: string;
}

export const EDITORIAL_TEAM: InsightsAuthor = {
  slug: "codeplay-studios-editorial-team",
  name: "CodePlay Studios Editorial Team",
  type: "Organization",
  role: "CodePlay Insights Editorial Team",
  bio: "CodePlay Insights is written and edited by the software and games engineers at CodePlay Studios. Every article is reviewed against our editorial process before publication — sources verified, claims separated from analysis, and the CodePlay developer take added by a human editor.",
  url: `${SITE_ORIGIN}${INSIGHTS_BASE}/authors/codeplay-studios-editorial-team`,
};

export const INSIGHTS_AUTHORS: InsightsAuthor[] = [EDITORIAL_TEAM];

export function getInsightsAuthor(slugOrName: string): InsightsAuthor {
  const key = slugOrName.toLowerCase();
  return (
    INSIGHTS_AUTHORS.find(
      (a) => a.slug === key || a.name.toLowerCase() === key,
    ) ?? EDITORIAL_TEAM
  );
}
