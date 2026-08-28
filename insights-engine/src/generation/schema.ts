/**
 * Zod schemas for every Gemini step output and for the final, persistable
 * article. Nothing malformed or schema-invalid is ever stored.
 */

import { z } from "zod";

export const ARTICLE_TYPES = [
  "breaking_news",
  "tech_analysis",
  "developer_guide",
  "explainer",
  "gaming_news",
  "gaming_community",
  "game_development",
  "ai_news",
  "product_launch",
  "security_alert",
  "industry_analysis",
] as const;
export type ArticleType = (typeof ARTICLE_TYPES)[number];

export const FACT_CONFIDENCE = [
  "verified",
  "likely",
  "community_rumor",
  "unverified",
] as const;

export const CLAIM_KIND = [
  "confirmed_fact",
  "analysis",
  "prediction",
  "community_opinion",
  "rumor",
] as const;

// --- research bundle ----------------------------------------------------

export const researchBundleSchema = z.object({
  topic: z.string().min(8).max(300),
  eventDate: z.string().max(60).nullable(),
  knownFacts: z.array(z.string().min(3)).min(1).max(30),
  entities: z.object({
    companies: z.array(z.string()).max(30),
    people: z.array(z.string()).max(30),
    products: z.array(z.string()).max(30),
  }),
  primarySources: z.array(z.string().url()).max(20),
  secondarySources: z.array(z.string().url()).max(30),
  communitySignals: z.array(z.string()).max(20),
  technicalContext: z.array(z.string()).max(20),
  historicalContext: z.array(z.string()).max(15),
  uncertainties: z.array(z.string()).max(20),
  claimsRequiringCaution: z.array(z.string()).max(20),
  suggestedArticleType: z.enum(ARTICLE_TYPES),
  recommendedWordCount: z.object({ min: z.number().int(), max: z.number().int() }),
});
export type ResearchBundle = z.infer<typeof researchBundleSchema>;

// --- source verification ---------------------------------------------------

export const sourceVerificationSchema = z.object({
  sources: z
    .array(
      z.object({
        url: z.string().url(),
        publisher: z.string().max(120),
        role: z.enum(["primary", "secondary", "community"]),
        isOfficial: z.boolean(),
        confidence: z.enum(FACT_CONFIDENCE),
        notes: z.string().max(400).optional(),
      }),
    )
    .max(50),
  overallConfidence: z.enum(FACT_CONFIDENCE),
  primarySourceCount: z.number().int().min(0),
  sufficientForFactualArticle: z.boolean(),
  reason: z.string().max(500),
});
export type SourceVerification = z.infer<typeof sourceVerificationSchema>;

// --- outline -------------------------------------------------------------

export const outlineSectionSchema = z.object({
  key: z.string().regex(/^[a-z][a-z0-9_]*$/).max(40),
  heading: z.string().min(2).max(120),
  purpose: z.string().min(4).max(300),
  targetWords: z.number().int().min(20).max(700),
});

export const outlineSchema = z.object({
  articleType: z.enum(ARTICLE_TYPES),
  angle: z.string().min(8).max(400),
  sections: z.array(outlineSectionSchema).min(4).max(14),
  estimatedWordCount: z.number().int().min(400).max(3000),
});
export type Outline = z.infer<typeof outlineSchema>;

// --- draft --------------------------------------------------------------

export const draftSectionSchema = z.object({
  key: z.string().regex(/^[a-z][a-z0-9_]*$/).max(40),
  heading: z.string().min(2).max(160),
  content: z.string().min(1),
});

export const originalValueSchema = z.object({
  developerTake: z.string().min(40),
  businessImpact: z.string().min(20),
  developerImpact: z.string().min(20),
  technicalExplanation: z.string().min(20),
  risksAndLimitations: z.string().min(20),
  whyItMatters: z.string().min(20),
  actionableRecommendations: z.string().min(20),
});

export const draftSchema = z.object({
  standfirst: z.string().min(20).max(320),
  quickSummary: z.array(z.string().min(8)).min(2).max(6),
  sections: z.array(draftSectionSchema).min(3).max(16),
  originalValue: originalValueSchema,
  wordCount: z.number().int().min(1),
});
export type Draft = z.infer<typeof draftSchema>;

// --- fact check ---------------------------------------------------------

export const factCheckSchema = z.object({
  claims: z
    .array(
      z.object({
        claim: z.string().min(4),
        kind: z.enum(CLAIM_KIND),
        supported: z.boolean(),
        supportingSource: z.string().url().nullable(),
        note: z.string().max(400).optional(),
      }),
    )
    .max(60),
  unsupportedFactualClaims: z.array(z.string()).max(30),
  rumorsPresentedAsFact: z.array(z.string()).max(20),
  factualConfidence: z.number().min(0).max(100),
  hallucinationRisk: z.number().min(0).max(100),
  verdict: z.enum(["pass", "needs_review", "fail"]),
  summary: z.string().max(600),
});
export type FactCheck = z.infer<typeof factCheckSchema>;

// --- SEO + headlines ---------------------------------------------------

export const seoSchema = z.object({
  headlineCandidates: z
    .array(
      z.object({
        text: z.string().min(12).max(120),
        clarity: z.number().min(0).max(100),
        accuracy: z.number().min(0).max(100),
        curiosity: z.number().min(0).max(100),
        searchPotential: z.number().min(0).max(100),
        clickThrough: z.number().min(0).max(100),
        clickbaitRisk: z.number().min(0).max(100),
      }),
    )
    .min(3)
    .max(8),
  chosenHeadline: z.string().min(12).max(120),
  chosenReason: z.string().max(400),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
  seoTitle: z.string().min(12).max(70),
  seoDescription: z.string().min(50).max(160),
  excerpt: z.string().min(60).max(320),
  tags: z.array(z.string().min(2).max(40)).min(2).max(12),
  category: z.string().min(2).max(40),
});
export type Seo = z.infer<typeof seoSchema>;

// --- quality gates ----------------------------------------------------

export const qualitySchema = z.object({
  factualConfidence: z.number().min(0).max(100),
  sourceQuality: z.number().min(0).max(100),
  originalValue: z.number().min(0).max(100),
  readability: z.number().min(0).max(100),
  seoQuality: z.number().min(0).max(100),
  duplicationRisk: z.number().min(0).max(100),
  sensationalism: z.number().min(0).max(100),
  hallucinationRisk: z.number().min(0).max(100),
  notes: z.string().max(1000),
});
export type QualityScores = z.infer<typeof qualitySchema>;

// --- final persistable article --------------------------------------

export const generatedArticleSchema = z.object({
  articleType: z.enum(ARTICLE_TYPES),
  title: z.string().min(12).max(160),
  headlineOptions: z.array(z.string()).min(1).max(8),
  subtitle: z.string().min(12).max(320),
  excerpt: z.string().min(60).max(320),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
  category: z.string().min(2).max(40),
  tags: z.array(z.string()).min(1).max(12),
  content: z.string().min(400), // rendered markdown
  sections: z.array(draftSectionSchema).min(3),
  quickSummary: z.array(z.string()).min(2).max(6),
  originalValue: originalValueSchema,
  seo: z.object({
    title: z.string().min(12).max(70),
    description: z.string().min(50).max(160),
  }),
  sources: z
    .array(
      z.object({
        url: z.string().url(),
        title: z.string().min(2).max(300),
        publisher: z.string().max(120),
        primary: z.boolean(),
      }),
    )
    .min(1)
    .max(40),
  factCheck: factCheckSchema,
  quality: qualitySchema,
  overallQuality: z.number().min(0).max(100),
  wordCount: z.number().int().min(1),
  readingMinutes: z.number().int().min(1),
  imageConcept: z.object({
    prompt: z.string().min(10).max(600),
    altText: z.string().min(6).max(240),
  }),
  needsReview: z.boolean(),
  reviewReasons: z.array(z.string()).max(20),
});
export type GeneratedArticle = z.infer<typeof generatedArticleSchema>;
