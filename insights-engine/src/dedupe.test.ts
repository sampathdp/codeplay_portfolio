import { describe, it, expect } from "vitest";
import { clusterItems, itemSimilarity, jaccard, diceCoefficient } from "./dedupe";
import { normalizeItem } from "./normalize";
import { classifyItem } from "./classify";
import { mockRawItem } from "./adapters/mock";
import type { NormalizedItem, RawItem, SourceConfig } from "./types";

function src(partial: Partial<SourceConfig> = {}): SourceConfig {
  return {
    name: partial.name ?? "S",
    slug: partial.slug ?? "s",
    adapter: partial.adapter ?? "rss",
    sourceType: partial.sourceType ?? "official",
    baseUrl: "https://x.test",
    feedUrl: "https://x.test/feed",
    category: partial.category ?? null,
    enabled: true,
    trustScore: partial.trustScore ?? 80,
    priority: 10,
    configuration: {},
  };
}

function norm(raw: RawItem, source = src()): NormalizedItem {
  return { ...raw, ...normalizeItem(raw), ...classifyItem(raw, source) };
}

describe("similarity primitives", () => {
  it("jaccard of identical sets is 1, disjoint is 0", () => {
    expect(jaccard(["a", "b"], ["a", "b"])).toBe(1);
    expect(jaccard(["a"], ["b"])).toBe(0);
  });
  it("dice coefficient rewards shared trigrams", () => {
    expect(diceCoefficient("gpt 5 launch", "gpt 5 launch")).toBe(1);
    expect(diceCoefficient("apple", "orange")).toBeLessThan(0.3);
  });
});

describe("itemSimilarity", () => {
  it("returns 1 for the same normalized URL", () => {
    const a = norm(mockRawItem({ title: "A", url: "https://x.com/a?utm_source=rss" }));
    const b = norm(mockRawItem({ title: "Totally different", url: "https://x.com/a" }));
    expect(itemSimilarity(a, b)).toBe(1);
  });
  it("scores near-duplicate headlines from different outlets high", () => {
    const a = norm(mockRawItem({ title: "OpenAI launches GPT-5, its most capable model", url: "https://openai.com/gpt5", sourceSlug: "openai" }));
    const b = norm(mockRawItem({ title: "OpenAI announces GPT-5, calling it its most capable model", url: "https://theverge.com/openai-gpt5", sourceSlug: "verge" }));
    expect(itemSimilarity(a, b)).toBeGreaterThan(0.6);
  });
  it("keeps unrelated stories apart", () => {
    const a = norm(mockRawItem({ title: "Valve reveals Steam Deck 2 hardware", url: "https://a.com/1" }));
    const b = norm(mockRawItem({ title: "Cloudflare mitigates record DDoS attack", url: "https://b.com/2" }));
    expect(itemSimilarity(a, b)).toBeLessThan(0.4);
  });
});

describe("clusterItems", () => {
  it("groups multi-source coverage of one event into a single cluster", () => {
    const items = [
      norm(mockRawItem({ title: "Google releases Gemini 3 with agentic coding", url: "https://blog.google/gemini-3", sourceSlug: "google", source: "Google" })),
      norm(mockRawItem({ title: "Google's Gemini 3 lands with agentic coding features", url: "https://arstechnica.com/gemini-3", sourceSlug: "ars", source: "Ars" })),
      norm(mockRawItem({ title: "Gemini 3 released by Google, adds agentic coding", url: "https://news.ycombinator.com/item?id=1", sourceSlug: "hn", source: "HN" })),
      norm(mockRawItem({ title: "Nintendo announces Switch 2 successor", url: "https://nintendo.com/switch-2", sourceSlug: "nintendo", source: "Nintendo" })),
    ];
    const clusters = clusterItems(items);
    expect(clusters).toHaveLength(2);
    const big = clusters.find((c) => c.sourceCount >= 2)!;
    expect(big.sourceCount).toBe(3);
    expect(big.items).toHaveLength(3);
  });

  it("retains every source URL on the cluster", () => {
    const items = [
      norm(mockRawItem({ title: "NVIDIA unveils new Blackwell GPU", url: "https://blogs.nvidia.com/blackwell", sourceSlug: "nvidia" })),
      norm(mockRawItem({ title: "NVIDIA unveils new Blackwell GPU lineup", url: "https://reuters.com/nvidia-blackwell", sourceSlug: "reuters" })),
    ];
    const [cluster] = clusterItems(items);
    expect(cluster.items.map((i) => i.url).sort()).toEqual(
      ["https://blogs.nvidia.com/blackwell", "https://reuters.com/nvidia-blackwell"].sort(),
    );
  });

  it("does not over-merge distinct stories that share an entity", () => {
    const items = [
      norm(mockRawItem({ title: "Apple releases iOS 19 developer beta", url: "https://a.com/1" })),
      norm(mockRawItem({ title: "Apple faces EU antitrust fine over App Store", url: "https://a.com/2" })),
    ];
    expect(clusterItems(items)).toHaveLength(2);
  });
});
