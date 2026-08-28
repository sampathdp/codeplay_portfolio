/**
 * JSON-mode Gemini calls with strict validation. Malformed or
 * schema-invalid output is retried ONCE with a repair prompt; if it still
 * fails the caller gets an error and nothing partial is ever stored.
 */

import type { ZodType } from "zod";
import type { GeminiClient, GeminiGenerateOptions, GeminiUsage } from "./types";

export class GeminiJsonError extends Error {
  constructor(
    message: string,
    readonly raw?: string,
  ) {
    super(message);
    this.name = "GeminiJsonError";
  }
}

function extractJson(text: string): string {
  const t = text.trim();
  // strip ```json fences
  const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  // else take the outermost {...} or [...]
  const first = t.search(/[[{]/);
  const lastObj = t.lastIndexOf("}");
  const lastArr = t.lastIndexOf("]");
  const last = Math.max(lastObj, lastArr);
  if (first >= 0 && last > first) return t.slice(first, last + 1);
  return t;
}

export interface GenerateJsonResult<T> {
  data: T;
  usage: GeminiUsage;
  model: string;
  attempts: number;
}

export async function generateJson<T>(
  client: GeminiClient,
  prompt: string,
  schema: ZodType<T>,
  opts: GeminiGenerateOptions,
): Promise<GenerateJsonResult<T>> {
  const totals: GeminiUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  let model = "";
  let lastRaw = "";
  let lastErr = "";

  for (let attempt = 1; attempt <= 2; attempt++) {
    const p =
      attempt === 1
        ? prompt
        : `${prompt}\n\n---\nYour previous response could not be used:\n${lastErr}\n\nPrevious response:\n${lastRaw}\n\nReturn ONLY corrected, valid JSON that satisfies the required shape. No prose, no markdown fences.`;

    const res = await client.generate(p, { ...opts, json: true });
    model = res.model;
    totals.promptTokens += res.usage.promptTokens;
    totals.completionTokens += res.usage.completionTokens;
    totals.totalTokens += res.usage.totalTokens;
    lastRaw = res.text;

    let parsed: unknown;
    try {
      parsed = JSON.parse(extractJson(res.text));
    } catch (e) {
      lastErr = `invalid JSON: ${e instanceof Error ? e.message : String(e)}`;
      continue;
    }

    const check = schema.safeParse(parsed);
    if (check.success) {
      return { data: check.data, usage: totals, model, attempts: attempt };
    }
    lastErr = `schema validation failed: ${check.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .slice(0, 12)
      .join("; ")}`;
  }

  throw new GeminiJsonError(
    `Gemini did not return valid JSON for ${opts.purpose} after 2 attempts — ${lastErr}`,
    lastRaw,
  );
}
