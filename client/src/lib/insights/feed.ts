/**
 * Read model for the public CodePlay Insights pages. Pure functions over
 * the build-time snapshot (`insights.generated.ts`). In dev, when the
 * snapshot is empty, a small sample set is used so the layout can be
 * previewed — production always uses the real generated data.
 *
 * Search is client-side over the loaded snapshot (fast for the expected
 * 2–3 articles/day cadence). It can be swapped for a Supabase full-text
 * query later without changing callers.
 */

import type {
  InsightsArticle,
  InsightsArticleSummary,
} from "./types";
import { INSIGHTS_CATEGORIES, type InsightsCategory } from "./categories";
import { INSIGHTS_ARTICLES } from "@/data/insights.generated";
import { SAMPLE_INSIGHTS_ARTICLES } from "@/data/insights.sample";

function source(): InsightsArticle[] {
  if (INSIGHTS_ARTICLES.length > 0) return INSIGHTS_ARTICLES;
  if (import.meta.env.DEV) return SAMPLE_INSIGHTS_ARTICLES;
  return [];
}

const byNewest = (a: InsightsArticle, b: InsightsArticle) =>
  Date.parse(b.publishedAt) - Date.parse(a.publishedAt);

export function allArticles(): InsightsArticle[] {
  return source()
    .filter((a) => a.status === "published")
    .slice()
    .sort(byNewest);
}

export function hasContent(): boolean {
  return allArticles().length > 0;
}

export function getArticle(slug: string): InsightsArticle | undefined {
  return allArticles().find((a) => a.slug === slug);
}

export function toSummary(a: InsightsArticle): InsightsArticleSummary {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    dek: a.dek,
    category: a.category,
    tags: a.tags,
    heroImage: a.heroImage,
    author: a.author,
    readingMinutes: a.readingMinutes,
    publishedAt: a.publishedAt,
    featured: a.featured,
    trending: a.trending,
    breaking: a.breaking,
    trendingRank: a.trendingRank,
    viewCount: a.viewCount,
    entities: a.entities,
  };
}

export function getFeatured(): InsightsArticle | undefined {
  const all = allArticles();
  return all.find((a) => a.featured) ?? all[0];
}

export function getTrending(limit = 5): InsightsArticleSummary[] {
  const all = allArticles();
  const flagged = all.filter((a) => a.trending);
  const pool = flagged.length ? flagged : all;
  return pool
    .slice()
    .sort((a, b) => {
      const ra = a.trendingRank ?? Number.MAX_SAFE_INTEGER;
      const rb = b.trendingRank ?? Number.MAX_SAFE_INTEGER;
      if (ra !== rb) return ra - rb;
      return (b.viewCount ?? 0) - (a.viewCount ?? 0) || byNewest(a, b);
    })
    .slice(0, limit)
    .map(toSummary);
}

export function getMostRead(limit = 5): InsightsArticleSummary[] {
  return allArticles()
    .slice()
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0) || byNewest(a, b))
    .slice(0, limit)
    .map(toSummary);
}

export function getLatest(
  limit = 9,
  exclude: string[] = [],
): InsightsArticleSummary[] {
  const skip = new Set(exclude);
  return allArticles()
    .filter((a) => !skip.has(a.slug))
    .slice(0, limit)
    .map(toSummary);
}

export function byCategory(
  categorySlug: string,
  limit?: number,
): InsightsArticleSummary[] {
  const list = allArticles()
    .filter((a) => a.category === categorySlug)
    .map(toSummary);
  return limit ? list.slice(0, limit) : list;
}

export function byTag(tagSlug: string, limit?: number): InsightsArticleSummary[] {
  const list = allArticles()
    .filter((a) => a.tags.some((t) => t.slug === tagSlug))
    .map(toSummary);
  return limit ? list.slice(0, limit) : list;
}

export interface CategoryWithCount extends InsightsCategory {
  count: number;
}

export function categoriesWithCounts(): CategoryWithCount[] {
  const counts = new Map<string, number>();
  for (const a of allArticles()) {
    counts.set(a.category, (counts.get(a.category) ?? 0) + 1);
  }
  return INSIGHTS_CATEGORIES.map((c) => ({ ...c, count: counts.get(c.slug) ?? 0 }));
}

export function nonEmptyCategories(): CategoryWithCount[] {
  return categoriesWithCounts().filter((c) => c.count > 0);
}

// --- search -----------------------------------------------------------

export interface SearchHit {
  article: InsightsArticleSummary;
  score: number;
}

export function searchArticles(query: string, limit = 30): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const terms = q.split(/\s+/).filter(Boolean);

  const scored: SearchHit[] = [];
  for (const a of allArticles()) {
    const title = a.title.toLowerCase();
    const dek = a.dek.toLowerCase();
    const tagText = a.tags.map((t) => t.name.toLowerCase()).join(" ");
    const catText = a.category.replace(/-/g, " ");
    const body = a.body.toLowerCase();

    let score = 0;
    for (const term of terms) {
      if (title.includes(term)) score += 10;
      if (title.startsWith(term)) score += 4;
      if (dek.includes(term)) score += 5;
      if (tagText.includes(term)) score += 6;
      if (catText.includes(term)) score += 4;
      if (body.includes(term)) score += 1;
    }
    // phrase bonus
    if (terms.length > 1 && (title.includes(q) || dek.includes(q))) score += 8;
    if (score > 0) scored.push({ article: toSummary(a), score });
  }

  return scored
    .sort(
      (x, y) =>
        y.score - x.score ||
        Date.parse(y.article.publishedAt) - Date.parse(x.article.publishedAt),
    )
    .slice(0, limit);
}

// --- related ---------------------------------------------------------

export function relatedArticles(
  article: InsightsArticle,
  limit = 4,
): InsightsArticleSummary[] {
  const now = Date.now();
  const tagSet = new Set(article.tags.map((t) => t.slug));
  const entSet = new Set((article.entities ?? []).map((e) => e.toLowerCase()));

  const scored = allArticles()
    .filter((a) => a.slug !== article.slug)
    .map((a) => {
      let score = 0;
      if (a.category === article.category) score += 5;
      score += a.tags.filter((t) => tagSet.has(t.slug)).length * 3;
      score += (a.entities ?? []).filter((e) => entSet.has(e.toLowerCase())).length * 4;
      const ageDays = (now - Date.parse(a.publishedAt)) / 86_400_000;
      score += Math.max(0, 3 - ageDays / 14); // recency nudge, ~6 weeks
      return { a, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score || byNewest(x.a, y.a));

  const picks = scored.slice(0, limit).map((x) => toSummary(x.a));
  if (picks.length < Math.min(3, allArticles().length - 1)) {
    // top up with latest so the section never looks broken
    for (const a of allArticles()) {
      if (picks.length >= limit) break;
      if (a.slug === article.slug || picks.some((p) => p.slug === a.slug)) continue;
      picks.push(toSummary(a));
    }
  }
  return picks;
}

// --- formatting -----------------------------------------------------

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelative(iso: string, now = Date.now()): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const diff = now - t;
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export function categoryName(slug: string): string {
  return (
    INSIGHTS_CATEGORIES.find((c) => c.slug === slug)?.name ??
    slug.replace(/-/g, " ")
  );
}
