/**
 * Quality gates. Combines the model's quality scores, the fact-check
 * verdict, source verification and deterministic style checks into a
 * pass / needs-review decision. Thresholds are configurable
 * (`insights_settings.generation.thresholds`).
 */

import type { FactCheck, QualityScores, SourceVerification } from "./schema";
import type { StyleReport } from "./style";

export interface GenerationThresholds {
  overallQuality: number;
  factualConfidence: number;
  sourceQuality: number;
  originalValue: number;
  readability: number;
  maxDuplicationRisk: number;
  maxSensationalism: number;
  maxHallucinationRisk: number;
  minSources: number;
  minPrimarySources: number;
}

export const DEFAULT_THRESHOLDS: GenerationThresholds = {
  overallQuality: 70,
  factualConfidence: 65,
  sourceQuality: 55,
  originalValue: 60,
  readability: 45,
  maxDuplicationRisk: 35,
  maxSensationalism: 30,
  maxHallucinationRisk: 25,
  minSources: 2,
  minPrimarySources: 1,
};

/** Weighted overall quality from the sub-scores (0-100). */
export function overallQuality(q: QualityScores): number {
  const positive =
    q.factualConfidence * 0.28 +
    q.sourceQuality * 0.16 +
    q.originalValue * 0.24 +
    q.readability * 0.12 +
    q.seoQuality * 0.08;
  const penalties =
    q.duplicationRisk * 0.18 + q.sensationalism * 0.12 + q.hallucinationRisk * 0.2;
  return Math.max(0, Math.min(100, Math.round(positive - penalties + 30)));
}

export interface GateResult {
  overall: number;
  passed: boolean;
  needsReview: boolean;
  reasons: string[];
}

export function evaluateGates(input: {
  quality: QualityScores;
  factCheck: FactCheck;
  verification: SourceVerification;
  style: StyleReport;
  sourceCount: number;
  thresholds: GenerationThresholds;
}): GateResult {
  const { quality: q, factCheck, verification, style, sourceCount } = input;
  const t = input.thresholds;
  const reasons: string[] = [];

  const overall = overallQuality(q);

  if (overall < t.overallQuality) reasons.push(`overall quality ${overall} < ${t.overallQuality}`);
  if (q.factualConfidence < t.factualConfidence)
    reasons.push(`factual confidence ${q.factualConfidence} < ${t.factualConfidence}`);
  if (q.sourceQuality < t.sourceQuality)
    reasons.push(`source quality ${q.sourceQuality} < ${t.sourceQuality}`);
  if (q.originalValue < t.originalValue)
    reasons.push(`original value ${q.originalValue} < ${t.originalValue}`);
  if (q.readability < t.readability)
    reasons.push(`readability ${q.readability} < ${t.readability}`);
  if (q.duplicationRisk > t.maxDuplicationRisk)
    reasons.push(`duplication risk ${q.duplicationRisk} > ${t.maxDuplicationRisk}`);
  if (q.sensationalism > t.maxSensationalism || style.sensationalismScore > t.maxSensationalism)
    reasons.push(`sensationalism too high`);
  if (q.hallucinationRisk > t.maxHallucinationRisk || factCheck.hallucinationRisk > t.maxHallucinationRisk)
    reasons.push(`hallucination risk too high`);
  if (factCheck.verdict === "fail") reasons.push("fact-check verdict: fail");
  if (factCheck.verdict === "needs_review") reasons.push("fact-check verdict: needs_review");
  if (factCheck.rumorsPresentedAsFact.length > 0)
    reasons.push(`${factCheck.rumorsPresentedAsFact.length} rumor(s) presented as fact`);
  if (factCheck.unsupportedFactualClaims.length > 2)
    reasons.push(`${factCheck.unsupportedFactualClaims.length} unsupported factual claims`);
  if (style.forbiddenClaimCount > 0)
    reasons.push(`${style.forbiddenClaimCount} forbidden hands-on claim(s)`);
  if (sourceCount < t.minSources) reasons.push(`only ${sourceCount} source(s) (min ${t.minSources})`);
  if (verification.primarySourceCount < t.minPrimarySources)
    reasons.push(`no primary source (min ${t.minPrimarySources})`);
  if (!verification.sufficientForFactualArticle)
    reasons.push("source verification: insufficient for a factual article");

  // Hard failures that block even a review draft.
  const hardFail =
    factCheck.verdict === "fail" ||
    style.forbiddenClaimCount > 0 ||
    factCheck.rumorsPresentedAsFact.length > 0 ||
    q.hallucinationRisk > t.maxHallucinationRisk + 25;

  return {
    overall,
    passed: reasons.length === 0,
    needsReview: !hardFail && reasons.length > 0,
    reasons,
  };
}
