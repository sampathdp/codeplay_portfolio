/**
 * Admin operations for trending story candidates. Read/write is gated by
 * RLS (`insights_news_candidates_admin`); approve/reject go through
 * security-definer RPCs.
 */

import { getInsightsSupabase } from "../supabase";
import type { NewsCandidateRow, CandidateStatusRow } from "../records";
import { rejectCandidateSchema } from "../schemas";
import { T, RPC } from "./tables";

export interface ListCandidatesOptions {
  status?: CandidateStatusRow | CandidateStatusRow[];
  limit?: number;
  offset?: number;
}

export async function listCandidates(
  opts: ListCandidatesOptions = {},
): Promise<NewsCandidateRow[]> {
  let filter = getInsightsSupabase().from(T.newsCandidates).select("*");

  if (Array.isArray(opts.status)) filter = filter.in("status", opts.status);
  else if (opts.status) filter = filter.eq("status", opts.status);

  let query = filter.order("viral_score", { ascending: false });
  if (opts.limit != null) {
    const from = opts.offset ?? 0;
    query = query.range(from, from + opts.limit - 1);
  }

  const res = await query;
  if (res.error) throw new Error(res.error.message);
  return (res.data as NewsCandidateRow[]) ?? [];
}

export function listNewCandidates(): Promise<NewsCandidateRow[]> {
  return listCandidates({ status: ["discovered", "filtered"] });
}

async function callRpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await getInsightsSupabase().rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

export function approveCandidate(id: string): Promise<NewsCandidateRow> {
  return callRpc<NewsCandidateRow>(RPC.approveCandidate, { p_id: id });
}

export async function rejectCandidate(
  id: string,
  reason?: string,
): Promise<NewsCandidateRow> {
  const parsed = rejectCandidateSchema.parse({ id, reason });
  return callRpc<NewsCandidateRow>(RPC.rejectCandidate, {
    p_id: parsed.id,
    p_reason: parsed.reason ?? null,
  });
}
