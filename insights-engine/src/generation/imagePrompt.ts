/**
 * Featured-image prompt generator.
 *
 * Builds a structured prompt (subject, environment, composition, lighting,
 * camera, editorial mood, negative requirements) from the article's
 * title / category / summary / entities / visual concept and the fixed
 * CodePlay visual style.
 *
 * An optional cheap Gemini call sharpens the *subject* and writes the alt
 * text; without it, a deterministic template is used.
 */

import { z } from "zod";
import type { GeminiClient } from "../gemini/types";
import { generateJson } from "../gemini/json";
import {
  HOUSE_VISUAL_STYLE,
  HOUSE_MOOD,
  NEGATIVE_REQUIREMENTS,
  categoryVisual,
} from "./imageStyle";

export interface ImagePromptInput {
  title: string;
  category: string | null;
  summary: string;
  entities: string[];
  /** The Phase-4 `article.imageConcept` seed, if any. */
  visualConcept?: string;
  aspectRatio?: string;
}

export interface ImagePromptResult {
  prompt: string;
  negativePrompt: string;
  altText: string;
  subject: string;
}

const refineSchema = z.object({
  subject: z.string().min(8).max(400),
  altText: z.string().min(10).max(180),
});

function cleanAlt(s: string): string {
  return s
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180)
    .replace(/[\s.,;:–—-]+$/, "");
}

function deterministicSubject(input: ImagePromptInput): string {
  const cv = categoryVisual(input.category);
  const ents = input.entities.slice(0, 2).join(" and ");
  const base = input.visualConcept?.trim() || cv.subject;
  return ents ? `${base}, evoking ${ents} without depicting their logos` : base;
}

export function composePrompt(
  input: ImagePromptInput,
  subject: string,
): { prompt: string; negativePrompt: string } {
  const cv = categoryVisual(input.category);
  const negativePrompt = NEGATIVE_REQUIREMENTS.join(", ");
  const prompt = [
    `Subject: ${subject}.`,
    `Environment: ${cv.environment}.`,
    `Composition: ${HOUSE_VISUAL_STYLE}.`,
    `Lighting: cinematic soft studio lighting, gentle rim light, controlled contrast.`,
    `Camera: ${cv.camera}.`,
    `Editorial mood: ${HOUSE_MOOD}.`,
    `Aspect ratio ${input.aspectRatio ?? "16:9"}, wide landscape, thumbnail-safe framing.`,
    `Negative requirements: ${negativePrompt}.`,
  ].join(" ");
  return { prompt, negativePrompt };
}

export function buildImagePromptDeterministic(
  input: ImagePromptInput,
): ImagePromptResult {
  const subject = deterministicSubject(input);
  const { prompt, negativePrompt } = composePrompt(input, subject);
  const cv = categoryVisual(input.category);
  const altText = cleanAlt(
    `Abstract editorial illustration: ${subject.split(",")[0]}, set in ${cv.environment}`,
  );
  return { prompt, negativePrompt, altText, subject };
}

export async function buildImagePrompt(
  input: ImagePromptInput,
  client?: GeminiClient,
): Promise<ImagePromptResult> {
  if (!client) return buildImagePromptDeterministic(input);

  try {
    const res = await generateJson(
      client,
      [
        "You are an art director for a premium technology publication.",
        "Given an article, describe ONE strong focal visual subject for its featured illustration, and write concise, non-keyword-stuffed alt text.",
        "The subject must be abstract/conceptual — no fake UI, no logos, no readable text, no real people.",
        "",
        `Title: ${input.title}`,
        `Category: ${input.category ?? "technology"}`,
        `Summary: ${input.summary.slice(0, 600)}`,
        `Key entities (do not draw their logos): ${input.entities.slice(0, 5).join(", ") || "none"}`,
        `Category visual direction: ${categoryVisual(input.category).subject}`,
        input.visualConcept ? `Existing concept seed: ${input.visualConcept}` : "",
        "",
        'Return JSON: { "subject": string (one vivid sentence), "altText": string (<=160 chars, describes the image plainly) }',
      ]
        .filter(Boolean)
        .join("\n"),
      refineSchema,
      { purpose: "seo", temperature: 0.6 },
    );

    const { prompt, negativePrompt } = composePrompt(input, res.data.subject);
    return {
      prompt,
      negativePrompt,
      altText: cleanAlt(res.data.altText),
      subject: res.data.subject,
    };
  } catch {
    return buildImagePromptDeterministic(input);
  }
}
