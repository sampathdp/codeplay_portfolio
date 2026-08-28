import { describe, it, expect } from "vitest";
import { countWords, estimateReadingTime } from "./readingTime";

describe("countWords", () => {
  it("counts whitespace-separated tokens", () => {
    expect(countWords("one two three")).toBe(3);
  });
  it("ignores leading/trailing and repeated whitespace", () => {
    expect(countWords("  a\n\n  b\t c  ")).toBe(3);
  });
  it("is 0 for empty or blank input", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   \n ")).toBe(0);
  });
});

describe("estimateReadingTime", () => {
  it("is 0 for empty content", () => {
    expect(estimateReadingTime("")).toBe(0);
  });
  it("rounds up and enforces a 1-minute floor", () => {
    expect(estimateReadingTime("word ".repeat(10))).toBe(1);
    expect(estimateReadingTime("word ".repeat(200))).toBe(1);
    expect(estimateReadingTime("word ".repeat(201))).toBe(2);
    expect(estimateReadingTime("word ".repeat(950))).toBe(5);
  });
  it("respects a custom words-per-minute", () => {
    expect(estimateReadingTime("word ".repeat(300), 100)).toBe(3);
  });
});
