/**
 * OPTIONAL Reddit community-signal adapter.
 *
 * - Uses the official OAuth API only (never HTML scraping).
 * - Requires REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET (script-app,
 *   client-credentials grant). Disabled until both are set.
 * - Posts are TREND SIGNALS, not verified facts — the classifier tags
 *   every item from here as `community_rumor`.
 */

import type { AdapterContext, RawItem, SourceAdapter, SourceConfig } from "../types";

interface RedditConfig {
  subreddits?: string[];
  listing?: "hot" | "top" | "rising" | "new";
  limit?: number;
  minScore?: number;
}

interface RedditChild {
  data: {
    id: string;
    name: string;
    title: string;
    permalink: string;
    url: string;
    subreddit: string;
    score: number;
    num_comments: number;
    upvote_ratio: number;
    created_utc: number;
    over_18: boolean;
    stickied: boolean;
    is_self: boolean;
  };
}

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getToken(ctx: AdapterContext): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 30_000) return tokenCache.token;

  const id = ctx.env.REDDIT_CLIENT_ID!;
  const secret = ctx.env.REDDIT_CLIENT_SECRET!;
  const basic = Buffer.from(`${id}:${secret}`).toString("base64");

  const res = await ctx.fetchJson<{ access_token: string; expires_in: number }>(
    "https://www.reddit.com/api/v1/access_token",
    {
      method: "POST",
      headers: {
        authorization: `Basic ${basic}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    },
  );
  tokenCache = {
    token: res.access_token,
    expiresAt: now + res.expires_in * 1000,
  };
  return res.access_token;
}

export const redditAdapter: SourceAdapter = {
  kind: "reddit",

  canRun(_source, ctx) {
    return Boolean(ctx.env.REDDIT_CLIENT_ID && ctx.env.REDDIT_CLIENT_SECRET);
  },

  async discover(source: SourceConfig, ctx: AdapterContext): Promise<RawItem[]> {
    if (!this.canRun(source, ctx)) {
      ctx.log("reddit.skipped", { reason: "missing credentials" });
      return [];
    }
    const cfg = (source.configuration ?? {}) as RedditConfig;
    const subs = cfg.subreddits ?? [];
    const listing = cfg.listing ?? "hot";
    const limit = Math.min(cfg.limit ?? 40, 100);
    const minScore = cfg.minScore ?? 100;

    const token = await getToken(ctx);
    const items: RawItem[] = [];

    for (const sub of subs) {
      try {
        const json = await ctx.fetchJson<{ data: { children: RedditChild[] } }>(
          `https://oauth.reddit.com/r/${encodeURIComponent(sub)}/${listing}?limit=${limit}&raw_json=1`,
          { headers: { authorization: `Bearer ${token}` } },
        );
        for (const child of json.data?.children ?? []) {
          const d = child.data;
          if (d.over_18 || d.stickied || d.score < minScore) continue;
          items.push({
            externalId: `reddit:${d.name}`,
            title: d.title,
            url: d.is_self
              ? `https://www.reddit.com${d.permalink}`
              : d.url,
            commentsUrl: `https://www.reddit.com${d.permalink}`,
            source: `${source.name} (r/${d.subreddit})`,
            sourceSlug: source.slug,
            adapter: "reddit",
            publishedAt: new Date(d.created_utc * 1000).toISOString(),
            signals: {
              redditScore: d.score,
              comments: d.num_comments,
              redditUpvoteRatio: d.upvote_ratio,
              isOfficial: false,
            },
            raw: { subreddit: d.subreddit, id: d.id },
          });
        }
      } catch (err) {
        ctx.log("reddit.sub.failed", { sub, error: String(err) });
      }
    }

    return items;
  },
};
