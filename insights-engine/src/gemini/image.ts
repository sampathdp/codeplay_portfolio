/**
 * Gemini image generation — server-side only. The pipeline depends on the
 * `GeminiImageClient` interface; tests inject a mock and never call the
 * real API.
 *
 * Handles both surfaces of `@google/genai`:
 *   - Imagen models  (`imagen-*`)  → `models.generateImages`
 *   - Gemini image   (`gemini-*-image`) → `models.generateContent` with an
 *     IMAGE response modality; aspect ratio is steered via the prompt.
 */

import { GoogleGenAI } from "@google/genai";
import { GeminiError } from "./client";

export interface ImageRequest {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: string; // "16:9"
  model?: string;
}

export interface ImageResult {
  bytes: Buffer;
  mimeType: string;
  model: string;
  /** The model's rewritten/enhanced prompt, when returned. */
  revisedPrompt?: string;
}

export interface GeminiImageClient {
  generateImage(req: ImageRequest): Promise<ImageResult>;
}

function isImagen(model: string): boolean {
  return /^imagen/i.test(model);
}

export class RealGeminiImageClient implements GeminiImageClient {
  private readonly ai: GoogleGenAI;
  constructor(
    apiKey: string,
    private readonly defaultModel: string,
  ) {
    if (!apiKey) throw new GeminiError("Gemini API key is not set");
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateImage(req: ImageRequest): Promise<ImageResult> {
    const model = req.model ?? this.defaultModel;
    try {
      return isImagen(model)
        ? await this.viaImagen(model, req)
        : await this.viaGemini(model, req);
    } catch (err) {
      throw new GeminiError(
        `image generation failed (${model}): ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  private async viaImagen(model: string, req: ImageRequest): Promise<ImageResult> {
    const res = await this.ai.models.generateImages({
      model,
      prompt: req.prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: req.aspectRatio ?? "16:9",
        ...(req.negativePrompt ? { negativePrompt: req.negativePrompt } : {}),
      },
    });
    const img = res.generatedImages?.[0];
    const b64 = img?.image?.imageBytes;
    if (!b64) {
      throw new Error(img?.raiFilteredReason ?? "no image returned");
    }
    return {
      bytes: Buffer.from(b64, "base64"),
      mimeType: img?.image?.mimeType ?? "image/png",
      model,
      revisedPrompt: img?.enhancedPrompt,
    };
  }

  private async viaGemini(model: string, req: ImageRequest): Promise<ImageResult> {
    const prompt = [
      req.prompt,
      `Aspect ratio ${req.aspectRatio ?? "16:9"} (wide landscape).`,
      req.negativePrompt ? `Do not include: ${req.negativePrompt}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const res = await this.ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseModalities: ["IMAGE", "TEXT"] },
    });

    const parts = res.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      const inline = (part as { inlineData?: { data?: string; mimeType?: string } }).inlineData;
      if (inline?.data) {
        return {
          bytes: Buffer.from(inline.data, "base64"),
          mimeType: inline.mimeType ?? "image/png",
          model,
        };
      }
    }
    throw new Error("no inline image data in response");
  }
}

export function createGeminiImageClient(
  env: Record<string, string | undefined>,
  model: string,
): GeminiImageClient {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) throw new GeminiError("GEMINI_API_KEY is not set");
  return new RealGeminiImageClient(apiKey, model);
}
