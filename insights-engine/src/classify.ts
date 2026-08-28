/**
 * Classification: themes, primary theme, CodePlay category + relevance,
 * and fact-confidence for a single normalized item.
 */

import type { FactConfidence, RawItem, SourceConfig } from "./types";
import { THEMES, type ThemeDef } from "./themes";
import { normalizeTitle, extractEntities } from "./normalize";
import { clamp } from "./scoring";

export interface Classification {
  themes: string[];
  primaryTheme: string | null;
  categorySlug: string | null;
  relevanceScore: number; // 0-100
  factConfidence: FactConfidence;
}

interface ThemeHit {
  theme: ThemeDef;
  score: number;
}

function themeHits(text: string, entities: string[]): ThemeHit[] {
  const hay = ` ${normalizeTitle(text)} `;
  const entitySet = new Set(entities.map((e) => e.toLowerCase()));
  const hits: ThemeHit[] = [];

  for (const theme of THEMES) {
    let score = 0;
    for (const kw of theme.keywords) {
      const k = kw.trim();
      const kSpaced = k.replace(/-/g, " ");
      if (hay.includes(k) || hay.includes(` ${kSpaced} `) || hay.includes(kSpaced)) {
        score += 1;
      }
    }
    for (const ent of theme.entities ?? []) {
      if (entitySet.has(ent.toLowerCase())) score += 1.5;
    }
    if (score > 0) hits.push({ theme, score });
  }
  return hits.sort((a, b) => b.score - a.score || b.theme.relevance - a.theme.relevance);
}

/** Adapter/source → base fact confidence for a single item. */
function baseConfidence(source: SourceConfig, item: RawItem): FactConfidence {
  if (source.adapter === "reddit" || source.sourceType === "community") {
    return "community_rumor";
  }
  if (source.adapter === "github_releases" || item.signals?.isRelease) {
    return "verified";
  }
  if (source.sourceType === "official" || item.signals?.isOfficial) {
    return "verified";
  }
  if (source.adapter === "hackernews") {
    // HN is a link aggregator; the linked domain decides.
    return isOfficialDomain(item.url) ? "verified" : "unverified";
  }
  if (source.sourceType === "rss") return "likely";
  return "unverified";
}

const OFFICIAL_DOMAINS = [
  "openai.com", "anthropic.com", "blog.google", "deepmind.google",
  "ai.meta.com", "engineering.fb.com", "blogs.microsoft.com", "github.blog",
  "apple.com", "blogs.nvidia.com", "developer.nvidia.com", "amd.com",
  "blog.cloudflare.com", "vercel.com", "supabase.com", "firebase.blog",
  "aws.amazon.com", "react.dev", "nodejs.org", "deno.com", "blog.python.org",
  "blog.playstation.com", "news.xbox.com", "nintendo.com",
  "store.steampowered.com", "unrealengine.com", "unity.com",
];

export function isOfficialDomain(url: string): boolean {
  try {
    const host = new URL(url).host.toLowerCase().replace(/^www\./, "");
    return OFFICIAL_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

export function classifyItem(
  item: RawItem,
  source: SourceConfig,
): Classification {
  const text = `${item.title} ${item.summary ?? ""}`;
  const entities = extractEntities(text);
  const hits = themeHits(text, entities);

  const themes = hits.slice(0, 4).map((h) => h.theme.id);
  const primary = hits[0]?.theme ?? null;

  // Relevance: strongest matched theme, nudged by source category and the
  // number of distinct on-topic themes, then clamped.
  let relevance = primary ? primary.relevance : 25;
  if (hits.length >= 2) relevance += 5;
  if (source.category && primary && source.category === primary.category) {
    relevance += 8;
  }
  if (entities.length > 0) relevance += 4;
  relevance = clamp(relevance, 0, 100);

  return {
    themes,
    primaryTheme: primary?.id ?? null,
    categorySlug: primary?.category ?? source.category ?? null,
    relevanceScore: relevance,
    factConfidence: baseConfidence(source, item),
  };
}

/**
 * Combine item confidences into a cluster confidence. Official first-party
 * confirmation wins outright; "likely" needs corroboration (≥2 reputable
 * secondary sources); community chatter alone stays a rumor.
 */
export function clusterConfidence(items: FactConfidence[]): FactConfidence {
  if (items.includes("verified")) return "verified";
  const likely = items.filter((c) => c === "likely").length;
  if (likely >= 2 || (likely >= 1 && items.length >= 3)) return "likely";
  if (items.includes("community_rumor")) return "community_rumor";
  return "unverified";
}
