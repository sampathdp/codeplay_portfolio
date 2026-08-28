/**
 * Cost control. Wraps a `GeminiClient` and enforces configurable daily
 * USD / call caps and a per-run cap. Every call's model, token usage and
 * estimated cost is emitted for the `insights_ai_usage` ledger.
 */

import type {
  GeminiClient,
  GeminiGenerateOptions,
  GeminiResult,
  GeminiUsage,
} from "./types";

export interface ModelPrice {
  input: number; // USD per 1M input tokens
  output: number; // USD per 1M output tokens
}

export interface AiBudgetConfig {
  dailyUsdCap: number;
  dailyCallCap: number;
  perRunCallCap: number;
  perArticleCallCap: number;
  pricingPer1MTokensUsd: Record<string, ModelPrice> & { default: ModelPrice };
  /** Flat USD cost per generated image, by model. */
  imagePricingUsd?: Record<string, number>;
}

export const DEFAULT_AI_BUDGET: AiBudgetConfig = {
  dailyUsdCap: 4.0,
  dailyCallCap: 400,
  perRunCallCap: 60,
  perArticleCallCap: 14,
  pricingPer1MTokensUsd: {
    "gemini-2.5-pro": { input: 1.25, output: 10.0 },
    "gemini-2.5-flash": { input: 0.3, output: 2.5 },
    default: { input: 0.5, output: 4.0 },
  },
};

export class BudgetExceededError extends Error {}

export function estimateCostUsd(
  model: string,
  usage: GeminiUsage,
  pricing: AiBudgetConfig["pricingPer1MTokensUsd"],
): number {
  const p = pricing[model] ?? pricing.default;
  const cost =
    (usage.promptTokens / 1_000_000) * p.input +
    (usage.completionTokens / 1_000_000) * p.output;
  return Math.round(cost * 1_000_000) / 1_000_000;
}

export interface UsageRecord {
  /** step name — a GeminiGenerateOptions purpose, or "image". */
  purpose: string;
  model: string;
  usage: GeminiUsage;
  costUsd: number;
  status: "ok" | "error" | "blocked";
  error?: string;
}

export interface BudgetState {
  /** USD already spent today (from the ledger). */
  dailySpentUsd: number;
  /** Calls already made today (from the ledger). */
  dailyCalls: number;
}

export class BudgetedGeminiClient implements GeminiClient {
  runCalls = 0;
  runSpentUsd = 0;

  constructor(
    private readonly inner: GeminiClient,
    private readonly cfg: AiBudgetConfig,
    private readonly state: BudgetState,
    private readonly onUsage: (r: UsageRecord) => void = () => {},
  ) {}

  private assertWithinBudget(purpose: string): void {
    const calls = this.state.dailyCalls + this.runCalls;
    const spent = this.state.dailySpentUsd + this.runSpentUsd;

    if (this.runCalls >= this.cfg.perRunCallCap) {
      this.blocked(purpose, `per-run call cap reached (${this.cfg.perRunCallCap})`);
    }
    if (calls >= this.cfg.dailyCallCap) {
      this.blocked(purpose, `daily call cap reached (${this.cfg.dailyCallCap})`);
    }
    if (spent >= this.cfg.dailyUsdCap) {
      this.blocked(
        purpose,
        `daily USD cap reached ($${this.cfg.dailyUsdCap.toFixed(2)})`,
      );
    }
  }

  private blocked(purpose: string, why: string): never {
    this.onUsage({
      purpose,
      model: "-",
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      costUsd: 0,
      status: "blocked",
      error: why,
    });
    throw new BudgetExceededError(`AI budget: ${why}`);
  }

  async generate(
    prompt: string,
    opts: GeminiGenerateOptions,
  ): Promise<GeminiResult> {
    this.assertWithinBudget(opts.purpose);

    let res: GeminiResult;
    try {
      res = await this.inner.generate(prompt, opts);
    } catch (err) {
      this.runCalls += 1;
      this.onUsage({
        purpose: opts.purpose,
        model: opts.model ?? "-",
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        costUsd: 0,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }

    const costUsd = estimateCostUsd(res.model, res.usage, this.cfg.pricingPer1MTokensUsd);
    this.runCalls += 1;
    this.runSpentUsd += costUsd;
    this.onUsage({
      purpose: opts.purpose,
      model: res.model,
      usage: res.usage,
      costUsd,
      status: "ok",
    });
    return res;
  }
}
