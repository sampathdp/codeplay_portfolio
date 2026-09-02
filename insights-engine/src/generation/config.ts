/**
 * Resolve generation + AI-budget config from `insights_settings`
 * (keys `generation`, `ai_budget`) over the code defaults.
 */

import { DEFAULT_GENERATION_CONFIG, type GenerationConfig } from "./pipeline";
import { DEFAULT_THRESHOLDS } from "./quality";
import { DEFAULT_AI_BUDGET, type AiBudgetConfig } from "../gemini/budget";

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

export function resolveGenerationConfig(
  settings: Record<string, unknown> = {},
): GenerationConfig {
  const g = (settings.generation ?? {}) as Record<string, unknown>;
  const t = (g.thresholds ?? {}) as Record<string, unknown>;
  const wcd = (g.wordCountDefault ?? {}) as Record<string, unknown>;
  const wci = (g.wordCountImportant ?? {}) as Record<string, unknown>;

  return {
    wordCountDefault: {
      min: num(wcd.min, DEFAULT_GENERATION_CONFIG.wordCountDefault.min),
      max: num(wcd.max, DEFAULT_GENERATION_CONFIG.wordCountDefault.max),
    },
    wordCountImportant: {
      min: num(wci.min, DEFAULT_GENERATION_CONFIG.wordCountImportant.min),
      max: num(wci.max, DEFAULT_GENERATION_CONFIG.wordCountImportant.max),
    },
    headlineCandidates: num(g.headlineCandidates, DEFAULT_GENERATION_CONFIG.headlineCandidates),
    thresholds: {
      overallQuality: num(t.overallQuality, DEFAULT_THRESHOLDS.overallQuality),
      factualConfidence: num(t.factualConfidence, DEFAULT_THRESHOLDS.factualConfidence),
      sourceQuality: num(t.sourceQuality, DEFAULT_THRESHOLDS.sourceQuality),
      originalValue: num(t.originalValue, DEFAULT_THRESHOLDS.originalValue),
      readability: num(t.readability, DEFAULT_THRESHOLDS.readability),
      maxDuplicationRisk: num(t.maxDuplicationRisk, DEFAULT_THRESHOLDS.maxDuplicationRisk),
      maxSensationalism: num(t.maxSensationalism, DEFAULT_THRESHOLDS.maxSensationalism),
      maxHallucinationRisk: num(t.maxHallucinationRisk, DEFAULT_THRESHOLDS.maxHallucinationRisk),
      minSources: num(t.minSources, DEFAULT_THRESHOLDS.minSources),
      minPrimarySources: num(t.minPrimarySources, DEFAULT_THRESHOLDS.minPrimarySources),
    },
    bannedPhrases: Array.isArray(g.bannedPhrases) ? (g.bannedPhrases as string[]) : undefined,
    forbiddenClaims: Array.isArray(g.forbiddenClaims) ? (g.forbiddenClaims as string[]) : undefined,
  };
}

export function resolveAiBudget(
  settings: Record<string, unknown> = {},
): AiBudgetConfig {
  const b = (settings.ai_budget ?? {}) as Record<string, unknown>;
  const pricing =
    (b.pricingPer1MTokensUsd as AiBudgetConfig["pricingPer1MTokensUsd"]) ??
    DEFAULT_AI_BUDGET.pricingPer1MTokensUsd;
  const imagePricing = (b.imagePricingUsd as Record<string, number> | undefined) ?? {
    "gemini-3.1-flash-image": 0.04,
    "gemini-3-pro-image": 0.06,
    "gemini-2.5-flash-image": 0.04,
    default: 0.04,
  };

  return {
    dailyUsdCap: num(b.dailyUsdCap, DEFAULT_AI_BUDGET.dailyUsdCap),
    dailyCallCap: num(b.dailyCallCap, DEFAULT_AI_BUDGET.dailyCallCap),
    perRunCallCap: num(b.perRunCallCap, DEFAULT_AI_BUDGET.perRunCallCap),
    perArticleCallCap: num(b.perArticleCallCap, DEFAULT_AI_BUDGET.perArticleCallCap),
    pricingPer1MTokensUsd: {
      ...DEFAULT_AI_BUDGET.pricingPer1MTokensUsd,
      ...pricing,
      default: pricing.default ?? DEFAULT_AI_BUDGET.pricingPer1MTokensUsd.default,
    },
    imagePricingUsd: imagePricing,
  };
}
