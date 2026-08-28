/**
 * selectDailyArticleCandidates()
 *
 * Picks the 2-3 strongest, non-overlapping topic clusters for a day, aimed
 * at editorial diversity:
 *   slot 1 — major AI / software / tech development
 *   slot 2 — developer / business technology story
 *   slot 3 — gaming / game development / community story
 *
 * Flexible: if a slot has no qualifying story, the strongest remaining
 * candidate fills in instead. Rumors and unverified single-source items
 * are excluded (unless research was force-flagged by an admin).
 */

import type { SelectionConfig } from "./config";
import type { ScoredCluster } from "./types";

export type DiversitySlot = 1 | 2 | 3 | 0;

const SLOT_CATEGORIES: Record<Exclude<DiversitySlot, 0>, string[]> = {
  1: ["artificial-intelligence", "software-development", "emerging-technology", "big-tech"],
  2: [
    "developer-tools", "web-development", "mobile-development", "cloud-and-devops",
    "open-source", "startups", "saas", "cybersecurity", "hardware-and-gpus",
  ],
  3: ["gaming", "game-development", "gaming-community"],
};

export function slotForCategory(category: string | null): DiversitySlot {
  if (!category) return 0;
  for (const slot of [1, 2, 3] as const) {
    if (SLOT_CATEGORIES[slot].includes(category)) return slot;
  }
  return 0;
}

export interface SelectionPick {
  cluster: ScoredCluster;
  slot: DiversitySlot;
  reason: string;
}

export interface SelectionInput {
  clusters: ScoredCluster[];
  now?: Date;
  /** ids/keys of clusters already converted recently, to avoid repeats. */
  recentlyUsedKeys?: Set<string>;
  /** cluster keys an admin force-flagged for research (bypass filters). */
  forcedKeys?: Set<string>;
}

export interface SelectionResult {
  picks: SelectionPick[];
  consideredCount: number;
  eligibleCount: number;
  note?: string;
}

function eligible(
  c: ScoredCluster,
  cfg: SelectionConfig,
  now: Date,
  forced: boolean,
): boolean {
  if (forced) return true;
  if (c.viralScore < cfg.minViralScore) return false;
  if (c.factConfidence === "community_rumor" || c.factConfidence === "unverified") {
    return false;
  }
  const ref = c.earliestPublishedAt
    ? new Date(c.earliestPublishedAt)
    : new Date(c.lastSeenAt);
  const ageHours = (now.getTime() - ref.getTime()) / 3_600_000;
  return ageHours <= cfg.lookbackHours;
}

function reasonFor(c: ScoredCluster, slot: DiversitySlot): string {
  const bits = [
    `viral ${c.viralScore.toFixed(0)}/100`,
    `${c.sourceCount} source${c.sourceCount === 1 ? "" : "s"}`,
    `confidence ${c.factConfidence}`,
  ];
  if (c.breaking) bits.push("breaking");
  if (c.primaryTheme) bits.push(`theme ${c.primaryTheme}`);
  const slotLabel =
    slot === 1 ? "AI/software/tech slot"
    : slot === 2 ? "developer/business slot"
    : slot === 3 ? "gaming slot"
    : "open slot";
  return `${slotLabel}: ${bits.join(", ")}`;
}

export function selectDailyArticleCandidates(
  input: SelectionInput,
  cfg: SelectionConfig,
): SelectionResult {
  const now = input.now ?? new Date();
  const recentlyUsed = input.recentlyUsedKeys ?? new Set<string>();
  const forced = input.forcedKeys ?? new Set<string>();

  const pool = input.clusters
    .filter((c) => !recentlyUsed.has(c.key))
    .filter((c) => eligible(c, cfg, now, forced.has(c.key)))
    .sort((a, b) => b.viralScore - a.viralScore);

  const picks: SelectionPick[] = [];
  const themeCount = new Map<string, number>();
  const categoryCount = new Map<string, number>();
  const usedKeys = new Set<string>();

  const capsOk = (c: ScoredCluster): boolean => {
    const theme = c.primaryTheme ?? "_none";
    const cat = c.categorySlug ?? "_none";
    if ((themeCount.get(theme) ?? 0) >= cfg.maxPerTheme) return false;
    if ((categoryCount.get(cat) ?? 0) >= cfg.maxPerCategory) return false;
    if (
      cfg.requireDistinctPrimaryTheme &&
      c.primaryTheme &&
      picks.some((p) => p.cluster.primaryTheme === c.primaryTheme)
    ) {
      return false;
    }
    return true;
  };

  const take = (c: ScoredCluster, slot: DiversitySlot) => {
    picks.push({ cluster: c, slot, reason: reasonFor(c, slot) });
    usedKeys.add(c.key);
    const theme = c.primaryTheme ?? "_none";
    const cat = c.categorySlug ?? "_none";
    themeCount.set(theme, (themeCount.get(theme) ?? 0) + 1);
    categoryCount.set(cat, (categoryCount.get(cat) ?? 0) + 1);
  };

  // Pass 1 — fill each diversity slot with its best matching, caps-ok story.
  for (const slot of [1, 2, 3] as const) {
    if (picks.length >= cfg.perDay) break;
    const match = pool.find(
      (c) =>
        !usedKeys.has(c.key) &&
        slotForCategory(c.categorySlug) === slot &&
        capsOk(c),
    );
    if (match) take(match, slot);
  }

  // Pass 2 — top up to perDay with the next best remaining stories.
  for (const c of pool) {
    if (picks.length >= cfg.perDay) break;
    if (usedKeys.has(c.key) || !capsOk(c)) continue;
    take(c, slotForCategory(c.categorySlug));
  }

  // Pass 3 — if still under the daily minimum, relax the theme/category
  // caps (but never the eligibility filter) so we can still ship 2.
  if (picks.length < cfg.minPerDay) {
    for (const c of pool) {
      if (picks.length >= cfg.minPerDay) break;
      if (usedKeys.has(c.key)) continue;
      take(c, slotForCategory(c.categorySlug));
    }
  }

  const note =
    picks.length < cfg.minPerDay
      ? `Only ${picks.length} qualifying stor${picks.length === 1 ? "y" : "ies"} today (min ${cfg.minPerDay}). Hold or widen sources.`
      : undefined;

  return {
    picks: picks.slice(0, cfg.perDay),
    consideredCount: input.clusters.length,
    eligibleCount: pool.length,
    note,
  };
}
