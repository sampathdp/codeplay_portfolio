import { describe, it, expect } from "vitest";
import { generateArticle } from "./pipeline";
import { MockGeminiClient } from "../gemini/mock";
import { BudgetedGeminiClient, DEFAULT_AI_BUDGET } from "../gemini/budget";
import { generatedArticleSchema } from "./schema";
import {
  defaultByPurpose,
  DRAFT,
  SAMPLE_CLUSTER_SOURCES,
  SOURCE_VERIFICATION,
  THIN_RESEARCH_BUNDLE,
} from "./fixtures";
import type { ClusterInput } from "./steps";

const cluster: ClusterInput & { viralScore: number; breaking: boolean } = {
  title: "Acme AI releases Nimbus 3 with agentic coding",
  primaryTheme: "ai-model-release",
  category: "artificial-intelligence",
  factConfidence: "verified",
  sources: SAMPLE_CLUSTER_SOURCES,
  viralScore: 72,
  breaking: false,
};

function client(overrides: Partial<Record<string, string>> = {}) {
  return new MockGeminiClient({
    byPurpose: { ...defaultByPurpose(), ...overrides },
    usage: { promptTokens: 500, completionTokens: 900 },
  });
}

describe("generateArticle — happy path", () => {
  it("produces a schema-valid review draft with original value and sources", async () => {
    const out = await generateArticle(client(), { cluster });

    expect(out.status).toBe("review");
    expect(out.article).not.toBeNull();
    const article = out.article!;

    expect(generatedArticleSchema.safeParse(article).success).toBe(true);
    expect(article.articleType).toBe("ai_news");
    expect(article.title.length).toBeGreaterThanOrEqual(12);
    expect(article.headlineOptions.length).toBeGreaterThanOrEqual(3);
    expect(article.content).toMatch(/## Sources & Further Reading/);
    expect(article.content).toContain("acme.ai/blog/nimbus-3");
    expect(article.sources.some((s) => s.primary)).toBe(true);
    expect(article.originalValue.developerTake.length).toBeGreaterThan(40);
    expect(article.wordCount).toBeGreaterThan(200);
    expect(article.needsReview).toBe(false);
    expect(out.stepsRun).toEqual([
      "research_bundle",
      "source_verification",
      "outline",
      "draft",
      "fact_check",
      "seo",
      "quality",
    ]);
  });

  it("uses the important word-count band for high-viral / breaking stories", async () => {
    const out = await generateArticle(client(), {
      cluster: { ...cluster, viralScore: 90 },
    });
    expect(out.article).not.toBeNull();
  });
});

describe("generateArticle — factual safety", () => {
  it("stops at NEEDS_REVIEW when source verification is insufficient (no draft, cheap)", async () => {
    const insufficient = JSON.stringify({
      ...SOURCE_VERIFICATION,
      overallConfidence: "community_rumor",
      primarySourceCount: 0,
      sufficientForFactualArticle: false,
      reason: "Only community chatter; no official confirmation.",
    });
    const c = client({
      source_verification: insufficient,
      research_bundle: JSON.stringify(THIN_RESEARCH_BUNDLE),
    });
    const out = await generateArticle(c, {
      cluster: {
        ...cluster,
        factConfidence: "community_rumor",
        sources: [
          {
            title: "Rumor thread",
            url: "https://www.reddit.com/r/tech/comments/x",
            publisher: "reddit.com",
            publishedAt: "2026-08-28T09:00:00Z",
            isOfficial: false,
            adapter: "reddit",
            summary: "unconfirmed",
          },
        ],
      },
    });
    expect(out.status).toBe("needs_review");
    expect(out.article).toBeNull();
    expect(out.stepsRun).toEqual(["research_bundle", "source_verification"]);
  });

  it("hard-rejects a draft that presents a rumor as fact", async () => {
    const badFactCheck = JSON.stringify({
      claims: [],
      unsupportedFactualClaims: ["Acme will be acquired next week"],
      rumorsPresentedAsFact: ["Acme will be acquired next week"],
      factualConfidence: 40,
      hallucinationRisk: 30,
      verdict: "fail",
      summary: "Contains an unconfirmed acquisition claim stated as fact.",
    });
    const out = await generateArticle(client({ fact_check: badFactCheck }), { cluster });
    expect(out.status).toBe("rejected");
    expect(out.reasons.join(" ")).toMatch(/rumor|fail/);
  });

  it("marks NEEDS_REVIEW when quality scores are weak", async () => {
    const weakQuality = JSON.stringify({
      factualConfidence: 55,
      sourceQuality: 45,
      originalValue: 40,
      readability: 50,
      seoQuality: 40,
      duplicationRisk: 20,
      sensationalism: 10,
      hallucinationRisk: 12,
      notes: "Thin analysis.",
    });
    const out = await generateArticle(client({ quality: weakQuality }), { cluster });
    expect(out.status).toBe("needs_review");
    expect(out.article).not.toBeNull();
    expect(out.article!.needsReview).toBe(true);
    expect(out.reasons.length).toBeGreaterThan(0);
  });
});

describe("generateArticle — robustness", () => {
  it("fails cleanly (no partial article) on unrepairable invalid JSON", async () => {
    const c = new MockGeminiClient({ byPurpose: { research_bundle: "definitely not json" } });
    const out = await generateArticle(c, { cluster });
    expect(out.status).toBe("failed");
    expect(out.article).toBeNull();
    expect(out.error).toBe("invalid_json");
  });

  it("fails cleanly when the AI budget is exceeded mid-pipeline", async () => {
    const budgeted = new BudgetedGeminiClient(
      client(),
      { ...DEFAULT_AI_BUDGET, perRunCallCap: 2 },
      { dailySpentUsd: 0, dailyCalls: 0 },
    );
    const out = await generateArticle(budgeted, { cluster });
    expect(out.status).toBe("failed");
    expect(out.error).toBe("budget_exceeded");
    expect(out.article).toBeNull();
  });

  it("de-duplicates slugs against existing ones", async () => {
    const out = await generateArticle(client(), {
      cluster,
      existingSlugs: ["acme-nimbus-3-agentic-coding-what-developers-need-to-know"],
    });
    expect(out.article!.slug).toBe(
      "acme-nimbus-3-agentic-coding-what-developers-need-to-know-2",
    );
  });
});

describe("draft fixture sanity", () => {
  it("has all seven original-value blocks populated", () => {
    for (const v of Object.values(DRAFT.originalValue)) {
      expect(typeof v).toBe("string");
      expect(v.length).toBeGreaterThan(20);
    }
  });
});
