import { describe, it, expect } from "vitest";
import {
  ARTICLE_TYPE_SECTIONS,
  requiredSectionKeys,
  originalValueSectionKeys,
  defaultArticleType,
} from "./articleTypes";
import { ARTICLE_TYPES } from "./schema";

describe("ARTICLE_TYPE_SECTIONS", () => {
  it("covers every article type", () => {
    for (const t of ARTICLE_TYPES) {
      expect(ARTICLE_TYPE_SECTIONS[t].length).toBeGreaterThanOrEqual(5);
    }
  });

  it("every type keeps a required verdict, a CodePlay analysis section, and >=2 original-value sections", () => {
    const takeKeys = new Set([
      "codeplay_developer_take",
      "developer_perspective",
      "game_developer_impact",
    ]);
    for (const t of ARTICLE_TYPES) {
      const keys = ARTICLE_TYPE_SECTIONS[t].map((s) => s.key);
      expect(requiredSectionKeys(t)).toContain("codeplay_verdict");
      expect(keys.some((k) => takeKeys.has(k))).toBe(true);
      expect(originalValueSectionKeys(t).length).toBeGreaterThanOrEqual(2);
    }
  });

  it("gaming types use player/community sections, not business-heavy ones", () => {
    const keys = ARTICLE_TYPE_SECTIONS.gaming_news.map((s) => s.key);
    expect(keys).toContain("why_players_care");
    expect(keys).toContain("gaming_community_reaction");
    expect(keys).not.toContain("business_impact");
  });
});

describe("defaultArticleType", () => {
  it("maps themes and categories to a sensible type", () => {
    expect(defaultArticleType("ai-model-release", "artificial-intelligence", false)).toBe("ai_news");
    expect(defaultArticleType("security-vuln", "cybersecurity", false)).toBe("security_alert");
    expect(defaultArticleType("unreal", "game-development", false)).toBe("game_development");
    expect(defaultArticleType("new-games", "gaming", false)).toBe("gaming_news");
    expect(defaultArticleType("acquisition", "big-tech", false)).toBe("industry_analysis");
    expect(defaultArticleType(null, null, true)).toBe("breaking_news");
    expect(defaultArticleType(null, null, false)).toBe("tech_analysis");
  });
});
