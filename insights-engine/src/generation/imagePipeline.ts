/**
 * Featured-image generation pipeline.
 *
 *   prompt (deterministic + optional Gemini subject)
 *   → Gemini image call
 *       └─ failure → category fallback SVG (publish never crashes)
 *   → optimise to 16:9 WebP variants (sharp)
 *   → store every variant in permanent object storage
 *   → metadata (url, prompt, model, size, alt text, dimensions)
 *
 * A manual image is never touched unless `force` is set.
 */

import type { GeminiClient } from "../gemini/types";
import type { GeminiImageClient } from "../gemini/image";
import { GeminiError } from "../gemini/client";
import type { UsageRecord } from "../gemini/budget";
import type { ImageProcessor, VariantSpec } from "../storage/processor";
import { DEFAULT_VARIANTS } from "../storage/processor";
import type { ImageStore, StoredObject } from "../storage/images";
import { buildImagePrompt, composePrompt } from "./imagePrompt";
import { fallbackSvg, fallbackAlt } from "./imageFallback";

export interface ImagePipelineDeps {
  imageClient: GeminiImageClient;
  processor: ImageProcessor;
  store: ImageStore;
  /** Budgeted text client for the subject-refinement step (optional). */
  textClient?: GeminiClient;
  onUsage?: (r: UsageRecord) => void;
  now?: Date;
}

export interface ImagePipelineInput {
  slug: string;
  title: string;
  category: string | null;
  summary: string;
  entities: string[];
  visualConcept?: string;
  /** Admin-edited full prompt override. */
  promptOverride?: string | null;
  aspectRatio?: string;
  variants?: VariantSpec[];
  webpQuality?: number;
  imageModel: string;
  imagePricingUsd?: Record<string, number>;
  isManual?: boolean;
  force?: boolean;
}

export interface StoredVariant {
  label: string;
  url: string;
  storagePath: string;
  contentType: string;
  width: number;
  height: number;
  bytes: number;
  isPrimary: boolean;
}

export type ImageStatus = "generated" | "fallback" | "skipped_manual" | "failed";

export interface ImageOutcome {
  status: ImageStatus;
  reason?: string;
  prompt: string;
  negativePrompt: string;
  altText: string;
  model: string | null;
  aiGenerated: boolean;
  primary: StoredVariant | null;
  variants: StoredVariant[];
  width: number | null;
  height: number | null;
  bytes: number | null;
  generatedAt: string;
}

function imageCost(model: string, pricing?: Record<string, number>): number {
  if (!pricing) return 0;
  return pricing[model] ?? pricing.default ?? 0;
}

export async function generateFeaturedImage(
  deps: ImagePipelineDeps,
  input: ImagePipelineInput,
): Promise<ImageOutcome> {
  const now = deps.now ?? new Date();
  const generatedAt = now.toISOString();

  if (input.isManual && !input.force) {
    return {
      status: "skipped_manual",
      reason: "article has a manual image; not replacing",
      prompt: input.promptOverride ?? "",
      negativePrompt: "",
      altText: "",
      model: null,
      aiGenerated: false,
      primary: null,
      variants: [],
      width: null,
      height: null,
      bytes: null,
      generatedAt,
    };
  }

  // 1. prompt
  let prompt: string;
  let negativePrompt: string;
  let altText: string;
  if (input.promptOverride && input.promptOverride.trim().length > 20) {
    const composed = composePrompt(
      {
        title: input.title,
        category: input.category,
        summary: input.summary,
        entities: input.entities,
        aspectRatio: input.aspectRatio,
      },
      input.promptOverride.trim(),
    );
    prompt = input.promptOverride.trim();
    negativePrompt = composed.negativePrompt;
    altText = `Editorial illustration for: ${input.title}`.slice(0, 180);
  } else {
    const p = await buildImagePrompt(
      {
        title: input.title,
        category: input.category,
        summary: input.summary,
        entities: input.entities,
        visualConcept: input.visualConcept,
        aspectRatio: input.aspectRatio,
      },
      deps.textClient,
    );
    prompt = p.prompt;
    negativePrompt = p.negativePrompt;
    altText = p.altText;
  }

  const specs = input.variants?.length ? input.variants : DEFAULT_VARIANTS;
  const quality = input.webpQuality ?? 82;

  // 2. generate
  let bytes: Buffer;
  let mimeType: string;
  let usedModel: string;
  try {
    const img = await deps.imageClient.generateImage({
      prompt,
      negativePrompt,
      aspectRatio: input.aspectRatio ?? "16:9",
      model: input.imageModel,
    });
    bytes = img.bytes;
    mimeType = img.mimeType;
    usedModel = img.model;
    deps.onUsage?.({
      purpose: "image",
      model: usedModel,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      costUsd: imageCost(usedModel, input.imagePricingUsd),
      status: "ok",
    });
  } catch (err) {
    const reason = err instanceof GeminiError || err instanceof Error ? err.message : String(err);
    deps.onUsage?.({
      purpose: "image",
      model: input.imageModel,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      costUsd: 0,
      status: "error",
      error: reason,
    });
    return buildFallback(deps, input, now, generatedAt, prompt, negativePrompt, reason);
  }

  // 3. optimise + 4. store
  try {
    const processed = await deps.processor.process(bytes, mimeType, specs, quality);
    const stored: StoredVariant[] = [];
    for (const v of processed.variants) {
      const name = `${v.label}.webp`;
      const obj = await deps.store.put(input.slug, name, v.bytes, v.contentType, now);
      stored.push(toStoredVariant(v.label, obj, v, v.label === processed.primary.label));
    }
    const primary = stored.find((v) => v.isPrimary) ?? stored[0] ?? null;
    return {
      status: "generated",
      prompt,
      negativePrompt,
      altText,
      model: usedModel,
      aiGenerated: true,
      primary,
      variants: stored,
      width: primary?.width ?? processed.sourceWidth,
      height: primary?.height ?? processed.sourceHeight,
      bytes: primary?.bytes ?? bytes.length,
      generatedAt,
    };
  } catch (err) {
    const reason = `storage/processing failed: ${err instanceof Error ? err.message : String(err)}`;
    return buildFallback(deps, input, now, generatedAt, prompt, negativePrompt, reason);
  }
}

async function buildFallback(
  deps: ImagePipelineDeps,
  input: ImagePipelineInput,
  now: Date,
  generatedAt: string,
  prompt: string,
  negativePrompt: string,
  reason: string,
): Promise<ImageOutcome> {
  const svg = fallbackSvg(input.category, input.slug);
  const alt = fallbackAlt(input.category);
  try {
    const obj = await deps.store.put(
      input.slug,
      "fallback.svg",
      Buffer.from(svg, "utf8"),
      "image/svg+xml",
      now,
    );
    const variant: StoredVariant = {
      label: "fallback",
      url: obj.url,
      storagePath: obj.path,
      contentType: "image/svg+xml",
      width: 1600,
      height: 900,
      bytes: obj.size,
      isPrimary: true,
    };
    return {
      status: "fallback",
      reason,
      prompt,
      negativePrompt,
      altText: alt,
      model: null,
      aiGenerated: false,
      primary: variant,
      variants: [variant],
      width: 1600,
      height: 900,
      bytes: obj.size,
      generatedAt,
    };
  } catch (err) {
    return {
      status: "failed",
      reason: `${reason}; fallback storage also failed: ${
        err instanceof Error ? err.message : String(err)
      }`,
      prompt,
      negativePrompt,
      altText: alt,
      model: null,
      aiGenerated: false,
      primary: null,
      variants: [],
      width: null,
      height: null,
      bytes: null,
      generatedAt,
    };
  }
}

function toStoredVariant(
  label: string,
  obj: StoredObject,
  dims: { width: number; height: number; size: number; contentType: string },
  isPrimary: boolean,
): StoredVariant {
  return {
    label,
    url: obj.url,
    storagePath: obj.path,
    contentType: dims.contentType,
    width: dims.width,
    height: dims.height,
    bytes: dims.size,
    isPrimary,
  };
}
