/**
 * Persist a generated article to Supabase (service role). Always lands as
 * status `review` (or `draft` when a hard gate failed) — never published,
 * never auto-scheduled. Writes the quality row, sources, tags, links the
 * cluster, closes the job, and records AI usage.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { GeneratedArticle } from "./schema";
import type { UsageRecord } from "../gemini/budget";
import { ensureUniqueSlug } from "../slug";
import type { GenerationStatus } from "./pipeline";

const EDITORIAL_SLUG = "codeplay-studios-editorial-team";

export interface PersistInput {
  article: GeneratedArticle;
  status: GenerationStatus;
  reasons: string[];
  clusterId: string | null;
  clusterViralScore: number | null;
  jobId: string | null;
  usageRecords: UsageRecord[];
}

export interface PersistResult {
  articleId: string;
  slug: string;
}

async function need<T = Record<string, unknown>>(
  p: PromiseLike<{ data: unknown; error: { message: string } | null }>,
  ctx: string,
): Promise<T> {
  const { data, error } = await p;
  if (error) throw new Error(`${ctx}: ${error.message}`);
  if (data == null) throw new Error(`${ctx}: no data`);
  return data as T;
}

export async function persistGeneratedArticle(
  sb: SupabaseClient,
  input: PersistInput,
): Promise<PersistResult> {
  const a = input.article;

  const category = await need<{ id: string }>(
    sb.from("insights_categories").select("id").eq("slug", a.category).single(),
    "category lookup",
  );
  const author = await need<{ id: string }>(
    sb.from("insights_authors").select("id").eq("slug", EDITORIAL_SLUG).single(),
    "author lookup",
  );

  // Unique slug against existing rows sharing the base.
  const base = a.slug.replace(/-\d+$/, "");
  const existing = await sb
    .from("insights_articles")
    .select("slug")
    .like("slug", `${base}%`);
  const slug = ensureUniqueSlug(
    a.slug,
    (existing.data ?? []).map((r) => (r as { slug: string }).slug),
    a.title,
  );

  const articleStatus = input.status === "rejected" ? "draft" : "review";

  const inserted = await need<{ id: string; slug: string }>(
    sb
      .from("insights_articles")
      .insert({
        title: a.title,
        slug,
        subtitle: a.subtitle,
        excerpt: a.excerpt,
        content: a.content,
        content_format: "markdown",
        category_id: category.id,
        author_id: author.id,
        status: articleStatus,
        content_type: "news",
        article_type: a.articleType,
        headline_options: a.headlineOptions,
        sections: a.sections,
        fact_check: a.factCheck,
        needs_review: a.needsReview || input.status !== "review",
        review_reasons: input.reasons.slice(0, 20),
        quality_score: a.overallQuality,
        seo_score: a.quality.seoQuality,
        viral_score: clamp0100(input.clusterViralScore),
        reading_time: a.readingMinutes,
        seo_title: a.seo.title,
        seo_description: a.seo.description,
        developer_take: a.originalValue.developerTake,
        business_impact: a.originalValue.businessImpact,
        developer_impact: a.originalValue.developerImpact,
        risks_limitations: a.originalValue.risksAndLimitations,
        why_it_matters: a.originalValue.whyItMatters,
        recommendations: a.originalValue.actionableRecommendations,
        image_prompt: a.imageConcept.prompt,
        image_is_ai_generated: false,
        cluster_id: input.clusterId,
        generation_job_id: input.jobId,
      })
      .select("id,slug")
      .single(),
    "article insert",
  );
  const articleId = inserted.id;
  const finalSlug = inserted.slug;

  // Quality row
  const qErr = await sb.from("insights_article_quality").upsert({
    article_id: articleId,
    fact_check_score: a.factCheck.factualConfidence,
    source_quality_score: a.quality.sourceQuality,
    originality_score: a.quality.originalValue,
    readability_score: a.quality.readability,
    seo_score: a.quality.seoQuality,
    overall_quality_score: a.overallQuality,
    duplication_risk_score: a.quality.duplicationRisk,
    sensationalism_score: a.quality.sensationalism,
    hallucination_risk_score: a.quality.hallucinationRisk,
    gate_passed: input.status === "review",
    gate_reasons: input.reasons.slice(0, 20),
    checks: { style: "deterministic", factCheckVerdict: a.factCheck.verdict },
    checked_at: new Date().toISOString(),
  });
  if (qErr.error) throw new Error(`quality upsert: ${qErr.error.message}`);

  // Sources
  if (a.sources.length) {
    const srcErr = await sb.from("insights_article_sources").insert(
      a.sources.map((s) => ({
        article_id: articleId,
        source_name: s.publisher || "source",
        source_url: s.url,
        source_type: s.primary ? "official_blog" : "article",
        primary_source: s.primary,
        verified: s.primary,
        notes: s.title.slice(0, 300),
      })),
    );
    if (srcErr.error) throw new Error(`sources insert: ${srcErr.error.message}`);
  }

  // Tags
  const tagSlugs = a.tags.map((t) => ({ name: t, slug: slugishTag(t) })).filter((t) => t.slug);
  if (tagSlugs.length) {
    const up = await sb
      .from("insights_tags")
      .upsert(tagSlugs, { onConflict: "slug", ignoreDuplicates: true })
      .select("id,slug");
    if (up.error) throw new Error(`tags upsert: ${up.error.message}`);
    const rows = await sb
      .from("insights_tags")
      .select("id,slug")
      .in("slug", tagSlugs.map((t) => t.slug));
    if (rows.error) throw new Error(`tags read: ${rows.error.message}`);
    const links = ((rows.data as { id: string }[]) ?? []).map((r) => ({
      article_id: articleId,
      tag_id: r.id,
    }));
    if (links.length) {
      const lErr = await sb.from("insights_article_tags").insert(links);
      if (lErr.error && !/duplicate key/i.test(lErr.error.message)) {
        throw new Error(`tag links: ${lErr.error.message}`);
      }
    }
  }

  // AI usage ledger
  if (input.usageRecords.length) {
    const uErr = await sb.from("insights_ai_usage").insert(
      input.usageRecords.map((r) => ({
        job_id: input.jobId,
        cluster_id: input.clusterId,
        step: r.purpose,
        model: r.model,
        request_count: 1,
        prompt_tokens: r.usage.promptTokens,
        completion_tokens: r.usage.completionTokens,
        total_tokens: r.usage.totalTokens,
        estimated_cost_usd: r.costUsd,
        status: r.status,
        error: r.error ?? null,
      })),
    );
    if (uErr.error) throw new Error(`ai_usage insert: ${uErr.error.message}`);
  }

  // Link the cluster
  if (input.clusterId) {
    await sb
      .from("insights_topic_clusters")
      .update({ status: "converted", article_id: articleId })
      .eq("id", input.clusterId);
  }

  return { articleId, slug: finalSlug };
}

function clamp0100(n: number | null): number {
  if (n == null || Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function slugishTag(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}
