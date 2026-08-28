/**
 * Dashboard KPIs. Small dataset (2–3 articles/day) → a handful of
 * filtered `count`/`select` queries with client-side aggregation.
 */

import { getInsightsSupabase } from "../supabase";
import { T } from "./tables";
import { categoryName } from "../feed";

/** Start of "today" in the given IANA timezone, as an ISO string. */
export function startOfDay(tz = "Asia/Colombo", now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const g = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  // ms since local midnight
  const sinceMidnight =
    ((g("hour") % 24) * 3600 + g("minute") * 60 + g("second")) * 1000;
  return new Date(now.getTime() - sinceMidnight).toISOString();
}

export function startOfWeek(tz = "Asia/Colombo", now = new Date()): string {
  return new Date(Date.parse(startOfDay(tz, now)) - 6 * 86_400_000).toISOString();
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function count(
  table: string,
  build: (q: any) => any,
): Promise<number> {
  const q = getInsightsSupabase().from(table).select("id", {
    count: "exact",
    head: true,
  });
  const { count: c, error } = await build(q);
  if (error) throw new Error(`${table}: ${error.message}`);
  return (c as number | null) ?? 0;
}

export interface TodayKpis {
  storiesDiscovered: number;
  trendingCandidates: number;
  draftsGenerated: number;
  awaitingReview: number;
  published: number;
  geminiRequests: number;
  imageRequests: number;
}

export interface WeekKpis {
  published: number;
  views: number;
  topArticle: { title: string; slug: string; views: number } | null;
  topCategory: { slug: string; name: string; count: number } | null;
  avgQualityScore: number | null;
}

export async function getTodayKpis(tz = "Asia/Colombo"): Promise<TodayKpis> {
  const since = startOfDay(tz);
  const sb = getInsightsSupabase();

  const [
    ingestion,
    trendingCandidates,
    draftsGenerated,
    awaitingReview,
    published,
    aiUsage,
  ] = await Promise.all([
    sb.from(T.ingestionRuns).select("items_found").gte("started_at", since),
    count(T.topicClusters, (q) => q.gte("last_seen_at", since)),
    count(T.articles, (q) =>
      q.not("generation_job_id", "is", null).gte("created_at", since),
    ),
    count(T.articles, (q) => q.eq("status", "review")),
    count(T.articles, (q) => q.eq("status", "published").gte("published_at", since)),
    sb.from(T.aiUsage).select("step").gte("created_at", since),
  ]);

  if (ingestion.error) throw new Error(ingestion.error.message);
  if (aiUsage.error) throw new Error(aiUsage.error.message);

  const storiesDiscovered = (ingestion.data ?? []).reduce(
    (n, r) => n + Number((r as { items_found: number }).items_found || 0),
    0,
  );
  const steps = (aiUsage.data ?? []).map((r) => (r as { step: string }).step);

  return {
    storiesDiscovered,
    trendingCandidates,
    draftsGenerated,
    awaitingReview,
    published,
    geminiRequests: steps.filter((s) => s !== "image").length,
    imageRequests: steps.filter((s) => s === "image").length,
  };
}

export async function getWeekKpis(tz = "Asia/Colombo"): Promise<WeekKpis> {
  const since = startOfWeek(tz);
  const sb = getInsightsSupabase();

  const { data, error } = await sb
    .from(T.articles)
    .select("title,slug,category_id,view_count,quality_score")
    .eq("status", "published")
    .gte("published_at", since);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as {
    title: string;
    slug: string;
    category_id: string;
    view_count: number;
    quality_score: number | null;
  }[];

  const views = rows.reduce((n, r) => n + Number(r.view_count || 0), 0);
  const top = [...rows].sort((a, b) => (b.view_count || 0) - (a.view_count || 0))[0];

  // resolve category names
  const catIds = Array.from(new Set(rows.map((r) => r.category_id)));
  let catCounts: { slug: string; name: string; count: number }[] = [];
  if (catIds.length) {
    const cats = await sb
      .from(T.categories)
      .select("id,slug,name")
      .in("id", catIds);
    const bySlug = new Map<string, { slug: string; name: string; count: number }>();
    const idToCat = new Map(
      ((cats.data as { id: string; slug: string; name: string }[]) ?? []).map((c) => [
        c.id,
        c,
      ] as const),
    );
    for (const r of rows) {
      const c = idToCat.get(r.category_id);
      if (!c) continue;
      const e = bySlug.get(c.slug) ?? { slug: c.slug, name: c.name, count: 0 };
      e.count += 1;
      bySlug.set(c.slug, e);
    }
    catCounts = Array.from(bySlug.values()).sort((a, b) => b.count - a.count);
  }

  const scored = rows.map((r) => r.quality_score).filter((s): s is number => s != null);
  const avgQualityScore = scored.length
    ? Math.round((scored.reduce((a, b) => a + b, 0) / scored.length) * 10) / 10
    : null;

  return {
    published: rows.length,
    views,
    topArticle: top ? { title: top.title, slug: top.slug, views: top.view_count || 0 } : null,
    topCategory: catCounts[0]
      ? { slug: catCounts[0].slug, name: catCounts[0].name ?? categoryName(catCounts[0].slug), count: catCounts[0].count }
      : null,
    avgQualityScore,
  };
}

// --- daily diversity plan (from selection + publishing settings) --------

export interface DiversityStatus {
  slot: string;
  filled: boolean;
  article?: { title: string; slug: string };
}

export async function getTodayPublishPlan(
  tz = "Asia/Colombo",
): Promise<{ minPerDay: number; maxPerDay: number; publishedToday: number; slots: DiversityStatus[] }> {
  const since = startOfDay(tz);
  const sb = getInsightsSupabase();

  const [publishing, published] = await Promise.all([
    sb.from(T.settings).select("value").eq("key", "publishing").maybeSingle(),
    sb
      .from(T.articles)
      .select("title,slug,category_id")
      .eq("status", "published")
      .gte("published_at", since),
  ]);

  const cfg = (publishing.data as { value: Record<string, unknown> } | null)?.value ?? {};
  const diversity = (cfg.diversity as string[]) ?? [
    "technology/AI/developer story",
    "broader technology/business/security story",
    "gaming/game-development/community story",
  ];
  const rows = (published.data as { title: string; slug: string; category_id: string }[]) ?? [];

  const slots: DiversityStatus[] = diversity.map((label, i) => ({
    slot: label,
    filled: i < rows.length,
    article: rows[i] ? { title: rows[i].title, slug: rows[i].slug } : undefined,
  }));

  return {
    minPerDay: Number(cfg.minPerDay ?? 2),
    maxPerDay: Number(cfg.maxPerDay ?? 3),
    publishedToday: rows.length,
    slots,
  };
}
