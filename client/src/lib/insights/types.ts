/**
 * Shared CodePlay Insights types.
 *
 * Phase 1: type contracts only — no runtime, no data source wired up yet.
 * These shapes are consumed by the (currently empty) build-time snapshot
 * `client/src/data/insights.generated.ts` and, in Phase 2, mirror the
 * Supabase schema in `docs/codeplay-insights-architecture.md` §3.3.
 */

import type { InsightsCategorySlug } from "./categories";

export type ArticleStatus =
  | "draft"
  | "in_review"
  | "scheduled"
  | "published"
  | "archived";

/** A cited primary source that a published article links back to. */
export interface ArticleSourceRef {
  url: string;
  title: string;
  publisher?: string;
  role: "primary" | "supporting";
}

/**
 * The original-value sections every article must carry before it can be
 * published (see architecture doc — this is the anti-content-farm rule).
 */
export interface DeveloperTake {
  /** CodePlay's editorial position on the news. */
  developerTake: string;
  businessImpact: string;
  developerImpact: string;
  technicalExplanation: string;
  risksAndLimitations: string;
  whyItMatters: string;
  actionableRecommendations: string;
}

/** Attribution for a stock (non-generated, non-manual) hero photo. */
export interface ImageCredit {
  provider: "pexels";
  photographer: string;
  photographerUrl: string;
  /** The photo's page on the provider. */
  sourceUrl: string;
}

export interface ArticleImage {
  /** Public URL of the hero image once shipped into the static build. */
  src: string;
  alt: string;
  width?: number;
  height?: number;
  /** 1200x630 crop for Open Graph / Twitter cards. */
  ogSrc?: string;
  /** Responsive WebP variants (label → url). */
  variants?: { label: string; url: string; width: number; height: number }[];
  /** True for a Gemini-generated editorial illustration — surface the
   * "AI-generated editorial illustration" label where shown. */
  aiGenerated?: boolean;
  /** 'generated' | 'manual' | 'fallback' | 'stock'. */
  kind?: "generated" | "manual" | "fallback" | "stock";
  /** Present for `kind: 'stock'` — show a "Photo: <name> / Pexels" credit. */
  credit?: ImageCredit | null;
}

export interface ArticleTag {
  slug: string;
  name: string;
}

export type InsightsArticleType =
  | "breaking_news"
  | "tech_analysis"
  | "developer_guide"
  | "explainer"
  | "gaming_news"
  | "gaming_community"
  | "game_development"
  | "ai_news"
  | "product_launch"
  | "security_alert"
  | "industry_analysis";

/** A fully rendered, publishable article as seen by the public site. */
export interface InsightsArticle {
  id: string;
  slug: string;
  status: ArticleStatus;
  title: string;
  /** Standfirst / deck. */
  dek: string;
  category: InsightsCategorySlug;
  categoryName?: string;
  tags: ArticleTag[];
  /** Article body as Markdown (rendered to safe HTML client-side). The
   * "Sources & Further Reading" section is stripped — see `sources`. */
  body: string;
  /** Scannable bullet points — rendered as "Key Takeaways". */
  keyTakeaways?: string[];
  take: DeveloperTake;
  sources: ArticleSourceRef[];
  heroImage?: ArticleImage;
  author: string;
  authorRole?: string;
  readingMinutes: number;
  publishedAt: string; // ISO 8601
  updatedAt?: string; // ISO 8601
  seo: {
    title: string;
    description: string;
    canonicalUrl: string;
  };
  articleType?: InsightsArticleType;
  featured?: boolean;
  trending?: boolean;
  breaking?: boolean;
  /** 1-based rank for the "Trending Now" list. */
  trendingRank?: number;
  /** For the "Most Read" list + related-story recency weighting. */
  viewCount?: number;
  /** Companies / people / products — used to rank related stories. */
  entities?: string[];
}

/** Lightweight shape for list/card views. */
export type InsightsArticleSummary = Pick<
  InsightsArticle,
  | "id"
  | "slug"
  | "title"
  | "dek"
  | "category"
  | "categoryName"
  | "tags"
  | "heroImage"
  | "author"
  | "readingMinutes"
  | "publishedAt"
  | "featured"
  | "trending"
  | "breaking"
  | "trendingRank"
  | "viewCount"
  | "entities"
>;

/** An approved upstream feed the ingestion pipeline is allowed to poll. */
export interface InsightsSource {
  id: string;
  name: string;
  homepageUrl: string;
  feedUrl: string;
  kind: "rss" | "api" | "sitemap";
  weight: number;
  isApproved: boolean;
  lastFetchedAt?: string;
}
