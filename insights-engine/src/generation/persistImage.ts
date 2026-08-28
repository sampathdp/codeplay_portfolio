/**
 * Write an `ImageOutcome` to the database: article image columns,
 * `insights_image_assets` rows, and `insights_ai_usage`. Service role.
 * A manual image is never overwritten here (the pipeline returns
 * `skipped_manual`; callers must not call this in that case).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ImageOutcome } from "./imagePipeline";
import type { UsageRecord } from "../gemini/budget";

export async function persistImageOutcome(
  sb: SupabaseClient,
  args: {
    articleId: string;
    jobId: string | null;
    outcome: ImageOutcome;
    usageRecords?: UsageRecord[];
  },
): Promise<void> {
  const { articleId, jobId, outcome } = args;

  if (outcome.status === "skipped_manual" || outcome.status === "failed") {
    if (outcome.status === "failed") {
      await sb
        .from("insights_articles")
        .update({ featured_image_status: "failed" })
        .eq("id", articleId)
        .eq("featured_image_is_manual", false);
    }
    await recordUsage(sb, articleId, jobId, args.usageRecords);
    return;
  }

  const source = outcome.status === "fallback" ? "fallback" : "generated";

  await sb
    .from("insights_articles")
    .update({
      featured_image_url: outcome.primary?.url ?? null,
      featured_image_alt: outcome.altText,
      featured_image_status: outcome.status, // 'generated' | 'fallback'
      featured_image_is_manual: false,
      image_is_ai_generated: outcome.aiGenerated,
      image_prompt: outcome.prompt,
      featured_image_model: outcome.model,
      featured_image_generated_at: outcome.generatedAt,
      featured_image_width: outcome.width,
      featured_image_height: outcome.height,
      featured_image_bytes: outcome.bytes,
      featured_image_storage_path: outcome.primary?.storagePath ?? null,
      featured_image_variants: outcome.variants.map((v) => ({
        label: v.label,
        url: v.url,
        width: v.width,
        height: v.height,
        bytes: v.bytes,
      })),
    })
    .eq("id", articleId)
    .eq("featured_image_is_manual", false);

  // Replace non-manual asset rows for this article.
  await sb
    .from("insights_image_assets")
    .delete()
    .eq("article_id", articleId)
    .neq("source", "manual");

  if (outcome.variants.length) {
    const { error } = await sb.from("insights_image_assets").insert(
      outcome.variants.map((v) => ({
        article_id: articleId,
        job_id: jobId,
        label: v.label,
        url: v.url,
        storage_path: v.storagePath,
        content_type: v.contentType,
        width: v.width,
        height: v.height,
        bytes: v.bytes,
        is_primary: v.isPrimary,
        source,
        model: outcome.model,
        prompt: outcome.prompt,
        alt_text: outcome.altText,
      })),
    );
    if (error) throw new Error(`image_assets insert: ${error.message}`);
  }

  await recordUsage(sb, articleId, jobId, args.usageRecords);
}

async function recordUsage(
  sb: SupabaseClient,
  articleId: string,
  jobId: string | null,
  records: UsageRecord[] | undefined,
): Promise<void> {
  if (!records?.length) return;
  const { error } = await sb.from("insights_ai_usage").insert(
    records.map((r) => ({
      job_id: jobId,
      step: r.purpose,
      model: r.model,
      prompt_tokens: r.usage.promptTokens,
      completion_tokens: r.usage.completionTokens,
      total_tokens: r.usage.totalTokens,
      estimated_cost_usd: r.costUsd,
      status: r.status,
      error: r.error ?? null,
    })),
  );
  if (error) throw new Error(`ai_usage insert: ${error.message}`);
}
