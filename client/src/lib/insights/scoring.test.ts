import { describe, it, expect } from "vitest";
import {
  clampScore,
  compositeViralScore,
  overallQualityScore,
  DEFAULT_VIRAL_WEIGHTS,
} from "./scoring";

describe("clampScore", () => {
  it("bounds to 0..100", () => {
    expect(clampScore(-5)).toBe(0);
    expect(clampScore(150)).toBe(100);
    expect(clampScore(42)).toBe(42);
  });
  it("maps NaN to 0", () => {
    expect(clampScore(Number.NaN)).toBe(0);
  });
});

describe("compositeViralScore", () => {
  const flat = {
    engagement: 80,
    freshness: 80,
    authority: 80,
    relevance: 80,
    community: 80,
    novelty: 80,
  };

  it("returns the common value when every signal is equal", () => {
    expect(compositeViralScore(flat)).toBeCloseTo(80, 5);
  });

  it("weights engagement more than novelty", () => {
    const highEngagement = compositeViralScore({
      ...flat,
      engagement: 100,
      novelty: 0,
    });
    const highNovelty = compositeViralScore({
      ...flat,
      engagement: 0,
      novelty: 100,
    });
    expect(highEngagement).toBeGreaterThan(highNovelty);
  });

  it("clamps out-of-range signals before weighting", () => {
    const score = compositeViralScore({ ...flat, engagement: 999 });
    expect(score).toBeLessThanOrEqual(100);
  });

  it("weights sum to 1 by default", () => {
    const total = Object.values(DEFAULT_VIRAL_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1, 5);
  });

  it("returns 0 when all weights are zeroed out", () => {
    expect(
      compositeViralScore(flat, {
        engagement: 0,
        freshness: 0,
        authority: 0,
        relevance: 0,
        community: 0,
        novelty: 0,
      }),
    ).toBe(0);
  });
});

describe("overallQualityScore", () => {
  it("blends subscores on a 0..100 scale", () => {
    const score = overallQualityScore({
      factCheck: 90,
      sourceQuality: 80,
      originality: 70,
      readability: 60,
      seo: 50,
    });
    expect(score).toBeGreaterThan(50);
    expect(score).toBeLessThan(90);
  });
});
