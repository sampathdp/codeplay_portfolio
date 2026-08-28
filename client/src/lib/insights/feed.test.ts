import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  allArticles,
  getFeatured,
  getTrending,
  getMostRead,
  getLatest,
  byCategory,
  byTag,
  searchArticles,
  relatedArticles,
  nonEmptyCategories,
  formatRelative,
  formatDate,
  __setFeedArticlesForTests,
} from "./feed";
import { SAMPLE_INSIGHTS_ARTICLES } from "@/data/insights.sample";

// Sample data is a TEST FIXTURE only — it is never imported by app code
// and never ships. The feed selectors read it here via the test hook.
beforeAll(() => __setFeedArticlesForTests(SAMPLE_INSIGHTS_ARTICLES));
afterAll(() => __setFeedArticlesForTests(null));

describe("feed selectors (sample data)", () => {
  it("returns published articles newest first", () => {
    const all = allArticles();
    expect(all.length).toBeGreaterThanOrEqual(6);
    for (let i = 1; i < all.length; i++) {
      expect(Date.parse(all[i - 1].publishedAt)).toBeGreaterThanOrEqual(
        Date.parse(all[i].publishedAt),
      );
    }
    expect(all.every((a) => a.status === "published")).toBe(true);
  });

  it("picks the flagged featured article", () => {
    expect(getFeatured()?.featured).toBe(true);
  });

  it("orders trending by rank", () => {
    const t = getTrending(5);
    const ranks = t.map((x) => x.trendingRank ?? 99);
    expect([...ranks]).toEqual([...ranks].sort((a, b) => a - b));
    expect(t[0].trendingRank).toBe(1);
  });

  it("orders most-read by view count", () => {
    const m = getMostRead(5);
    for (let i = 1; i < m.length; i++) {
      expect(m[i - 1].viewCount ?? 0).toBeGreaterThanOrEqual(m[i].viewCount ?? 0);
    }
  });

  it("excludes given slugs from latest", () => {
    const featured = getFeatured()!;
    const latest = getLatest(9, [featured.slug]);
    expect(latest.some((a) => a.slug === featured.slug)).toBe(false);
  });

  it("filters by category and tag", () => {
    expect(byCategory("artificial-intelligence").every((a) => a.category === "artificial-intelligence")).toBe(true);
    const tagged = byTag("react");
    expect(tagged.length).toBeGreaterThan(0);
    expect(tagged.every((a) => a.tags.some((t) => t.slug === "react"))).toBe(true);
  });

  it("only lists non-empty categories", () => {
    expect(nonEmptyCategories().every((c) => c.count > 0)).toBe(true);
  });
});

describe("searchArticles", () => {
  it("returns nothing for < 2 chars", () => {
    expect(searchArticles("a")).toEqual([]);
  });

  it("ranks a headline match above a body-only match", () => {
    const hits = searchArticles("nimbus");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].article.title.toLowerCase()).toContain("nimbus");
  });

  it("matches tags and category words", () => {
    expect(searchArticles("react").length).toBeGreaterThan(0);
    expect(searchArticles("cybersecurity").length).toBeGreaterThan(0);
  });

  it("returns [] for a nonsense query", () => {
    expect(searchArticles("zzzxqwv")).toEqual([]);
  });
});

describe("relatedArticles", () => {
  it("prefers same-category and shared-tag articles", () => {
    const seed = allArticles().find(
      (a) => a.slug === "acme-nimbus-3-agentic-coding-what-developers-need-to-know",
    )!;
    const related = relatedArticles(seed, 4);
    expect(related.length).toBeGreaterThanOrEqual(3);
    expect(related.some((a) => a.slug === seed.slug)).toBe(false);
    // shares category "artificial-intelligence" and the "ai-coding" tag
    expect(related[0].slug).toBe("mistral-ships-open-weights-coding-model");
  });

  it("never returns fewer than 3 when the library allows it", () => {
    const seed = allArticles()[0];
    expect(relatedArticles(seed, 4).length).toBeGreaterThanOrEqual(3);
  });
});

describe("date formatting", () => {
  it("formats absolute dates", () => {
    expect(formatDate("2026-08-28T00:00:00Z")).toMatch(/2026/);
  });
  it("formats relative times", () => {
    const now = Date.parse("2026-08-28T12:00:00Z");
    expect(formatRelative("2026-08-28T11:30:00Z", now)).toBe("30m ago");
    expect(formatRelative("2026-08-28T09:00:00Z", now)).toBe("3h ago");
    expect(formatRelative("2026-08-26T12:00:00Z", now)).toBe("2d ago");
  });
});
