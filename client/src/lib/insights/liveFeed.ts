/**
 * Live hydration for the public CodePlay Insights pages.
 *
 * The site ships a build-time snapshot (`insights.generated.ts`) that only
 * refreshes on deploy. When Supabase is configured this module fetches the
 * currently-published articles straight from the database (anon key, RLS
 * only exposes `status = 'published'` rows) and pushes them into the feed
 * store so a freshly-published article appears without a redeploy.
 *
 * Read-only, best-effort: any failure leaves the snapshot in place.
 * Mirrors `insights-engine/src/publish/snapshot.ts` field-for-field.
 */

import type { InsightsArticle } from "./types";
import { isInsightsConfigured, getInsightsSupabase } from "./supabase";
import { setLiveArticles, setFeedLoading, setFeedError } from "./feed";

const EDITORIAL_AUTHOR = "CodePlay Studios Editorial Team";
const ARTICLE_COLUMNS = `
  id, slug, title, subtitle, excerpt, content, article_type, status,
  featured, trending, breaking, reading_time, view_count,
  published_at, updated_at, seo_title, seo_description, canonical_url,
  developer_take, business_impact, developer_impact, risks_limitations,
  why_it_matters, recommendations, sections,
  featured_image_url, featured_image_alt, featured_image_width,
  featured_image_height, featured_image_status, image_is_ai_generated,
  insights_categories:category_id ( slug, name ),
  insights_authors:author_id ( name )
`;

let started = false;

/** Fetch published articles once per page load and populate the feed
 * store. Safe to call from every Insights page — subsequent calls are
 * no-ops. */
export async function hydrateInsightsFeed(): Promise<void> {
  if (started) return;
  started = true;

  if (!isInsightsConfigured()) return;

  setFeedLoading();
  try {
    setLiveArticles(await loadPublishedArticles());
  } catch (err) {
    // Keep the static snapshot; just log for diagnostics.
    console.error("[insights] live feed hydration failed:", err);
    setFeedError();
  }
}

/** Test/HMR helper — lets a fresh hydration run again. */
export function __resetInsightsFeedHydration(): void {
  started = false;
}

function sectionText(sections: unknown, key: string): string {
  if (!Array.isArray(sections)) return "";
  const hit = sections.find(
    (s) => s && typeof s === "object" && (s as { key?: string }).key === key,
  ) as { content?: string } | undefined;
  return hit?.content ?? "";
}

interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  content: string | null;
  article_type: string | null;
  status: string;
  featured: boolean;
  trending: boolean;
  breaking: boolean;
  reading_time: number | null;
  view_count: number | null;
  published_at: string | null;
  updated_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  developer_take: string | null;
  business_impact: string | null;
  developer_impact: string | null;
  risks_limitations: string | null;
  why_it_matters: string | null;
  recommendations: string | null;
  sections: unknown;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  featured_image_width: number | null;
  featured_image_height: number | null;
  featured_image_status: string | null;
  image_is_ai_generated: boolean | null;
  insights_categories: { slug: string; name: string } | null;
  insights_authors: { name: string } | null;
}

async function loadPublishedArticles(): Promise<InsightsArticle[]> {
  const sb = getInsightsSupabase();

  const { data, error } = await sb
    .from("insights_articles")
    .select(ARTICLE_COLUMNS)
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as ArticleRow[];
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);

  // tags
  const tagsByArticle = new Map<string, { slug: string; name: string }[]>();
  const tagLinks = await sb
    .from("insights_article_tags")
    .select("article_id, insights_tags:tag_id ( slug, name )")
    .in("article_id", ids);
  for (const link of (tagLinks.data ?? []) as unknown as Array<{
    article_id: string;
    insights_tags: { slug: string; name: string } | null;
  }>) {
    if (!link.insights_tags) continue;
    const list = tagsByArticle.get(link.article_id) ?? [];
    list.push(link.insights_tags);
    tagsByArticle.set(link.article_id, list);
  }

  // sources
  const sourcesByArticle = new Map<string, InsightsArticle["sources"]>();
  const srcRows = await sb
    .from("insights_article_sources")
    .select("article_id, source_name, source_url, primary_source, notes")
    .in("article_id", ids);
  for (const s of (srcRows.data ?? []) as unknown as Array<{
    article_id: string;
    source_name: string;
    source_url: string;
    primary_source: boolean;
    notes: string | null;
  }>) {
    const list = sourcesByArticle.get(s.article_id) ?? [];
    list.push({
      url: s.source_url,
      title: s.notes || s.source_name,
      publisher: s.source_name,
      role: s.primary_source ? "primary" : "supporting",
    });
    sourcesByArticle.set(s.article_id, list);
  }

  return rows.map((r): InsightsArticle => {
    const category = r.insights_categories?.slug ?? "emerging-technology";
    const canonical =
      r.canonical_url || `https://codeplaystudios.com/insights/${r.slug}`;
    const hasImage =
      Boolean(r.featured_image_url) && r.featured_image_status !== "failed";

    return {
      id: r.id,
      slug: r.slug,
      status: "published",
      title: r.title,
      dek: r.subtitle || r.excerpt || "",
      category,
      tags: tagsByArticle.get(r.id) ?? [],
      body: r.content ?? "",
      keyTakeaways: [],
      take: {
        developerTake: r.developer_take ?? "",
        businessImpact: r.business_impact ?? "",
        developerImpact: r.developer_impact ?? "",
        technicalExplanation: sectionText(r.sections, "technical_explanation"),
        risksAndLimitations: r.risks_limitations ?? "",
        whyItMatters: r.why_it_matters ?? "",
        actionableRecommendations: r.recommendations ?? "",
      },
      sources: sourcesByArticle.get(r.id) ?? [],
      heroImage: hasImage
        ? {
            src: r.featured_image_url!,
            alt: r.featured_image_alt ?? r.title,
            width: r.featured_image_width ?? undefined,
            height: r.featured_image_height ?? undefined,
            ogSrc: r.featured_image_url!,
            aiGenerated: r.image_is_ai_generated ?? true,
            kind:
              r.featured_image_status === "manual"
                ? "manual"
                : r.featured_image_status === "fallback"
                  ? "fallback"
                  : "generated",
          }
        : undefined,
      author: r.insights_authors?.name ?? EDITORIAL_AUTHOR,
      authorRole: "CodePlay Insights Editorial Team",
      readingMinutes: r.reading_time || 5,
      publishedAt: r.published_at ?? new Date().toISOString(),
      updatedAt: r.updated_at ?? undefined,
      seo: {
        title: r.seo_title || r.title,
        description: r.seo_description || r.subtitle || r.excerpt || "",
        canonicalUrl: canonical,
      },
      articleType: (r.article_type ?? undefined) as InsightsArticle["articleType"],
      featured: r.featured,
      trending: r.trending,
      breaking: r.breaking,
      viewCount: r.view_count ?? 0,
    };
  });
}
