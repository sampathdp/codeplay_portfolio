import { describe, it, expect } from "vitest";
import { checkStyle, readabilityScore, wordCount } from "./style";

describe("checkStyle", () => {
  it("passes clean professional copy", () => {
    const r = checkStyle(
      "Acme AI released a new model. From a development perspective, the main change is a planning loop that decomposes tasks. Teams should evaluate it on a low-risk project first.",
    );
    expect(r.ok).toBe(true);
    expect(r.findings).toHaveLength(0);
  });

  it("flags banned marketing phrases", () => {
    const r = checkStyle("This revolutionary game changer will transform the ever-evolving landscape.");
    expect(r.bannedPhraseCount).toBeGreaterThanOrEqual(2);
    expect(r.ok).toBe(false);
  });

  it("flags forbidden hands-on claims", () => {
    const r = checkStyle("We tested the model and our developers found it fast. In our testing it held up.");
    expect(r.forbiddenClaimCount).toBeGreaterThanOrEqual(2);
    expect(r.ok).toBe(false);
  });

  it("flags sensational language and hype punctuation", () => {
    const r = checkStyle("SHOCKING!! Google just DESTROYED the competition!!!");
    expect(r.sensationalCount).toBeGreaterThan(0);
    expect(r.sensationalismScore).toBeGreaterThan(0);
  });

  it("allows the recommended phrasings", () => {
    const r = checkStyle(
      "From a development perspective, a likely implication is more automation. For teams building internal tools, this matters.",
    );
    expect(r.forbiddenClaimCount).toBe(0);
  });
});

describe("readabilityScore", () => {
  it("returns a 0-100 score, higher for plain sentences", () => {
    const plain = readabilityScore("The cat sat on the mat. It was a good day. We went home.");
    const dense = readabilityScore(
      "Notwithstanding the aforementioned considerations, the multifaceted ramifications necessitate comprehensive interdisciplinary evaluation.",
    );
    expect(plain).toBeGreaterThan(dense);
    expect(plain).toBeLessThanOrEqual(100);
    expect(dense).toBeGreaterThanOrEqual(0);
  });
});

describe("wordCount", () => {
  it("counts words", () => {
    expect(wordCount("  one  two three ")).toBe(3);
    expect(wordCount("")).toBe(0);
  });
});
