/**
 * Service-role persistence for the discovery engine.
 *
 * Runs only server-side (GitHub Actions cron / a future Edge Function).
 * `SUPABASE_SERVICE_ROLE_KEY` never reaches the browser — the client
 * bundle uses the anon key exclusively.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { IngestionRunResult, ScoredCluster } from "../types";
import type { PersistResult, Store } from "./types";

export function createServiceClient(env: Record<string, string | undefined>): SupabaseClient {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SupabaseStore needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export class SupabaseStore implements Store {
  constructor(private readonly sb: SupabaseClient) {}

  static fromEnv(env: Record<string, string | undefined>): SupabaseStore {
    return new SupabaseStore(createServiceClient(env));
  }

  async getSettings(): Promise<Record<string, unknown>> {
    const { data, error } = await this.sb.from("insights_settings").select("key,value");
    if (error) throw new Error(`getSettings: ${error.message}`);
    const out: Record<string, unknown> = {};
    for (const row of data ?? []) out[(row as { key: string }).key] = (row as { value: unknown }).value;
    return out;
  }

  async getRecentlyUsedClusterKeys(sinceHours: number): Promise<Set<string>> {
    const since = new Date(Date.now() - sinceHours * 3_600_000).toISOString();
    const { data, error } = await this.sb
      .from("insights_topic_clusters")
      .select("cluster_key,status,updated_at")
      .in("status", ["selected", "converted", "rejected", "ignored"])
      .gte("updated_at", since);
    if (error) throw new Error(`getRecentlyUsedClusterKeys: ${error.message}`);
    return new Set((data ?? []).map((r) => (r as { cluster_key: string }).cluster_key));
  }

  async getForcedClusterKeys(): Promise<Set<string>> {
    const { data, error } = await this.sb
      .from("insights_topic_clusters")
      .select("cluster_key")
      .eq("research_forced", true);
    if (error) throw new Error(`getForcedClusterKeys: ${error.message}`);
    return new Set((data ?? []).map((r) => (r as { cluster_key: string }).cluster_key));
  }

  async saveIngestionRun(
    run: IngestionRunResult & { startedAt: string; finishedAt: string },
  ): Promise<void> {
    const { error } = await this.sb.from("insights_ingestion_runs").insert({
      adapter: run.adapter,
      source_slug: run.sourceSlug,
      status: run.status === "skipped" ? "skipped" : run.status,
      items_found: run.itemsFound,
      error: run.error ?? null,
      started_at: run.startedAt,
      finished_at: run.finishedAt,
      duration_ms: run.durationMs,
    });
    if (error) throw new Error(`saveIngestionRun: ${error.message}`);
  }

  async upsertClusters(clusters: ScoredCluster[]): Promise<PersistResult> {
    let clustersUpserted = 0;
    let candidatesUpserted = 0;

    for (const cluster of clusters) {
      const scoreCols = {
        title: cluster.title,
        normalized_title: cluster.normalizedTitle,
        summary: cluster.summary,
        primary_theme: cluster.primaryTheme,
        themes: cluster.themes,
        category: cluster.categorySlug,
        freshness_score: round(cluster.scores.freshness),
        engagement_score: round(cluster.scores.engagement),
        authority_score: round(cluster.scores.sourceAuthority),
        cross_source_score: round(cluster.scores.crossSourceCoverage),
        relevance_score: round(cluster.scores.codeplayRelevance),
        community_score: round(cluster.scores.communityMomentum),
        novelty_score: round(cluster.scores.novelty),
        viral_score: round(cluster.viralScore),
        source_count: cluster.sourceCount,
        breaking: cluster.breaking,
        fact_confidence: cluster.factConfidence,
        entities: cluster.entities,
        keywords: cluster.keywords,
        earliest_published_at: cluster.earliestPublishedAt,
        last_seen_at: cluster.lastSeenAt,
      };

      const existing = await this.sb
        .from("insights_topic_clusters")
        .select("id")
        .eq("cluster_key", cluster.key)
        .maybeSingle();
      if (existing.error) throw new Error(`cluster lookup: ${existing.error.message}`);

      let clusterId: string;
      if (existing.data) {
        clusterId = (existing.data as { id: string }).id;
        const upd = await this.sb
          .from("insights_topic_clusters")
          .update(scoreCols) // deliberately does NOT touch admin-set `status`
          .eq("id", clusterId);
        if (upd.error) throw new Error(`cluster update: ${upd.error.message}`);
      } else {
        const ins = await this.sb
          .from("insights_topic_clusters")
          .insert({ cluster_key: cluster.key, status: "discovered", ...scoreCols })
          .select("id")
          .single();
        if (ins.error) throw new Error(`cluster insert: ${ins.error.message}`);
        clusterId = (ins.data as { id: string }).id;
      }
      clustersUpserted++;

      const rows = cluster.items.map((it) => ({
        cluster_id: clusterId,
        external_id: it.externalId,
        title: it.title,
        url: it.url,
        source: it.source,
        source_type: adapterToSourceKind(it.adapter),
        adapter: it.adapter,
        summary: (it.summary ?? "").slice(0, 800),
        published_at: it.publishedAt ?? null,
        normalized_title: it.normalizedTitle,
        normalized_url: it.normalizedUrl,
        dedupe_hash: it.dedupeHash,
        themes: it.themes,
        entities: it.entities,
        keywords: it.keywords,
        fact_confidence: it.factConfidence,
        relevance_score: round(it.relevanceScore),
        engagement_score: round(engagementProxy(it)),
        community_score: round(it.signals?.redditScore ? 60 : 0),
        viral_score: round(cluster.viralScore),
        raw: it.raw ?? {},
      }));

      if (rows.length) {
        const up = await this.sb
          .from("insights_news_candidates")
          .upsert(rows, { onConflict: "url" });
        if (up.error) throw new Error(`candidate upsert: ${up.error.message}`);
        candidatesUpserted += rows.length;
      }
    }

    return { clustersUpserted, candidatesUpserted };
  }
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function engagementProxy(it: ScoredCluster["items"][number]): number {
  const s = it.signals ?? {};
  return Math.min(100, Math.log1p((s.points ?? 0) + (s.redditScore ?? 0)) * 12);
}

function adapterToSourceKind(adapter: string): string {
  switch (adapter) {
    case "hackernews":
      return "api";
    case "github_releases":
      return "release_feed";
    case "reddit":
      return "community";
    case "rss":
      return "rss";
    default:
      return "rss";
  }
}
