/**
 * Generic RSS 2.0 / Atom adapter for official announcement feeds.
 *
 * We store headline, link, publication date and a short summary only — we
 * do not fetch or persist full article bodies. Feeds flagged as
 * `source_type = 'official'` mark their items as first-party (`isOfficial`).
 */

import { XMLParser } from "fast-xml-parser";
import type { AdapterContext, RawItem, SourceAdapter, SourceConfig } from "../types";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
  processEntities: true,
});

/** Drop heavy full-content nodes we never use — they blow past the XML
 * parser's entity-expansion guard on content-rich feeds (e.g. GitHub
 * release notes) and we only want headline + link + date + short summary. */
function stripHeavyNodes(xml: string): string {
  return xml
    .replace(/<content:encoded[\s\S]*?<\/content:encoded>/gi, "<content:encoded/>")
    .replace(/<content\b[^>]*>[\s\S]*?<\/content>/gi, "<content/>");
}

function asArray<T>(v: T | T[] | undefined): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

function text(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v !== null) {
    const o = v as Record<string, unknown>;
    if (typeof o["#text"] === "string") return o["#text"];
  }
  return String(v);
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

function atomLink(links: unknown): string {
  for (const l of asArray(links)) {
    if (typeof l === "string") return l;
    const o = l as Record<string, string>;
    if (!o["@_rel"] || o["@_rel"] === "alternate") return o["@_href"] ?? "";
  }
  const first = asArray(links)[0] as Record<string, string> | undefined;
  return first?.["@_href"] ?? "";
}

export interface ParsedFeedItem {
  title: string;
  url: string;
  publishedAt?: string;
  summary?: string;
  author?: string;
  guid?: string;
}

export function parseFeed(xml: string): ParsedFeedItem[] {
  let doc: Record<string, unknown>;
  try {
    doc = parser.parse(xml) as Record<string, unknown>;
  } catch {
    // Retry without the bulky content bodies.
    doc = parser.parse(stripHeavyNodes(xml)) as Record<string, unknown>;
  }

  // RSS 2.0
  const channel = (doc.rss as Record<string, unknown>)?.channel as
    | Record<string, unknown>
    | undefined;
  if (channel) {
    return asArray(channel.item).map((raw) => {
      const it = raw as Record<string, unknown>;
      return {
        title: stripHtml(text(it.title)),
        url: text(it.link).trim(),
        publishedAt: normalizeDate(text(it.pubDate) || text(it["dc:date"])),
        summary: stripHtml(text(it.description) || text(it["content:encoded"])),
        author: text(it["dc:creator"] || it.author) || undefined,
        guid: text(it.guid) || undefined,
      };
    });
  }

  // Atom
  const feed = doc.feed as Record<string, unknown> | undefined;
  if (feed) {
    return asArray(feed.entry).map((raw) => {
      const it = raw as Record<string, unknown>;
      return {
        title: stripHtml(text(it.title)),
        url: atomLink(it.link).trim(),
        publishedAt: normalizeDate(text(it.published) || text(it.updated)),
        summary: stripHtml(text(it.summary) || text(it.content)),
        author: text((it.author as Record<string, unknown>)?.name) || undefined,
        guid: text(it.id) || undefined,
      };
    });
  }

  return [];
}

function normalizeDate(s: string): string | undefined {
  if (!s) return undefined;
  const t = Date.parse(s);
  return Number.isFinite(t) ? new Date(t).toISOString() : undefined;
}

export const rssAdapter: SourceAdapter = {
  kind: "rss",

  canRun(source) {
    return Boolean(source.feedUrl);
  },

  async discover(source: SourceConfig, ctx: AdapterContext): Promise<RawItem[]> {
    if (!source.feedUrl) return [];
    const xml = await ctx.fetchText(source.feedUrl);
    const parsed = parseFeed(xml).filter((p) => p.title && p.url);
    const limit = Number((source.configuration as Record<string, unknown>)?.maxItems ?? 25);
    const isOfficial = source.sourceType === "official";

    return parsed.slice(0, limit).map((p, i) => ({
      externalId: p.guid || p.url || `${source.slug}:${i}`,
      title: p.title,
      url: p.url,
      source: source.name,
      sourceSlug: source.slug,
      adapter: "rss",
      publishedAt: p.publishedAt,
      summary: p.summary,
      author: p.author,
      signals: { isOfficial },
      raw: {},
    }));
  },
};
