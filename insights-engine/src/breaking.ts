/**
 * Breaking / trending classification.
 *
 * A cluster is "breaking" only when the story is very recent, multiple
 * reputable sources carry it, and it is not merely community chatter.
 * Rumors are never auto-promoted to fact — a `community_rumor` cluster can
 * still be surfaced as trending, but not marked breaking.
 */

import type { BreakingConfig } from "./config";
import type { ScoreBreakdown, TopicCluster, FactConfidence } from "./types";

export interface BreakingInput {
  cluster: TopicCluster;
  scores: ScoreBreakdown;
  factConfidence: FactConfidence;
  now: Date;
}

export function isBreaking(input: BreakingInput, cfg: BreakingConfig): boolean {
  const { cluster, scores, factConfidence, now } = input;

  const ref = cluster.earliestPublishedAt
    ? new Date(cluster.earliestPublishedAt)
    : new Date(cluster.lastSeenAt);
  const ageHours = (now.getTime() - ref.getTime()) / 3_600_000;

  if (ageHours > cfg.maxAgeHours) return false;
  if (cluster.sourceCount < cfg.minSources) return false;
  if (factConfidence === "community_rumor" || factConfidence === "unverified") {
    return false;
  }

  const reputable = scores.sourceAuthority >= cfg.minAuthority;
  const hotInCommunity = scores.communityMomentum >= cfg.minCommunityScore;
  return reputable || hotInCommunity;
}
