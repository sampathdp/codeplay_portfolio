import { describe, it, expect } from "vitest";
import { evaluateGates, overallQuality, DEFAULT_THRESHOLDS } from "./quality";
import { checkStyle } from "./style";
import type { FactCheck, QualityScores, SourceVerification } from "./schema";

const goodQuality: QualityScores = {
  factualConfidence: 85,
  sourceQuality: 78,
  originalValue: 80,
  readability: 66,
  seoQuality: 74,
  duplicationRisk: 12,
  sensationalism: 8,
  hallucinationRisk: 9,
  notes: "ok",
};

const goodFactCheck: FactCheck = {
  claims: [],
  unsupportedFactualClaims: [],
  rumorsPresentedAsFact: [],
  factualConfidence: 85,
  hallucinationRisk: 9,
  verdict: "pass",
  summary: "ok",
};

const goodVerification: SourceVerification = {
  sources: [],
  overallConfidence: "verified",
  primarySourceCount: 1,
  sufficientForFactualArticle: true,
  reason: "ok",
};

const cleanStyle = checkStyle("A measured, well-sourced analysis for engineering teams.");

describe("overallQuality", () => {
  it("is 0-100 and rewards fact + originality, penalizes hallucination", () => {
    const hi = overallQuality(goodQuality);
    const lo = overallQuality({ ...goodQuality, factualConfidence: 20, originalValue: 20, hallucinationRisk: 80 });
    expect(hi).toBeGreaterThan(lo);
    expect(hi).toBeLessThanOrEqual(100);
    expect(lo).toBeGreaterThanOrEqual(0);
  });
});

describe("evaluateGates", () => {
  it("passes a strong, well-sourced, non-sensational draft", () => {
    const r = evaluateGates({
      quality: goodQuality,
      factCheck: goodFactCheck,
      verification: goodVerification,
      style: cleanStyle,
      sourceCount: 3,
      thresholds: DEFAULT_THRESHOLDS,
    });
    expect(r.passed).toBe(true);
    expect(r.needsReview).toBe(false);
    expect(r.reasons).toHaveLength(0);
  });

  it("flags NEEDS_REVIEW when quality is below threshold (soft fail)", () => {
    const r = evaluateGates({
      quality: { ...goodQuality, originalValue: 40, factualConfidence: 60 },
      factCheck: goodFactCheck,
      verification: goodVerification,
      style: cleanStyle,
      sourceCount: 3,
      thresholds: DEFAULT_THRESHOLDS,
    });
    expect(r.passed).toBe(false);
    expect(r.needsReview).toBe(true);
    expect(r.reasons.join(" ")).toMatch(/original value|factual confidence/);
  });

  it("hard-fails (no review draft) when a rumor is presented as fact", () => {
    const r = evaluateGates({
      quality: goodQuality,
      factCheck: { ...goodFactCheck, rumorsPresentedAsFact: ["X will acquire Y"], verdict: "needs_review" },
      verification: goodVerification,
      style: cleanStyle,
      sourceCount: 3,
      thresholds: DEFAULT_THRESHOLDS,
    });
    expect(r.passed).toBe(false);
    expect(r.needsReview).toBe(false); // hard fail
  });

  it("hard-fails on a forbidden hands-on claim", () => {
    const r = evaluateGates({
      quality: goodQuality,
      factCheck: goodFactCheck,
      verification: goodVerification,
      style: checkStyle("We tested the release and it was fine."),
      sourceCount: 3,
      thresholds: DEFAULT_THRESHOLDS,
    });
    expect(r.passed).toBe(false);
    expect(r.needsReview).toBe(false);
    expect(r.reasons.join(" ")).toMatch(/forbidden/);
  });

  it("flags insufficient sources", () => {
    const r = evaluateGates({
      quality: goodQuality,
      factCheck: goodFactCheck,
      verification: { ...goodVerification, primarySourceCount: 0, sufficientForFactualArticle: false },
      style: cleanStyle,
      sourceCount: 1,
      thresholds: DEFAULT_THRESHOLDS,
    });
    expect(r.passed).toBe(false);
    expect(r.reasons.join(" ")).toMatch(/source/);
  });
});
