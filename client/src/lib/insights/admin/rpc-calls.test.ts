import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The Phase 7 admin functions are thin wrappers over security-definer RPCs
 * (which the DB gates with `insights_require_admin()` — see
 * `rpc-security.test.ts`). Here we only check each wrapper calls the right
 * RPC name with the right args. The Supabase client is stubbed.
 */

interface Call {
  op: string;
  args: unknown[];
}

interface Stub {
  calls: Call[];
  [k: string]: unknown;
}

function makeStub(result: { data: unknown; error: unknown }): Stub {
  const calls: Call[] = [];
  const rec = (op: string, ...args: unknown[]) => {
    calls.push({ op, args });
    return builder;
  };
  const builder: Stub = {
    calls,
    from: (t: string) => rec("from", t),
    select: () => rec("select"),
    insert: (v: unknown) => rec("insert", v),
    update: (v: unknown) => rec("update", v),
    delete: () => rec("delete"),
    upsert: (v: unknown) => rec("upsert", v),
    eq: () => rec("eq"),
    in: () => rec("in"),
    order: () => rec("order"),
    range: () => rec("range"),
    gte: () => rec("gte"),
    not: () => rec("not"),
    limit: () => rec("limit"),
    maybeSingle: () => Promise.resolve(result),
    single: () => Promise.resolve(result),
    rpc: (fn: string, args: unknown) => {
      calls.push({ op: "rpc", args: [fn, args] });
      return Promise.resolve(result);
    },
    then: (res: (v: unknown) => unknown) => Promise.resolve(result).then(res),
  };
  return builder;
}

const state = vi.hoisted(() => ({ current: null as Stub | null }));
vi.mock("../supabase", () => ({
  getInsightsSupabase: () => state.current,
  isInsightsConfigured: () => true,
}));

import {
  retryJob,
  requestSourceRun,
  forceResearch,
  rejectCluster,
  ignoreCluster,
  markDuplicate,
  selectCluster,
  approveArticle,
  applySectionProposal,
  requestArticleGeneration,
  improveTitle,
  runFactCheck,
  generateImage,
  removeImage,
} from "./index";

const UUID = "00000000-0000-4000-8000-000000000000";
const rpcCall = () => state.current!.calls.find((c) => c.op === "rpc");

beforeEach(() => {
  state.current = makeStub({ data: { id: UUID }, error: null });
});

const cases: [string, () => Promise<unknown>, string, Record<string, unknown>][] = [
  ["retryJob", () => retryJob(UUID), "insights_retry_job", { p_id: UUID }],
  ["requestSourceRun", () => requestSourceRun(UUID), "insights_request_source_run", { p_id: UUID }],
  ["forceResearch", () => forceResearch(UUID), "insights_force_research_cluster", { p_id: UUID }],
  ["rejectCluster", () => rejectCluster(UUID, "no"), "insights_reject_cluster", { p_id: UUID, p_reason: "no" }],
  ["ignoreCluster", () => ignoreCluster(UUID), "insights_ignore_cluster", { p_id: UUID, p_reason: null }],
  ["markDuplicate", () => markDuplicate(UUID, "11111111-1111-4111-8111-111111111111"), "insights_merge_clusters", { p_source: UUID, p_target: "11111111-1111-4111-8111-111111111111" }],
  ["selectCluster", () => selectCluster(UUID), "insights_select_cluster", { p_id: UUID, p_reason: null }],
  ["approveArticle", () => approveArticle(UUID), "insights_approve_article", { p_id: UUID }],
  ["applySectionProposal", () => applySectionProposal(UUID), "insights_apply_section", { p_job_id: UUID, p_force: false }],
  ["improveTitle", () => improveTitle(UUID), "insights_request_generation", { p_cluster_id: null, p_kind: "improve_title", p_article_type: null, p_params: { article_id: UUID } }],
  ["runFactCheck", () => runFactCheck(UUID), "insights_request_generation", { p_cluster_id: null, p_kind: "fact_check", p_article_type: null, p_params: { article_id: UUID } }],
  ["generateImage", () => generateImage(UUID), "insights_request_image", { p_article_id: UUID, p_kind: "generate_image", p_prompt: null }],
  ["removeImage", () => removeImage(UUID), "insights_remove_image", { p_article_id: UUID }],
];

describe("admin RPC wrappers", () => {
  for (const [name, fn, rpc, args] of cases) {
    it(`${name} → ${rpc}`, async () => {
      await fn();
      const call = rpcCall();
      expect(call, `${name} made no rpc call`).toBeTruthy();
      expect(call!.args[0]).toBe(rpc);
      expect(call!.args[1]).toEqual(args);
    });
  }

  it("requestArticleGeneration passes the cluster id", async () => {
    await requestArticleGeneration(UUID);
    expect(rpcCall()!.args).toEqual([
      "insights_request_generation",
      { p_cluster_id: UUID, p_kind: "full_article", p_article_type: null, p_params: {} },
    ]);
  });
});
