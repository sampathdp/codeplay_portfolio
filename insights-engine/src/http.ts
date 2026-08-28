/**
 * Bounded HTTP client for source adapters.
 *
 * - per-request timeout via AbortController
 * - retries with exponential backoff + jitter (429 / 5xx / network)
 * - per-host minimum interval (politeness / rate-limit respect)
 * - structured logging
 *
 * Uses the global `fetch` (Node 20+ / Deno), so no dependency.
 */

import type { EngineConfig } from "./config";

export type Logger = (msg: string, extra?: Record<string, unknown>) => void;

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly url?: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export interface HttpClient {
  text(url: string, init?: RequestInit): Promise<string>;
  json<T = unknown>(url: string, init?: RequestInit): Promise<T>;
}

export function createHttpClient(
  cfg: EngineConfig["http"],
  log: Logger = () => {},
  fetchImpl: typeof fetch = fetch,
): HttpClient {
  const lastHit = new Map<string, number>();

  async function throttle(url: string): Promise<void> {
    const host = hostOf(url);
    const now = Date.now();
    const wait = (lastHit.get(host) ?? 0) + cfg.minHostIntervalMs - now;
    if (wait > 0) await sleep(wait);
    lastHit.set(host, Date.now());
  }

  async function request(url: string, init: RequestInit = {}): Promise<Response> {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= cfg.retries; attempt++) {
      if (attempt > 0) {
        const backoff = Math.min(
          cfg.backoffMaxMs,
          cfg.backoffBaseMs * 2 ** (attempt - 1),
        );
        const jitter = Math.random() * backoff * 0.3;
        log("http.retry", { url, attempt, waitMs: Math.round(backoff + jitter) });
        await sleep(backoff + jitter);
      }

      await throttle(url);
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), cfg.timeoutMs);
      try {
        const res = await fetchImpl(url, {
          ...init,
          signal: ac.signal,
          headers: {
            "user-agent": cfg.userAgent,
            accept: "application/json, application/rss+xml, application/atom+xml, text/xml, */*",
            ...(init.headers ?? {}),
          },
        });
        clearTimeout(timer);

        if (res.status === 429 || res.status >= 500) {
          lastErr = new HttpError(`upstream ${res.status}`, res.status, url);
          // Honor Retry-After when present.
          const ra = Number(res.headers.get("retry-after"));
          if (Number.isFinite(ra) && ra > 0) await sleep(Math.min(ra * 1000, cfg.backoffMaxMs));
          continue;
        }
        if (!res.ok) {
          throw new HttpError(`upstream ${res.status}`, res.status, url);
        }
        return res;
      } catch (err) {
        clearTimeout(timer);
        lastErr = err;
        const status = err instanceof HttpError ? err.status : undefined;
        // 4xx (other than 429) is not retryable.
        if (status && status < 500 && status !== 429) throw err;
      }
    }
    throw lastErr instanceof Error
      ? lastErr
      : new HttpError(`request failed: ${url}`, undefined, url);
  }

  return {
    async text(url, init) {
      const res = await request(url, init);
      return res.text();
    },
    async json<T>(url: string, init?: RequestInit) {
      const res = await request(url, init);
      return (await res.json()) as T;
    },
  };
}
