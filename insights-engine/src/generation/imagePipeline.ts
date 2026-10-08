/**
 * Featured-image generation pipeline.
 *
 *   source article lead image (og:image of the pages the story came from)
 *       └─ miss → continue
 *   prompt (deterministic + optional Gemini subject)
 *   → Gemini image call
 *       └─ failure → stock photo (Pexels), then category fallback SVG
 *          (publish never crashes)
 *   → optimise to 16:9 WebP variants (sharp)
 *   → store every variant in permanent object storage
 *   → metadata (url, prompt, model, size, alt text, dimensions, credit)
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
import {
  NullStockImageClient,
  type StockImageClient,
  type StockImageCredit,
} from "./stockImage";
import {
  NullSourceImageClient,
  type SourceImageClient,
  type SourceImageCredit,
  type SourceRef,
} from "./sourceImage";

/** Smallest source image width worth upscaling into a 1600px hero. */
const MIN_SOURCE_WIDTH = 600;

export interface ImagePipelineDeps {
  imageClient: GeminiImageClient;
  processor: ImageProcessor;
  store: ImageStore;
  /** Real-photo fallback source. Defaults to a no-op client. */
  stockClient?: StockImageClient;
  /** Publisher lead-image source. Defaults to a no-op client. */
  sourceClient?: SourceImageClient;
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
  /** Source pages the article was written from (lead-image tier). */
  sources?: SourceRef[];
  /** Try the source lead image before AI generation. Default true. */
  preferSourceImage?: boolean;
  /** Stock photo pages / source image URLs already used elsewhere. */
  excludeStockUrls?: string[];
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

export type ImageStatus =
  | "generated"
  | "stock"
  | "fallback"
  | "skipped_manual"
  | "failed";

export interface ImageOutcome {
  status: ImageStatus;
  reason?: string;
  prompt: string;
  negativePrompt: string;
  altText: string;
  model: string | null;
  aiGenerated: boolean;
  /** Attribution for a stock / source photo; null for generated / SVG. */
  credit: StockImageCredit | SourceImageCredit | null;
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
      credit: null,
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

  // 1b. the story's own lead image beats anything we could generate or search
  if (input.preferSourceImage !== false && input.sources?.length) {
    const fromSource = await trySourceImage(deps, input, now, generatedAt, prompt, negativePrompt);
    if (fromSource) return fromSource;
  }

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
    return buildNonGeneratedImage(deps, input, now, generatedAt, prompt, negativePrompt, reason);
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
      credit: null,
      primary,
      variants: stored,
      width: primary?.width ?? processed.sourceWidth,
      height: primary?.height ?? processed.sourceHeight,
      bytes: primary?.bytes ?? bytes.length,
      generatedAt,
    };
  } catch (err) {
    const reason = `storage/processing failed: ${err instanceof Error ? err.message : String(err)}`;
    return buildNonGeneratedImage(deps, input, now, generatedAt, prompt, negativePrompt, reason);
  }
}

/**
 * Generation failed. Try a real stock photo first; if that misses (no
 * key, no match, download error) drop to the deterministic category SVG.
 * Never throws — publish must not crash on an image.
 */
async function buildNonGeneratedImage(
  deps: ImagePipelineDeps,
  input: ImagePipelineInput,
  now: Date,
  generatedAt: string,
  prompt: string,
  negativePrompt: string,
  reason: string,
): Promise<ImageOutcome> {
  const stock = await tryStockImage(deps, input, now, generatedAt, prompt, negativePrompt, reason);
  if (stock) return stock;

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
      credit: null,
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
      credit: null,
      primary: null,
      variants: [],
      width: null,
      height: null,
      bytes: null,
      generatedAt,
    };
  }
}

/**
 * Attempt the stock-photo tier. Returns a full outcome on success, or null
 * to signal "fall through to the SVG". Swallows every error.
 */
async function tryStockImage(
  deps: ImagePipelineDeps,
  input: ImagePipelineInput,
  now: Date,
  generatedAt: string,
  prompt: string,
  negativePrompt: string,
  reason: string,
): Promise<ImageOutcome | null> {
  const client = deps.stockClient ?? new NullStockImageClient();
  const specs = input.variants?.length ? input.variants : DEFAULT_VARIANTS;
  const quality = input.webpQuality ?? 82;

  let photo;
  try {
    photo = await client.find({
      title: input.title,
      category: input.category,
      entities: input.entities,
      visualConcept: input.visualConcept,
      excludeSourceUrls: input.excludeStockUrls,
    });
  } catch (err) {
    deps.onUsage?.({
      purpose: "image",
      model: "pexels",
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      costUsd: 0,
      status: "error",
      error: `stock lookup failed: ${err instanceof Error ? err.message : String(err)}`,
    });
    return null;
  }
  if (!photo) return null;

  try {
    const processed = await deps.processor.process(photo.bytes, photo.mimeType, specs, quality);
    const stored: StoredVariant[] = [];
    for (const v of processed.variants) {
      const obj = await deps.store.put(input.slug, `${v.label}.webp`, v.bytes, v.contentType, now);
      stored.push(toStoredVariant(v.label, obj, v, v.label === processed.primary.label));
    }
    const primary = stored.find((v) => v.isPrimary) ?? stored[0] ?? null;
    const altText = (
      photo.description?.trim() || `Photograph illustrating: ${input.title}`
    ).slice(0, 180);

    deps.onUsage?.({
      purpose: "image",
      model: "pexels",
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      costUsd: 0,
      status: "ok",
    });

    return {
      status: "stock",
      reason: `generation unavailable (${reason}); used ${photo.credit.provider} stock photo`,
      prompt,
      negativePrompt,
      altText,
      model: photo.credit.provider,
      aiGenerated: false,
      credit: photo.credit,
      primary,
      variants: stored,
      width: primary?.width ?? processed.sourceWidth,
      height: primary?.height ?? processed.sourceHeight,
      bytes: primary?.bytes ?? photo.bytes.length,
      generatedAt,
    };
  } catch (err) {
    deps.onUsage?.({
      purpose: "image",
      model: "pexels",
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      costUsd: 0,
      status: "error",
      error: `stock processing failed: ${err instanceof Error ? err.message : String(err)}`,
    });
    return null;
  }
}

/**
 * Attempt the publisher lead-image tier. Returns null on any miss (no
 * sources, no og:image, too small, download/processing error).
 */
async function trySourceImage(
  deps: ImagePipelineDeps,
  input: ImagePipelineInput,
  now: Date,
  generatedAt: string,
  prompt: string,
  negativePrompt: string,
): Promise<ImageOutcome | null> {
  const client = deps.sourceClient ?? new NullSourceImageClient();
  const specs = input.variants?.length ? input.variants : DEFAULT_VARIANTS;
  const quality = input.webpQuality ?? 82;

  let photo;
  try {
    photo = await client.find({
      sources: input.sources ?? [],
      excludeImageUrls: input.excludeStockUrls,
    });
  } catch {
    return null;
  }
  if (!photo) return null;

  try {
    const processed = await deps.processor.process(photo.bytes, photo.mimeType, specs, quality);
    if (processed.sourceWidth < MIN_SOURCE_WIDTH) return null;
    const stored: StoredVariant[] = [];
    for (const v of processed.variants) {
      const obj = await deps.store.put(input.slug, `${v.label}.webp`, v.bytes, v.contentType, now);
      stored.push(toStoredVariant(v.label, obj, v, v.label === processed.primary.label));
    }
    const primary = stored.find((v) => v.isPrimary) ?? stored[0] ?? null;
    const altText = (photo.description?.trim() || `Image for: ${input.title}`).slice(0, 180);

    return {
      status: "stock",
      reason: `used lead image from ${photo.credit.photographer}`,
      prompt,
      negativePrompt,
      altText,
      model: "source",
      aiGenerated: false,
      credit: photo.credit,
      primary,
      variants: stored,
      width: primary?.width ?? processed.sourceWidth,
      height: primary?.height ?? processed.sourceHeight,
      bytes: primary?.bytes ?? photo.bytes.length,
      generatedAt,
    };
  } catch {
    return null;
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
