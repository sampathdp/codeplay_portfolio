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
import { DEFAULT_CONFIG, resolveGeminiModels } from "../config";
import type { ArticleType } from "./schema";
import { createGeminiClient } from "../gemini/client";
import { isDailyQuotaError } from "../gemini/retry";
import {
  BudgetedGeminiClient,
  type AiBudgetConfig,
  type BudgetState,
  type UsageRecord,
} from "../gemini/budget";
import { resolveAiBudget, resolveGenerationConfig } from "./config";
import {
  rankForAutoPublish,
  resolveAutoPublishConfig,
  type PublishCandidate,
} from "../publish/autopublish";
import { generateArticle } from "./pipeline";
import { persistGeneratedArticle } from "./persist";
import type { ClusterInput } from "./steps";
import { createGeminiImageClient } from "../gemini/image";
import { SharpImageProcessor, type VariantSpec } from "../storage/processor";
import { SupabaseImageStore } from "../storage/images";
import { generateFeaturedImage } from "./imagePipeline";
import { createStockImageClient } from "./stockImage";
import { createSourceImageClient } from "./sourceImage";
import { persistImageOutcome } from "./persistImage";

const env = process.env as Record<string, string | undefined>;

function startOfUtcDay(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Persist the live pipeline step for the admin progress bar. Best-effort. */
async function setJobStep(
  sb: SupabaseClient,
  jobId: string,
  step: string,
): Promise<void> {
  try {
    await sb.from("insights_content_generation_jobs").update({ step }).eq("id", jobId);
  } catch {
    // never fail a generation run because progress reporting hiccupped
  }
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
  /** Use the source article's lead image before AI / stock. Default true. */
  preferSourceImage?: boolean;
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
    .select("source_name,source_url,source_type,primary_source")
    .eq("article_id", ctx.articleId)
    .limit(8);
  const sourceRows = (entRes.data ?? []) as Array<{
    source_name: string;
    source_url: string;
    source_type: string | null;
    primary_source: boolean | null;
  }>;
  const entities = [...new Set(sourceRows.map((r) => r.source_name))];
  const sources = sourceRows.map((r) => ({
    name: r.source_name,
    url: r.source_url,
    primary: Boolean(r.primary_source),
    official: ["official_blog", "press_release", "release_notes"].includes(r.source_type ?? ""),
  }));

  // Stock photos already used by other articles, so each post gets its own.
  const usedRes = await sb
    .from("insights_articles")
    .select("featured_image_credit")
    .neq("id", ctx.articleId)
    .not("featured_image_credit", "is", null)
    .limit(500);
  const excludeStockUrls = ((usedRes.data ?? []) as Array<{
    featured_image_credit: { sourceUrl?: string } | null;
  }>)
    .map((r) => r.featured_image_credit?.sourceUrl)
    .filter((u): u is string => Boolean(u));

  const usage: UsageRecord[] = [];
  try {
    const outcome = await generateFeaturedImage(
      {
        imageClient: createGeminiImageClient(env, ctx.imageModel),
        stockClient: createStockImageClient(env),
        sourceClient: createSourceImageClient(env),
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
        excludeStockUrls,
        sources,
        preferSourceImage: ctx.imageSettings.preferSourceImage,
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
  const maxPerDay = scheduler.maxArticlesPerDay ?? DEFAULT_CONFIG.scheduler.maxArticlesPerDay;

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

  // Reclaim jobs left "running" by a previous worker that crashed or was
  // killed mid-call. Anything running longer than this is not actually in
  // flight — put it back on the queue so a later run retries it.
  const STALE_RUNNING_MS = 30 * 60 * 1000;
  const staleBefore = new Date(Date.now() - STALE_RUNNING_MS).toISOString();
  const reclaimed = await sb
    .from("insights_content_generation_jobs")
    .update({ status: "queued", started_at: null })
    .eq("status", "running")
    .lt("started_at", staleBefore)
    .select("id");
  if (reclaimed.data?.length) {
    console.log(JSON.stringify({ msg: "jobs.reclaimed", count: reclaimed.data.length }));
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
        onStep: (step) => setJobStep(sb, jobId, step),
      });

      // account for what we spent
      state.dailySpentUsd += budgeted.runSpentUsd;
      state.dailyCalls += budgeted.runCalls;

      if (!outcome.article) {
        const softFailed = outcome.status !== "needs_review";
        const reasonText =
          outcome.reasons.join(" | ") || `no article produced (${outcome.status})`;
        await sb.from("insights_content_generation_jobs").update({
          status: softFailed ? "failed" : "succeeded",
          needs_review: outcome.status === "needs_review",
          review_reason: reasonText,
          // Mirror the reason into `error` too — the admin Jobs view reads
          // that column, so a soft fail is otherwise a silent "FAILED".
          error: softFailed ? reasonText : null,
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

      await setJobStep(sb, jobId, "persist");
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
        step: "finalize",
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
        await setJobStep(sb, jobId, "image");
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
      await recordUsage(sb, jobId, String(job.cluster_id ?? ""), usageRecords);

      if (isDailyQuotaError(err)) {
        // Hard quota stop — every remaining call this run would 429 too.
        // Put the job back on the queue (not "failed", no attempt burned)
        // so it resumes automatically once the quota resets or billing is
        // enabled, and stop the run here.
        await sb.from("insights_content_generation_jobs").update({
          status: "queued",
          started_at: null,
        }).eq("id", jobId);
        console.error(JSON.stringify({ msg: "run.aborted.quota", jobId, error: message }));
        return;
      }

      await sb.from("insights_content_generation_jobs").update({
        status: "failed",
        error: message,
        attempt_count: Number(job.attempt_count ?? 0) + 1,
        completed_at: new Date().toISOString(),
      }).eq("id", jobId);
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

      let status: string;
      try {
        status = await runImageForArticle(sb, {
          articleId,
          jobId,
          imageModel,
          imagePricing,
          imageSettings,
          textClient: budgeted,
          promptOverride: (params.prompt_override as string) ?? null,
          force: Boolean(params.force),
        });
      } catch (err) {
        state.dailySpentUsd += budgeted.runSpentUsd;
        state.dailyCalls += budgeted.runCalls;
        const message = err instanceof Error ? err.message : String(err);
        if (isDailyQuotaError(err)) {
          await sb.from("insights_content_generation_jobs").update({
            status: "queued",
            started_at: null,
          }).eq("id", jobId);
          console.error(JSON.stringify({ msg: "run.aborted.quota", jobId, error: message }));
          return;
        }
        await sb.from("insights_content_generation_jobs").update({
          status: "failed",
          error: message,
          completed_at: new Date().toISOString(),
        }).eq("id", jobId);
        console.error(JSON.stringify({ msg: "image.job.failed", jobId, error: message }));
        continue;
      }
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

  // ---- autopilot: publish the day's best drafts --------------------------
  const publishing = (settings.publishing ?? {}) as Record<string, unknown>;
  if (publishing.autoPublish === true) {
    try {
      await runAutoPublish(sb, {
        publishing,
        models,
        budget,
        state,
        imageModel,
        imagePricing,
        imageSettings,
      });
    } catch (err) {
      console.error(
        JSON.stringify({
          msg: "autopublish.error",
          error: err instanceof Error ? err.message : String(err),
        }),
      );
    }
  }
}

/**
 * Rank today's `review` drafts and flip the best `minPerDay..maxPerDay` (1 by default)
 * (diverse) ones to `published`. Fully autonomous: a `needs_review` flag
 * does not exclude a draft. Each winner is guaranteed a featured image
 * first. Never throws past its own try/catch in `main`.
 */
async function runAutoPublish(
  sb: SupabaseClient,
  opts: {
    publishing: Record<string, unknown>;
    models: ReturnType<typeof resolveGeminiModels>;
    budget: AiBudgetConfig;
    state: BudgetState;
    imageModel: string;
    imagePricing: Record<string, number>;
    imageSettings: ImageSettings;
  },
): Promise<void> {
  const baseCfg = resolveAutoPublishConfig(opts.publishing);
  const since = startOfUtcDay();

  // Respect the daily cap across every generate run today.
  const already = await sb
    .from("insights_articles")
    .select("id", { count: "exact", head: true })
    .eq("status", "published")
    .not("generation_job_id", "is", null)
    .gte("published_at", since);
  if (already.error) throw new Error(`autopublish count: ${already.error.message}`);
  const publishedToday = already.count ?? 0;

  const cfg = {
    ...baseCfg,
    maxPerDay: Math.max(0, baseCfg.maxPerDay - publishedToday),
    minPerDay: Math.max(0, baseCfg.minPerDay - publishedToday),
  };
  if (cfg.maxPerDay === 0) {
    console.log(JSON.stringify({ msg: "autopublish.none", reason: "daily cap reached", publishedToday }));
    return;
  }

  const res = await sb
    .from("insights_articles")
    .select(
      "id,slug,quality_score,viral_score,breaking,needs_review,created_at,featured_image_url,featured_image_status,insights_categories:category_id ( slug )",
    )
    .eq("status", "review")
    .gte("created_at", since);
  if (res.error) throw new Error(`autopublish load: ${res.error.message}`);

  const rows = (res.data ?? []) as Array<Record<string, unknown>>;
  if (rows.length === 0) {
    console.log(JSON.stringify({ msg: "autopublish.none", reason: "no review drafts today" }));
    return;
  }

  const candidates: PublishCandidate[] = rows.map((r) => ({
    id: String(r.id),
    slug: String(r.slug),
    categorySlug: (r.insights_categories as { slug?: string } | null)?.slug ?? null,
    qualityScore: Number(r.quality_score ?? 0),
    viralScore: Number(r.viral_score ?? 0),
    breaking: Boolean(r.breaking),
    needsReview: Boolean(r.needs_review),
    createdAt: String(r.created_at ?? ""),
  }));

  const ranked = rankForAutoPublish(candidates, cfg);
  if (ranked.winners.length === 0) {
    console.log(JSON.stringify({ msg: "autopublish.none", reason: "nothing ranked" }));
    return;
  }

  const byId = new Map(rows.map((r) => [String(r.id), r]));
  const publishedSlugs: string[] = [];

  for (let i = 0; i < ranked.winners.length; i++) {
    const w = ranked.winners[i];
    const row = byId.get(w.id) ?? {};

    // Guarantee a usable featured image before going live.
    const hasImage =
      Boolean(row.featured_image_url) && row.featured_image_status !== "failed";
    if (!hasImage) {
      const budgeted = new BudgetedGeminiClient(
        createGeminiClient(env, opts.models),
        { ...opts.budget, perRunCallCap: 4 },
        opts.state,
        () => {},
      );
      try {
        const imgStatus = await runImageForArticle(sb, {
          articleId: w.id,
          jobId: null,
          imageModel: opts.imageModel,
          imagePricing: opts.imagePricing,
          imageSettings: opts.imageSettings,
          textClient: budgeted,
        });
        opts.state.dailySpentUsd += budgeted.runSpentUsd;
        opts.state.dailyCalls += budgeted.runCalls;
        console.log(JSON.stringify({ msg: "autopublish.image", articleId: w.id, imgStatus }));
      } catch (err) {
        opts.state.dailySpentUsd += budgeted.runSpentUsd;
        opts.state.dailyCalls += budgeted.runCalls;
        console.error(
          JSON.stringify({
            msg: "autopublish.image.error",
            articleId: w.id,
            error: err instanceof Error ? err.message : String(err),
          }),
        );
      }
    }

    // Compare-and-swap: only publish while the draft is still `review`,
    // so a concurrent human edit / unpublish is never clobbered.
    const upd = await sb
      .from("insights_articles")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        scheduled_at: null,
        ...(i === 0 ? { featured: true } : {}),
      })
      .eq("id", w.id)
      .eq("status", "review")
      .select("id");
    if (upd.error) {
      console.error(JSON.stringify({ msg: "autopublish.publish.error", articleId: w.id, error: upd.error.message }));
      continue;
    }
    if (!upd.data?.length) {
      console.log(JSON.stringify({ msg: "autopublish.skip", articleId: w.id, reason: "no longer in review" }));
      continue;
    }

    await sb.from("insights_admin_action_logs").insert({
      actor: null,
      actor_email: "autopilot",
      action: "autopublish",
      entity_type: "article",
      entity_id: w.id,
      metadata: {
        slug: w.slug,
        score: Math.round(ranked.scores[w.id] ?? 0),
        reason: ranked.reasons[w.id] ?? "",
      },
    });
    publishedSlugs.push(w.slug);
  }

  console.log(
    JSON.stringify({
      msg: "autopublish.done",
      published: publishedSlugs,
      belowMin: ranked.belowMin,
      consideredToday: candidates.length,
    }),
  );
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
