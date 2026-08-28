import { describe, it, expect } from "vitest";
import {
  clamp,
  logNorm,
  freshnessScore,
  crossSourceScore,
  engagementScore,
  communityMomentumScore,
  noveltyScore,
  scoreCluster,
} from "./scoring";
import { DEFAULT_CONFIG } from "./config";
import type { NormalizedItem, TopicCluster } from "./types";

const CAPS = DEFAULT_CONFIG.scoring.engagementCaps;
const SCFG = DEFAULT_CONFIG.scoring;

function item(partial: Partial<NormalizedItem> = {}): NormalizedItem {
  return {
    externalId: "x",
    title: partial.title ?? "Some tech story",
    url: "https://x.com/a",
    source: "S",
    sourceSlug: partial.sourceSlug ?? "s",
    adapter: partial.adapter ?? "rss",
    normalizedTitle: partial.normalizedTitle ?? "some tech story",
    normalizedUrl: "x.com/a",
    dedupeHash: "h",
    entities: [],
    keywords: [],
    themes: [],
    primaryTheme: null,
    categorySlug: null,
    relevanceScore: partial.relevanceScore ?? 50,
    factConfidence: "likely",
    signals: partial.signals ?? {},
    publishedAt: partial.publishedAt,
  };
}

function cluster(partial: Partial<TopicCluster> = {}): TopicCluster {
  const items = partial.items ?? [item()];
  return {
    key: "k",
    title: partial.title ?? "Some tech story",
    normalizedTitle: "some tech story",
    summary: "",
    items,
    entities: [],
    keywords: [],
    themes: [],
    primaryTheme: partial.primaryTheme ?? null,
    categorySlug: partial.categorySlug ?? null,
    earliestPublishedAt: partial.earliestPublishedAt ?? new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    sourceCount: partial.sourceCount ?? items.length,
    factConfidence: "likely",
  };
}

describe("primitives", () => {
  it("clamp bounds 0..100 and maps NaN to min", () => {
    expect(clamp(-1)).toBe(0);
    expect(clamp(120)).toBe(100);
    expect(clamp(Number.NaN)).toBe(0);
  });
  it("logNorm is 0 at 0 and approaches 100 near the cap", () => {
    expect(logNorm(0, 100)).toBe(0);
    expect(logNorm(100, 100)).toBeGreaterThan(95);
  });
});

describe("freshnessScore", () => {
  it("is 100 at age 0 and halves each half-life", () => {
    expect(freshnessScore(0, SCFG)).toBe(100);
    expect(freshnessScore(SCFG.freshnessHalfLifeHours, SCFG)).toBeCloseTo(50, 0);
  });
  it("is 0 past the max age", () => {
    expect(freshnessScore(SCFG.freshnessMaxAgeHours + 1, SCFG)).toBe(0);
  });
});

describe("crossSourceScore", () => {
  it("is 0 for a lone single-adapter source and grows with coverage", () => {
    expect(crossSourceScore(1, 1)).toBe(0);
    expect(crossSourceScore(2, 1)).toBeGreaterThan(0);
    expect(crossSourceScore(4, 3)).toBe(100);
  });
});

describe("engagement / community", () => {
  it("engagementScore rises with HN points", () => {
    const low = engagementScore([item({ signals: { points: 10 } })], CAPS);
    const high = engagementScore([item({ signals: { points: 600 } })], CAPS);
    expect(high).toBeGreaterThan(low);
  });
  it("communityMomentumScore is 0 without community items", () => {
    expect(communityMomentumScore([item({ signals: { points: 500 } })], CAPS)).toBe(0);
  });
  it("communityMomentumScore is positive for a hot reddit thread", () => {
    const s = communityMomentumScore(
      [
        item({ adapter: "reddit", signals: { redditScore: 3000, comments: 400, redditUpvoteRatio: 0.95 } }),
        item({ adapter: "reddit", signals: { redditScore: 1200, comments: 150, redditUpvoteRatio: 0.9 } }),
      ],
      CAPS,
    );
    expect(s).toBeGreaterThan(40);
  });
});

describe("noveltyScore", () => {
  it("rewards launch language, penalizes rehashes and priors", () => {
    expect(noveltyScore(cluster({ title: "Acme launches new database" }))).toBeGreaterThan(
      noveltyScore(cluster({ title: "Weekly update: Acme database patch notes" })),
    );
    expect(
      noveltyScore(cluster({ title: "Acme launches new database" }), 3),
    ).toBeLessThan(noveltyScore(cluster({ title: "Acme launches new database" }), 0));
  });
});

describe("scoreCluster", () => {
  it("produces a 0-100 viral score and a full breakdown", () => {
    const now = new Date("2026-08-28T12:00:00Z");
    const c = cluster({
      title: "OpenAI launches GPT-5",
      items: [
        item({ sourceSlug: "openai", relevanceScore: 95, signals: { isOfficial: true }, publishedAt: "2026-08-28T09:00:00Z" }),
        item({ sourceSlug: "verge", relevanceScore: 80, signals: {}, publishedAt: "2026-08-28T10:00:00Z" }),
      ],
      sourceCount: 2,
      earliestPublishedAt: "2026-08-28T09:00:00Z",
    });
    const { scores, viralScore } = scoreCluster(
      { cluster: c, now, trustScores: [95, 80], distinctAdapters: 2 },
      SCFG,
    );
    expect(viralScore).toBeGreaterThan(0);
    expect(viralScore).toBeLessThanOrEqual(100);
    expect(scores.freshness).toBeGreaterThan(80);
    expect(scores.sourceAuthority).toBeGreaterThan(90);
    expect(scores.crossSourceCoverage).toBeGreaterThan(0);
    expect(Object.keys(scores)).toHaveLength(7);
  });

  it("weights are configurable — zeroing all weights yields 0", () => {
    const zero = {
      ...SCFG,
      weights: {
        freshness: 0, engagement: 0, sourceAuthority: 0, crossSourceCoverage: 0,
        codeplayRelevance: 0, communityMomentum: 0, novelty: 0,
      },
    };
    const { viralScore } = scoreCluster(
      { cluster: cluster(), now: new Date(), trustScores: [80], distinctAdapters: 1 },
      zero,
    );
    expect(viralScore).toBe(0);
  });
});
