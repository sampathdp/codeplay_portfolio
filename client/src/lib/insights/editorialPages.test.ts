import { describe, it, expect } from "vitest";
import {
  EDITORIAL_PAGE_SLUGS,
  allEditorialPages,
  getEditorialPage,
} from "./editorialPages";

describe("editorial pages", () => {
  it("exposes the four E-E-A-T pages", () => {
    expect(EDITORIAL_PAGE_SLUGS.sort()).toEqual(
      ["about", "ai-policy", "corrections", "editorial-policy"].sort(),
    );
  });

  it("each page has a title, description, body and /insights path", () => {
    for (const p of allEditorialPages()) {
      expect(p.title.length).toBeGreaterThan(3);
      expect(p.description.length).toBeGreaterThan(10);
      expect(p.body.length).toBeGreaterThan(200);
      expect(p.path).toBe(`/insights/${p.slug}`);
    }
  });

  it("the AI policy states a human reviews every published article", () => {
    const ai = getEditorialPage("ai-policy")!;
    const flat = ai.body.replace(/\s+/g, " ").toLowerCase();
    expect(flat).toContain("human editor");
    expect(flat).toMatch(/accountable for \*\*every\*\* published article/);
  });

  it("returns undefined for an unknown slug", () => {
    expect(getEditorialPage("nope")).toBeUndefined();
  });
});
