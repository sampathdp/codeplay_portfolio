/**
 * Configurable viral-score engine. All sub-scores are 0-100; the composite
 * is a weighted, weight-normalized blend, also 0-100.
 *
 *   viralScore =
 *     freshness            * w.freshness
 *   + engagement           * w.engagement
 *   + sourceAuthority      * w.sourceAuthority
 *   + crossSourceCoverage  * w.crossSourceCoverage
 *   + codeplayRelevance    * w.codeplayRelevance
 *   + communityMomentum    * w.communityMomentum
 *   + novelty              * w.novelty
 *   ) / sum(w)
 */

import type { ScoringConfig } from "./config";
import type { NormalizedItem, ScoreBreakdown, TopicCluster } from "./types";

export function clamp(v: number, min = 0, max = 100): number {
  if (Number.isNaN(v)) return min;
  return Math.min(max, Math.max(min, v));
}

/** Log-scaled normalization of a count against a cap → 0-100. */
export function logNorm(value: number, cap: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (cap <= 1) return 100;
  return clamp((Math.log1p(value) / Math.log1p(cap)) * 100);
}

export function freshnessScore(
  ageHours: number,
  cfg: Pick<ScoringConfig, "freshnessHalfLifeHours" | "freshnessMaxAgeHours">,
): number {
  if (ageHours < 0) ageHours = 0;
  if (ageHours > cfg.freshnessMaxAgeHours) return 0;
  return clamp(100 * 0.5 ** (ageHours / cfg.freshnessHalfLifeHours));
}

export function engagementScore(
  items: NormalizedItem[],
  caps: ScoringConfig["engagementCaps"],
): number {
  let best = 0;
  for (const it of items) {
    const s = it.signals ?? {};
    const parts = [
      logNorm(s.points ?? 0, caps.hnPoints),
      logNorm(s.comments ?? 0, caps.hnComments),
      logNorm(s.redditScore ?? 0, caps.redditScore),
    ];
    best = Math.max(best, ...parts);
  }
  return clamp(best);
}

export function sourceAuthorityScore(trustScores: number[]): number {
  if (trustScores.length === 0) return 0;
  // Top authority, with a small bump for a second strong corroborator.
  const sorted = [...trustScores].sort((a, b) => b - a);
  const bump = sorted[1] ? Math.min(8, sorted[1] * 0.1) : 0;
  return clamp(sorted[0] + bump);
}

export function crossSourceScore(sourceCount: number, distinctAdapters: number): number {
  if (sourceCount <= 1) return distinctAdapters > 1 ? 20 : 0;
  return clamp((sourceCount - 1) * 34 + (distinctAdapters - 1) * 12);
}

export function communityMomentumScore(
  items: NormalizedItem[],
  caps: ScoringConfig["engagementCaps"],
): number {
  const community = items.filter(
    (i) => i.adapter === "reddit" || i.signals?.redditScore != null,
  );
  if (community.length === 0) return 0;
  let best = 0;
  for (const it of community) {
    const s = it.signals ?? {};
    const score = logNorm(s.redditScore ?? 0, caps.redditScore);
    const comments = logNorm(s.comments ?? 0, caps.redditComments);
    const ratio = s.redditUpvoteRatio != null ? clamp(s.redditUpvoteRatio * 100) : 60;
    best = Math.max(best, score * 0.55 + comments * 0.3 + ratio * 0.15);
  }
  // A single subreddit thread is weaker than several.
  return clamp(best * (community.length >= 2 ? 1 : 0.8));
}

const REHASH_RE = /\b(update|updated|patch|hotfix|follow[- ]?up|roundup|recap|weekly|digest|revisited|part \d|v\d+\.\d+|again)\b/i;
const NOVEL_RE = /\b(launches?|launched|announces?|announced|unveils?|introduc\w+|releases?|released|debuts?|now available|open[- ]sourced?|first)\b/i;

export function noveltyScore(cluster: TopicCluster, priorSimilarClusters = 0): number {
  let score = 65;
  const title = cluster.title.toLowerCase();
  if (NOVEL_RE.test(title)) score += 25;
  if (REHASH_RE.test(title)) score -= 35;
  score -= Math.min(45, priorSimilarClusters * 15);
  return clamp(score);
}

export interface ScoreInputs {
  cluster: TopicCluster;
  now: Date;
  trustScores: number[];
  distinctAdapters: number;
  priorSimilarClusters?: number;
}

export function scoreCluster(
  input: ScoreInputs,
  cfg: ScoringConfig,
): { scores: ScoreBreakdown; viralScore: number } {
  const { cluster, now } = input;
  const earliest = cluster.earliestPublishedAt
    ? new Date(cluster.earliestPublishedAt)
    : new Date(cluster.lastSeenAt);
  const ageHours = Math.max(0, (now.getTime() - earliest.getTime()) / 3_600_000);

  const scores: ScoreBreakdown = {
    freshness: freshnessScore(ageHours, cfg),
    engagement: engagementScore(cluster.items, cfg.engagementCaps),
    sourceAuthority: sourceAuthorityScore(input.trustScores),
    crossSourceCoverage: crossSourceScore(cluster.sourceCount, input.distinctAdapters),
    codeplayRelevance: clamp(
      Math.max(0, ...cluster.items.map((i) => i.relevanceScore ?? 0)),
    ),
    communityMomentum: communityMomentumScore(cluster.items, cfg.engagementCaps),
    novelty: noveltyScore(cluster, input.priorSimilarClusters ?? 0),
  };

  const w = cfg.weights;
  const totalW =
    w.freshness + w.engagement + w.sourceAuthority + w.crossSourceCoverage +
    w.codeplayRelevance + w.communityMomentum + w.novelty;

  const weighted =
    scores.freshness * w.freshness +
    scores.engagement * w.engagement +
    scores.sourceAuthority * w.sourceAuthority +
    scores.crossSourceCoverage * w.crossSourceCoverage +
    scores.codeplayRelevance * w.codeplayRelevance +
    scores.communityMomentum * w.communityMomentum +
    scores.novelty * w.novelty;

  return {
    scores,
    viralScore: totalW > 0 ? clamp(weighted / totalW) : 0,
  };
}
