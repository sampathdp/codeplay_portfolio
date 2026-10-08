/**
 * Individual generation steps. Each calls Gemini in JSON mode with strict
 * zod validation, and merges in deterministic facts (real source URLs,
 * official-domain counts) so the model can't silently drop or invent them.
 */

import type { GeminiClient } from "../gemini/types";
import { generateJson } from "../gemini/json";
import { BudgetExceededError } from "../gemini/budget";
import { isOfficialDomain } from "../classify";
import {
  researchBundleSchema,
  sourceVerificationSchema,
  outlineSchema,
  draftSchema,
  factCheckSchema,
  seoSchema,
  qualitySchema,
  type ArticleType,
  type ResearchBundle,
  type SourceVerification,
  type Outline,
  type Draft,
  type FactCheck,
  type Seo,
  type QualityScores,
} from "./schema";
import {
  researchBundlePrompt,
  sourceVerificationPrompt,
  outlinePrompt,
  draftPrompt,
  editPrompt,
  factCheckPrompt,
  seoPrompt,
  qualityPrompt,
  HOUSE_STYLE,
} from "./prompts";
import { ARTICLE_TYPE_SECTIONS, requiredSectionKeys } from "./articleTypes";

export interface ClusterInput {
  title: string;
  primaryTheme: string | null;
  category: string | null;
  factConfidence: string;
  sources: Array<{
    title: string;
    url: string;
    publisher: string;
    publishedAt: string | null;
    isOfficial: boolean;
    adapter: string;
    summary: string;
  }>;
}

const uniq = (xs: string[]) => [...new Set(xs.filter(Boolean))];

export async function buildResearchBundle(
  client: GeminiClient,
  cluster: ClusterInput,
) {
  const res = await generateJson(
    client,
    researchBundlePrompt({
      clusterTitle: cluster.title,
      primaryTheme: cluster.primaryTheme,
      category: cluster.category,
      factConfidence: cluster.factConfidence,
      items: cluster.sources,
    }),
    researchBundleSchema,
    { purpose: "research_bundle", system: HOUSE_STYLE, temperature: 0.3 },
  );

  // Merge in the REAL source URLs — never rely on the model to keep them.
  const officialUrls = cluster.sources
    .filter((s) => s.isOfficial || isOfficialDomain(s.url))
    .map((s) => s.url);
  const otherUrls = cluster.sources
    .filter((s) => !(s.isOfficial || isOfficialDomain(s.url)))
    .map((s) => s.url);

  const bundle: ResearchBundle = {
    ...res.data,
    primarySources: uniq([...officialUrls, ...res.data.primarySources]).slice(0, 20),
    secondarySources: uniq([...otherUrls, ...res.data.secondarySources])
      .filter((u) => !officialUrls.includes(u))
      .slice(0, 30),
  };
  return { bundle, usage: res.usage, model: res.model };
}

export async function verifySources(client: GeminiClient, bundle: ResearchBundle) {
  const res = await generateJson(
    client,
    sourceVerificationPrompt(bundle),
    sourceVerificationSchema,
    { purpose: "source_verification", system: HOUSE_STYLE, temperature: 0.2 },
  );

  // Deterministic floor: trust our own official-domain detection.
  const officialCount = bundle.primarySources.filter(isOfficialDomain).length;
  const primarySourceCount = Math.max(res.data.primarySourceCount, officialCount);
  const data: SourceVerification = {
    ...res.data,
    primarySourceCount,
    sufficientForFactualArticle:
      res.data.sufficientForFactualArticle ||
      officialCount >= 1 ||
      bundle.secondarySources.length >= 2,
  };
  return { data, usage: res.usage, model: res.model };
}

export async function generateOutline(
  client: GeminiClient,
  bundle: ResearchBundle,
  verification: SourceVerification,
  articleType: ArticleType,
  wordCount: { min: number; max: number },
) {
  const res = await generateJson(
    client,
    outlinePrompt({ bundle, verification, articleType, wordCount }),
    outlineSchema,
    { purpose: "outline", system: HOUSE_STYLE, temperature: 0.5 },
  );

  // Guarantee required sections survive.
  const have = new Set(res.data.sections.map((s) => s.key));
  const specs = ARTICLE_TYPE_SECTIONS[articleType];
  for (const key of requiredSectionKeys(articleType)) {
    if (!have.has(key)) {
      const spec = specs.find((s) => s.key === key)!;
      res.data.sections.push({
        key,
        heading: spec.heading,
        purpose: `Required section for ${articleType}`,
        targetWords: 120,
      });
    }
  }
  return { outline: res.data as Outline, usage: res.usage, model: res.model };
}

export async function generateDraft(
  client: GeminiClient,
  bundle: ResearchBundle,
  verification: SourceVerification,
  outline: Outline,
) {
  const res = await generateJson(
    client,
    draftPrompt({ bundle, verification, outline }),
    draftSchema,
    { purpose: "draft", system: HOUSE_STYLE, temperature: 0.6, maxOutputTokens: 12_000 },
  );
  return { draft: res.data as Draft, usage: res.usage, model: res.model };
}

export async function factCheckDraft(
  client: GeminiClient,
  bundle: ResearchBundle,
  draft: Draft,
) {
  const res = await generateJson(
    client,
    factCheckPrompt({ bundle, draft }),
    factCheckSchema,
    { purpose: "fact_check", system: HOUSE_STYLE, temperature: 0.1 },
  );
  return { factCheck: res.data as FactCheck, usage: res.usage, model: res.model };
}

export async function generateSeo(
  client: GeminiClient,
  bundle: ResearchBundle,
  draft: Draft,
  headlineCandidates: number,
  categoryHint: string | null,
) {
  const res = await generateJson(
    client,
    seoPrompt({ bundle, draft, headlineCandidates, categoryHint }),
    seoSchema,
    { purpose: "seo", system: HOUSE_STYLE, temperature: 0.4 },
  );
  return { seo: res.data as Seo, usage: res.usage, model: res.model };
}

export async function scoreQuality(
  client: GeminiClient,
  bundle: ResearchBundle,
  draft: Draft,
  factCheck: FactCheck,
  styleSensationalism: number,
) {
  const res = await generateJson(
    client,
    qualityPrompt({
      bundle,
      draft,
      factCheck: {
        verdict: factCheck.verdict,
        factualConfidence: factCheck.factualConfidence,
        hallucinationRisk: factCheck.hallucinationRisk,
      },
      styleSensationalism,
    }),
    qualitySchema,
    { purpose: "quality", system: HOUSE_STYLE, temperature: 0.2 },
  );
  return { quality: res.data as QualityScores, usage: res.usage, model: res.model };
}

const LINK_RE = /\]\((https?:\/\/[^)\s]+)\)/g;

function draftLinks(d: Draft): Set<string> {
  const text = [
    ...d.sections.map((s) => s.content),
    ...Object.values(d.originalValue),
  ].join("\n");
  return new Set([...text.matchAll(LINK_RE)].map((m) => m[1]));
}

function bodyWords(d: Draft): number {
  return d.sections
    .map((s) => s.content)
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/**
 * Why an edited draft must be thrown away, or null when it is safe to use.
 * The editor may rewrite prose freely but must not change structure, drop
 * sourcing, or introduce links that are not in the draft or the bundle.
 */
export function editRejection(
  original: Draft,
  edited: Draft,
  bundle: ResearchBundle,
): string | null {
  const keysA = original.sections.map((s) => s.key).join(",");
  const keysB = edited.sections.map((s) => s.key).join(",");
  if (keysA !== keysB) return "section keys changed";

  const before = draftLinks(original);
  const after = draftLinks(edited);
  for (const url of before) if (!after.has(url)) return `dropped link ${url}`;
  const allowed = new Set([...before, ...bundle.primarySources, ...bundle.secondarySources]);
  for (const url of after) if (!allowed.has(url)) return `new unsourced link ${url}`;

  if (bodyWords(edited) < bodyWords(original) * 0.75) return "edit cut too much content";
  return null;
}

/**
 * Editor pass: rewrite the draft the way a human desk editor would —
 * news-first, varied rhythm, no machine-sounding filler, a stronger
 * CodePlay angle. Never fatal: on any failure, or if the edit breaks a
 * guard, the original draft is kept and the fact-check runs on it.
 */
export async function editDraft(
  client: GeminiClient,
  bundle: ResearchBundle,
  draft: Draft,
): Promise<{ draft: Draft; edited: boolean; reason?: string }> {
  try {
    const res = await generateJson(client, editPrompt({ bundle, draft }), draftSchema, {
      purpose: "edit",
      system: HOUSE_STYLE,
      temperature: 0.7,
      maxOutputTokens: 12_000,
    });
    const edited = res.data as Draft;
    const why = editRejection(draft, edited, bundle);
    if (why) return { draft, edited: false, reason: why };
    return { draft: { ...edited, wordCount: bodyWords(edited) }, edited: true };
  } catch (err) {
    if (err instanceof BudgetExceededError) throw err;
    return { draft, edited: false, reason: err instanceof Error ? err.message : String(err) };
  }
}
