/**
 * Normalization: turn a `RawItem` into stable, comparable forms used by
 * dedupe, classification and scoring.
 */

import type { RawItem } from "./types";
import { KNOWN_ENTITIES } from "./themes";

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for", "with",
  "at", "by", "from", "as", "is", "are", "was", "were", "be", "been", "being",
  "this", "that", "these", "those", "it", "its", "into", "over", "after",
  "new", "now", "how", "why", "what", "you", "your", "we", "our", "will",
  "can", "just", "has", "have", "had", "not", "no", "up", "out", "about",
  "vs", "via", "amp",
]);

/** Marketing / clickbait prefixes and suffixes to strip from titles. */
const TITLE_NOISE = [
  /^show hn:\s*/i,
  /^ask hn:\s*/i,
  /^\[[^\]]+\]\s*/,
  /\s*[-–—|:]\s*(the verge|techcrunch|ars technica|engadget|wired|reuters|bloomberg|cnbc|the register|venturebeat)\s*$/i,
  /\s*\(video\)\s*$/i,
];

export function normalizeTitle(title: string): string {
  let t = (title ?? "").toLowerCase();
  for (const re of TITLE_NOISE) t = t.replace(re, "");
  return t
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]s\b/g, "") // possessives: "google's" -> "google"
    .replace(/['’".,!?:;()\[\]{}]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const TRACKING_PARAMS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "utm_id", "ref", "ref_src", "source", "cmpid", "fbclid", "gclid", "mc_cid",
  "mc_eid", "spm", "_hsenc", "_hsmi", "igshid", "at_medium", "at_campaign",
]);

export function normalizeUrl(url: string): string {
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    return url.trim().toLowerCase();
  }
  u.protocol = "https:";
  u.host = u.host.toLowerCase().replace(/^www\./, "");
  u.hash = "";
  for (const p of [...u.searchParams.keys()]) {
    if (TRACKING_PARAMS.has(p.toLowerCase())) u.searchParams.delete(p);
  }
  u.searchParams.sort();
  let path = u.pathname.replace(/\/+$/, "");
  if (path === "") path = "/";
  const qs = u.searchParams.toString();
  return `${u.host}${path}${qs ? `?${qs}` : ""}`;
}

export function tokenize(text: string): string[] {
  return normalizeTitle(text)
    .split(" ")
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

export function extractKeywords(text: string, limit = 12): string[] {
  const counts = new Map<string, number>();
  for (const tok of tokenize(text)) counts.set(tok, (counts.get(tok) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([w]) => w);
}

const ENTITY_LOOKUP = KNOWN_ENTITIES.map((e) => ({
  name: e,
  needle: e.toLowerCase(),
}));

export function extractEntities(text: string): string[] {
  const hay = ` ${(text ?? "").toLowerCase()} `;
  const found = new Set<string>();
  for (const { name, needle } of ENTITY_LOOKUP) {
    // word-ish boundary check
    const idx = hay.indexOf(needle);
    if (idx === -1) continue;
    const before = hay[idx - 1];
    const after = hay[idx + needle.length];
    if (/[a-z0-9]/.test(before ?? " ") || /[a-z0-9]/.test(after ?? " ")) continue;
    found.add(name);
  }
  return [...found];
}

/**
 * Fast-path exact-bucket hash: the leading significant tokens of a
 * headline, in order. Wire-copied / lightly-reworded headlines collide
 * here; reordered or reworded ones are still caught by `itemSimilarity`.
 */
export function dedupeHash(title: string): string {
  const basis = tokenize(title).slice(0, 4).join("-");
  // djb2
  let h = 5381;
  for (let i = 0; i < basis.length; i++) h = (h * 33) ^ basis.charCodeAt(i);
  return (h >>> 0).toString(36);
}

export interface NormalizedFields {
  normalizedTitle: string;
  normalizedUrl: string;
  dedupeHash: string;
  entities: string[];
  keywords: string[];
}

export function normalizeItem(item: RawItem): NormalizedFields {
  const text = `${item.title} ${item.summary ?? ""}`;
  return {
    normalizedTitle: normalizeTitle(item.title),
    normalizedUrl: normalizeUrl(item.url),
    dedupeHash: dedupeHash(item.title),
    entities: extractEntities(text),
    keywords: extractKeywords(text),
  };
}
