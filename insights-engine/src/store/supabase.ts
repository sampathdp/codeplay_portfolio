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

  // --- autopilot: auto-queue generation for the daily picks -----------------

  /** Cluster rows for the given keys — id, workflow status, article link. */
  async getClustersByKey(
    keys: string[],
  ): Promise<{ key: string; id: string; status: string; articleId: string | null }[]> {
    if (keys.length === 0) return [];
    const { data, error } = await this.sb
      .from("insights_topic_clusters")
      .select("cluster_key,id,status,article_id")
      .in("cluster_key", keys);
    if (error) throw new Error(`getClustersByKey: ${error.message}`);
    return (data ?? []).map((r) => {
      const row = r as {
        cluster_key: string;
        id: string;
        status: string;
        article_id: string | null;
      };
      return { key: row.cluster_key, id: row.id, status: row.status, articleId: row.article_id };
    });
  }

  /** Cluster ids among `clusterIds` that already hold a non-terminal
   *  `full_article` generation job (queued / running / succeeded). */
  async getClusterIdsWithLiveJob(clusterIds: string[]): Promise<Set<string>> {
    if (clusterIds.length === 0) return new Set();
    const { data, error } = await this.sb
      .from("insights_content_generation_jobs")
      .select("cluster_id")
      .eq("kind", "full_article")
      .in("cluster_id", clusterIds)
      .in("status", ["queued", "running", "succeeded"]);
    if (error) throw new Error(`getClusterIdsWithLiveJob: ${error.message}`);
    return new Set(
      (data ?? [])
        .map((r) => (r as { cluster_id: string | null }).cluster_id)
        .filter((v): v is string => Boolean(v)),
    );
  }

  /** How many `full_article` jobs (queued / running / succeeded) were
   *  created since `sinceIso` — the day's generation load so far. */
  async countFullArticleJobsSince(sinceIso: string): Promise<number> {
    const { count, error } = await this.sb
      .from("insights_content_generation_jobs")
      .select("id", { count: "exact", head: true })
      .eq("kind", "full_article")
      .in("status", ["queued", "running", "succeeded"])
      .gte("created_at", sinceIso);
    if (error) throw new Error(`countFullArticleJobsSince: ${error.message}`);
    return count ?? 0;
  }

  /** Queue one auto `full_article` job and mark the cluster `selected`. */
  async queueAutoGeneration(clusterId: string, reason: string): Promise<void> {
    const job = await this.sb.from("insights_content_generation_jobs").insert({
      cluster_id: clusterId,
      kind: "full_article",
      status: "queued",
      step: "research_bundle",
      params: { auto: true, reason },
    });
    if (job.error) throw new Error(`queueAutoGeneration insert: ${job.error.message}`);

    const upd = await this.sb
      .from("insights_topic_clusters")
      .update({ status: "selected", selection_reason: reason })
      .eq("id", clusterId);
    if (upd.error) throw new Error(`queueAutoGeneration select: ${upd.error.message}`);
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
    const failures: string[] = [];

    for (const cluster of clusters) {
     try {
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

      // De-duplicate by `url` within the cluster: Postgres rejects an
      // `ON CONFLICT DO UPDATE` that would touch the same conflict target
      // (url) twice in one statement ("cannot affect row a second time").
      const seenUrls = new Set<string>();
      const rows = cluster.items
        .filter((it) => {
          if (!it.url || seenUrls.has(it.url)) return false;
          seenUrls.add(it.url);
          return true;
        })
        .map((it) => ({
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
     } catch (err) {
       // One bad cluster must not sink the whole run.
       failures.push(
         `${cluster.key}: ${err instanceof Error ? err.message : String(err)}`,
       );
     }
    }

    if (failures.length && clustersUpserted === 0) {
      throw new Error(`all cluster upserts failed: ${failures.join(" | ")}`);
    }
    if (failures.length) {
      console.error(
        `upsertClusters: ${failures.length} cluster(s) skipped — ${failures.join(" | ")}`,
      );
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
