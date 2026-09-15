/**
 * Prerender a static, crawler-visible <head> for each published CodePlay
 * Insights article into dist/public/insights/<slug>/index.html.
 *
 *   tsx insights-engine/src/publish/prerender.ts
 *
 * Must run AFTER `vite build` — it clones the *built* index.html (with its
 * hashed asset tags) as the template, so the SPA still boots and hydrates
 * normally on top of the static markup. The only thing this buys is a real
 * <title>/description/canonical/OG/Twitter/JSON-LD in the initial response,
 * for crawlers and unfurlers (Bing, Slack, Discord, …) that don't execute
 * the client JS that `ArticleSEO.tsx` otherwise relies on at runtime.
 *
 * Self-guards exactly like run.ts: no Supabase env, no published articles,
 * or a missing build output all just log and exit 0 — a failed prerender
 * must never block a deploy.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createServiceClient } from "../store/supabase";
import { loadPublishedArticles } from "./snapshot";
import {
  SITE_ORIGIN,
  INSIGHTS_BASE,
  articleUrl,
  type PublishArticle,
} from "./feeds";

const ROOT = process.cwd();
const DIST = join(ROOT, "dist", "public");
const TEMPLATE = join(DIST, "index.html");

// Mirrors client/src/lib/insights/authors.ts — CodePlay has one editorial
// byline today (no invented individual journalists), so this stays a
// single constant rather than pulling in the client module.
const EDITORIAL_TEAM = {
  name: "CodePlay Studios Editorial Team",
  type: "Organization" as const,
  url: `${SITE_ORIGIN}${INSIGHTS_BASE}/authors/codeplay-studios-editorial-team`,
};

function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Mirrors components/SEO.tsx's jsonLd() — keeps a stray `</script>` inside
 * a title/description from ever breaking out of the JSON-LD script tag. */
function jsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

function shareableImage(u: string | undefined): string | undefined {
  if (!u) return undefined;
  if (/^https?:\/\//.test(u)) return u;
  if (u.startsWith("/")) return `${SITE_ORIGIN}${u}`;
  return undefined;
}

/** Builds the <head> additions for one article. Mirrors ArticleSEO.tsx +
 * components/SEO.tsx so a crawler that never runs JS sees the same tags a
 * browser gets at runtime via react-helmet-async. */
function buildHead(article: PublishArticle): { title: string; head: string } {
  const url = articleUrl(article.slug);
  const author = EDITORIAL_TEAM;
  const published = article.publishedAt;
  const modified = article.updatedAt || article.publishedAt;
  const description = article.seo.description || article.dek;
  const siteTitle = article.seo.title.includes("CodePlay Studios")
    ? article.seo.title
    : `${article.seo.title} | CodePlay Studios`;
  const keywords = article.tags.map((t) => t.name).join(", ");

  const img = article.heroImage;
  const heroAbs = shareableImage(img?.ogSrc || img?.src);
  const absImage = heroAbs ?? `${SITE_ORIGIN}/assets/logo_trans.png`;
  const imageObject = heroAbs
    ? {
        "@type": "ImageObject",
        url: heroAbs,
        width: img?.width ?? 1200,
        height: img?.height ?? 630,
        ...(img?.alt ? { caption: img.alt } : {}),
      }
    : undefined;

  const newsArticle = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title.slice(0, 110),
    description: article.dek,
    datePublished: published,
    dateModified: modified,
    articleSection: article.categoryName,
    inLanguage: "en",
    isAccessibleForFree: true,
    keywords,
    wordCount: Math.max(1, Math.round(article.readingMinutes * 200)),
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(imageObject ? { image: imageObject } : {}),
    author: { "@type": author.type, name: author.name, url: author.url },
    publisher: {
      "@type": "Organization",
      name: "CodePlay Studios",
      url: SITE_ORIGIN,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_ORIGIN}/assets/logo_trans.png`,
        width: 512,
        height: 512,
      },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
      {
        "@type": "ListItem",
        position: 2,
        name: "Insights",
        item: `${SITE_ORIGIN}${INSIGHTS_BASE}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.categoryName,
        item: `${SITE_ORIGIN}${INSIGHTS_BASE}/category/${article.category}`,
      },
      { "@type": "ListItem", position: 4, name: article.title, item: url },
    ],
  };

  const tags = [
    `<link rel="canonical" href="${url}" />`,
    `<meta name="keywords" content="${escapeHtml(keywords)}" />`,
    `<meta name="robots" content="index, follow" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${escapeHtml(siteTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:image" content="${absImage}" />`,
    img?.alt
      ? `<meta property="og:image:alt" content="${escapeHtml(img.alt)}" />`
      : "",
    heroAbs && img?.width
      ? `<meta property="og:image:width" content="${img.width}" />`
      : "",
    heroAbs && img?.height
      ? `<meta property="og:image:height" content="${img.height}" />`
      : "",
    `<meta property="og:site_name" content="CodePlay Studios" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="article:published_time" content="${published}" />`,
    modified
      ? `<meta property="article:modified_time" content="${modified}" />`
      : "",
    `<meta property="article:author" content="${escapeHtml(author.name)}" />`,
    `<meta property="article:section" content="${escapeHtml(article.categoryName)}" />`,
    ...article.tags.map(
      (t) => `<meta property="article:tag" content="${escapeHtml(t.name)}" />`,
    ),
    `<meta property="twitter:card" content="summary_large_image" />`,
    `<meta property="twitter:url" content="${url}" />`,
    `<meta property="twitter:title" content="${escapeHtml(siteTitle)}" />`,
    `<meta property="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta property="twitter:image" content="${absImage}" />`,
    img?.alt
      ? `<meta property="twitter:image:alt" content="${escapeHtml(img.alt)}" />`
      : "",
    `<script type="application/ld+json">${jsonLd(newsArticle)}</script>`,
    `<script type="application/ld+json">${jsonLd(breadcrumbSchema)}</script>`,
  ].filter(Boolean);

  return { title: siteTitle, head: tags.join("\n  ") };
}

function renderArticleHtml(template: string, article: PublishArticle): string {
  const { title, head } = buildHead(article);
  const description = article.seo.description || article.dek;

  return template
    .replace(
      /<title>[\s\S]*?<\/title>/,
      `<title>${escapeHtml(title)}</title>`,
    )
    .replace(
      /<meta\s+name="description"[\s\S]*?\/>/,
      `<meta name="description" content="${escapeHtml(description)}" />`,
    )
    .replace("</head>", `  ${head}\n</head>`);
}

async function main(): Promise<void> {
  if (!existsSync(TEMPLATE)) {
    console.log(
      `insights:prerender — no build output at ${TEMPLATE}; run "vite build" first`,
    );
    return;
  }

  const env = process.env as Record<string, string | undefined>;
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log("insights:prerender — no Supabase env; skipping");
    return;
  }

  let articles: PublishArticle[] = [];
  try {
    const sb = createServiceClient(env);
    articles = await loadPublishedArticles(sb);
  } catch (err) {
    console.error(
      `insights:prerender — DB read failed, skipping: ${(err as Error).message}`,
    );
    return;
  }

  if (articles.length === 0) {
    console.log("insights:prerender — no published articles; skipping");
    return;
  }

  const template = readFileSync(TEMPLATE, "utf8");
  for (const article of articles) {
    const html = renderArticleHtml(template, article);
    const outDir = join(DIST, "insights", article.slug);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "index.html"), html, "utf8");
  }

  console.log(`insights:prerender — wrote ${articles.length} article page(s)`);
}

main().catch((err) => {
  console.error("insights:prerender — unexpected error (continuing):", err);
  process.exit(0);
});
