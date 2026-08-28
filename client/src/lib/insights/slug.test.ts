import { describe, it, expect } from "vitest";
import { slugify, ensureUniqueSlug, MAX_SLUG_LENGTH } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Google Launches New Gemini Model")).toBe(
      "google-launches-new-gemini-model",
    );
  });

  it("strips punctuation and collapses separators", () => {
    expect(slugify("NVIDIA's H200 -- 2x faster?!")).toBe(
      "nvidia-s-h200-2x-faster",
    );
  });

  it("transliterates common accented characters", () => {
    expect(slugify("Café déjà vu")).toBe("cafe-deja-vu");
  });

  it("trims leading and trailing separators", () => {
    expect(slugify("  --Hello--  ")).toBe("hello");
  });

  it("returns empty string for input with no slug characters", () => {
    expect(slugify("!!!")).toBe("");
    expect(slugify("")).toBe("");
  });
});

describe("ensureUniqueSlug", () => {
  it("returns the base slug when unused", () => {
    expect(ensureUniqueSlug("Fresh Story", [])).toBe("fresh-story");
  });

  it("appends -2, -3 on collision (never -1)", () => {
    expect(ensureUniqueSlug("Dupe", ["dupe"])).toBe("dupe-2");
    expect(ensureUniqueSlug("Dupe", ["dupe", "dupe-2"])).toBe("dupe-3");
  });

  it("falls back to the title, then to 'article'", () => {
    expect(ensureUniqueSlug("", [], "The Real Title")).toBe("the-real-title");
    expect(ensureUniqueSlug("", [], "")).toBe("article");
  });

  it("caps length at MAX_SLUG_LENGTH", () => {
    const long = "word ".repeat(60).trim();
    expect(ensureUniqueSlug(long, []).length).toBeLessThanOrEqual(
      MAX_SLUG_LENGTH,
    );
  });

  it("does not emit a trailing hyphen after truncation", () => {
    const input = `${"a".repeat(MAX_SLUG_LENGTH - 1)} bcd`;
    expect(ensureUniqueSlug(input, [])).not.toMatch(/-$/);
  });
});
