import { describe, it, expect } from "vitest";
import { jobProgress, stepLabel } from "./jobProgress";
import type { GenerationJobRow } from "./records";

type J = Pick<GenerationJobRow, "kind" | "status" | "step">;
const job = (p: Partial<J>): J => ({
  kind: p.kind ?? "full_article",
  status: p.status ?? "running",
  step: p.step ?? "draft",
});

describe("jobProgress", () => {
  it("is 0% and queued-toned while waiting for the worker", () => {
    const p = jobProgress(job({ status: "queued", step: "research_bundle" }));
    expect(p.pct).toBe(0);
    expect(p.tone).toBe("queued");
  });

  it("advances monotonically through the full_article steps", () => {
    const order = [
      "research_bundle", "source_verification", "outline", "draft",
      "fact_check", "seo", "quality", "persist", "finalize",
    ] as const;
    const pcts = order.map((s) => jobProgress(job({ step: s })).pct);
    for (let i = 1; i < pcts.length; i++) {
      expect(pcts[i]).toBeGreaterThan(pcts[i - 1]);
    }
    expect(pcts[pcts.length - 1]).toBe(100);
  });

  it("reports 100% / done for a succeeded job regardless of step", () => {
    const p = jobProgress(job({ status: "succeeded", step: "image" }));
    expect(p).toMatchObject({ pct: 100, tone: "done" });
  });

  it("freezes the bar at the step a failure happened on", () => {
    const p = jobProgress(job({ status: "failed", step: "draft" }));
    expect(p.tone).toBe("failed");
    expect(p.pct).toBeGreaterThan(0);
    expect(p.pct).toBeLessThan(100);
    expect(p.label).toMatch(/Failed at/);
  });

  it("marks an unknown running step as indeterminate", () => {
    const p = jobProgress(job({ status: "running", step: "" }));
    expect(p.indeterminate).toBe(true);
  });

  it("treats single-shot jobs as indeterminate while running", () => {
    const p = jobProgress(job({ kind: "generate_image", status: "running", step: "image" }));
    expect(p.indeterminate).toBe(true);
    expect(p.label).toBe("Generating image");
  });
});

describe("stepLabel", () => {
  it("humanises known and unknown steps", () => {
    expect(stepLabel("fact_check")).toBe("Fact-checking");
    expect(stepLabel("some_new_step")).toBe("some new step");
    expect(stepLabel(null)).toBe("");
  });
});
