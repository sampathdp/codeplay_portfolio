/**
 * Map a generation job's live `step` (written by the worker as each
 * pipeline stage completes — see `insights-engine/src/generation/run.ts`)
 * to a progress percentage + human label for the admin Jobs view.
 */

import type { GenerationJobRow } from "./records";

/** Must match `FULL_ARTICLE_STEP_SEQUENCE` in the engine's pipeline.ts. */
export const FULL_ARTICLE_STEPS = [
  "research_bundle",
  "source_verification",
  "outline",
  "draft",
  "fact_check",
  "seo",
  "quality",
  "persist",
  "finalize",
] as const;

const STEP_LABELS: Record<string, string> = {
  research_bundle: "Researching sources",
  source_verification: "Verifying sources",
  outline: "Outlining",
  draft: "Writing draft",
  fact_check: "Fact-checking",
  seo: "SEO & headlines",
  quality: "Quality gates",
  persist: "Saving draft",
  finalize: "Finalising",
  image: "Generating image",
  research: "Researching",
};

export interface JobProgress {
  /** 0–100 */
  pct: number;
  label: string;
  /** true → render an animated/indeterminate bar (fraction unknown) */
  indeterminate: boolean;
  tone: "running" | "done" | "failed" | "queued";
}

export function stepLabel(step: string | null | undefined): string {
  if (!step) return "";
  return STEP_LABELS[step] ?? step.replace(/_/g, " ");
}

export function jobProgress(
  job: Pick<GenerationJobRow, "kind" | "status" | "step">,
): JobProgress {
  const label = stepLabel(job.step);
  const idx = FULL_ARTICLE_STEPS.indexOf(job.step as (typeof FULL_ARTICLE_STEPS)[number]);
  const stepPct =
    idx >= 0 ? Math.round(((idx + 1) / FULL_ARTICLE_STEPS.length) * 100) : 0;

  if (job.status === "succeeded") {
    return { pct: 100, label: "Done", indeterminate: false, tone: "done" };
  }
  if (job.status === "failed") {
    return {
      pct: stepPct,
      label: label ? `Failed at ${label}` : "Failed",
      indeterminate: false,
      tone: "failed",
    };
  }
  if (job.status === "cancelled") {
    return { pct: stepPct, label: "Cancelled", indeterminate: false, tone: "failed" };
  }
  if (job.status === "queued") {
    return { pct: 0, label: "Queued — waiting for worker", indeterminate: false, tone: "queued" };
  }

  // running
  if (job.kind === "full_article") {
    if (idx < 0) {
      return { pct: 5, label: label || "Starting", indeterminate: true, tone: "running" };
    }
    return { pct: stepPct, label, indeterminate: false, tone: "running" };
  }

  // single-shot jobs (image, improve_title, fact_check, …) have no sub-steps
  return { pct: 60, label: label || "Working", indeterminate: true, tone: "running" };
}
