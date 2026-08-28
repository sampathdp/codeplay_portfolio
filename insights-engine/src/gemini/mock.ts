/**
 * Scripted Gemini client for tests. Never touches the network.
 *
 * Provide either a `respond(prompt, opts)` function or a queue of canned
 * responses keyed by `purpose`. Records every call for assertions.
 */

import type {
  GeminiClient,
  GeminiGenerateOptions,
  GeminiResult,
} from "./types";
import type { GeminiImageClient, ImageRequest, ImageResult } from "./image";

export interface MockCall {
  prompt: string;
  opts: GeminiGenerateOptions;
}

export interface MockGeminiOptions {
  /** Full control: return the text (string) or a partial GeminiResult. */
  respond?: (
    prompt: string,
    opts: GeminiGenerateOptions,
  ) => string | Partial<GeminiResult>;
  /** Canned text per purpose (JSON strings for json:true calls). */
  byPurpose?: Partial<Record<GeminiGenerateOptions["purpose"], string | string[]>>;
  /** Fixed token usage per call. */
  usage?: { promptTokens: number; completionTokens: number };
  /** Throw on the Nth call (1-indexed) to exercise failure handling. */
  failOnCall?: number;
  model?: string;
}

export class MockGeminiClient implements GeminiClient {
  readonly calls: MockCall[] = [];
  private readonly cursor: Partial<Record<string, number>> = {};

  constructor(private readonly opts: MockGeminiOptions = {}) {}

  async generate(
    prompt: string,
    opts: GeminiGenerateOptions,
  ): Promise<GeminiResult> {
    this.calls.push({ prompt, opts });

    if (this.opts.failOnCall && this.calls.length === this.opts.failOnCall) {
      throw new Error(`mock gemini forced failure on call ${this.calls.length}`);
    }

    let text = "";
    if (this.opts.respond) {
      const out = this.opts.respond(prompt, opts);
      if (typeof out === "string") text = out;
      else {
        return {
          text: out.text ?? "",
          model: out.model ?? this.opts.model ?? "mock-model",
          usage:
            out.usage ??
            {
              promptTokens: this.opts.usage?.promptTokens ?? 400,
              completionTokens: this.opts.usage?.completionTokens ?? 700,
              totalTokens:
                (this.opts.usage?.promptTokens ?? 400) +
                (this.opts.usage?.completionTokens ?? 700),
            },
        };
      }
    } else {
      const canned = this.opts.byPurpose?.[opts.purpose];
      if (Array.isArray(canned)) {
        const i = this.cursor[opts.purpose] ?? 0;
        text = canned[Math.min(i, canned.length - 1)] ?? "";
        this.cursor[opts.purpose] = i + 1;
      } else {
        text = canned ?? "";
      }
    }

    const promptTokens = this.opts.usage?.promptTokens ?? Math.ceil(prompt.length / 4);
    const completionTokens = this.opts.usage?.completionTokens ?? Math.ceil(text.length / 4);
    return {
      text,
      model: opts.model ?? this.opts.model ?? "mock-model",
      usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens },
    };
  }
}

/** A tiny valid 2x2 PNG (base64) — enough for sharp to decode in tests. */
export const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAF0lEQVR4nGP8z8BQz0AEYCJG0aiiwaQIAHFGAgVJj1ZVAAAAAElFTkSuQmCC";

export interface MockImageOptions {
  bytes?: Buffer;
  mimeType?: string;
  model?: string;
  /** Throw on the Nth call (1-indexed). */
  failOnCall?: number;
  failWith?: string;
}

export class MockGeminiImageClient implements GeminiImageClient {
  readonly calls: ImageRequest[] = [];
  constructor(private readonly opts: MockImageOptions = {}) {}

  async generateImage(req: ImageRequest): Promise<ImageResult> {
    this.calls.push(req);
    if (this.opts.failWith) throw new Error(this.opts.failWith);
    if (this.opts.failOnCall && this.calls.length === this.opts.failOnCall) {
      throw new Error(`mock image gen forced failure on call ${this.calls.length}`);
    }
    return {
      bytes: this.opts.bytes ?? Buffer.from(TINY_PNG_BASE64, "base64"),
      mimeType: this.opts.mimeType ?? "image/png",
      model: req.model ?? this.opts.model ?? "mock-image-model",
    };
  }
}
