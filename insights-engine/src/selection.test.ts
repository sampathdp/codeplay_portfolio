import { describe, it, expect } from "vitest";
import { selectDailyArticleCandidates, slotForCategory } from "./selection";
import { DEFAULT_CONFIG } from "./config";
import type { ScoredCluster } from "./types";

// Multi-pick selection logic, exercised at 2–3/day (the default is 1/day).
const SEL = { ...DEFAULT_CONFIG.selection, perDay: 3, minPerDay: 2 };
const NOW = new Date("2026-08-28T12:00:00Z");

function sc(p: Partial<ScoredCluster> & { key: string }): ScoredCluster {
  return {
    key: p.key,
    title: p.title ?? p.key,
    normalizedTitle: p.normalizedTitle ?? p.key,
    summary: "",
    items: p.items ?? [],
    entities: [],
    keywords: [],
    themes: p.themes ?? [],
    primaryTheme: p.primaryTheme ?? null,
    categorySlug: p.categorySlug ?? null,
    earliestPublishedAt: p.earliestPublishedAt ?? "2026-08-28T09:00:00Z",
    lastSeenAt: "2026-08-28T11:00:00Z",
    sourceCount: p.sourceCount ?? 2,
    factConfidence: p.factConfidence ?? "likely",
    scores: {
      freshness: 80, engagement: 50, sourceAuthority: 80,
      crossSourceCoverage: 40, codeplayRelevance: 70, communityMomentum: 0, novelty: 70,
    },
    viralScore: p.viralScore ?? 70,
    breaking: p.breaking ?? false,
  };
}

describe("slotForCategory", () => {
  it("maps categories to diversity slots", () => {
    expect(slotForCategory("artificial-intelligence")).toBe(1);
    expect(slotForCategory("developer-tools")).toBe(2);
    expect(slotForCategory("gaming")).toBe(3);
    expect(slotForCategory(null)).toBe(0);
  });
});

describe("selectDailyArticleCandidates", () => {
  it("returns 2-3 picks spread across the diversity slots", () => {
    const clusters = [
      sc({ key: "ai1", categorySlug: "artificial-intelligence", primaryTheme: "ai-model-release", viralScore: 88 }),
      sc({ key: "ai2", categorySlug: "artificial-intelligence", primaryTheme: "ai-agents", viralScore: 82 }),
      sc({ key: "dev1", categorySlug: "developer-tools", primaryTheme: "dev-tools", viralScore: 76 }),
      sc({ key: "game1", categorySlug: "gaming", primaryTheme: "console-news", viralScore: 71 }),
      sc({ key: "game2", categorySlug: "game-development", primaryTheme: "unreal", viralScore: 66 }),
    ];
    const { picks } = selectDailyArticleCandidates({ clusters, now: NOW }, SEL);
    expect(picks.length).toBeGreaterThanOrEqual(2);
    expect(picks.length).toBeLessThanOrEqual(3);
    const slots = picks.map((p) => p.slot).sort();
    expect(new Set(slots).size).toBe(picks.length); // one per slot
    expect(slots).toEqual([1, 2, 3]);
  });

  it("does not pick two stories with the same primary theme", () => {
    const clusters = [
      sc({ key: "a", categorySlug: "artificial-intelligence", primaryTheme: "ai-model-release", viralScore: 90 }),
      sc({ key: "b", categorySlug: "software-development", primaryTheme: "ai-model-release", viralScore: 85 }),
      sc({ key: "c", categorySlug: "developer-tools", primaryTheme: "dev-tools", viralScore: 80 }),
      sc({ key: "d", categorySlug: "gaming", primaryTheme: "new-games", viralScore: 78 }),
    ];
    const { picks } = selectDailyArticleCandidates({ clusters, now: NOW }, SEL);
    const themes = picks.map((p) => p.cluster.primaryTheme);
    expect(new Set(themes).size).toBe(themes.length);
  });

  it("excludes rumors and unverified single-source items", () => {
    const clusters = [
      sc({ key: "rumor", categorySlug: "big-tech", primaryTheme: "acquisition", viralScore: 95, factConfidence: "community_rumor" }),
      sc({ key: "unver", categorySlug: "gaming", primaryTheme: "new-games", viralScore: 92, factConfidence: "unverified" }),
      sc({ key: "solid", categorySlug: "artificial-intelligence", primaryTheme: "ai-model-release", viralScore: 60, factConfidence: "verified" }),
    ];
    const { picks, eligibleCount } = selectDailyArticleCandidates({ clusters, now: NOW }, SEL);
    expect(eligibleCount).toBe(1);
    expect(picks.map((p) => p.cluster.key)).toEqual(["solid"]);
  });

  it("still surfaces a forced cluster below threshold / confidence", () => {
    const clusters = [
      sc({ key: "weak", categorySlug: "startups", primaryTheme: "startup-launch", viralScore: 12, factConfidence: "unverified" }),
    ];
    const forcedKeys = new Set(["weak"]);
    const { picks } = selectDailyArticleCandidates({ clusters, now: NOW, forcedKeys }, SEL);
    expect(picks.map((p) => p.cluster.key)).toEqual(["weak"]);
  });

  it("skips clusters already used recently", () => {
    const clusters = [
      sc({ key: "used", categorySlug: "artificial-intelligence", primaryTheme: "ai-model-release", viralScore: 90 }),
      sc({ key: "fresh", categorySlug: "developer-tools", primaryTheme: "dev-tools", viralScore: 70 }),
    ];
    const { picks } = selectDailyArticleCandidates(
      { clusters, now: NOW, recentlyUsedKeys: new Set(["used"]) },
      SEL,
    );
    expect(picks.map((p) => p.cluster.key)).not.toContain("used");
  });

  it("drops stale clusters outside the lookback window and notes the shortfall", () => {
    const stale = sc({
      key: "old",
      categorySlug: "artificial-intelligence",
      primaryTheme: "ai-model-release",
      viralScore: 95,
      earliestPublishedAt: "2026-08-25T00:00:00Z", // > 36h before NOW
    });
    const { picks, note } = selectDailyArticleCandidates({ clusters: [stale], now: NOW }, SEL);
    expect(picks).toHaveLength(0);
    expect(note).toMatch(/qualifying/);
  });
});
