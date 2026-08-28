import { describe, it, expect } from "vitest";
import {
  normalizeTitle,
  normalizeUrl,
  extractEntities,
  extractKeywords,
  dedupeHash,
} from "./normalize";

describe("normalizeTitle", () => {
  it("lowercases, strips punctuation and Show HN prefix", () => {
    expect(normalizeTitle("Show HN: My New Tool (v2.0)!")).toBe("my new tool v20");
  });
  it("drops trailing outlet suffixes", () => {
    expect(normalizeTitle("OpenAI ships GPT-5 - The Verge")).toBe("openai ships gpt 5");
  });
  it("expands ampersands", () => {
    expect(normalizeTitle("R&D at Google")).toBe("r and d at google");
  });
});

describe("normalizeUrl", () => {
  it("drops protocol, www, trailing slash, hash and tracking params", () => {
    expect(
      normalizeUrl("https://www.Example.com/Post/?utm_source=rss&id=9#top"),
    ).toBe("example.com/Post?id=9");
  });
  it("treats http and https the same host/path as equal", () => {
    expect(normalizeUrl("http://blog.google/x/")).toBe(
      normalizeUrl("https://blog.google/x"),
    );
  });
  it("sorts query params for stability", () => {
    expect(normalizeUrl("https://a.com/p?b=2&a=1")).toBe("a.com/p?a=1&b=2");
  });
});

describe("extractEntities", () => {
  it("finds known multi-word and single-word entities with boundaries", () => {
    const ents = extractEntities("Unreal Engine 5.5 lands; NVIDIA reacts");
    expect(ents).toContain("Unreal Engine");
    expect(ents).toContain("NVIDIA");
  });
  it("does not match entity substrings inside other words", () => {
    expect(extractEntities("metaphysics and openairlines")).not.toContain("Meta");
  });
});

describe("extractKeywords", () => {
  it("returns frequent, non-stopword tokens", () => {
    const kw = extractKeywords("Kubernetes autoscaling for Kubernetes clusters on AWS");
    expect(kw[0]).toBe("kubernetes");
    expect(kw).not.toContain("for");
  });
});

describe("dedupeHash", () => {
  it("collides for lightly-reworded copies of the same leading phrase", () => {
    expect(dedupeHash("OpenAI launches GPT-5 model today")).toBe(
      dedupeHash("OpenAI launches GPT-5 model — details"),
    );
  });
  it("differs for unrelated headlines", () => {
    expect(dedupeHash("Valve announces Steam Deck 2")).not.toBe(
      dedupeHash("Google ships new Gemini model"),
    );
  });
});
