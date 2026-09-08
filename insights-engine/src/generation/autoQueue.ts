/**
 * Autopilot — auto-queue generation jobs for the daily article picks.
 *
 * Pure planning helper. Given the day's `selectDailyArticleCandidates`
 * picks, the remaining daily quota and which clusters are already spoken
 * for, it decides which clusters get a fresh `full_article` generation
 * job this run. The service-role DB writes live in `../run.ts`.
 *
 * Only reached when `insights_settings.publishing.autoPublish` is true;
 * otherwise discovery stays print-only, exactly as before.
 */

import type { SelectionPick } from "../selection";

export interface AutoQueuePlanInput {
  picks: SelectionPick[];
  /** How many more articles may be generated today (>= 0). */
  quotaRemaining: number;
  /** Cluster row ids that must not be re-queued (converted, already has an
   *  article, or already has a live `full_article` job). */
  blockedClusterIds: Set<string>;
  /** cluster key -> cluster row id (missing key = cluster not persisted). */
  clusterIdByKey: Map<string, string>;
}

export interface AutoQueueItem {
  clusterId: string;
  clusterKey: string;
  reason: string;
}

export interface AutoQueuePlan {
  queue: AutoQueueItem[];
  skipped: { clusterKey: string; reason: string }[];
}

export function planAutoQueue(input: AutoQueuePlanInput): AutoQueuePlan {
  const queue: AutoQueueItem[] = [];
  const skipped: { clusterKey: string; reason: string }[] = [];

  for (const pick of input.picks) {
    const key = pick.cluster.key;

    if (queue.length >= input.quotaRemaining) {
      skipped.push({ clusterKey: key, reason: "daily quota reached" });
      continue;
    }

    const clusterId = input.clusterIdByKey.get(key);
    if (!clusterId) {
      skipped.push({ clusterKey: key, reason: "cluster row not found" });
      continue;
    }
    if (input.blockedClusterIds.has(clusterId)) {
      skipped.push({ clusterKey: key, reason: "already queued or converted" });
      continue;
    }

    queue.push({ clusterId, clusterKey: key, reason: pick.reason });
  }

  return { queue, skipped };
}
