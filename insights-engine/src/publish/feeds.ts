/**
 * Pure builders for the CodePlay Insights SEO artefacts:
 *   - client/src/data/insights.generated.ts   (build-time content snapshot)
 *   - client/public/sitemap-insights.xml      (published articles + sections)
 *   - client/public/insights/rss.xml          (RSS 2.0 feed)
 *
 * No I/O and no Supabase here — everything takes plain data so it can be
 * unit-tested. `run.ts` wires these to the database and the filesystem.
 */

export const SITE_ORIGIN = "https://codeplaystudios.com";
export const INSIGHTS_BASE = "/insights";

/** The subset of a published article these artefacts need. */
export interface PublishArticle {
  id: string;
  slug: string;
  title: string;
  dek: string;
  category: string;
  categoryName: string;
  tags: { slug: string; name: string }[];
  body: string;
  keyTakeaways: string[];
  take: {
    developerTake: string;
    businessImpact: string;
    developerImpact: string;
    technicalExplanation: string;
    risksAndLimitations: string;
    whyItMatters: string;
    actionableRecommendations: string;
  };
  sources: {
    url: string;
    title: string;
    publisher?: string;
    role: "primary" | "supporting";
  }[];
  heroImage?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    ogSrc?: string;
    aiGenerated?: boolean;
    kind?: "generated" | "manual" | "fallback";
  };
  author: string;
  authorRole?: string;
  readingMinutes: number;
  publishedAt: string;
  updatedAt?: string;
  seo: { title: string; description: string; canonicalUrl: string };
  articleType?: string;
  featured?: boolean;
  trending?: boolean;
  breaking?: boolean;
  trendingRank?: number;
  viewCount?: number;
  entities?: string[];
}

export function escapeXml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function articleUrl(slug: string): string {
  return `${SITE_ORIGIN}${INSIGHTS_BASE}/${slug}`;
}

/** ISO date (YYYY-MM-DD) for <lastmod>. */
export function isoDate(input: string | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  return Number.isNaN(d.getTime())
    ? new Date().toISOString().slice(0, 10)
    : d.toISOString().slice(0, 10);
}

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

export function buildSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map((e) => {
      const parts = [`    <loc>${escapeXml(e.loc)}</loc>`];
      if (e.lastmod) parts.push(`    <lastmod>${escapeXml(e.lastmod)}</lastmod>`);
      if (e.changefreq)
        parts.push(`    <changefreq>${escapeXml(e.changefreq)}</changefreq>`);
      if (typeof e.priority === "number")
        parts.push(`    <priority>${e.priority.toFixed(1)}</priority>`);
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/** Sitemap for everything under /insights: sections, trust pages, articles. */
export function buildInsightsSitemap(
  articles: PublishArticle[],
  categorySlugs: string[],
): string {
  const now = isoDate(new Date());
  const newest = articles
    .map((a) => a.updatedAt || a.publishedAt)
    .sort()
    .pop();

  const entries: SitemapEntry[] = [
    {
      loc: `${SITE_ORIGIN}${INSIGHTS_BASE}`,
      lastmod: newest ? isoDate(newest) : now,
      changefreq: "daily",
      priority: 0.9,
    },
    ...["about", "editorial-policy", "ai-policy", "corrections"].map((p) => ({
      loc: `${SITE_ORIGIN}${INSIGHTS_BASE}/${p}`,
      lastmod: now,
      changefreq: "monthly",
      priority: 0.3,
    })),
    {
      loc: `${SITE_ORIGIN}${INSIGHTS_BASE}/authors/codeplay-studios-editorial-team`,
      lastmod: now,
      changefreq: "weekly",
      priority: 0.3,
    },
  ];

  const usedCategories = new Set(articles.map((a) => a.category));
  for (const slug of categorySlugs) {
    if (!usedCategories.has(slug)) continue;
    entries.push({
      loc: `${SITE_ORIGIN}${INSIGHTS_BASE}/category/${slug}`,
      lastmod: now,
      changefreq: "weekly",
      priority: 0.5,
    });
  }

  for (const a of articles) {
    entries.push({
      loc: articleUrl(a.slug),
      lastmod: isoDate(a.updatedAt || a.publishedAt),
      changefreq: "monthly",
      priority: a.featured ? 0.8 : 0.7,
    });
  }

  return buildSitemapXml(entries);
}

export function buildRssXml(
  articles: PublishArticle[],
  now: Date = new Date(),
): string {
  const items = articles
    .slice()
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 50)
    .map((a) => {
      const url = articleUrl(a.slug);
      const img =
        a.heroImage?.ogSrc || a.heroImage?.src
          ? absolute(a.heroImage!.ogSrc || a.heroImage!.src)
          : undefined;
      return [
        "    <item>",
        `      <title>${escapeXml(a.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>`,
        `      <category>${escapeXml(a.categoryName)}</category>`,
        `      <description>${escapeXml(a.dek)}</description>`,
        img
          ? `      <enclosure url="${escapeXml(img)}" type="image/webp" />`
          : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    "    <title>CodePlay Insights</title>",
    `    <link>${SITE_ORIGIN}${INSIGHTS_BASE}</link>`,
    `    <atom:link href="${SITE_ORIGIN}${INSIGHTS_BASE}/rss.xml" rel="self" type="application/rss+xml" />`,
    "    <description>Original technology, AI and gaming analysis with the CodePlay developer take — for developers, gamers and businesses.</description>",
    "    <language>en</language>",
    `    <lastBuildDate>${now.toUTCString()}</lastBuildDate>`,
    "    <ttl>60</ttl>",
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}

function absolute(src: string): string {
  return src.startsWith("http") ? src : `${SITE_ORIGIN}${src}`;
}

/** The literal TS source for `client/src/data/insights.generated.ts`. */
export function renderArticlesModule(articles: PublishArticle[]): string {
  const sorted = articles
    .slice()
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .map((a) => ({ status: "published" as const, ...a }));
  const json = JSON.stringify(sorted, null, 2);
  return `/**
 * AUTO-GENERATED by insights-engine/src/publish/run.ts — DO NOT EDIT.
 *
 * Build-time snapshot of published CodePlay Insights articles, pulled from
 * Supabase before \`vite build\`. When the pipeline has no database
 * configured this stays an empty, type-correct array.
 */

import type { InsightsArticle } from "@/lib/insights/types";

export const INSIGHTS_ARTICLES: InsightsArticle[] = ${json};

export function getPublishedArticle(
  slug: string,
): InsightsArticle | undefined {
  return INSIGHTS_ARTICLES.find(
    (a) => a.slug === slug && a.status === "published",
  );
}
`;
}
