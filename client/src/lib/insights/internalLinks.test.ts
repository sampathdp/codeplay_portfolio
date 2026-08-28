import { describe, it, expect } from "vitest";
import { relatedServices } from "./internalLinks";
import type { InsightsArticleSummary } from "./types";

function summary(over: Partial<InsightsArticleSummary>): InsightsArticleSummary {
  return {
    id: "1",
    slug: "s",
    title: over.title ?? "Title",
    dek: over.dek ?? "",
    category: over.category ?? "software-development",
    tags: over.tags ?? [],
    heroImage: undefined,
    author: "CodePlay Studios Editorial Team",
    readingMinutes: 5,
    publishedAt: "2026-08-20T00:00:00Z",
    entities: over.entities,
  };
}

describe("relatedServices", () => {
  it("maps a Unity story to game development", () => {
    const links = relatedServices(
      summary({ category: "game-development", entities: ["Unity"] }),
      2,
    );
    expect(links[0].href).toBe("/unity-game-development");
  });

  it("maps a Flutter story to mobile via keywords even off-category", () => {
    const links = relatedServices(
      summary({ category: "software-development", title: "Flutter 4 lands" }),
      2,
    );
    expect(links.some((l) => l.href === "/mobile-development")).toBe(true);
  });

  it("maps an AI story to AI development", () => {
    const links = relatedServices(
      summary({ category: "artificial-intelligence" }),
      2,
    );
    expect(links.some((l) => l.href === "/ai-development")).toBe(true);
  });

  it("always returns at least one link and never more than the limit", () => {
    const links = relatedServices(summary({ category: "big-tech" }), 2);
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links.length).toBeLessThanOrEqual(2);
  });

  it("de-duplicates and always keeps contact as a safe fallback", () => {
    const links = relatedServices(summary({ category: "hardware-and-gpus" }), 3);
    const hrefs = links.map((l) => l.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs).toContain("/contact");
  });
});
