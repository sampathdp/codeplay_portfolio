import { describe, it, expect } from "vitest";
import { z } from "zod";
import { generateJson, GeminiJsonError } from "./json";
import { MockGeminiClient } from "./mock";

const schema = z.object({ title: z.string().min(3), score: z.number() });
const opts = { purpose: "seo" as const };

describe("generateJson", () => {
  it("parses a clean JSON response", async () => {
    const client = new MockGeminiClient({
      respond: () => JSON.stringify({ title: "Hello", score: 9 }),
    });
    const res = await generateJson(client, "p", schema, opts);
    expect(res.data).toEqual({ title: "Hello", score: 9 });
    expect(res.attempts).toBe(1);
  });

  it("strips markdown fences", async () => {
    const client = new MockGeminiClient({
      respond: () => "```json\n{ \"title\": \"Fenced\", \"score\": 1 }\n```",
    });
    const res = await generateJson(client, "p", schema, opts);
    expect(res.data.title).toBe("Fenced");
  });

  it("extracts the JSON object from surrounding prose", async () => {
    const client = new MockGeminiClient({
      respond: () => 'Sure! Here you go: { "title": "Prose", "score": 2 } Hope that helps.',
    });
    const res = await generateJson(client, "p", schema, opts);
    expect(res.data.title).toBe("Prose");
  });

  it("repairs once on invalid output then succeeds", async () => {
    let call = 0;
    const client = new MockGeminiClient({
      respond: () => {
        call += 1;
        return call === 1 ? "not json at all" : JSON.stringify({ title: "Repaired", score: 5 });
      },
    });
    const res = await generateJson(client, "p", schema, opts);
    expect(res.data.title).toBe("Repaired");
    expect(res.attempts).toBe(2);
    expect(client.calls).toHaveLength(2);
  });

  it("throws GeminiJsonError after two bad attempts", async () => {
    const client = new MockGeminiClient({ respond: () => "still not json" });
    await expect(generateJson(client, "p", schema, opts)).rejects.toBeInstanceOf(
      GeminiJsonError,
    );
    expect(client.calls).toHaveLength(2);
  });

  it("throws on schema-invalid JSON", async () => {
    const client = new MockGeminiClient({
      respond: () => JSON.stringify({ title: "x", score: "nope" }),
    });
    await expect(generateJson(client, "p", schema, opts)).rejects.toThrow();
  });

  it("accumulates token usage across attempts", async () => {
    let call = 0;
    const client = new MockGeminiClient({
      usage: { promptTokens: 100, completionTokens: 50 },
      respond: () => {
        call += 1;
        return call === 1 ? "bad" : JSON.stringify({ title: "okay", score: 1 });
      },
    });
    const res = await generateJson(client, "p", schema, opts);
    expect(res.usage.totalTokens).toBe(300); // 2 calls x 150
  });
});
