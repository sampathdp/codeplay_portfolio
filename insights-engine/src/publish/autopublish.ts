/**
 * Autopilot — rank the day's `review` drafts and pick the best to publish.
 *
 * Pure ranking helper. The generation worker (`../generation/run.ts`)
 * loads today's `review` articles, calls `rankForAutoPublish`, makes sure
 * each winner has a featured image, then flips it to `published`.
 *
 * "Fully autonomous" mode: a `needs_review` flag does NOT exclude a draft
 * (hard-rejected drafts land as `draft`, not `review`, so they never
 * reach this list). Diversity + per-category caps mirror
 * `selectDailyArticleCandidates`.
 */

import { slotForCategory } from "../selection";

export interface PublishCandidate {
  id: string;
  slug: string;
  categorySlug: string | null;
  /** 0-100 overall quality score from the generation gates. */
  qualityScore: number;
  /** 0-100 cluster virality carried onto the article. */
  viralScore: number;
  breaking: boolean;
  needsReview: boolean;
  createdAt: string;
}

export interface AutoPublishConfig {
  minPerDay: number;
  maxPerDay: number;
  maxPerCategory: number;
  weights: { quality: number; viral: number; breaking: number };
}

export const DEFAULT_AUTOPUBLISH_CONFIG: AutoPublishConfig = {
  minPerDay: 2,
  maxPerDay: 3,
  maxPerCategory: 2,
  weights: { quality: 0.6, viral: 0.35, breaking: 8 },
};

export interface RankedPublish {
  /** Ordered best-first, length between 0 and `maxPerDay`. */
  winners: PublishCandidate[];
  scores: Record<string, number>;
  reasons: Record<string, string>;
  /** true when fewer drafts qualified than `minPerDay`. */
  belowMin: boolean;
}

export function scoreCandidate(
  c: PublishCandidate,
  cfg: AutoPublishConfig,
): number {
  return (
    cfg.weights.quality * (c.qualityScore || 0) +
    cfg.weights.viral * (c.viralScore || 0) +
    (c.breaking ? cfg.weights.breaking : 0)
  );
}

export function rankForAutoPublish(
  candidates: PublishCandidate[],
  cfg: AutoPublishConfig = DEFAULT_AUTOPUBLISH_CONFIG,
): RankedPublish {
  const scores: Record<string, number> = {};
  for (const c of candidates) scores[c.id] = scoreCandidate(c, cfg);

  const pool = [...candidates].sort((a, b) => scores[b.id] - scores[a.id]);

  const winners: PublishCandidate[] = [];
  const reasons: Record<string, string> = {};
  const catCount = new Map<string, number>();
  const used = new Set<string>();

  const capOk = (c: PublishCandidate): boolean => {
    const cat = c.categorySlug ?? "_none";
    return (catCount.get(cat) ?? 0) < cfg.maxPerCategory;
  };

  const take = (c: PublishCandidate, why: string): void => {
    winners.push(c);
    used.add(c.id);
    const cat = c.categorySlug ?? "_none";
    catCount.set(cat, (catCount.get(cat) ?? 0) + 1);
    const flags = [
      `score ${scores[c.id].toFixed(0)}`,
      ...(c.breaking ? ["breaking"] : []),
      ...(c.needsReview ? ["flagged(needs_review)"] : []),
    ];
    reasons[c.id] = `${why} — ${flags.join(", ")}`;
  };

  // Pass 1 — best story per diversity slot (AI / dev / gaming).
  for (const slot of [1, 2, 3] as const) {
    if (winners.length >= cfg.maxPerDay) break;
    const match = pool.find(
      (c) =>
        !used.has(c.id) && slotForCategory(c.categorySlug) === slot && capOk(c),
    );
    if (match) take(match, `slot ${slot} pick`);
  }

  // Pass 2 — top up to maxPerDay with the next best, caps respected.
  for (const c of pool) {
    if (winners.length >= cfg.maxPerDay) break;
    if (used.has(c.id) || !capOk(c)) continue;
    take(c, "top-ranked");
  }

  // Pass 3 — reach minPerDay even if it means relaxing the per-category cap.
  for (const c of pool) {
    if (winners.length >= cfg.minPerDay) break;
    if (used.has(c.id)) continue;
    take(c, "min-per-day fill");
  }

  return {
    winners: winners.slice(0, cfg.maxPerDay),
    scores,
    reasons,
    belowMin: winners.length < cfg.minPerDay,
  };
}

/** Merge `insights_settings.publishing` over the defaults. */
export function resolveAutoPublishConfig(
  publishing: Record<string, unknown> = {},
): AutoPublishConfig {
  const w = (publishing.rankWeights ?? {}) as Record<string, unknown>;
  const num = (v: unknown, fallback: number): number =>
    typeof v === "number" && Number.isFinite(v) ? v : fallback;
  return {
    minPerDay: num(publishing.minPerDay, DEFAULT_AUTOPUBLISH_CONFIG.minPerDay),
    maxPerDay: num(publishing.maxPerDay, DEFAULT_AUTOPUBLISH_CONFIG.maxPerDay),
    maxPerCategory: num(
      publishing.maxPerCategory,
      DEFAULT_AUTOPUBLISH_CONFIG.maxPerCategory,
    ),
    weights: {
      quality: num(w.quality, DEFAULT_AUTOPUBLISH_CONFIG.weights.quality),
      viral: num(w.viral, DEFAULT_AUTOPUBLISH_CONFIG.weights.viral),
      breaking: num(w.breaking, DEFAULT_AUTOPUBLISH_CONFIG.weights.breaking),
    },
  };
}
