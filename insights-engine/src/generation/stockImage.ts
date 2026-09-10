/**
 * Stock-photo fallback source. When Gemini image generation fails or is
 * content-filtered, the pipeline tries a real editorial photograph before
 * dropping to the deterministic SVG.
 *
 * Backed by Pexels (https://www.pexels.com/api/) — free, generous rate
 * limits, no attribution *required* by licence but we surface a credit
 * anyway. Set `PEXELS_API_KEY` to enable; without it the pipeline simply
 * skips this tier.
 *
 * The returned bytes are fed through the same sharp pipeline as a
 * generated image, so the output is identical 16:9 WebP variants.
 */

import { retryTransient } from "../gemini/retry";
import { categoryVisual } from "./imageStyle";

export interface StockImageCredit {
  provider: "pexels";
  photographer: string;
  photographerUrl: string;
  /** The photo's page on the provider — where a credit link should point. */
  sourceUrl: string;
}

export interface StockImage {
  bytes: Buffer;
  mimeType: string;
  credit: StockImageCredit;
  /** The provider's own alt/description text, when present. */
  description?: string;
}

export interface StockImageQuery {
  title: string;
  category: string | null;
  entities: string[];
  visualConcept?: string;
}

export interface StockImageClient {
  /** Resolve one landscape photo for the query, or null if none fits. */
  find(query: StockImageQuery): Promise<StockImage | null>;
}

/** No-op client used when no provider key is configured. */
export class NullStockImageClient implements StockImageClient {
  async find(_query: StockImageQuery): Promise<StockImage | null> {
    return null;
  }
}

// Per-category search terms. Kept short and concrete — stock search engines
// reward plain nouns over the art-direction prose used for generation.
const CATEGORY_TERMS: Record<string, string> = {
  "artificial-intelligence": "artificial intelligence technology abstract",
  "software-development": "software developer code screen",
  "web-development": "web development workspace laptop",
  "mobile-development": "smartphone mobile app technology",
  "game-development": "game development studio computer",
  gaming: "gaming setup controller neon",
  "gaming-community": "esports gaming event crowd",
  cybersecurity: "cybersecurity network servers dark",
  "cloud-and-devops": "data center server room",
  "developer-tools": "developer desk keyboard terminal",
  "hardware-and-gpus": "computer hardware circuit board macro",
  startups: "startup office team workspace",
  saas: "software business dashboard laptop",
  "big-tech": "modern tech office architecture",
  "open-source": "collaboration developers teamwork",
  "emerging-technology": "futuristic technology robotics",
};

/** Build a stock-search string from the article context. */
export function stockQuery(q: StockImageQuery): string {
  const base =
    (q.category && CATEGORY_TERMS[q.category]) ||
    `${categoryVisual(q.category).subject.split(",")[0]}`;
  return base.trim();
}

interface PexelsPhoto {
  url: string;
  photographer: string;
  photographer_url: string;
  alt?: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    landscape: string;
  };
}

interface PexelsSearchResponse {
  photos?: PexelsPhoto[];
}

const PEXELS_ENDPOINT = "https://api.pexels.com/v1/search";

export class PexelsStockImageClient implements StockImageClient {
  constructor(
    private readonly apiKey: string,
    private readonly timeoutMs = 15_000,
  ) {}

  async find(query: StockImageQuery): Promise<StockImage | null> {
    const q = stockQuery(query);

    // Keep retries short — this runs inside the article pipeline and a stock
    // photo is itself a fallback; a slow retry storm is worse than the SVG.
    const retryOpts = { attempts: 2, baseMs: 500, maxMs: 2_000 };

    const photo = await retryTransient(
      () => this.search(q),
      { ...retryOpts, label: `Pexels search "${q}"` },
    );
    if (!photo) return null;

    // Prefer a purpose-cropped landscape, fall back to the biggest source.
    const imgUrl =
      photo.src.landscape || photo.src.large2x || photo.src.large || photo.src.original;
    const bytes = await retryTransient(
      () => this.download(imgUrl),
      { ...retryOpts, label: "Pexels download" },
    );

    return {
      bytes,
      mimeType: "image/jpeg",
      description: photo.alt,
      credit: {
        provider: "pexels",
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        sourceUrl: photo.url,
      },
    };
  }

  private async search(q: string): Promise<PexelsPhoto | null> {
    const url = `${PEXELS_ENDPOINT}?query=${encodeURIComponent(
      q,
    )}&orientation=landscape&size=large&per_page=15`;
    const res = await this.fetchWithTimeout(url, {
      headers: { Authorization: this.apiKey },
    });
    if (!res.ok) {
      throw new Error(`Pexels search ${res.status} ${res.statusText}`);
    }
    const body = (await res.json()) as PexelsSearchResponse;
    const photos = body.photos ?? [];
    if (!photos.length) return null;
    // Deterministic pick: first result is Pexels' best relevance match.
    return photos[0];
  }

  private async download(url: string): Promise<Buffer> {
    const res = await this.fetchWithTimeout(url);
    if (!res.ok) {
      throw new Error(`Pexels download ${res.status} ${res.statusText}`);
    }
    return Buffer.from(await res.arrayBuffer());
  }

  private async fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), this.timeoutMs);
    try {
      return await fetch(url, { ...init, signal: ctrl.signal });
    } finally {
      clearTimeout(t);
    }
  }
}

export function createStockImageClient(
  env: Record<string, string | undefined>,
): StockImageClient {
  const key = env.PEXELS_API_KEY;
  return key ? new PexelsStockImageClient(key) : new NullStockImageClient();
}
