/**
 * Prompt templates. The pipeline never asks Gemini to "rewrite an
 * article" — every step works from the structured research bundle and
 * returns strict JSON.
 */

import type { ResearchBundle, SourceVerification, Outline, Draft } from "./schema";
import { ARTICLE_TYPE_SECTIONS } from "./articleTypes";
import type { ArticleType } from "./schema";

export const HOUSE_STYLE = `You write for "CodePlay Insights", the technology and gaming publication of CodePlay Studios (a software and game development studio).

Voice: professional, clear, credible, developer- and business-friendly, easy to scan, never sensational, never robotic, never keyword-stuffed. Short paragraphs. Concrete over vague.

Hard rules:
- Distinguish confirmed facts, analysis, predictions, community opinions and rumors. Never present a rumor or unverified community claim as fact.
- Never claim hands-on experience CodePlay does not have. Do NOT write "we tested", "we used", "our developers found", "in our testing". Instead: "From a development perspective...", "For teams building...", "A likely implication is...".
- Every article must contain genuine original analysis: developer implications, business implications, a plain technical explanation, limitations, and practical guidance. Reference and link primary sources; never invent a citation or a quote.
- Avoid: "game changer", "revolutionary", "in today's fast-paced world", "delve", "ever-evolving landscape", hype punctuation, ALL-CAPS.
- Only use sections that genuinely fit the story. Do not pad.

Always respond with a single valid JSON object. No markdown, no commentary outside the JSON.`;

function bundleBlock(b: ResearchBundle): string {
  return JSON.stringify(b, null, 2);
}

export function researchBundlePrompt(input: {
  clusterTitle: string;
  primaryTheme: string | null;
  category: string | null;
  factConfidence: string;
  items: Array<{
    title: string;
    url: string;
    publisher: string;
    publishedAt: string | null;
    isOfficial: boolean;
    adapter: string;
    summary: string;
  }>;
}): string {
  return `Build a STRUCTURED RESEARCH BUNDLE for the following story cluster. Use ONLY the material provided. Do not fetch or assume outside facts. Where the material is thin, record that in "uncertainties" — do not guess.

Cluster headline: ${input.clusterTitle}
Engine theme: ${input.primaryTheme ?? "unknown"} | category hint: ${input.category ?? "unknown"} | current confidence: ${input.factConfidence}

Source items (headline + link + short metadata only — NOT full articles):
${JSON.stringify(input.items, null, 2)}

Return JSON with exactly these keys:
{
  "topic": string,
  "eventDate": string | null,
  "knownFacts": string[]            // only statements supported by the items; attribute implicitly
  "entities": { "companies": string[], "people": string[], "products": string[] },
  "primarySources": string[]        // official / first-party URLs from the items
  "secondarySources": string[]      // reputable secondary URLs from the items
  "communitySignals": string[]      // community chatter, clearly labelled as such
  "technicalContext": string[]      // background a developer needs, general knowledge is OK here
  "historicalContext": string[],
  "uncertainties": string[],
  "claimsRequiringCaution": string[],
  "suggestedArticleType": one of breaking_news|tech_analysis|developer_guide|explainer|gaming_news|gaming_community|game_development|ai_news|product_launch|security_alert|industry_analysis,
  "recommendedWordCount": { "min": number, "max": number }
}`;
}

export function sourceVerificationPrompt(bundle: ResearchBundle): string {
  return `Assess the sources in this research bundle for a factual news article. Classify each source's role and confidence, and decide whether the evidence is sufficient to publish a factual article (as opposed to marking it NEEDS_REVIEW).

Research bundle:
${bundleBlock(bundle)}

Rules:
- "primary" = first-party / official announcement. "secondary" = independent reporting. "community" = forum/social chatter.
- A factual article needs at least one primary OR at least two independent reputable secondary sources.
- If the story rests only on community rumor or a single weak source, set sufficientForFactualArticle=false.

Return JSON:
{
  "sources": [{ "url", "publisher", "role": "primary"|"secondary"|"community", "isOfficial": bool, "confidence": "verified"|"likely"|"community_rumor"|"unverified", "notes"? }],
  "overallConfidence": "verified"|"likely"|"community_rumor"|"unverified",
  "primarySourceCount": number,
  "sufficientForFactualArticle": boolean,
  "reason": string
}`;
}

export function outlinePrompt(input: {
  bundle: ResearchBundle;
  verification: SourceVerification;
  articleType: ArticleType;
  wordCount: { min: number; max: number };
}): string {
  const recommended = ARTICLE_TYPE_SECTIONS[input.articleType]
    .map((s) => `${s.key} ("${s.heading}")${s.required ? " [required]" : ""}${s.originalValue ? " [original-analysis]" : ""}`)
    .join("\n");

  return `Plan a CodePlay Insights article. Choose the sharpest, most useful angle. Build an outline of sections that genuinely fit THIS story — drop recommended sections that don't apply, and you may add a better-fitting one. Keep every [required] section and at least two [original-analysis] sections.

Article type: ${input.articleType}
Target length: ${input.wordCount.min}-${input.wordCount.max} words.

Recommended sections for this type:
${recommended}

Research bundle:
${bundleBlock(input.bundle)}

Source confidence: ${input.verification.overallConfidence} (${input.verification.reason})

Return JSON:
{
  "articleType": "${input.articleType}",
  "angle": string,
  "sections": [{ "key": lower_snake_case, "heading": string, "purpose": string, "targetWords": number }],
  "estimatedWordCount": number
}`;
}

export function draftPrompt(input: {
  bundle: ResearchBundle;
  verification: SourceVerification;
  outline: Outline;
}): string {
  return `Write the full CodePlay Insights article following this outline. Use ONLY facts from the research bundle. Clearly separate fact from analysis from prediction. Link primary sources in-text where natural using markdown links. Do not invent quotes, numbers, benchmarks or citations. Do not claim hands-on experience.

Outline:
${JSON.stringify(input.outline, null, 2)}

Research bundle:
${bundleBlock(input.bundle)}

Source confidence: ${input.verification.overallConfidence}

Return JSON:
{
  "standfirst": string,                      // one-sentence standfirst / subtitle
  "quickSummary": string[],                  // 2-5 scannable bullet points
  "sections": [{ "key": string, "heading": string, "content": markdown string }],
  "originalValue": {
    "developerTake": string, "businessImpact": string, "developerImpact": string,
    "technicalExplanation": string, "risksAndLimitations": string,
    "whyItMatters": string, "actionableRecommendations": string
  },
  "wordCount": number
}
The section keys must match the outline. Each originalValue field must contain specific, non-generic analysis grounded in the bundle.`;
}

export function factCheckPrompt(input: { bundle: ResearchBundle; draft: Draft }): string {
  const body = input.draft.sections.map((s) => `## ${s.heading}\n${s.content}`).join("\n\n");
  return `Fact-check this draft against the research bundle ONLY. For each material claim, classify it and say whether the bundle supports it. Flag any factual claim with no support, and any rumor/community opinion written as if it were established fact.

Research bundle:
${bundleBlock(input.bundle)}

Draft body:
${body}

Return JSON:
{
  "claims": [{ "claim", "kind": "confirmed_fact"|"analysis"|"prediction"|"community_opinion"|"rumor", "supported": bool, "supportingSource": url|null, "note"? }],
  "unsupportedFactualClaims": string[],
  "rumorsPresentedAsFact": string[],
  "factualConfidence": 0-100,
  "hallucinationRisk": 0-100,
  "verdict": "pass"|"needs_review"|"fail",
  "summary": string
}`;
}

export function seoPrompt(input: {
  bundle: ResearchBundle;
  draft: Draft;
  headlineCandidates: number;
  categoryHint: string | null;
}): string {
  return `Produce SEO metadata and ${input.headlineCandidates} headline candidates for this article, then pick the strongest. Headlines must be accurate and non-clickbait. Prefer clear, specific, developer-relevant phrasing.

Good: "Gemini X Just Changed AI Coding — Here's What Developers Need to Know"
Bad:  "SHOCKING! Google Just DESTROYED ChatGPT!!!"

Topic: ${input.bundle.topic}
Category hint: ${input.categoryHint ?? "unknown"}
Standfirst: ${input.draft.standfirst}
Key points: ${input.draft.quickSummary.join(" | ")}

Return JSON:
{
  "headlineCandidates": [{ "text", "clarity", "accuracy", "curiosity", "searchPotential", "clickThrough", "clickbaitRisk" }],   // scores 0-100
  "chosenHeadline": string,
  "chosenReason": string,
  "slug": kebab-case,
  "seoTitle": string (<= 65 chars),
  "seoDescription": string (120-158 chars),
  "excerpt": string (2 sentences),
  "tags": string[] (2-10, proper nouns and technologies),
  "category": one CodePlay Insights category slug
}`;
}

export function qualityPrompt(input: {
  bundle: ResearchBundle;
  draft: Draft;
  factCheck: { verdict: string; factualConfidence: number; hallucinationRisk: number };
  styleSensationalism: number;
}): string {
  const body = input.draft.sections.map((s) => `## ${s.heading}\n${s.content}`).join("\n\n");
  return `Score this finished draft on each dimension, 0-100. Be strict. "Original value" measures whether the article adds genuine CodePlay analysis (developer/business/technical implications, limitations, guidance) beyond summarising the news.

Fact-check verdict: ${input.factCheck.verdict} (confidence ${input.factCheck.factualConfidence}, hallucination risk ${input.factCheck.hallucinationRisk})
Deterministic sensationalism estimate: ${input.styleSensationalism}

Research bundle:
${bundleBlock(input.bundle)}

Draft:
${body}

Original-value blocks:
${JSON.stringify(input.draft.originalValue, null, 2)}

Return JSON:
{
  "factualConfidence": 0-100, "sourceQuality": 0-100, "originalValue": 0-100,
  "readability": 0-100, "seoQuality": 0-100, "duplicationRisk": 0-100,
  "sensationalism": 0-100, "hallucinationRisk": 0-100,
  "notes": string
}`;
}

export function improveTitlePrompt(current: string, summary: string[]): string {
  return `Suggest 5 stronger, accurate, non-clickbait headlines for a CodePlay Insights article, then choose one.
Current: ${current}
Summary: ${summary.join(" | ")}
Return JSON: { "headlineCandidates": [{ "text","clarity","accuracy","curiosity","searchPotential","clickThrough","clickbaitRisk" }], "chosenHeadline": string, "chosenReason": string }`;
}

export function regenerateSectionPrompt(input: {
  bundle: ResearchBundle;
  sectionKey: string;
  heading: string;
  currentContent: string;
  instruction?: string;
}): string {
  return `Rewrite ONLY the "${input.heading}" section of a CodePlay Insights article. Same facts (from the bundle), same voice, no new claims. ${input.instruction ? `Editor instruction: ${input.instruction}` : ""}

Research bundle:
${bundleBlock(input.bundle)}

Current section content:
${input.currentContent}

Return JSON: { "section": "${input.sectionKey}", "heading": "${input.heading}", "content": markdown string }`;
}
