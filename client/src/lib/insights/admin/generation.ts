/**
 * Admin actions for Gemini-powered generation. All heavy work runs in the
 * server-side worker — these functions only queue jobs (`insights_request_
 * generation` RPC) or apply the worker's proposals. The Gemini API key and
 * every other server secret stay out of the browser entirely.
 *
 * Regenerating a single section NEVER auto-overwrites a human-edited
 * section: the worker writes a proposal to the job, and an admin applies
 * it explicitly via `applySectionProposal` (which the DB refuses over a
 * human-edited section unless forced).
 */

import { getInsightsSupabase } from "../supabase";
import type {
  GenerationJobRow,
  GenerationJobKind,
  AiUsageRow,
  ArticleRow,
} from "../records";
import { T, RPC } from "./tables";

async function callRpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await getInsightsSupabase().rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

function queue(
  kind: GenerationJobKind,
  clusterId: string | null,
  params: Record<string, unknown>,
  articleType?: string,
): Promise<GenerationJobRow> {
  return callRpc<GenerationJobRow>(RPC.requestGeneration, {
    p_cluster_id: clusterId,
    p_kind: kind,
    p_article_type: articleType ?? null,
    p_params: params,
  });
}

/** Generate a full article from a trending cluster. */
export function requestArticleGeneration(
  clusterId: string,
  articleType?: string,
): Promise<GenerationJobRow> {
  return queue("full_article", clusterId, {}, articleType);
}

export function regenerateSection(
  articleId: string,
  sectionKey: string,
  instruction?: string,
): Promise<GenerationJobRow> {
  return queue("regenerate_section", null, {
    article_id: articleId,
    section: sectionKey,
    instruction: instruction ?? null,
  });
}

export function improveTitle(articleId: string): Promise<GenerationJobRow> {
  return queue("improve_title", null, { article_id: articleId });
}

export function improveSeo(articleId: string): Promise<GenerationJobRow> {
  return queue("improve_seo", null, { article_id: articleId });
}

export function regenerateSummary(articleId: string): Promise<GenerationJobRow> {
  return queue("regenerate_summary", null, { article_id: articleId });
}

export function runFactCheck(articleId: string): Promise<GenerationJobRow> {
  return queue("fact_check", null, { article_id: articleId });
}

/** Apply a `regenerate_section` proposal. Refused over a human-edited
 * section unless `force`. */
export function applySectionProposal(
  jobId: string,
  force = false,
): Promise<ArticleRow> {
  return callRpc<ArticleRow>(RPC.applySection, { p_job_id: jobId, p_force: force });
}

/** Mark an article human-reviewed (clears needs_review; does not publish). */
export function approveArticle(id: string): Promise<ArticleRow> {
  return callRpc<ArticleRow>(RPC.approveArticle, { p_id: id });
}

/** Record that a human edited these section keys (protects them from
 * regeneration overwrite). Call from the editor on save. */
export function markSectionsEdited(
  articleId: string,
  sectionKeys: string[],
): Promise<ArticleRow> {
  return callRpc<ArticleRow>(RPC.markSectionsEdited, {
    p_id: articleId,
    p_sections: sectionKeys,
  });
}

// --- reads ------------------------------------------------------------

export interface ListJobsOptions {
  status?: GenerationJobRow["status"] | GenerationJobRow["status"][];
  kind?: GenerationJobKind;
  articleId?: string;
  clusterId?: string;
  limit?: number;
}

export async function listGenerationJobs(
  opts: ListJobsOptions = {},
): Promise<GenerationJobRow[]> {
  let q = getInsightsSupabase().from(T.generationJobs).select("*");
  if (Array.isArray(opts.status)) q = q.in("status", opts.status);
  else if (opts.status) q = q.eq("status", opts.status);
  if (opts.kind) q = q.eq("kind", opts.kind);
  if (opts.articleId) q = q.eq("article_id", opts.articleId);
  if (opts.clusterId) q = q.eq("cluster_id", opts.clusterId);

  const res = await q.order("created_at", { ascending: false }).range(0, (opts.limit ?? 50) - 1);
  if (res.error) throw new Error(res.error.message);
  return (res.data as GenerationJobRow[]) ?? [];
}

export async function getGenerationJob(id: string): Promise<GenerationJobRow> {
  const res = await getInsightsSupabase()
    .from(T.generationJobs)
    .select("*")
    .eq("id", id)
    .single();
  if (res.error) throw new Error(res.error.message);
  return res.data as GenerationJobRow;
}

/** Re-queue a failed / cancelled job as a fresh copy. */
export async function retryJob(id: string): Promise<GenerationJobRow> {
  const { data, error } = await getInsightsSupabase().rpc(RPC.retryJob, {
    p_id: id,
  });
  if (error) throw new Error(error.message);
  return data as GenerationJobRow;
}

export function listFailedJobs(limit = 30): Promise<GenerationJobRow[]> {
  return listGenerationJobs({ status: ["failed", "cancelled"], limit });
}

/** Cancel a single queued / running job so the worker skips it. */
export async function cancelJob(id: string): Promise<void> {
  const { error } = await getInsightsSupabase()
    .from(T.generationJobs)
    .update({ status: "cancelled", completed_at: new Date().toISOString() })
    .eq("id", id)
    .in("status", ["queued", "running"]);
  if (error) throw new Error(error.message);
}

/** Cancel every queued or running job in one shot — the "clear the stuck
 * queue" button. Returns how many rows were cancelled. */
export async function cancelAllPendingJobs(): Promise<number> {
  const { data, error } = await getInsightsSupabase()
    .from(T.generationJobs)
    .update({ status: "cancelled", completed_at: new Date().toISOString() })
    .in("status", ["queued", "running"])
    .select("id");
  if (error) throw new Error(error.message);
  return data?.length ?? 0;
}

/** Permanently delete every failed / cancelled job — clears the history
 * list. Returns how many rows were removed. */
export async function clearInactiveJobs(): Promise<number> {
  const { data, error } = await getInsightsSupabase()
    .from(T.generationJobs)
    .delete()
    .in("status", ["failed", "cancelled"])
    .select("id");
  if (error) throw new Error(error.message);
  return data?.length ?? 0;
}

export interface AiSpendSummary {
  totalUsd: number;
  calls: number;
  byModel: Record<string, { calls: number; usd: number; tokens: number }>;
}

export async function aiSpendSince(sinceIso: string): Promise<AiSpendSummary> {
  const res = await getInsightsSupabase()
    .from(T.aiUsage)
    .select("model,estimated_cost_usd,total_tokens,request_count")
    .gte("created_at", sinceIso);
  if (res.error) throw new Error(res.error.message);

  const rows = (res.data as Pick<AiUsageRow, "model" | "estimated_cost_usd" | "total_tokens" | "request_count">[]) ?? [];
  const summary: AiSpendSummary = { totalUsd: 0, calls: 0, byModel: {} };
  for (const r of rows) {
    const usd = Number(r.estimated_cost_usd) || 0;
    summary.totalUsd += usd;
    summary.calls += r.request_count || 1;
    const m = (summary.byModel[r.model] ??= { calls: 0, usd: 0, tokens: 0 });
    m.calls += r.request_count || 1;
    m.usd += usd;
    m.tokens += r.total_tokens || 0;
  }
  summary.totalUsd = Math.round(summary.totalUsd * 1e6) / 1e6;
  return summary;
}

export function aiSpendToday(): Promise<AiSpendSummary> {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return aiSpendSince(d.toISOString());
}
