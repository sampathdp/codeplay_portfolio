/**
 * Article styles and their recommended section structures. The outline
 * step is given the recommended sections for the chosen type and may
 * adapt them — but it must keep the required ones and never force
 * irrelevant sections.
 */

import type { ArticleType } from "./schema";

export interface SectionSpec {
  key: string;
  heading: string;
  /** Cannot be dropped by the outline step. */
  required?: boolean;
  /** Counts as CodePlay original analysis. */
  originalValue?: boolean;
}

const S = {
  quick_summary: { key: "quick_summary", heading: "Quick Summary", required: true },
  what_happened: { key: "what_happened", heading: "What Happened?", required: true },
  what_changed: { key: "what_changed", heading: "What Changed?" },
  key_details: { key: "key_details", heading: "Key Details" },
  why_it_matters: { key: "why_it_matters", heading: "Why It Matters", originalValue: true },
  developer_take: { key: "codeplay_developer_take", heading: "CodePlay Developer Take", required: true, originalValue: true },
  business_impact: { key: "business_impact", heading: "What This Means for Businesses", originalValue: true },
  technical_impact: { key: "technical_impact", heading: "Technical Impact", originalValue: true },
  technical_breakdown: { key: "technical_breakdown", heading: "Technical Breakdown", originalValue: true },
  developer_impact: { key: "developer_impact", heading: "Developer Impact", originalValue: true },
  example: { key: "example", heading: "Example", originalValue: true },
  practical_advice: { key: "practical_advice", heading: "Practical Advice", originalValue: true },
  limitations: { key: "limitations", heading: "Limitations", originalValue: true },
  migration: { key: "migration_considerations", heading: "Migration Considerations", originalValue: true },
  cost: { key: "cost_implications", heading: "Cost Implications", originalValue: true },
  security: { key: "security_implications", heading: "Security Implications", originalValue: true },
  performance: { key: "performance_implications", heading: "Performance Implications", originalValue: true },
  why_players_care: { key: "why_players_care", heading: "Why Players Care" },
  community_reaction: { key: "gaming_community_reaction", heading: "Community Reaction" },
  game_dev_impact: { key: "game_developer_impact", heading: "Game Developer Impact", originalValue: true },
  developer_perspective: { key: "developer_perspective", heading: "Developer Perspective", originalValue: true },
  what_happens_next: { key: "what_happens_next", heading: "What Happens Next?", originalValue: true },
  verdict: { key: "codeplay_verdict", heading: "CodePlay Verdict", required: true, originalValue: true },
} satisfies Record<string, SectionSpec>;

export const ARTICLE_TYPE_SECTIONS: Record<ArticleType, SectionSpec[]> = {
  breaking_news: [S.quick_summary, S.what_happened, S.key_details, S.why_it_matters, S.developer_take, S.what_happens_next, S.verdict],
  tech_analysis: [S.quick_summary, S.what_changed, S.key_details, S.technical_impact, S.business_impact, S.developer_impact, S.limitations, S.developer_take, S.verdict],
  developer_guide: [S.quick_summary, S.what_changed, S.technical_breakdown, S.example, S.practical_advice, S.migration, S.limitations, S.developer_take, S.verdict],
  explainer: [S.quick_summary, S.what_happened, S.technical_breakdown, S.why_it_matters, S.developer_impact, S.developer_take, S.verdict],
  gaming_news: [S.quick_summary, S.what_happened, S.key_details, S.why_players_care, S.community_reaction, S.developer_perspective, S.what_happens_next, S.verdict],
  gaming_community: [S.quick_summary, S.what_happened, S.community_reaction, S.why_players_care, S.developer_perspective, S.what_happens_next, S.verdict],
  game_development: [S.quick_summary, S.what_changed, S.technical_breakdown, S.game_dev_impact, S.practical_advice, S.limitations, S.developer_take, S.verdict],
  ai_news: [S.quick_summary, S.what_changed, S.technical_breakdown, S.developer_impact, S.business_impact, S.example, S.limitations, S.developer_take, S.verdict],
  product_launch: [S.quick_summary, S.what_happened, S.key_details, S.developer_impact, S.business_impact, S.cost, S.limitations, S.developer_take, S.verdict],
  security_alert: [S.quick_summary, S.what_happened, S.key_details, S.security, S.developer_impact, S.practical_advice, S.developer_take, S.what_happens_next, S.verdict],
  industry_analysis: [S.quick_summary, S.what_happened, S.why_it_matters, S.business_impact, S.developer_impact, S.what_happens_next, S.developer_take, S.verdict],
};

export function requiredSectionKeys(type: ArticleType): string[] {
  return ARTICLE_TYPE_SECTIONS[type].filter((s) => s.required).map((s) => s.key);
}

export function originalValueSectionKeys(type: ArticleType): string[] {
  return ARTICLE_TYPE_SECTIONS[type].filter((s) => s.originalValue).map((s) => s.key);
}

/** Map an engine theme / category to a sensible default article type. */
export function defaultArticleType(
  primaryTheme: string | null,
  category: string | null,
  breaking: boolean,
): ArticleType {
  if (breaking) return "breaking_news";
  const t = primaryTheme ?? "";
  if (t.startsWith("ai-")) return "ai_news";
  if (t === "security-vuln" || t === "data-breach") return "security_alert";
  if (t === "startup-launch" || t === "software-release" || t === "open-source-launch") return "product_launch";
  if (["game-engine", "unity", "unreal"].includes(t)) return "game_development";
  if (t === "gaming-controversy") return "gaming_community";
  if (["new-games", "steam-trends", "console-news"].includes(t)) return "gaming_news";
  if (t === "acquisition" || t === "tech-policy") return "industry_analysis";
  if (["dev-tools", "ai-coding", "dev-productivity"].includes(t)) return "developer_guide";
  switch (category) {
    case "gaming":
    case "gaming-community":
      return "gaming_news";
    case "game-development":
      return "game_development";
    case "cybersecurity":
      return "security_alert";
    case "artificial-intelligence":
      return "ai_news";
    case "startups":
    case "big-tech":
    case "saas":
      return "industry_analysis";
    default:
      return "tech_analysis";
  }
}
