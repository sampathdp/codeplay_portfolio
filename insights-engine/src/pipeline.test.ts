import { describe, it, expect } from "vitest";
import { runDiscoveryPipeline } from "./pipeline";
import { MemoryStore } from "./store/memory";
import { makeMockAdapter, mockRawItem } from "./adapters/mock";
import type { AdapterContext, SourceConfig } from "./types";

const NOW = new Date("2026-08-28T12:00:00Z");

function ctx(): AdapterContext {
  return {
    now: NOW,
    env: {},
    log: () => {},
    fetchText: async () => "",
    fetchJson: async () => ({}) as never,
  };
}

function source(p: Partial<SourceConfig> & { slug: string }): SourceConfig {
  return {
    name: p.name ?? p.slug,
    slug: p.slug,
    adapter: p.adapter ?? "mock",
    sourceType: p.sourceType ?? "official",
    baseUrl: "https://s.test",
    feedUrl: "https://s.test/feed",
    category: p.category ?? null,
    enabled: p.enabled ?? true,
    trustScore: p.trustScore ?? 80,
    priority: 10,
    configuration: {},
  };
}

describe("runDiscoveryPipeline", () => {
  it("discovers, clusters, scores and persists", async () => {
    const rss = makeMockAdapter({
      kind: "rss",
      items: [
        mockRawItem({ title: "OpenAI launches GPT-5 frontier model", url: "https://openai.com/gpt5", sourceSlug: "a", source: "A", publishedAt: NOW.toISOString(), signals: { isOfficial: true } }),
        mockRawItem({ title: "Nintendo reveals Switch 2 hardware specs", url: "https://nintendo.com/s2", sourceSlug: "a", source: "A", publishedAt: NOW.toISOString(), signals: { isOfficial: true } }),
      ],
    });
    const store = new MemoryStore();
    const report = await runDiscoveryPipeline({
      sources: [source({ slug: "a", adapter: "rss" })],
      ctx: ctx(),
      store,
      getAdapter: () => rss,
    });
    expect(report.itemsDiscovered).toBe(2);
    expect(report.clusters).toHaveLength(2);
    expect(report.clusters.every((c) => c.viralScore >= 0 && c.viralScore <= 100)).toBe(true);
    expect(store.clusters).toHaveLength(2);
    expect(store.ingestionRuns).toHaveLength(1);
  });

  it("isolates a failing source — others still ingest", async () => {
    const good = makeMockAdapter({
      kind: "rss",
      items: [mockRawItem({ title: "Cloudflare ships new WAF engine", url: "https://blog.cloudflare.com/waf", sourceSlug: "good" })],
    });
    const bad = makeMockAdapter({ kind: "hackernews", failWith: "boom: upstream 500" });

    const store = new MemoryStore();
    const report = await runDiscoveryPipeline({
      sources: [
        source({ slug: "bad", adapter: "hackernews" }),
        source({ slug: "good", adapter: "rss" }),
      ],
      ctx: ctx(),
      store,
      getAdapter: (k) => (k === "hackernews" ? bad : k === "rss" ? good : undefined),
    });

    const byStatus = Object.fromEntries(report.runs.map((r) => [r.sourceSlug, r.status]));
    expect(byStatus.bad).toBe("failed");
    expect(byStatus.good).toBe("succeeded");
    expect(report.itemsDiscovered).toBe(1);
    expect(report.clusters).toHaveLength(1);
    expect(report.errors[0]).toContain("boom");
    expect(store.ingestionRuns).toHaveLength(2);
  });

  it("skips disabled sources and sources with no adapter", async () => {
    const store = new MemoryStore();
    const report = await runDiscoveryPipeline({
      sources: [
        source({ slug: "off", enabled: false, adapter: "rss" }),
        source({ slug: "unknown", adapter: "reddit" }),
      ],
      ctx: ctx(),
      store,
      getAdapter: (k) => (k === "rss" ? makeMockAdapter({ kind: "rss", items: [] }) : undefined),
    });
    expect(report.runs.map((r) => r.status)).toEqual(["skipped", "skipped"]);
    expect(report.errors).toHaveLength(0);
  });

  it("respects canRun=false (missing credentials)", async () => {
    const store = new MemoryStore();
    const report = await runDiscoveryPipeline({
      sources: [source({ slug: "reddit", adapter: "reddit" })],
      ctx: ctx(),
      store,
      getAdapter: () => makeMockAdapter({ kind: "reddit", canRun: false }),
    });
    expect(report.runs[0].status).toBe("skipped");
    expect(report.runs[0].error).toMatch(/canRun/);
  });

  it("clusters GPT-5 coverage from two adapters into one scored cluster", async () => {
    const a = makeMockAdapter({
      kind: "rss",
      items: [mockRawItem({ title: "OpenAI launches GPT-5 frontier model", url: "https://openai.com/gpt5", sourceSlug: "a", signals: { isOfficial: true }, publishedAt: NOW.toISOString() })],
    });
    const h = makeMockAdapter({
      kind: "hackernews",
      items: [mockRawItem({ title: "OpenAI launches GPT-5, a new frontier model", url: "https://news.ycombinator.com/item?id=1", sourceSlug: "hn", signals: { points: 900 }, publishedAt: NOW.toISOString() })],
    });
    const store = new MemoryStore();
    const report = await runDiscoveryPipeline({
      sources: [
        source({ slug: "a", adapter: "rss", trustScore: 95 }),
        source({ slug: "hn", adapter: "hackernews", sourceType: "api", trustScore: 65 }),
      ],
      ctx: ctx(),
      store,
      getAdapter: (k) => (k === "rss" ? a : k === "hackernews" ? h : undefined),
    });
    expect(report.clusters).toHaveLength(1);
    const c = report.clusters[0];
    expect(c.sourceCount).toBe(2);
    expect(c.viralScore).toBeGreaterThan(40);
    expect(c.factConfidence).toBe("verified"); // one official source in the cluster
  });
});
