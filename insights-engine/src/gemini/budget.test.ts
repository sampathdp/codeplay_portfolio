import { describe, it, expect } from "vitest";
import {
  BudgetedGeminiClient,
  BudgetExceededError,
  DEFAULT_AI_BUDGET,
  estimateCostUsd,
} from "./budget";
import { MockGeminiClient } from "./mock";
import type { UsageRecord } from "./budget";

const opts = { purpose: "draft" as const };

describe("estimateCostUsd", () => {
  it("prices input and output tokens per model", () => {
    const cost = estimateCostUsd(
      "gemini-3.1-pro-preview",
      { promptTokens: 1_000_000, completionTokens: 1_000_000, totalTokens: 2_000_000 },
      DEFAULT_AI_BUDGET.pricingPer1MTokensUsd,
    );
    expect(cost).toBeCloseTo(1.25 + 10.0, 4);
  });
  it("falls back to default pricing for unknown models", () => {
    const cost = estimateCostUsd(
      "some-future-model",
      { promptTokens: 1_000_000, completionTokens: 0, totalTokens: 1_000_000 },
      DEFAULT_AI_BUDGET.pricingPer1MTokensUsd,
    );
    expect(cost).toBeCloseTo(0.5, 4);
  });
});

describe("BudgetedGeminiClient", () => {
  it("records usage + cost for each call", async () => {
    const records: UsageRecord[] = [];
    const inner = new MockGeminiClient({
      model: "gemini-3.6-flash",
      usage: { promptTokens: 1000, completionTokens: 2000 },
      respond: () => "ok",
    });
    const client = new BudgetedGeminiClient(
      inner,
      DEFAULT_AI_BUDGET,
      { dailySpentUsd: 0, dailyCalls: 0 },
      (r) => records.push(r),
    );
    await client.generate("p", opts);
    expect(records).toHaveLength(1);
    expect(records[0].status).toBe("ok");
    expect(records[0].costUsd).toBeGreaterThan(0);
    expect(client.runCalls).toBe(1);
  });

  it("blocks when the per-run call cap is hit", async () => {
    const records: UsageRecord[] = [];
    const client = new BudgetedGeminiClient(
      new MockGeminiClient({ respond: () => "ok" }),
      { ...DEFAULT_AI_BUDGET, perRunCallCap: 2 },
      { dailySpentUsd: 0, dailyCalls: 0 },
      (r) => records.push(r),
    );
    await client.generate("p", opts);
    await client.generate("p", opts);
    await expect(client.generate("p", opts)).rejects.toBeInstanceOf(BudgetExceededError);
    expect(records.at(-1)?.status).toBe("blocked");
  });

  it("blocks when the daily USD cap is already exceeded", async () => {
    const client = new BudgetedGeminiClient(
      new MockGeminiClient({ respond: () => "ok" }),
      { ...DEFAULT_AI_BUDGET, dailyUsdCap: 1 },
      { dailySpentUsd: 1.5, dailyCalls: 3 },
    );
    await expect(client.generate("p", opts)).rejects.toBeInstanceOf(BudgetExceededError);
  });

  it("blocks when the daily call cap is already exceeded", async () => {
    const client = new BudgetedGeminiClient(
      new MockGeminiClient({ respond: () => "ok" }),
      { ...DEFAULT_AI_BUDGET, dailyCallCap: 10 },
      { dailySpentUsd: 0, dailyCalls: 10 },
    );
    await expect(client.generate("p", opts)).rejects.toBeInstanceOf(BudgetExceededError);
  });

  it("records an error entry and rethrows when the inner client fails", async () => {
    const records: UsageRecord[] = [];
    const client = new BudgetedGeminiClient(
      new MockGeminiClient({ failOnCall: 1 }),
      DEFAULT_AI_BUDGET,
      { dailySpentUsd: 0, dailyCalls: 0 },
      (r) => records.push(r),
    );
    await expect(client.generate("p", opts)).rejects.toThrow();
    expect(records[0].status).toBe("error");
    expect(client.runCalls).toBe(1);
  });
});
