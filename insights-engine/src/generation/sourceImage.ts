/**
 * Source-image tier. The article was written from real source pages
 * (RSS / HN / release links gathered at discovery time); the publisher's
 * own lead image (`og:image` / `twitter:image`) is by far the most
 * relevant picture for the story — far better than a keyword-matched
 * stock photo.
 *
 * We fetch each source page's <head>, read the declared share image,
 * download it, and hand the bytes to the same sharp pipeline as every
 * other tier. The image is credited to the publisher and linked back to
 * the source article.
 *
 * Only primary / official sources are used (press-reuse images); news-site
 * images are skipped as a copyright risk. Aggregator pages (Reddit, HN,
 * GitHub) are skipped: their share images are generic site cards.
 */

import { retryTransient } from "../gemini/retry";

export interface SourceImageCredit {
  provider: "source";
  /** Publisher name shown in the credit ("Image: The Verge"). */
  photographer: string;
  /** The source article — where the credit link points. */
  photographerUrl: string;
  /** The image URL itself; used to avoid re-using one image across posts. */
  sourceUrl: string;
}

export interface SourceRef {
  name: string;
  url: string;
  primary?: boolean;
  official?: boolean;
}

export interface SourceImage {
  bytes: Buffer;
  mimeType: string;
  credit: SourceImageCredit;
  description?: string;
}

export interface SourceImageQuery {
  sources: SourceRef[];
  /** Image URLs already used by other articles; skipped. */
  excludeImageUrls?: string[];
}

export interface SourceImageClient {
  find(query: SourceImageQuery): Promise<SourceImage | null>;
}

export class NullSourceImageClient implements SourceImageClient {
  async find(_query: SourceImageQuery): Promise<SourceImage | null> {
    return null;
  }
}

/** Hosts whose share image is a generic site card, not a story image. */
const SKIP_HOSTS = [
  "reddit.com",
  "redd.it",
  "news.ycombinator.com",
  "github.com",
  "twitter.com",
  "x.com",
  "youtube.com",
  "youtu.be",
];

/** URL fragments that mark a logo / placeholder rather than a lead image. */
const JUNK_IMAGE = /(logo|favicon|sprite|placeholder|default[-_]?(og|share|image)|blank\.|avatar|icon[-_.])/i;

/** Smallest acceptable download — share-card logos are usually tiny. */
const MIN_BYTES = 15_000;
const MAX_BYTES = 12_000_000;
const MAX_HTML = 400_000;

function hostOf(url: string): string {
  try {
    return new URL(url).host.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

function isSkippedHost(url: string): boolean {
  const h = hostOf(url);
  return !h || SKIP_HOSTS.some((s) => h === s || h.endsWith(`.${s}`));
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function attr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  if (!m) return null;
  return decodeEntities((m[2] ?? m[3] ?? m[4] ?? "").trim());
}

/**
 * Pull the declared lead image + alt text out of a page's HTML. Order of
 * preference: og:image:secure_url, og:image, twitter:image, image_src.
 * Relative URLs resolve against `pageUrl`.
 */
export function extractLeadImage(
  html: string,
  pageUrl: string,
): { url: string; alt?: string } | null {
  const head = html.slice(0, MAX_HTML);
  const metas = head.match(/<meta\b[^>]*>/gi) ?? [];
  const byKey = new Map<string, string>();
  for (const tag of metas) {
    const key = (attr(tag, "property") ?? attr(tag, "name") ?? "").toLowerCase();
    const content = attr(tag, "content");
    if (key && content && !byKey.has(key)) byKey.set(key, content);
  }
  const link = (head.match(/<link\b[^>]*rel\s*=\s*["']?image_src["']?[^>]*>/i) ?? [])[0];

  const candidate =
    byKey.get("og:image:secure_url") ||
    byKey.get("og:image") ||
    byKey.get("og:image:url") ||
    byKey.get("twitter:image") ||
    byKey.get("twitter:image:src") ||
    (link ? attr(link, "href") : null);
  if (!candidate) return null;

  let resolved: string;
  try {
    resolved = new URL(candidate, pageUrl).toString();
  } catch {
    return null;
  }
  if (!/^https?:/i.test(resolved) || JUNK_IMAGE.test(resolved)) return null;

  const alt = byKey.get("og:image:alt") || byKey.get("twitter:image:alt") || undefined;
  return { url: resolved, alt };
}

/**
 * Only primary / official sources (company newsrooms, press releases,
 * release notes) — their images are published for press reuse. Third-party
 * news images are often agency-licensed (Getty / AP) and are never used.
 * Primary first, then official; aggregator hosts dropped.
 */
export function orderSources(sources: SourceRef[]): SourceRef[] {
  const seen = new Set<string>();
  return sources
    .filter((s) => s.primary || s.official)
    .filter((s) => s.url && !isSkippedHost(s.url))
    .filter((s) => (seen.has(s.url) ? false : (seen.add(s.url), true)))
    .map((s, i) => ({ s, i, rank: (s.primary ? 2 : 0) + (s.official ? 1 : 0) }))
    .sort((a, b) => b.rank - a.rank || a.i - b.i)
    .map((x) => x.s);
}

const UA =
  "Mozilla/5.0 (compatible; CodePlayInsightsBot/0.3; +https://codeplaystudios.com/insights)";

export class HttpSourceImageClient implements SourceImageClient {
  constructor(
    private readonly timeoutMs = 10_000,
    private readonly maxSources = 4,
  ) {}

  async find(query: SourceImageQuery): Promise<SourceImage | null> {
    const used = new Set(query.excludeImageUrls ?? []);
    const retryOpts = { attempts: 2, baseMs: 500, maxMs: 2_000 };

    for (const src of orderSources(query.sources).slice(0, this.maxSources)) {
      try {
        const html = await retryTransient(() => this.fetchHtml(src.url), {
          ...retryOpts,
          label: `source page ${hostOf(src.url)}`,
        });
        const lead = extractLeadImage(html, src.url);
        if (!lead || used.has(lead.url)) continue;

        const img = await retryTransient(() => this.download(lead.url), {
          ...retryOpts,
          label: `source image ${hostOf(lead.url)}`,
        });
        if (!img) continue;

        return {
          bytes: img.bytes,
          mimeType: img.mimeType,
          description: lead.alt,
          credit: {
            provider: "source",
            photographer: src.name || hostOf(src.url),
            photographerUrl: src.url,
            sourceUrl: lead.url,
          },
        };
      } catch {
        // One bad source must not stop the next one.
        continue;
      }
    }
    return null;
  }

  private async fetchHtml(url: string): Promise<string> {
    const res = await this.fetchWithTimeout(url, {
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`source page ${res.status} ${res.statusText}`);
    const type = res.headers.get("content-type") ?? "";
    if (type && !/html|xml/i.test(type)) return "";
    return (await res.text()).slice(0, MAX_HTML);
  }

  private async download(url: string): Promise<{ bytes: Buffer; mimeType: string } | null> {
    const res = await this.fetchWithTimeout(url, {
      headers: { "User-Agent": UA, Accept: "image/*" },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`source image ${res.status} ${res.statusText}`);
    const mimeType = (res.headers.get("content-type") ?? "").split(";")[0].trim();
    if (!mimeType.startsWith("image/") || mimeType === "image/svg+xml") return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length < MIN_BYTES || bytes.length > MAX_BYTES) return null;
    return { bytes, mimeType };
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

export function createSourceImageClient(
  env: Record<string, string | undefined>,
): SourceImageClient {
  return env.INSIGHTS_SOURCE_IMAGES === "off"
    ? new NullSourceImageClient()
    : new HttpSourceImageClient();
}
