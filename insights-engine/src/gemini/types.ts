/**
 * Gemini client contract. The generation pipeline depends only on this
 * interface, so tests inject a mock and never make a real paid call.
 * The real implementation (`client.ts`) is the only place `@google/genai`
 * and `GEMINI_API_KEY` are touched, and it is server-side only.
 */

export interface GeminiUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface GeminiResult {
  text: string;
  model: string;
  usage: GeminiUsage;
  finishReason?: string;
}

export interface GeminiGenerateOptions {
  /** Logical step name — used for cost logging and per-step model choice. */
  purpose:
    | "research_bundle"
    | "source_verification"
    | "outline"
    | "draft"
    | "fact_check"
    | "seo"
    | "headlines"
    | "quality"
    | "improve_title"
    | "improve_seo"
    | "regenerate_summary"
    | "regenerate_section";
  system?: string;
  temperature?: number;
  maxOutputTokens?: number;
  /** Ask the model for `application/json`. */
  json?: boolean;
  /** Explicit model override (otherwise chosen from config by purpose). */
  model?: string;
}

export interface GeminiClient {
  generate(prompt: string, opts: GeminiGenerateOptions): Promise<GeminiResult>;
}

export interface GeminiModelConfig {
  /** High-quality model for outline + draft. */
  textModel: string;
  /** Cheaper model for research synthesis, fact-check, SEO, quality. */
  fastModel: string;
  /** Image model (Phase 5 — not used yet). */
  imageModel: string;
}

/** Steps that should use the cheaper/faster model. */
export const FAST_PURPOSES: ReadonlySet<GeminiGenerateOptions["purpose"]> =
  new Set([
    "research_bundle",
    "source_verification",
    "fact_check",
    "seo",
    "headlines",
    "quality",
    "improve_title",
    "improve_seo",
    "regenerate_summary",
  ]);

export function modelForPurpose(
  purpose: GeminiGenerateOptions["purpose"],
  cfg: GeminiModelConfig,
): string {
  return FAST_PURPOSES.has(purpose) ? cfg.fastModel : cfg.textModel;
}
