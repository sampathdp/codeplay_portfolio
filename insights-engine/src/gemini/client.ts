/**
 * Real Gemini client — the ONLY module that imports `@google/genai` or
 * reads `GEMINI_API_KEY`. Server-side only; never bundled for the browser.
 *
 * Model IDs are never hardcoded here — they come from config
 * (`GEMINI_TEXT_MODEL` / `GEMINI_FAST_MODEL` / `GEMINI_IMAGE_MODEL`), which
 * ships real defaults in `../config`.
 */

import { GoogleGenAI } from "@google/genai";
import type {
  GeminiClient,
  GeminiGenerateOptions,
  GeminiModelConfig,
  GeminiResult,
} from "./types";
import { modelForPurpose } from "./types";
import { retryTransient } from "./retry";

export class GeminiError extends Error {}

export interface RealGeminiOptions {
  apiKey: string;
  models: GeminiModelConfig;
  defaultMaxOutputTokens?: number;
  /** Max attempts per call for transient errors (429 / 5xx). Default 5. */
  maxAttempts?: number;
}

export class RealGeminiClient implements GeminiClient {
  private readonly ai: GoogleGenAI;
  private readonly models: GeminiModelConfig;
  private readonly defaultMax: number;
  private readonly maxAttempts: number;

  constructor(opts: RealGeminiOptions) {
    if (!opts.apiKey) throw new GeminiError("GEMINI_API_KEY is not set");
    this.ai = new GoogleGenAI({ apiKey: opts.apiKey });
    this.models = opts.models;
    this.defaultMax = opts.defaultMaxOutputTokens ?? 8192;
    this.maxAttempts = Math.max(1, opts.maxAttempts ?? 5);
  }

  async generate(
    prompt: string,
    opts: GeminiGenerateOptions,
  ): Promise<GeminiResult> {
    const model = opts.model ?? modelForPurpose(opts.purpose, this.models);

    let res;
    try {
      res = await retryTransient(
        () =>
          this.ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction: opts.system,
              temperature: opts.temperature ?? 0.5,
              maxOutputTokens: opts.maxOutputTokens ?? this.defaultMax,
              ...(opts.json ? { responseMimeType: "application/json" } : {}),
            },
          }),
        { attempts: this.maxAttempts, label: `Gemini ${model}/${opts.purpose}` },
      );
    } catch (err) {
      throw new GeminiError(
        `Gemini request failed (${model}, ${opts.purpose}): ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }

    const text = res.text ?? "";
    const u = res.usageMetadata ?? {};
    return {
      text,
      model,
      finishReason: res.candidates?.[0]?.finishReason as string | undefined,
      usage: {
        promptTokens: u.promptTokenCount ?? 0,
        completionTokens: u.candidatesTokenCount ?? 0,
        totalTokens:
          u.totalTokenCount ??
          (u.promptTokenCount ?? 0) + (u.candidatesTokenCount ?? 0),
      },
    };
  }
}

export function createGeminiClient(
  env: Record<string, string | undefined>,
  models: GeminiModelConfig,
): GeminiClient {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) throw new GeminiError("GEMINI_API_KEY is not set");
  return new RealGeminiClient({ apiKey, models });
}
