/**
 * Generation worker. Processes queued `insights_content_generation_jobs`.
 * Invoked by GitHub Actions (`.github/workflows/insights-generate.yml`)
 * after discovery. Server-side only.
 *
 *   tsx insights-engine/src/generation/run.ts            # process queued jobs
 *   tsx insights-engine/src/generation/run.ts --cluster <id>   # queue+run one
 *   tsx insights-engine/src/generation/run.ts --dry-run  # requires GEMINI_API_KEY, no DB writes
 *
 * NO article is ever published. Everything lands as `review`.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { resolveGeminiModels } from "../config";
import type { ArticleType } from "./schema";
import { createGeminiClient } from "../gemini/client";
import {
  BudgetedGeminiClient,
  type BudgetState,
  type UsageRecord,
} from "../gemini/budget";
import { resolveAiBudget, resolveGenerationConfig } from "./config";
import { generateArticle } from "./pipeline";
import { persistGeneratedArticle } from "./persist";
import type { ClusterInput } from "./steps";
import { createGeminiImageClient } from "../gemini/image";
import { SharpImageProcessor, type VariantSpec } from "../storage/processor";
import { SupabaseImageStore } from "../storage/images";
import { generateFeaturedImage } from "./imagePipeline";
import { persistImageOutcome } from "./persistImage";

const env = process.env as Record<string, string | undefined>;

function startOfUtcDay(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

async function loadSettings(sb: SupabaseClient): Promise<Record<string, unknown>> {
  const { data, error } = await sb.from("insights_settings").select("key,value");
  if (error) throw new Error(`settings: ${error.message}`);
  const out: Record<string, unknown> = {};
  for (const r of data ?? []) out[(r as { key: string }).key] = (r as { value: unknown }).value;
  return out;
}

async function budgetState(sb: SupabaseClient): Promise<BudgetState> {
  const { data, error } = await sb
    .from("insights_ai_usage")
    .select("estimated_cost_usd")
    .gte("created_at", startOfUtcDay());
  if (error) throw new Error(`budget state: ${error.message}`);
  const rows = data ?? [];
  return {
    dailySpentUsd: rows.reduce((s, r) => s + Number((r as { estimated_cost_usd: number }).estimated_cost_usd || 0), 0),
    dailyCalls: rows.length,
  };
}

async function articlesGeneratedToday(sb: SupabaseClient): Promise<number> {
  const { count, error } = await sb
    .from("insights_articles")
    .select("id", { count: "exact", head: true })
    .not("generation_job_id", "is", null)
    .gte("created_at", startOfUtcDay());
  if (error) throw new Error(`quota check: ${error.message}`);
  return count ?? 0;
}

async function clusterInput(sb: SupabaseClient, clusterId: string): Promise<{
  input: ClusterInput;
  viralScore: number;
  breaking: boolean;
} | null> {
  const c = await sb.from("insights_topic_clusters").select("*").eq("id", clusterId).single();
  if (c.error || !c.data) return null;
  const cl = c.data as Record<string, unknown>;

  const items = await sb
    .from("insights_news_candidates")
    .select("title,url,source,published_at,adapter,summary,fact_confidence")
    .eq("cluster_id", clusterId);
  if (items.error) throw new Error(`cluster items: ${items.error.message}`);

  const sources = (items.data ?? []).map((r) => {
    const it = r as Record<string, unknown>;
    return {
      title: String(it.title ?? ""),
      url: String(it.url ?? ""),
      publisher: hostOf(String(it.url ?? "")),
      publishedAt: (it.published_at as string) ?? null,
      isOfficial: it.fact_confidence === "verified",
      adapter: String(it.adapter ?? "rss"),
      summary: String(it.summary ?? "").slice(0, 600),
    };
  });

  return {
    input: {
      title: String(cl.title ?? ""),
      primaryTheme: (cl.primary_theme as string) ?? null,
      category: (cl.category as string) ?? null,
      factConfidence: String(cl.fact_confidence ?? "unverified"),
      sources,
    },
    viralScore: Number(cl.viral_score ?? 0),
    breaking: Boolean(cl.breaking),
  };
}

function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

interface ImageSettings {
  enabled?: boolean;
  autoGenerateOnReview?: boolean;
  aspectRatio?: string;
  variants?: VariantSpec[];
  webpQuality?: number;
}

/** Generate + store ONE featured image for an article. Never throws. */
async function runImageForArticle(
  sb: SupabaseClient,
  ctx: {
    articleId: string;
    jobId: string | null;
    imageModel: string;
    imagePricing: Record<string, number>;
    imageSettings: ImageSettings;
    textClient?: import("../gemini/types").GeminiClient;
    promptOverride?: string | null;
    force?: boolean;
  },
): Promise<string> {
  const a = await sb
    .from("insights_articles")
    .select(
      "id,slug,title,excerpt,category_id,image_prompt,featured_image_is_manual",
    )
    .eq("id", ctx.articleId)
    .single();
  if (a.error || !a.data) return "article-not-found";
  const art = a.data as Record<string, unknown>;

  if (art.featured_image_is_manual && !ctx.force) return "skipped-manual";

  const cat = await sb
    .from("insights_categories")
    .select("slug")
    .eq("id", art.category_id as string)
    .maybeSingle();
  const categorySlug = (cat.data as { slug?: string } | null)?.slug ?? null;

  const entRes = await sb
    .from("insights_article_sources")
    .select("source_name")
    .eq("article_id", ctx.articleId)
    .limit(6);
  const entities = [
    ...new Set(((entRes.data as { source_name: string }[]) ?? []).map((r) => r.source_name)),
  ];

  const usage: UsageRecord[] = [];
  try {
    const outcome = await generateFeaturedImage(
      {
        imageClient: createGeminiImageClient(env, ctx.imageModel),
        processor: new SharpImageProcessor(),
        store: new SupabaseImageStore(sb, env.INSIGHTS_MEDIA_BUCKET || "insights-media"),
        textClient: ctx.textClient,
        onUsage: (r) => usage.push(r),
      },
      {
        slug: String(art.slug),
        title: String(art.title),
        category: categorySlug,
        summary: String(art.excerpt ?? ""),
        entities,
        visualConcept: (art.image_prompt as string) ?? undefined,
        promptOverride: ctx.promptOverride ?? null,
        aspectRatio: ctx.imageSettings.aspectRatio ?? "16:9",
        variants: ctx.imageSettings.variants,
        webpQuality: ctx.imageSettings.webpQuality,
        imageModel: ctx.imageModel,
        imagePricingUsd: ctx.imagePricing,
        isManual: Boolean(art.featured_image_is_manual),
        force: ctx.force,
      },
    );

    if (outcome.status !== "skipped_manual") {
      await persistImageOutcome(sb, {
        articleId: ctx.articleId,
        jobId: ctx.jobId,
        outcome,
        usageRecords: usage,
      });
    }
    console.log(JSON.stringify({ msg: "image.done", articleId: ctx.articleId, status: outcome.status, reason: outcome.reason }));
    return outcome.status;
  } catch (err) {
    console.error(
      JSON.stringify({ msg: "image.error", articleId: ctx.articleId, error: err instanceof Error ? err.message : String(err) }),
    );
    return "error";
  }
}

async function main() {
  const clusterArg = argValue("--cluster");
  const limit = Number(argValue("--limit") ?? "3");

  if (!env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is required.");
    process.exit(2);
  }
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
    process.exit(2);
  }

  const models = resolveGeminiModels(env);
  const sb: SupabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const settings = await loadSettings(sb);
  const genConfig = resolveGenerationConfig(settings);
  const budget = resolveAiBudget(settings);
  const scheduler = (settings.scheduler ?? {}) as { maxArticlesPerDay?: number };
  const maxPerDay = scheduler.maxArticlesPerDay ?? 3;

  const imageSettings: ImageSettings =
    ((settings.generation ?? {}) as { image?: ImageSettings }).image ?? {};
  const imagePricing = budget.imagePricingUsd ?? { default: 0.04 };
  const imageModel = models.imageModel;
  const imagesEnabled = imageSettings.enabled !== false;

  const state = await budgetState(sb);
  console.log(
    JSON.stringify({ msg: "budget", dailySpentUsd: state.dailySpentUsd, dailyCalls: state.dailyCalls, cap: budget.dailyUsdCap }),
  );

  if (clusterArg) {
    const { data: job } = await sb
      .from("insights_content_generation_jobs")
      .insert({ cluster_id: clusterArg, kind: "full_article", status: "queued", step: "research_bundle" })
      .select("*")
      .single();
    if (!job) throw new Error("could not queue job");
  }

  let generatedToday = await articlesGeneratedToday(sb);
  const { data: jobs, error } = await sb
    .from("insights_content_generation_jobs")
    .select("*")
    .eq("status", "queued")
    .eq("kind", "full_article")
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw new Error(`jobs: ${error.message}`);

  for (const jobRow of jobs ?? []) {
    const job = jobRow as Record<string, unknown>;
    const jobId = String(job.id);

    if (generatedToday >= maxPerDay) {
      console.log(JSON.stringify({ msg: "quota reached", generatedToday, maxPerDay }));
      break;
    }

    await sb.from("insights_content_generation_jobs").update({ status: "running", started_at: new Date().toISOString() }).eq("id", jobId);

    const usageRecords: UsageRecord[] = [];
    const budgeted = new BudgetedGeminiClient(
      createGeminiClient(env, models),
      { ...budget, perRunCallCap: Math.min(budget.perRunCallCap, budget.perArticleCallCap) },
      state,
      (r) => usageRecords.push(r),
    );

    try {
      const ci = await clusterInput(sb, String(job.cluster_id));
      if (!ci) throw new Error(`cluster ${job.cluster_id} not found`);

      const outcome = await generateArticle(budgeted, {
        cluster: { ...ci.input, viralScore: ci.viralScore, breaking: ci.breaking },
        config: genConfig,
        articleType: (job.article_type as ArticleType | null) ?? undefined,
      });

      // account for what we spent
      state.dailySpentUsd += budgeted.runSpentUsd;
      state.dailyCalls += budgeted.runCalls;

      if (!outcome.article) {
        await sb.from("insights_content_generation_jobs").update({
          status: outcome.status === "needs_review" ? "succeeded" : "failed",
          needs_review: outcome.status === "needs_review",
          review_reason: outcome.reasons.join(" | "),
          result: { status: outcome.status, reasons: outcome.reasons, stepsRun: outcome.stepsRun },
          completed_at: new Date().toISOString(),
        }).eq("id", jobId);
        if (job.cluster_id && outcome.status === "needs_review") {
          await sb.from("insights_topic_clusters").update({ status: "filtered", rejection_reason: "needs human review: " + outcome.reasons[0] }).eq("id", String(job.cluster_id));
        }
        // still record usage
        await recordUsage(sb, jobId, String(job.cluster_id ?? ""), usageRecords);
        console.log(JSON.stringify({ msg: "job.no_article", jobId, status: outcome.status, reasons: outcome.reasons }));
        continue;
      }

      const persisted = await persistGeneratedArticle(sb, {
        article: outcome.article,
        status: outcome.status,
        reasons: outcome.reasons,
        clusterId: (job.cluster_id as string) ?? null,
        clusterViralScore: ci.viralScore,
        jobId,
        usageRecords,
      });

      await sb.from("insights_content_generation_jobs").update({
        status: "succeeded",
        article_id: persisted.articleId,
        needs_review: outcome.status !== "review",
        result: { status: outcome.status, reasons: outcome.reasons, stepsRun: outcome.stepsRun, articleId: persisted.articleId },
        completed_at: new Date().toISOString(),
      }).eq("id", jobId);

      generatedToday += 1;
      console.log(JSON.stringify({ msg: "job.done", jobId, articleId: persisted.articleId, slug: persisted.slug, status: outcome.status }));

      // One featured image per selected article — only when the draft passed
      // the gates (status "review"), so we never spend on a weak draft.
      if (imagesEnabled && imageSettings.autoGenerateOnReview !== false && outcome.status === "review") {
        const imgStatus = await runImageForArticle(sb, {
          articleId: persisted.articleId,
          jobId,
          imageModel,
          imagePricing,
          imageSettings,
          textClient: budgeted,
        });
        state.dailySpentUsd += budgeted.runSpentUsd;
        state.dailyCalls += budgeted.runCalls;
        console.log(JSON.stringify({ msg: "job.image", jobId, articleId: persisted.articleId, imageStatus: imgStatus }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await sb.from("insights_content_generation_jobs").update({
        status: "failed",
        error: message,
        attempt_count: Number(job.attempt_count ?? 0) + 1,
        completed_at: new Date().toISOString(),
      }).eq("id", jobId);
      await recordUsage(sb, jobId, String(job.cluster_id ?? ""), usageRecords);
      console.error(JSON.stringify({ msg: "job.failed", jobId, error: message }));
    }
  }

  // ---- image jobs (admin-requested Generate / Regenerate Image) ----------
  if (imagesEnabled) {
    const imgJobs = await sb
      .from("insights_content_generation_jobs")
      .select("*")
      .eq("status", "queued")
      .in("kind", ["generate_image", "regenerate_image"])
      .order("created_at", { ascending: true })
      .limit(limit);

    for (const row of imgJobs.data ?? []) {
      const job = row as Record<string, unknown>;
      const jobId = String(job.id);
      const params = (job.params ?? {}) as Record<string, unknown>;
      const articleId = String(params.article_id ?? job.article_id ?? "");
      if (!articleId) continue;

      await sb.from("insights_content_generation_jobs").update({ status: "running", started_at: new Date().toISOString() }).eq("id", jobId);

      const textUsage: UsageRecord[] = [];
      const budgeted = new BudgetedGeminiClient(
        createGeminiClient(env, models),
        { ...budget, perRunCallCap: 4 },
        state,
        (r) => textUsage.push(r),
      );

      const status = await runImageForArticle(sb, {
        articleId,
        jobId,
        imageModel,
        imagePricing,
        imageSettings,
        textClient: budgeted,
        promptOverride: (params.prompt_override as string) ?? null,
        force: Boolean(params.force),
      });
      state.dailySpentUsd += budgeted.runSpentUsd;
      state.dailyCalls += budgeted.runCalls;

      await sb.from("insights_content_generation_jobs").update({
        status: status === "error" ? "failed" : "succeeded",
        result: { imageStatus: status },
        error: status === "error" ? "image generation errored" : null,
        completed_at: new Date().toISOString(),
      }).eq("id", jobId);
      console.log(JSON.stringify({ msg: "image.job.done", jobId, articleId, status }));
    }
  }
}

async function recordUsage(
  sb: SupabaseClient,
  jobId: string,
  clusterId: string,
  records: UsageRecord[],
): Promise<void> {
  if (!records.length) return;
  await sb.from("insights_ai_usage").insert(
    records.map((r) => ({
      job_id: jobId,
      cluster_id: clusterId || null,
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
}

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
