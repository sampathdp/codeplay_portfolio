import { describe, it, expect } from "vitest";
import { classifyItem, clusterConfidence, isOfficialDomain } from "./classify";
import { mockRawItem } from "./adapters/mock";
import type { SourceConfig } from "./types";

function source(p: Partial<SourceConfig> = {}): SourceConfig {
  return {
    name: p.name ?? "Src",
    slug: p.slug ?? "src",
    adapter: p.adapter ?? "rss",
    sourceType: p.sourceType ?? "official",
    baseUrl: "https://s.test",
    feedUrl: "https://s.test/feed",
    category: p.category ?? null,
    enabled: true,
    trustScore: p.trustScore ?? 85,
    priority: 10,
    configuration: {},
  };
}

describe("classifyItem", () => {
  it("tags an AI model release and maps it to the AI category", () => {
    const c = classifyItem(
      mockRawItem({ title: "OpenAI launches GPT-5, a new frontier model" }),
      source({ category: "artificial-intelligence" }),
    );
    expect(c.themes).toContain("ai-model-release");
    expect(c.primaryTheme).toBe("ai-model-release");
    expect(c.categorySlug).toBe("artificial-intelligence");
    expect(c.relevanceScore).toBeGreaterThan(80);
  });

  it("classifies a game engine story into game-development", () => {
    const c = classifyItem(
      mockRawItem({ title: "Unreal Engine 5.5 ships with Nanite improvements" }),
      source({ category: "game-development" }),
    );
    expect(c.categorySlug).toBe("game-development");
    expect(c.themes.some((t) => t === "unreal" || t === "game-engine")).toBe(true);
  });

  it("gives low relevance to loosely-related consumer news", () => {
    const c = classifyItem(
      mockRawItem({ title: "New smart glasses gadget spotted at trade show" }),
      source({ sourceType: "rss", category: null }),
    );
    expect(c.relevanceScore).toBeLessThan(70);
  });

  it("marks first-party official posts as verified and reddit as rumor", () => {
    expect(
      classifyItem(mockRawItem({ title: "We are launching X" }), source({ sourceType: "official" }))
        .factConfidence,
    ).toBe("verified");
    expect(
      classifyItem(
        mockRawItem({ title: "Rumor: big acquisition incoming" }),
        source({ adapter: "reddit", sourceType: "community" }),
      ).factConfidence,
    ).toBe("community_rumor");
  });

  it("treats an HN link to an official domain as verified, else unverified", () => {
    expect(
      classifyItem(
        mockRawItem({ title: "Show HN: thing", url: "https://openai.com/blog/thing" }),
        source({ adapter: "hackernews", sourceType: "api" }),
      ).factConfidence,
    ).toBe("verified");
    expect(
      classifyItem(
        mockRawItem({ title: "Show HN: thing", url: "https://randomblog.example/thing" }),
        source({ adapter: "hackernews", sourceType: "api" }),
      ).factConfidence,
    ).toBe("unverified");
  });
});

describe("isOfficialDomain", () => {
  it("recognizes first-party domains and subdomains", () => {
    expect(isOfficialDomain("https://openai.com/x")).toBe(true);
    expect(isOfficialDomain("https://news.xbox.com/en-us/x")).toBe(true);
    expect(isOfficialDomain("https://www.theverge.com/x")).toBe(false);
  });
});

describe("clusterConfidence", () => {
  it("verified wins outright", () => {
    expect(clusterConfidence(["unverified", "verified", "community_rumor"])).toBe("verified");
  });
  it("two likely sources make a cluster likely", () => {
    expect(clusterConfidence(["likely", "likely"])).toBe("likely");
  });
  it("a lone community mention stays a rumor", () => {
    expect(clusterConfidence(["community_rumor"])).toBe("community_rumor");
    expect(clusterConfidence(["unverified"])).toBe("unverified");
  });
});
