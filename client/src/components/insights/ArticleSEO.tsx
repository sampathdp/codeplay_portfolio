import SEO from "@/components/SEO";
import type { InsightsArticle } from "@/lib/insights/types";
import {
  insightsArticleUrl,
  insightsCategoryPath,
  SITE_ORIGIN,
  INSIGHTS_BASE,
} from "@/lib/insights/routes";
import { categoryName } from "@/lib/insights/feed";
import { getInsightsAuthor } from "@/lib/insights/authors";

/**
 * Article-level SEO — wraps the site's `<SEO>` with:
 *  - `og:type=article` + `article:*` Open Graph tags
 *  - large featured image for Facebook / LinkedIn / X / Discord / Slack
 *  - `NewsArticle` + `BreadcrumbList` JSON-LD (no fabricated fields)
 *
 * Dates, author and image come straight from the published record.
 */
export default function ArticleSEO({ article }: { article: InsightsArticle }) {
  const url = insightsArticleUrl(article.slug);
  const catName = categoryName(article.category);
  const author = getInsightsAuthor(article.author);
  const published = article.publishedAt;
  const modified = article.updatedAt || article.publishedAt;

  const img = article.heroImage;
  // Only absolute https URLs or site-root paths make a shareable OG image —
  // data:/blob: URIs (used by dev sample data) are not.
  const shareable = (u?: string): string | undefined => {
    if (!u) return undefined;
    if (/^https?:\/\//.test(u)) return u;
    if (u.startsWith("/")) return `${SITE_ORIGIN}${u}`;
    return undefined;
  };
  const heroAbs = shareable(img?.ogSrc || img?.src);
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
    articleSection: catName,
    inLanguage: "en",
    isAccessibleForFree: true,
    keywords: article.tags.map((t) => t.name).join(", "),
    wordCount: Math.max(1, Math.round(article.readingMinutes * 200)),
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(imageObject ? { image: imageObject } : {}),
    author: {
      "@type": author.type,
      name: author.name,
      url: author.url,
    },
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

  const breadcrumbs = [
    { name: "Home", item: SITE_ORIGIN },
    { name: "Insights", item: `${SITE_ORIGIN}${INSIGHTS_BASE}` },
    { name: catName, item: `${SITE_ORIGIN}${insightsCategoryPath(article.category)}` },
    { name: article.title, item: url },
  ];

  return (
    <SEO
      title={article.seo.title}
      description={article.seo.description}
      canonical={url}
      ogType="article"
      ogImage={absImage}
      ogImageAlt={img?.alt || article.title}
      ogImageWidth={heroAbs ? img?.width : undefined}
      ogImageHeight={heroAbs ? img?.height : undefined}
      keywords={article.tags.map((t) => t.name).join(", ")}
      article={{
        publishedTime: published,
        modifiedTime: modified,
        authorName: author.name,
        section: catName,
        tags: article.tags.map((t) => t.name),
      }}
      breadcrumbs={breadcrumbs}
      schemas={[newsArticle]}
    />
  );
}
