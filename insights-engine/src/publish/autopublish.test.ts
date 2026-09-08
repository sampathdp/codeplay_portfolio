import { describe, it, expect } from "vitest";
import {
  rankForAutoPublish,
  resolveAutoPublishConfig,
  DEFAULT_AUTOPUBLISH_CONFIG,
  type PublishCandidate,
} from "./autopublish";

function cand(p: Partial<PublishCandidate> & { id: string }): PublishCandidate {
  return {
    id: p.id,
    slug: p.slug ?? p.id,
    categorySlug: p.categorySlug ?? "artificial-intelligence",
    qualityScore: p.qualityScore ?? 70,
    viralScore: p.viralScore ?? 60,
    breaking: p.breaking ?? false,
    needsReview: p.needsReview ?? false,
    createdAt: p.createdAt ?? "2026-09-08T04:00:00Z",
  };
}

const CFG = DEFAULT_AUTOPUBLISH_CONFIG;

describe("rankForAutoPublish", () => {
  it("orders winners by weighted score, best first", () => {
    const { winners } = rankForAutoPublish(
      [
        cand({ id: "low", categorySlug: "gaming", qualityScore: 40, viralScore: 40 }),
        cand({ id: "high", categorySlug: "artificial-intelligence", qualityScore: 90, viralScore: 88 }),
        cand({ id: "mid", categorySlug: "developer-tools", qualityScore: 65, viralScore: 60 }),
      ],
      CFG,
    );
    expect(winners[0].id).toBe("high");
  });

  it("spreads picks across the AI / dev / gaming diversity slots", () => {
    const { winners } = rankForAutoPublish(
      [
        cand({ id: "ai1", categorySlug: "artificial-intelligence", qualityScore: 95 }),
        cand({ id: "ai2", categorySlug: "artificial-intelligence", qualityScore: 92 }),
        cand({ id: "dev", categorySlug: "developer-tools", qualityScore: 70 }),
        cand({ id: "game", categorySlug: "gaming", qualityScore: 55 }),
      ],
      CFG,
    );
    expect(winners.map((w) => w.id).sort()).toEqual(["ai1", "dev", "game"]);
  });

  it("respects the per-category cap", () => {
    const { winners } = rankForAutoPublish(
      [
        cand({ id: "a", categorySlug: "artificial-intelligence", qualityScore: 95 }),
        cand({ id: "b", categorySlug: "artificial-intelligence", qualityScore: 90 }),
        cand({ id: "c", categorySlug: "artificial-intelligence", qualityScore: 85 }),
      ],
      CFG,
    );
    expect(winners).toHaveLength(2); // maxPerCategory = 2
  });

  it("does not exclude drafts flagged needs_review (fully autonomous)", () => {
    const { winners } = rankForAutoPublish(
      [
        cand({ id: "flagged", needsReview: true, qualityScore: 80 }),
        cand({ id: "clean", categorySlug: "gaming", needsReview: false, qualityScore: 78 }),
      ],
      CFG,
    );
    expect(winners.map((w) => w.id).sort()).toEqual(["clean", "flagged"]);
  });

  it("gives breaking news a ranking boost", () => {
    const { winners } = rankForAutoPublish(
      [
        cand({ id: "calm", categorySlug: "gaming", qualityScore: 72, viralScore: 70 }),
        cand({ id: "break", categorySlug: "artificial-intelligence", qualityScore: 68, viralScore: 66, breaking: true }),
      ],
      { ...CFG, weights: { quality: 0.6, viral: 0.35, breaking: 40 } },
    );
    expect(winners[0].id).toBe("break");
  });

  it("flags belowMin when too few drafts qualify", () => {
    const res = rankForAutoPublish([cand({ id: "only" })], CFG);
    expect(res.winners).toHaveLength(1);
    expect(res.belowMin).toBe(true);
  });

  it("caps at maxPerDay", () => {
    const res = rankForAutoPublish(
      [
        cand({ id: "a", categorySlug: "artificial-intelligence" }),
        cand({ id: "b", categorySlug: "developer-tools" }),
        cand({ id: "c", categorySlug: "gaming" }),
        cand({ id: "d", categorySlug: "cybersecurity" }),
      ],
      CFG,
    );
    expect(res.winners).toHaveLength(3);
  });
});

describe("resolveAutoPublishConfig", () => {
  it("returns defaults for an empty settings block", () => {
    expect(resolveAutoPublishConfig({})).toEqual(DEFAULT_AUTOPUBLISH_CONFIG);
  });

  it("merges overrides from insights_settings.publishing", () => {
    const cfg = resolveAutoPublishConfig({
      minPerDay: 1,
      maxPerDay: 5,
      rankWeights: { quality: 0.8 },
    });
    expect(cfg.minPerDay).toBe(1);
    expect(cfg.maxPerDay).toBe(5);
    expect(cfg.weights.quality).toBe(0.8);
    expect(cfg.weights.viral).toBe(DEFAULT_AUTOPUBLISH_CONFIG.weights.viral);
  });
});
