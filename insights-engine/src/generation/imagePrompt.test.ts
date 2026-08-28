import { describe, it, expect } from "vitest";
import {
  buildImagePrompt,
  buildImagePromptDeterministic,
  composePrompt,
} from "./imagePrompt";
import { NEGATIVE_REQUIREMENTS } from "./imageStyle";
import { MockGeminiClient } from "../gemini/mock";

const base = {
  title: "Acme AI releases Nimbus 3 with agentic coding",
  category: "artificial-intelligence",
  summary: "Acme AI announced a new model with an agentic coding mode.",
  entities: ["Acme AI", "Nimbus 3"],
};

describe("composePrompt / deterministic", () => {
  it("includes every structured section and the negative requirements", () => {
    const r = buildImagePromptDeterministic({ ...base });
    for (const label of ["Subject:", "Environment:", "Composition:", "Lighting:", "Camera:", "Editorial mood:", "Negative requirements:"]) {
      expect(r.prompt).toContain(label);
    }
    expect(r.prompt).toContain("16:9");
    // a representative sample of the hard negatives
    for (const neg of ["no text", "no logos", "no readable source code", "no real people or recognizable faces"]) {
      expect(r.negativePrompt).toContain(neg);
    }
    expect(r.negativePrompt.split(", ").length).toBe(NEGATIVE_REQUIREMENTS.length);
  });

  it("uses category-specific visual direction", () => {
    const ai = buildImagePromptDeterministic({ ...base, category: "artificial-intelligence" });
    const gaming = buildImagePromptDeterministic({ ...base, category: "gaming" });
    expect(ai.prompt).toMatch(/neural-interface|model-architecture|AI accelerator/i);
    expect(gaming.prompt).toMatch(/controller|console|handheld|gaming hardware/i);
  });

  it("references entities without asking for their logos", () => {
    const r = buildImagePromptDeterministic({ ...base });
    expect(r.subject.toLowerCase()).toContain("acme ai");
    expect(r.prompt.toLowerCase()).toContain("without depicting their logos");
  });

  it("produces plain, non-spammy alt text", () => {
    const r = buildImagePromptDeterministic({ ...base });
    expect(r.altText.length).toBeLessThanOrEqual(180);
    expect(r.altText).not.toMatch(/[.]$/);
  });

  it("respects a full prompt override via composePrompt", () => {
    const { prompt, negativePrompt } = composePrompt(base, "a single glowing monolith");
    expect(prompt).toContain("Subject: a single glowing monolith.");
    expect(negativePrompt).toContain("no text");
  });
});

describe("buildImagePrompt with a Gemini subject", () => {
  it("uses the model's subject + alt text when the call succeeds", async () => {
    const client = new MockGeminiClient({
      respond: () =>
        JSON.stringify({
          subject: "layered translucent planning-loop geometry hovering over a dark studio void",
          altText: "Abstract illustration of a translucent branching structure over a dark background",
        }),
    });
    const r = await buildImagePrompt(base, client);
    expect(r.subject).toContain("planning-loop geometry");
    expect(r.prompt).toContain("Subject: layered translucent planning-loop geometry");
    expect(r.altText).toContain("branching structure");
    expect(r.prompt).toContain("no logos");
  });

  it("falls back to the deterministic prompt when the model output is unusable", async () => {
    const client = new MockGeminiClient({ respond: () => "not json, twice" });
    const r = await buildImagePrompt(base, client);
    expect(r.prompt).toContain("Subject:");
    expect(r.subject.toLowerCase()).toContain("acme ai");
  });
});
