import { describe, it, expect } from "vitest";
import { editDraft, editRejection } from "./steps";
import { generateArticle } from "./pipeline";
import { MockGeminiClient } from "../gemini/mock";
import { DRAFT, RESEARCH_BUNDLE, SAMPLE_CLUSTER_SOURCES, defaultByPurpose } from "./fixtures";
import type { Draft, ResearchBundle } from "./schema";

const draft = DRAFT as Draft;
const bundle = RESEARCH_BUNDLE as ResearchBundle;

function clone(d: Draft): Draft {
  return JSON.parse(JSON.stringify(d));
}

/** A valid edit: same structure and links, reworded first section. */
function goodEdit(): Draft {
  const d = clone(draft);
  d.standfirst = "Acme's Nimbus 3 ships an agentic coding mode — here is what changes for working developers.";
  d.sections[0].content = `${d.sections[0].content}\n\nFor small teams, the practical question is cost and review overhead.`;
  return d;
}

function client(edit: string) {
  return new MockGeminiClient({ byPurpose: { ...defaultByPurpose(), edit } });
}

describe("editRejection", () => {
  it("accepts a reworded draft with the same structure and links", () => {
    expect(editRejection(draft, goodEdit(), bundle)).toBeNull();
  });

  it("rejects changed section keys", () => {
    const d = goodEdit();
    d.sections = [...d.sections].reverse();
    expect(editRejection(draft, d, bundle)).toMatch(/section keys/);
  });

  it("rejects a dropped source link", () => {
    const linked = clone(draft);
    linked.sections[0].content += " Per the [announcement](https://acme.ai/blog/nimbus-3).";
    const edited = clone(draft); // same text, link removed
    expect(editRejection(linked, edited, bundle)).toMatch(/dropped link/);
  });

  it("rejects a new link that is not in the draft or bundle", () => {
    const d = goodEdit();
    d.sections[0].content += " See [this](https://made-up.example/claim).";
    expect(editRejection(draft, d, bundle)).toMatch(/new unsourced link/);
  });

  it("rejects an edit that cuts most of the body", () => {
    const d = clone(draft);
    for (const s of d.sections) s.content = "Short.";
    expect(editRejection(draft, d, bundle)).toMatch(/cut too much/);
  });
});

describe("editDraft", () => {
  it("returns the edited draft when it passes the guards", async () => {
    const out = await editDraft(client(JSON.stringify(goodEdit())), bundle, draft);
    expect(out.edited).toBe(true);
    expect(out.draft.standfirst).toMatch(/working developers/);
  });

  it("keeps the original draft when the model returns junk", async () => {
    const out = await editDraft(client("not json"), bundle, draft);
    expect(out.edited).toBe(false);
    expect(out.draft).toBe(draft);
  });
});

describe("generateArticle with the editor pass", () => {
  const cluster = {
    title: "Acme AI releases Nimbus 3 with agentic coding",
    primaryTheme: "ai-model-release",
    category: "artificial-intelligence",
    factConfidence: "verified",
    sources: SAMPLE_CLUSTER_SOURCES,
    viralScore: 72,
    breaking: false,
  };

  it("publishes the edited text and fact-checks it", async () => {
    const c = client(JSON.stringify(goodEdit()));
    const out = await generateArticle(c, { cluster });
    expect(out.status).toBe("review");
    expect(out.article!.content).toContain("review overhead");
    const purposes = c.calls.map((x) => x.opts.purpose);
    expect(purposes.indexOf("edit")).toBeGreaterThan(purposes.indexOf("draft"));
    expect(purposes.indexOf("fact_check")).toBeGreaterThan(purposes.indexOf("edit"));
  });

  it("skips the editor when editorPass is false", async () => {
    const c = client(JSON.stringify(goodEdit()));
    await generateArticle(c, { cluster, config: { editorPass: false } });
    expect(c.calls.some((x) => x.opts.purpose === "edit")).toBe(false);
  });
});
