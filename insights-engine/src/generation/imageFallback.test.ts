import { describe, it, expect } from "vitest";
import { fallbackSvg, fallbackPalette, fallbackAlt } from "./imageFallback";

describe("fallbackSvg", () => {
  it("is a valid 16:9 SVG with no text elements", () => {
    const svg = fallbackSvg("cybersecurity", "some-slug");
    expect(svg).toContain('width="1600" height="900"');
    expect(svg).toContain("<svg");
    expect(svg).not.toMatch(/<text/);
    expect(svg.trim().endsWith("</svg>")).toBe(true);
  });

  it("is deterministic for the same category + seed", () => {
    expect(fallbackSvg("gaming", "abc")).toBe(fallbackSvg("gaming", "abc"));
    expect(fallbackSvg("gaming", "abc")).not.toBe(fallbackSvg("gaming", "xyz"));
  });

  it("uses a distinct palette per category, with a sane default", () => {
    expect(fallbackPalette("artificial-intelligence")).not.toEqual(fallbackPalette("gaming"));
    expect(fallbackPalette("not-a-category").accent).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe("fallbackAlt", () => {
  it("describes the category without keyword spam", () => {
    expect(fallbackAlt("hardware-and-gpus")).toBe(
      "CodePlay Insights hardware and gpus category illustration",
    );
  });
});
