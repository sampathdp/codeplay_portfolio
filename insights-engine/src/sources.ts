/**
 * Load the source registry. Primary path: the `insights_news_sources`
 * table (service role). Fallback: a small built-in free-first set so
 * `--dry-run` works without a database.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdapterKind, SourceConfig } from "./types";

export const FALLBACK_SOURCES: SourceConfig[] = [
  {
    name: "Hacker News",
    slug: "hacker-news",
    adapter: "hackernews",
    sourceType: "api",
    baseUrl: "https://news.ycombinator.com",
    feedUrl: null,
    category: "developer-tools",
    enabled: true,
    trustScore: 65,
    priority: 10,
    configuration: {
      streams: ["topstories", "beststories"],
      includeShowHN: true,
      maxItems: 45,
      minPoints: 60,
    },
  },
  {
    name: "GitHub Blog",
    slug: "github-blog",
    adapter: "rss",
    sourceType: "official",
    baseUrl: "https://github.blog",
    feedUrl: "https://github.blog/feed/",
    category: "developer-tools",
    enabled: true,
    trustScore: 88,
    priority: 25,
    configuration: {},
  },
  {
    name: "GitHub Releases — Core Frameworks",
    slug: "github-releases-core",
    adapter: "github_releases",
    sourceType: "release_feed",
    baseUrl: "https://github.com",
    feedUrl: null,
    category: "software-development",
    enabled: true,
    trustScore: 88,
    priority: 15,
    configuration: {
      repos: ["facebook/react", "vercel/next.js", "nodejs/node", "vitejs/vite"],
      perRepo: 2,
    },
  },
];

interface SourceRow {
  id: string;
  name: string;
  slug: string | null;
  adapter: string | null;
  source_type: string;
  base_url: string;
  feed_url: string | null;
  category: string | null;
  enabled: boolean;
  trust_score: number;
  priority: number;
  configuration: Record<string, unknown> | null;
}

export async function loadSources(sb: SupabaseClient): Promise<SourceConfig[]> {
  const { data, error } = await sb
    .from("insights_news_sources")
    .select(
      "id,name,slug,adapter,source_type,base_url,feed_url,category,enabled,trust_score,priority,configuration",
    )
    .order("priority", { ascending: true });
  if (error) throw new Error(`loadSources: ${error.message}`);

  return (data ?? []).map((raw) => {
    const r = raw as SourceRow;
    return {
      id: r.id,
      name: r.name,
      slug: r.slug ?? slugish(r.name),
      adapter: (r.adapter ?? "rss") as AdapterKind,
      sourceType: r.source_type,
      baseUrl: r.base_url,
      feedUrl: r.feed_url,
      category: r.category,
      enabled: r.enabled,
      trustScore: r.trust_score,
      priority: r.priority,
      configuration: r.configuration ?? {},
    };
  });
}

function slugish(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
