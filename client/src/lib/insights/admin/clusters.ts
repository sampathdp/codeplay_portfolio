/**
 * Admin operations for trending topic clusters (the reviewable unit of the
 * discovery engine). Read/write gated by RLS; triage goes through
 * security-definer RPCs. No authorization is performed here.
 */

import { getInsightsSupabase } from "../supabase";
import type {
  TopicClusterRow,
  NewsCandidateRow,
  IngestionRunRow,
  CandidateStatusRow,
} from "../records";
import { T, RPC } from "./tables";

export interface ListClustersOptions {
  status?: CandidateStatusRow | CandidateStatusRow[];
  minViralScore?: number;
  breakingOnly?: boolean;
  /**
   * `viral` (default) — best story first, the classic review-queue order.
   * `recency` — latest news first (newest `earliest_published_at`, then
   * viral score as a tie-break).
   */
  orderBy?: "viral" | "recency";
  limit?: number;
  offset?: number;
}

export async function listClusters(
  opts: ListClustersOptions = {},
): Promise<TopicClusterRow[]> {
  let filter = getInsightsSupabase().from(T.topicClusters).select("*");

  if (Array.isArray(opts.status)) filter = filter.in("status", opts.status);
  else if (opts.status) filter = filter.eq("status", opts.status);
  if (opts.minViralScore != null) filter = filter.gte("viral_score", opts.minViralScore);
  if (opts.breakingOnly) filter = filter.eq("breaking", true);

  let query =
    opts.orderBy === "recency"
      ? filter
          .order("earliest_published_at", { ascending: false, nullsFirst: false })
          .order("viral_score", { ascending: false })
      : filter.order("viral_score", { ascending: false });
  if (opts.limit != null) {
    const from = opts.offset ?? 0;
    query = query.range(from, from + opts.limit - 1);
  }

  const res = await query;
  if (res.error) throw new Error(res.error.message);
  return (res.data as TopicClusterRow[]) ?? [];
}

/** The admin review queue: fresh, unreviewed clusters, best first. */
export function listReviewQueue(limit = 50): Promise<TopicClusterRow[]> {
  return listClusters({ status: ["discovered", "filtered"], limit });
}

export interface ClusterDetail {
  cluster: TopicClusterRow;
  /** Every source item behind the cluster — all related URLs. */
  sources: NewsCandidateRow[];
}

export async function getClusterDetail(id: string): Promise<ClusterDetail> {
  const sb = getInsightsSupabase();
  const cluster = await sb.from(T.topicClusters).select("*").eq("id", id).single();
  if (cluster.error) throw new Error(cluster.error.message);

  const sources = await sb
    .from(T.newsCandidates)
    .select("*")
    .eq("cluster_id", id)
    .order("published_at", { ascending: true });
  if (sources.error) throw new Error(sources.error.message);

  return {
    cluster: cluster.data as TopicClusterRow,
    sources: (sources.data as NewsCandidateRow[]) ?? [],
  };
}

async function callRpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await getInsightsSupabase().rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

export function selectCluster(id: string, reason?: string): Promise<TopicClusterRow> {
  return callRpc<TopicClusterRow>(RPC.selectCluster, { p_id: id, p_reason: reason ?? null });
}

export function rejectCluster(id: string, reason?: string): Promise<TopicClusterRow> {
  return callRpc<TopicClusterRow>(RPC.rejectCluster, { p_id: id, p_reason: reason ?? null });
}

export function ignoreCluster(id: string, reason?: string): Promise<TopicClusterRow> {
  return callRpc<TopicClusterRow>(RPC.ignoreCluster, { p_id: id, p_reason: reason ?? null });
}

export function forceResearch(id: string): Promise<TopicClusterRow> {
  return callRpc<TopicClusterRow>(RPC.forceResearchCluster, { p_id: id });
}

/** Mark `sourceId` a duplicate of `targetId` and merge their sources. */
export function markDuplicate(
  sourceId: string,
  targetId: string,
): Promise<TopicClusterRow> {
  return callRpc<TopicClusterRow>(RPC.mergeClusters, {
    p_source: sourceId,
    p_target: targetId,
  });
}

export async function listIngestionRuns(limit = 50): Promise<IngestionRunRow[]> {
  const res = await getInsightsSupabase()
    .from(T.ingestionRuns)
    .select("*")
    .order("started_at", { ascending: false })
    .range(0, limit - 1);
  if (res.error) throw new Error(res.error.message);
  return (res.data as IngestionRunRow[]) ?? [];
}
