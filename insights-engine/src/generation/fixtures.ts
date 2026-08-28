/**
 * Valid canned Gemini step outputs for tests. Exported (not a *.test.ts)
 * so multiple test files can share them. Never used at runtime.
 */

import type { GeminiGenerateOptions } from "../gemini/types";

const LONG =
  "From a development perspective this changes how teams structure their build and deployment pipeline, and the trade-offs are worth weighing carefully before adopting it in production.";

export const RESEARCH_BUNDLE = {
  topic: "Acme AI releases the Nimbus 3 model with agentic coding features",
  eventDate: "2026-08-28",
  knownFacts: [
    "Acme AI announced Nimbus 3 on its official blog.",
    "Nimbus 3 adds an agentic coding mode.",
    "Pricing was published alongside the announcement.",
  ],
  entities: { companies: ["Acme AI"], people: [], products: ["Nimbus 3"] },
  primarySources: ["https://acme.ai/blog/nimbus-3"],
  secondarySources: [
    "https://techpress.example/acme-nimbus-3",
    "https://devnews.example/nimbus-3-coding",
  ],
  communitySignals: ["Developers on forums are discussing the agentic mode."],
  technicalContext: ["Agentic coding lets a model plan and execute multi-step tasks."],
  historicalContext: ["Acme AI shipped Nimbus 2 six months earlier."],
  uncertainties: ["Independent benchmarks are not yet available."],
  claimsRequiringCaution: ["Vendor-supplied benchmark numbers."],
  suggestedArticleType: "ai_news" as const,
  recommendedWordCount: { min: 900, max: 1400 },
};

/** A rumor cluster with only community chatter — no primary, no corroboration. */
export const THIN_RESEARCH_BUNDLE = {
  topic: "Unconfirmed report that BigCo may acquire SmallCo",
  eventDate: null,
  knownFacts: ["A forum post claims an acquisition is imminent."],
  entities: { companies: ["BigCo", "SmallCo"], people: [], products: [] },
  primarySources: [],
  secondarySources: [],
  communitySignals: ["A single forum thread is speculating about a deal."],
  technicalContext: [],
  historicalContext: [],
  uncertainties: ["No company has commented.", "No filing exists."],
  claimsRequiringCaution: ["The entire premise is unconfirmed."],
  suggestedArticleType: "industry_analysis" as const,
  recommendedWordCount: { min: 800, max: 1200 },
};

export const SOURCE_VERIFICATION = {
  sources: [
    {
      url: "https://acme.ai/blog/nimbus-3",
      publisher: "Acme AI",
      role: "primary" as const,
      isOfficial: true,
      confidence: "verified" as const,
    },
    {
      url: "https://techpress.example/acme-nimbus-3",
      publisher: "TechPress",
      role: "secondary" as const,
      isOfficial: false,
      confidence: "likely" as const,
    },
  ],
  overallConfidence: "verified" as const,
  primarySourceCount: 1,
  sufficientForFactualArticle: true,
  reason: "Official announcement plus independent reporting.",
};

export const OUTLINE = {
  articleType: "ai_news" as const,
  angle: "What the agentic coding mode actually changes for engineering teams.",
  sections: [
    { key: "quick_summary", heading: "Quick Summary", purpose: "Scannable overview", targetWords: 90 },
    { key: "what_changed", heading: "What Changed?", purpose: "The concrete change", targetWords: 180 },
    { key: "technical_breakdown", heading: "Technical Breakdown", purpose: "How it works", targetWords: 220 },
    { key: "developer_impact", heading: "Developer Impact", purpose: "Effect on teams", targetWords: 200 },
    { key: "codeplay_developer_take", heading: "CodePlay Developer Take", purpose: "Our analysis", targetWords: 200 },
    { key: "codeplay_verdict", heading: "CodePlay Verdict", purpose: "Bottom line", targetWords: 120 },
  ],
  estimatedWordCount: 1100,
};

const para = (label: string) =>
  `${label}. ${LONG} For teams building on this platform, a likely implication is a shift in how integration tests are organised, and the migration path is incremental rather than disruptive for most codebases today.`;

export const DRAFT = {
  standfirst: "Acme AI's Nimbus 3 brings an agentic coding mode; here is what it means for engineering teams.",
  quickSummary: [
    "Acme AI announced Nimbus 3 with an agentic coding mode.",
    "Pricing is published; independent benchmarks are not yet available.",
    "The practical impact is on multi-step automation in developer workflows.",
  ],
  sections: [
    { key: "what_changed", heading: "What Changed?", content: para("Acme AI shipped a new model tier") },
    { key: "technical_breakdown", heading: "Technical Breakdown", content: para("The agentic mode plans and executes steps") },
    { key: "developer_impact", heading: "Developer Impact", content: para("Teams can offload repetitive multi-step tasks") },
    { key: "codeplay_developer_take", heading: "CodePlay Developer Take", content: para("From a development perspective the value depends on tooling maturity") },
    { key: "codeplay_verdict", heading: "CodePlay Verdict", content: para("A measured step forward, worth evaluating on a real project") },
  ],
  originalValue: {
    developerTake:
      "From a development perspective, the agentic mode is most useful for well-scoped, repetitive automation rather than open-ended design work, and teams should sandbox it before wiring it into CI.",
    businessImpact:
      "For businesses, the pricing model favours steady usage; budget owners should model cost against current tooling spend.",
    developerImpact:
      "Developers gain a way to delegate multi-step chores but take on new review overhead for generated changes.",
    technicalExplanation:
      "The model exposes a planning loop that decomposes a task, calls tools, and checks results before returning.",
    risksAndLimitations:
      "No independent benchmarks yet; agentic runs can fail silently on ambiguous instructions; vendor lock-in on the tool protocol.",
    whyItMatters:
      "It moves everyday automation from scripts to natural-language intent, which changes who can build internal tooling.",
    actionableRecommendations:
      "Pilot on a low-risk repo, cap tool permissions, and compare review time against manual work before rolling out.",
  },
  wordCount: 1080,
};

export const FACT_CHECK = {
  claims: [
    {
      claim: "Acme AI announced Nimbus 3.",
      kind: "confirmed_fact" as const,
      supported: true,
      supportingSource: "https://acme.ai/blog/nimbus-3",
    },
    {
      claim: "The agentic mode will dominate the market.",
      kind: "prediction" as const,
      supported: false,
      supportingSource: null,
    },
  ],
  unsupportedFactualClaims: [],
  rumorsPresentedAsFact: [],
  factualConfidence: 86,
  hallucinationRisk: 8,
  verdict: "pass" as const,
  summary: "Claims align with the research bundle; predictions are labelled.",
};

export const SEO = {
  headlineCandidates: [
    { text: "Acme Nimbus 3 Adds Agentic Coding — What Developers Need to Know", clarity: 88, accuracy: 90, curiosity: 72, searchPotential: 80, clickThrough: 74, clickbaitRisk: 10 },
    { text: "Nimbus 3: Acme AI's Agentic Coding Mode, Explained for Teams", clarity: 84, accuracy: 88, curiosity: 70, searchPotential: 78, clickThrough: 70, clickbaitRisk: 8 },
    { text: "Acme AI Ships Nimbus 3 With an Agentic Coding Mode", clarity: 90, accuracy: 92, curiosity: 60, searchPotential: 82, clickThrough: 66, clickbaitRisk: 5 },
  ],
  chosenHeadline: "Acme Nimbus 3 Adds Agentic Coding — What Developers Need to Know",
  chosenReason: "Clear, accurate, developer-relevant, not clickbait.",
  slug: "acme-nimbus-3-agentic-coding-what-developers-need-to-know",
  seoTitle: "Acme Nimbus 3 Adds Agentic Coding: Developer Guide",
  seoDescription:
    "Acme AI's Nimbus 3 introduces an agentic coding mode. Here is what actually changes for engineering teams, plus the limitations to watch.",
  excerpt:
    "Acme AI's Nimbus 3 introduces an agentic coding mode. We break down what changes for engineering teams and where the limits are.",
  tags: ["Acme AI", "Nimbus 3", "AI coding", "developer tools"],
  category: "artificial-intelligence",
};

export const QUALITY = {
  factualConfidence: 84,
  sourceQuality: 78,
  originalValue: 80,
  readability: 68,
  seoQuality: 76,
  duplicationRisk: 12,
  sensationalism: 6,
  hallucinationRisk: 9,
  notes: "Solid analysis, well sourced, scannable.",
};

export function defaultByPurpose(): Partial<
  Record<GeminiGenerateOptions["purpose"], string>
> {
  return {
    research_bundle: JSON.stringify(RESEARCH_BUNDLE),
    source_verification: JSON.stringify(SOURCE_VERIFICATION),
    outline: JSON.stringify(OUTLINE),
    draft: JSON.stringify(DRAFT),
    fact_check: JSON.stringify(FACT_CHECK),
    seo: JSON.stringify(SEO),
    quality: JSON.stringify(QUALITY),
  };
}

export const SAMPLE_CLUSTER_SOURCES = [
  {
    title: "Introducing Nimbus 3",
    url: "https://acme.ai/blog/nimbus-3",
    publisher: "acme.ai",
    publishedAt: "2026-08-28T09:00:00Z",
    isOfficial: true,
    adapter: "rss",
    summary: "Acme AI announces Nimbus 3 with agentic coding.",
  },
  {
    title: "Acme AI's Nimbus 3 lands with agentic coding",
    url: "https://techpress.example/acme-nimbus-3",
    publisher: "techpress.example",
    publishedAt: "2026-08-28T10:30:00Z",
    isOfficial: false,
    adapter: "rss",
    summary: "Independent report on the Nimbus 3 launch.",
  },
];
