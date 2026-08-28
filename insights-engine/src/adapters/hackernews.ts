/**
 * Hacker News official Firebase API.
 * https://github.com/HackerNews/API  (public, no key, no license issue —
 * we store id / title / url / score / time only).
 *
 * Streams: topstories, beststories, newstories. "Show HN" posts are
 * detected by title prefix and flagged as a launch signal.
 */

import type { AdapterContext, RawItem, SourceAdapter, SourceConfig } from "../types";

const BASE = "https://hacker-news.firebaseio.com/v0";

interface HnItem {
  id: number;
  type?: string;
  title?: string;
  url?: string;
  score?: number;
  descendants?: number;
  time?: number;
  by?: string;
  dead?: boolean;
  deleted?: boolean;
}

interface HnConfig {
  streams?: string[];
  includeShowHN?: boolean;
  maxItems?: number;
  minPoints?: number;
}

export const hackerNewsAdapter: SourceAdapter = {
  kind: "hackernews",

  canRun() {
    return true; // no credentials required
  },

  async discover(source: SourceConfig, ctx: AdapterContext): Promise<RawItem[]> {
    const cfg = (source.configuration ?? {}) as HnConfig;
    const streams = cfg.streams?.length
      ? cfg.streams
      : ["topstories", "beststories", "newstories"];
    const maxItems = Math.min(cfg.maxItems ?? 60, 200);
    const minPoints = cfg.minPoints ?? 30;
    const perStream = Math.max(10, Math.ceil(maxItems / streams.length));

    const ids: number[] = [];
    for (const stream of streams) {
      try {
        const list = await ctx.fetchJson<number[]>(`${BASE}/${stream}.json`);
        ids.push(...list.slice(0, perStream));
      } catch (err) {
        ctx.log("hn.stream.failed", { stream, error: String(err) });
      }
    }

    const uniqueIds = [...new Set(ids)].slice(0, maxItems);
    const items: RawItem[] = [];

    for (const id of uniqueIds) {
      let hn: HnItem | null = null;
      try {
        hn = await ctx.fetchJson<HnItem>(`${BASE}/item/${id}.json`);
      } catch (err) {
        ctx.log("hn.item.failed", { id, error: String(err) });
        continue;
      }
      if (!hn || hn.dead || hn.deleted || hn.type !== "story" || !hn.title) continue;

      const isShowHN = /^show hn:/i.test(hn.title);
      if (isShowHN && cfg.includeShowHN === false) continue;
      if ((hn.score ?? 0) < minPoints && !isShowHN) continue;

      const hnUrl = `https://news.ycombinator.com/item?id=${hn.id}`;
      items.push({
        externalId: `hn:${hn.id}`,
        title: hn.title,
        url: hn.url || hnUrl,
        commentsUrl: hnUrl,
        source: source.name,
        sourceSlug: source.slug,
        adapter: "hackernews",
        publishedAt: hn.time ? new Date(hn.time * 1000).toISOString() : undefined,
        author: hn.by,
        signals: {
          points: hn.score ?? 0,
          comments: hn.descendants ?? 0,
          isShowHN,
          isOfficial: false,
        },
        raw: { id: hn.id, score: hn.score, descendants: hn.descendants },
      });
    }

    return items;
  },
};
