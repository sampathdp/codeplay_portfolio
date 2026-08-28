import { describe, it, expect } from "vitest";
import {
  buildInsightsSitemap,
  buildRssXml,
  buildSitemapXml,
  escapeXml,
  isoDate,
  renderArticlesModule,
  type PublishArticle,
} from "./feeds";

function article(over: Partial<PublishArticle> = {}): PublishArticle {
  return {
    id: over.id ?? "a1",
    slug: over.slug ?? "a-real-story",
    title: over.title ?? "A Real Story & Its <Impact>",
    dek: over.dek ?? "What it means.",
    category: over.category ?? "artificial-intelligence",
    categoryName: over.categoryName ?? "Artificial Intelligence",
    tags: over.tags ?? [{ slug: "ai", name: "AI" }],
    body: over.body ?? "## Heading\n\nBody.",
    keyTakeaways: over.keyTakeaways ?? [],
    take: over.take ?? {
      developerTake: "d",
      businessImpact: "b",
      developerImpact: "di",
      technicalExplanation: "t",
      risksAndLimitations: "r",
      whyItMatters: "w",
      actionableRecommendations: "a",
    },
    sources: over.sources ?? [
      { url: "https://example.com/x", title: "X", role: "primary" },
    ],
    heroImage: over.heroImage,
    author: over.author ?? "CodePlay Studios Editorial Team",
    readingMinutes: over.readingMinutes ?? 6,
    publishedAt: over.publishedAt ?? "2026-08-20T08:30:00.000Z",
    updatedAt: over.updatedAt,
    seo: over.seo ?? {
      title: "t",
      description: "d",
      canonicalUrl: "https://codeplaystudios.com/insights/a-real-story",
    },
    featured: over.featured,
    trending: over.trending,
    breaking: over.breaking,
    viewCount: over.viewCount,
    entities: over.entities,
  };
}

describe("escapeXml", () => {
  it("escapes the five XML entities", () => {
    expect(escapeXml(`a & b < c > d " e ' f`)).toBe(
      "a &amp; b &lt; c &gt; d &quot; e &apos; f",
    );
  });
});

describe("isoDate", () => {
  it("returns YYYY-MM-DD", () => {
    expect(isoDate("2026-08-20T08:30:00Z")).toBe("2026-08-20");
  });
  it("falls back to today for garbage", () => {
    expect(isoDate("not-a-date")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("buildSitemapXml", () => {
  it("emits well-formed urls with optional fields", () => {
    const xml = buildSitemapXml([
      { loc: "https://x/y", lastmod: "2026-08-20", priority: 0.7 },
      { loc: "https://x/z" },
    ]);
    expect(xml).toContain("<loc>https://x/y</loc>");
    expect(xml).toContain("<priority>0.7</priority>");
    expect(xml.match(/<url>/g)).toHaveLength(2);
    expect(xml.startsWith('<?xml version="1.0"')).toBe(true);
  });
});

describe("buildInsightsSitemap", () => {
  it("lists the hub, trust pages, used category and every article", () => {
    const xml = buildInsightsSitemap(
      [article({ slug: "one", category: "gaming" })],
      ["gaming", "saas"],
    );
    expect(xml).toContain("https://codeplaystudios.com/insights</loc>");
    expect(xml).toContain("/insights/editorial-policy");
    expect(xml).toContain("/insights/category/gaming");
    expect(xml).not.toContain("/insights/category/saas"); // unused category
    expect(xml).toContain("/insights/one</loc>");
  });

  it("is valid with no articles", () => {
    const xml = buildInsightsSitemap([], ["gaming"]);
    expect(xml).toContain("/insights</loc>");
    expect(xml).not.toContain("/category/");
  });
});

describe("buildRssXml", () => {
  it("includes an item per article, newest first", () => {
    const xml = buildRssXml([
      article({ slug: "old", title: "Old", publishedAt: "2026-08-01T00:00:00Z" }),
      article({ slug: "new", title: "New", publishedAt: "2026-08-25T00:00:00Z" }),
    ]);
    expect(xml.indexOf("/insights/new")).toBeLessThan(xml.indexOf("/insights/old"));
    expect(xml.match(/<item>/g)).toHaveLength(2);
    expect(xml).toContain('<guid isPermaLink="true">');
  });

  it("escapes titles and descriptions", () => {
    const xml = buildRssXml([article()]);
    expect(xml).toContain("<title>A Real Story &amp; Its &lt;Impact&gt;</title>");
  });

  it("adds an enclosure only when there is a hero image", () => {
    const withImg = buildRssXml([
      article({ heroImage: { src: "/assets/insights/x/featured.webp", alt: "x" } }),
    ]);
    expect(withImg).toContain(
      "<enclosure url=\"https://codeplaystudios.com/assets/insights/x/featured.webp\"",
    );
    expect(buildRssXml([article()])).not.toContain("<enclosure");
  });

  it("is valid with no articles", () => {
    const xml = buildRssXml([]);
    expect(xml).toContain("<title>CodePlay Insights</title>");
    expect(xml).not.toContain("<item>");
  });
});

describe("renderArticlesModule", () => {
  it("emits a typed module that marks every article published", () => {
    const src = renderArticlesModule([article({ slug: "z" })]);
    expect(src).toContain(
      'import type { InsightsArticle } from "@/lib/insights/types";',
    );
    expect(src).toContain("export const INSIGHTS_ARTICLES: InsightsArticle[]");
    expect(src).toContain('"status": "published"');
    expect(src).toContain("getPublishedArticle");
  });

  it("emits an empty array for no articles", () => {
    expect(renderArticlesModule([])).toContain(
      "export const INSIGHTS_ARTICLES: InsightsArticle[] = [];",
    );
  });
});
