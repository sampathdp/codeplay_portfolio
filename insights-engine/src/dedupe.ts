/**
 * Cross-source matching. Multiple outlets covering the same event must
 * collapse into ONE topic cluster, with every source URL retained.
 *
 * Signals combined (cheap, deterministic — no embeddings):
 *   - identical normalized URL
 *   - identical dedupe hash (leading title tokens + primary entity)
 *   - title token Jaccard similarity
 *   - title character trigram (Dice) similarity
 *   - shared named entities
 *
 * A semantic-similarity hook (`opts.semanticSimilar`) can be supplied
 * later without touching callers.
 */

import type { NormalizedItem, TopicCluster } from "./types";
import { clusterConfidence } from "./classify";

export interface DedupeOptions {
  /** Combined-score threshold above which two items are "the same story". */
  threshold?: number;
  /** Optional async/sync semantic comparator, 0..1. */
  semanticSimilar?: (a: NormalizedItem, b: NormalizedItem) => number;
}

export function jaccard(a: Iterable<string>, b: Iterable<string>): number {
  const sa = new Set(a);
  const sb = new Set(b);
  if (sa.size === 0 && sb.size === 0) return 0;
  let inter = 0;
  for (const x of sa) if (sb.has(x)) inter++;
  return inter / (sa.size + sb.size - inter);
}

export function trigrams(s: string): Set<string> {
  const t = ` ${s.replace(/\s+/g, " ").trim()} `;
  const out = new Set<string>();
  for (let i = 0; i < t.length - 2; i++) out.add(t.slice(i, i + 3));
  return out;
}

export function diceCoefficient(a: string, b: string): number {
  const ta = trigrams(a);
  const tb = trigrams(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const x of ta) if (tb.has(x)) inter++;
  return (2 * inter) / (ta.size + tb.size);
}

/** 0..1 similarity between two normalized items. */
export function itemSimilarity(
  a: NormalizedItem,
  b: NormalizedItem,
  opts: DedupeOptions = {},
): number {
  if (a.normalizedUrl && a.normalizedUrl === b.normalizedUrl) return 1;
  if (a.dedupeHash && a.dedupeHash === b.dedupeHash) return 0.9;

  const titleTokensA = a.normalizedTitle.split(" ").filter(Boolean);
  const titleTokensB = b.normalizedTitle.split(" ").filter(Boolean);

  const jac = jaccard(titleTokensA, titleTokensB);
  const dice = diceCoefficient(a.normalizedTitle, b.normalizedTitle);
  const entityOverlap = jaccard(
    a.entities.map((e) => e.toLowerCase()),
    b.entities.map((e) => e.toLowerCase()),
  );
  const keywordOverlap = jaccard(a.keywords, b.keywords);

  let score =
    jac * 0.4 + dice * 0.3 + entityOverlap * 0.2 + keywordOverlap * 0.1;

  // A strong shared entity + decent lexical overlap is a good signal.
  if (entityOverlap > 0 && (jac > 0.25 || dice > 0.3)) score += 0.12;

  if (opts.semanticSimilar) {
    score = Math.max(score, score * 0.5 + opts.semanticSimilar(a, b) * 0.5);
  }
  return Math.min(1, score);
}

class UnionFind {
  private parent: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
  }
  find(i: number): number {
    while (this.parent[i] !== i) {
      this.parent[i] = this.parent[this.parent[i]];
      i = this.parent[i];
    }
    return i;
  }
  union(a: number, b: number): void {
    this.parent[this.find(a)] = this.find(b);
  }
}

function pickTitle(items: NormalizedItem[]): NormalizedItem {
  // Prefer the earliest-published, official-ish, non-"Show HN" headline.
  return [...items].sort((a, b) => {
    const off = Number(!!b.signals?.isOfficial) - Number(!!a.signals?.isOfficial);
    if (off) return off;
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : Infinity;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : Infinity;
    return ta - tb;
  })[0];
}

function clusterKey(items: NormalizedItem[]): string {
  const hashes = [...new Set(items.map((i) => i.dedupeHash))].sort();
  return hashes.join("+");
}

export function clusterItems(
  items: NormalizedItem[],
  opts: DedupeOptions = {},
): TopicCluster[] {
  const threshold = opts.threshold ?? 0.55;
  const uf = new UnionFind(items.length);

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (itemSimilarity(items[i], items[j], opts) >= threshold) uf.union(i, j);
    }
  }

  const groups = new Map<number, NormalizedItem[]>();
  items.forEach((item, idx) => {
    const root = uf.find(idx);
    let bucket = groups.get(root);
    if (!bucket) {
      bucket = [];
      groups.set(root, bucket);
    }
    bucket.push(item);
  });

  const clusters: TopicCluster[] = [];
  for (const group of groups.values()) {
    const lead = pickTitle(group);
    const publishedTimes = group
      .map((i) => (i.publishedAt ? Date.parse(i.publishedAt) : NaN))
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => a - b);
    const entities = [...new Set(group.flatMap((i) => i.entities))];
    const keywords = [...new Set(group.flatMap((i) => i.keywords))].slice(0, 16);
    const themes = [...new Set(group.flatMap((i) => i.themes))];

    // primary theme = most common across items, tie-break by lead item
    const themeCounts = new Map<string, number>();
    for (const it of group)
      for (const t of it.themes) themeCounts.set(t, (themeCounts.get(t) ?? 0) + 1);
    const primaryTheme =
      [...themeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
      lead.primaryTheme ??
      null;

    clusters.push({
      key: clusterKey(group),
      title: lead.title,
      normalizedTitle: lead.normalizedTitle,
      summary: lead.summary ?? "",
      items: group,
      entities,
      keywords,
      themes,
      primaryTheme,
      categorySlug: lead.categorySlug ?? null,
      earliestPublishedAt: publishedTimes.length
        ? new Date(publishedTimes[0]).toISOString()
        : null,
      lastSeenAt: new Date().toISOString(),
      sourceCount: new Set(group.map((i) => i.sourceSlug)).size,
      factConfidence: clusterConfidence(group.map((i) => i.factConfidence)),
    });
  }

  return clusters.sort((a, b) => b.sourceCount - a.sourceCount);
}
