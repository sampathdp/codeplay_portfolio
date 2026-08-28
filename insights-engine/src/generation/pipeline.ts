/**
 * Article generation pipeline.
 *
 *   cluster → research bundle → source verification
 *           → (stop early if sources insufficient → NEEDS_REVIEW)
 *           → outline → draft → fact check → SEO/headlines → quality gates
 *           → validated GeneratedArticle
 *
 * No article is ever published here. Output is a `review` draft (or a
 * `needs_review` flag). Nothing partial or schema-invalid is returned.
 */

import type { GeminiClient } from "../gemini/types";
import { BudgetExceededError } from "../gemini/budget";
import { GeminiJsonError } from "../gemini/json";
import { slugify, ensureUniqueSlug } from "../slug";
import { coerceCategory } from "../categories";
import {
  generatedArticleSchema,
  type ArticleType,
  type GeneratedArticle,
  type ResearchBundle,
  type Draft,
  type FactCheck,
  type Seo,
  type QualityScores,
} from "./schema";
import { defaultArticleType, originalValueSectionKeys } from "./articleTypes";
import { checkStyle, readabilityScore, wordCount as countWords } from "./style";
import {
  DEFAULT_THRESHOLDS,
  evaluateGates,
  overallQuality,
  type GenerationThresholds,
} from "./quality";
import {
  buildResearchBundle,
  verifySources,
  generateOutline,
  generateDraft,
  factCheckDraft,
  generateSeo,
  scoreQuality,
  type ClusterInput,
} from "./steps";

export interface GenerationConfig {
  wordCountDefault: { min: number; max: number };
  wordCountImportant: { min: number; max: number };
  headlineCandidates: number;
  thresholds: GenerationThresholds;
  bannedPhrases?: string[];
  forbiddenClaims?: string[];
}

export const DEFAULT_GENERATION_CONFIG: GenerationConfig = {
  wordCountDefault: { min: 800, max: 1500 },
  wordCountImportant: { min: 1500, max: 2500 },
  headlineCandidates: 5,
  thresholds: DEFAULT_THRESHOLDS,
};

export type GenerationStatus = "review" | "needs_review" | "rejected" | "failed";

export interface GenerationOutcome {
  status: GenerationStatus;
  article: GeneratedArticle | null;
  reasons: string[];
  stepsRun: string[];
  error?: string;
}

export interface GenerateOptions {
  cluster: ClusterInput & { viralScore?: number; breaking?: boolean };
  config?: Partial<GenerationConfig>;
  articleType?: ArticleType;
  existingSlugs?: Iterable<string>;
  now?: Date;
}

export async function generateArticle(
  client: GeminiClient,
  opts: GenerateOptions,
): Promise<GenerationOutcome> {
  const cfg: GenerationConfig = { ...DEFAULT_GENERATION_CONFIG, ...opts.config };
  const stepsRun: string[] = [];
  const cluster = opts.cluster;

  try {
    // 1. research bundle
    const { bundle } = await buildResearchBundle(client, cluster);
    stepsRun.push("research_bundle");

    // 2. source verification — gate before spending on a draft
    const { data: verification } = await verifySources(client, bundle);
    stepsRun.push("source_verification");

    const important =
      (cluster.viralScore ?? 0) >= 78 || cluster.breaking === true;
    const wordTarget = important ? cfg.wordCountImportant : cfg.wordCountDefault;

    const hasPrimary =
      verification.primarySourceCount >= cfg.thresholds.minPrimarySources;
    const hasCorroboration = bundle.secondarySources.length >= 2;
    if (!verification.sufficientForFactualArticle || (!hasPrimary && !hasCorroboration)) {
      return {
        status: "needs_review",
        article: null,
        reasons: [
          "Source confidence insufficient for an automatic factual article.",
          verification.reason,
        ],
        stepsRun,
      };
    }

    const articleType: ArticleType =
      opts.articleType ??
      bundle.suggestedArticleType ??
      defaultArticleType(
        cluster.primaryTheme,
        cluster.category,
        cluster.breaking ?? false,
      );

    // 3. outline
    const { outline } = await generateOutline(
      client,
      bundle,
      verification,
      articleType,
      wordTarget,
    );
    stepsRun.push("outline");

    // 4. draft
    const { draft } = await generateDraft(client, bundle, verification, outline);
    stepsRun.push("draft");

    // 5. fact check
    const { factCheck } = await factCheckDraft(client, bundle, draft);
    stepsRun.push("fact_check");

    // 6. SEO + headlines
    const { seo } = await generateSeo(
      client,
      bundle,
      draft,
      cfg.headlineCandidates,
      cluster.category,
    );
    stepsRun.push("seo");

    // deterministic style pass
    const bodyText = draft.sections.map((s) => s.content).join("\n\n");
    const style = checkStyle(bodyText, {
      bannedPhrases: cfg.bannedPhrases,
      forbiddenClaims: cfg.forbiddenClaims,
    });

    // 7. quality scores + gates
    const { quality } = await scoreQuality(
      client,
      bundle,
      draft,
      factCheck,
      style.sensationalismScore,
    );
    stepsRun.push("quality");

    // Blend model readability with the deterministic Flesch proxy.
    quality.readability = Math.round(
      (quality.readability + readabilityScore(bodyText)) / 2,
    );
    quality.sensationalism = Math.max(quality.sensationalism, style.sensationalismScore);

    const allSources = dedupeSources([
      ...bundle.primarySources.map((url) => ({ url, primary: true })),
      ...bundle.secondarySources.map((url) => ({ url, primary: false })),
    ]);

    const gate = evaluateGates({
      quality,
      factCheck,
      verification,
      style,
      sourceCount: allSources.length,
      thresholds: cfg.thresholds,
    });

    const article = assembleArticle({
      articleType,
      cluster,
      bundle,
      draft,
      factCheck,
      seo,
      quality,
      style,
      overall: gate.overall,
      needsReview: !gate.passed,
      reviewReasons: gate.reasons,
      existingSlugs: opts.existingSlugs,
    });

    const check = generatedArticleSchema.safeParse(article);
    if (!check.success) {
      return {
        status: "failed",
        article: null,
        reasons: check.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
        stepsRun,
        error: "assembled article failed final schema validation",
      };
    }

    if (!gate.passed && !gate.needsReview) {
      // Hard fail — keep the draft but flag it clearly; never auto-publish.
      return { status: "rejected", article: check.data, reasons: gate.reasons, stepsRun };
    }

    return {
      status: gate.passed ? "review" : "needs_review",
      article: check.data,
      reasons: gate.reasons,
      stepsRun,
    };
  } catch (err) {
    if (err instanceof BudgetExceededError) {
      return { status: "failed", article: null, reasons: [err.message], stepsRun, error: "budget_exceeded" };
    }
    if (err instanceof GeminiJsonError) {
      return { status: "failed", article: null, reasons: [err.message], stepsRun, error: "invalid_json" };
    }
    return {
      status: "failed",
      article: null,
      reasons: [err instanceof Error ? err.message : String(err)],
      stepsRun,
      error: "exception",
    };
  }
}

// --- assembly ----------------------------------------------------------

interface AssembleInput {
  articleType: ArticleType;
  cluster: ClusterInput;
  bundle: ResearchBundle;
  draft: Draft;
  factCheck: FactCheck;
  seo: Seo;
  quality: QualityScores;
  style: ReturnType<typeof checkStyle>;
  overall: number;
  needsReview: boolean;
  reviewReasons: string[];
  existingSlugs?: Iterable<string>;
}

function dedupeSources(
  xs: Array<{ url: string; primary: boolean }>,
): Array<{ url: string; primary: boolean }> {
  const seen = new Map<string, boolean>();
  for (const x of xs) {
    if (!x.url) continue;
    seen.set(x.url, (seen.get(x.url) ?? false) || x.primary);
  }
  return [...seen.entries()].map(([url, primary]) => ({ url, primary }));
}

function publisherOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

function renderMarkdown(input: AssembleInput, title: string): string {
  const { draft } = input;
  const lines: string[] = [];
  lines.push(`# ${title}`, "");
  if (draft.standfirst) lines.push(`*${draft.standfirst}*`, "");
  if (draft.quickSummary.length) {
    lines.push("## Quick Summary", "");
    for (const b of draft.quickSummary) lines.push(`- ${b}`);
    lines.push("");
  }
  for (const s of draft.sections) {
    if (s.key === "quick_summary" || s.key === "sources") continue;
    lines.push(`## ${s.heading}`, "", s.content.trim(), "");
  }
  lines.push("## Sources & Further Reading", "");
  const sources = buildSourceList(input);
  for (const src of sources) {
    lines.push(`- [${src.title}](${src.url})${src.primary ? " — primary source" : ""}`);
  }
  return lines.join("\n").trim();
}

function buildSourceList(input: AssembleInput) {
  const bySource = new Map(input.cluster.sources.map((s) => [s.url, s]));
  const out = dedupeSources([
    ...input.bundle.primarySources.map((url) => ({ url, primary: true })),
    ...input.bundle.secondarySources.map((url) => ({ url, primary: false })),
  ]);
  return out
    .map(({ url, primary }) => {
      const item = bySource.get(url);
      return {
        url,
        title: item?.title || input.bundle.topic,
        publisher: item?.publisher || publisherOf(url),
        primary: primary || Boolean(item?.isOfficial),
      };
    })
    .sort((a, b) => Number(b.primary) - Number(a.primary))
    .slice(0, 40);
}

function assembleArticle(input: AssembleInput): GeneratedArticle {
  const title = input.seo.chosenHeadline.trim();
  const baseSlug = input.seo.slug || slugify(title);
  const slug = ensureUniqueSlug(baseSlug, input.existingSlugs ?? [], title);

  const sections = input.draft.sections.filter(
    (s) => s.key !== "sources" && s.content.trim().length > 0,
  );
  const content = renderMarkdown(input, title);
  const words = Math.max(countWords(content), input.draft.wordCount || 0);
  const category = coerceCategory(input.seo.category, input.cluster.category);
  const sources = buildSourceList(input);

  return {
    articleType: input.articleType,
    title,
    headlineOptions: input.seo.headlineCandidates.map((h) => h.text).slice(0, 8),
    subtitle: input.draft.standfirst,
    excerpt: input.seo.excerpt,
    slug,
    category,
    tags: uniqStrings(input.seo.tags).slice(0, 12),
    content,
    sections,
    quickSummary: input.draft.quickSummary.slice(0, 6),
    originalValue: input.draft.originalValue,
    seo: { title: input.seo.seoTitle, description: input.seo.seoDescription },
    sources: sources.length
      ? sources
      : [{ url: input.cluster.sources[0]?.url ?? "https://codeplaystudios.com", title: input.bundle.topic, publisher: "source", primary: false }],
    factCheck: input.factCheck,
    quality: { ...input.quality },
    overallQuality: input.overall,
    wordCount: words,
    readingMinutes: Math.max(1, Math.ceil(words / 200)),
    imageConcept: {
      prompt: `Editorial illustration for a technology article titled "${title}". Modern, abstract, clean. No logos, no readable text, no real people.`,
      altText: `Abstract editorial illustration representing: ${input.bundle.topic}`.slice(0, 240),
    },
    needsReview: input.needsReview,
    reviewReasons: input.reviewReasons.slice(0, 20),
  };
}

const uniqStrings = (xs: string[]) => [...new Set(xs.map((x) => x.trim()).filter(Boolean))];

export { overallQuality, originalValueSectionKeys };
