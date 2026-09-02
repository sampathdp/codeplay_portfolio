/**
 * Shared retry-with-backoff for Gemini calls. Free-tier keys routinely
 * return 429 (rate limit) and 503 (model overload); these are transient
 * and worth retrying with exponential backoff + jitter.
 */

export function isTransientError(err: unknown): boolean {
  const m = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return (
    /\b(429|500|502|503|504)\b/.test(m) ||
    m.includes("unavailable") ||
    m.includes("resource_exhausted") ||
    m.includes("overloaded") ||
    m.includes("high demand") ||
    m.includes("try again") ||
    m.includes("deadline") ||
    m.includes("etimedout") ||
    m.includes("econnreset") ||
    m.includes("fetch failed")
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function retryTransient<T>(
  fn: () => Promise<T>,
  opts: { attempts?: number; label?: string; baseMs?: number; maxMs?: number } = {},
): Promise<T> {
  const attempts = Math.max(1, opts.attempts ?? 5);
  const baseMs = opts.baseMs ?? 2_000;
  const maxMs = opts.maxMs ?? 30_000;
  let lastErr: unknown;

  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i >= attempts || !isTransientError(err)) break;
      const wait = Math.min(maxMs, baseMs * 2 ** (i - 1)) + Math.random() * 1_000;
      console.warn(
        `${opts.label ?? "gemini"}: transient error (attempt ${i}/${attempts}), retrying in ${Math.round(wait)}ms`,
      );
      await sleep(wait);
    }
  }
  throw lastErr;
}
