import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The admin API is a thin wrapper over the anon-key Supabase client; auth
 * is enforced by the database (RLS + security-definer RPCs). These tests
 * check input validation and that each call targets the right table / RPC
 * with the right shape — the Supabase client is stubbed.
 */

interface StubCall {
  op: string;
  args: unknown[];
}

interface Stub {
  calls: StubCall[];
  [key: string]: unknown;
}

function makeStub(result: { data: unknown; error: unknown }): Stub {
  const calls: StubCall[] = [];
  const rec = (op: string, ...args: unknown[]) => {
    calls.push({ op, args });
    return builder;
  };
  const builder: Stub = {
    calls,
    from: (t: string) => rec("from", t),
    select: (...a: unknown[]) => rec("select", ...a),
    insert: (v: unknown) => rec("insert", v),
    update: (v: unknown) => rec("update", v),
    delete: () => rec("delete"),
    upsert: (v: unknown) => rec("upsert", v),
    eq: (...a: unknown[]) => rec("eq", ...a),
    in: (...a: unknown[]) => rec("in", ...a),
    order: (...a: unknown[]) => rec("order", ...a),
    range: (...a: unknown[]) => rec("range", ...a),
    single: () => Promise.resolve(result),
    maybeSingle: () => Promise.resolve(result),
    rpc: (fn: string, args: unknown) => {
      calls.push({ op: "rpc", args: [fn, args] });
      return Promise.resolve(result);
    },
    then: (res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) =>
      Promise.resolve(result).then(res, rej),
  };
  return builder;
}

const state = vi.hoisted(() => ({ current: null as Stub | null }));

vi.mock("../supabase", () => ({
  getInsightsSupabase: () => state.current,
  isInsightsConfigured: () => true,
}));

import {
  createArticle,
  publishArticle,
  scheduleArticle,
  listDrafts,
} from "./articles";

const UUID = "00000000-0000-4000-8000-000000000000";
const calls = () => state.current!.calls;

beforeEach(() => {
  state.current = makeStub({
    data: { id: UUID, slug: "google-launches-new-gemini-model", status: "draft" },
    error: null,
  });
});

describe("createArticle", () => {
  it("rejects invalid input before touching the client", async () => {
    await expect(createArticle({ title: "x" } as never)).rejects.toThrow();
    expect(calls().length).toBe(0);
  });

  it("resolves the default author and inserts into insights_articles", async () => {
    await createArticle({
      title: "Google launches new Gemini model",
      category_id: UUID,
    });
    const tables = calls()
      .filter((c) => c.op === "from")
      .map((c) => c.args[0]);
    expect(tables).toContain("insights_authors");
    expect(tables).toContain("insights_articles");

    const insert = calls().find((c) => c.op === "insert");
    expect(insert).toBeTruthy();
    const payload = insert!.args[0] as Record<string, unknown>;
    expect(payload.title).toBe("Google launches new Gemini model");
    expect(payload.author_id).toBe(UUID);
    expect(payload.status).toBe("draft");
  });
});

describe("publishArticle", () => {
  it("calls the insights_publish_article RPC with p_id", async () => {
    await publishArticle(UUID);
    const rpc = calls().find((c) => c.op === "rpc");
    expect(rpc!.args[0]).toBe("insights_publish_article");
    expect(rpc!.args[1]).toEqual({ p_id: UUID });
  });
});

describe("scheduleArticle", () => {
  it("rejects a past date before calling the RPC", async () => {
    await expect(
      scheduleArticle(UUID, new Date(Date.now() - 1000).toISOString()),
    ).rejects.toThrow();
    expect(calls().find((c) => c.op === "rpc")).toBeUndefined();
  });

  it("calls insights_schedule_article for a future date", async () => {
    const when = new Date(Date.now() + 3_600_000).toISOString();
    await scheduleArticle(UUID, when);
    const rpc = calls().find((c) => c.op === "rpc");
    expect(rpc!.args[0]).toBe("insights_schedule_article");
    expect(rpc!.args[1]).toEqual({ p_id: UUID, p_when: when });
  });
});

describe("listDrafts", () => {
  it("filters to the pre-publish statuses", async () => {
    await listDrafts();
    const inCall = calls().find((c) => c.op === "in");
    expect(inCall!.args[0]).toBe("status");
    expect(inCall!.args[1]).toEqual(["idea", "researching", "draft", "review"]);
  });
});
