/**
 * GitHub releases via the public REST API
 * (`GET /repos/{owner}/{repo}/releases`). Unauthenticated is fine for a
 * handful of repos (60 req/h); set `GITHUB_TOKEN` (GitHub Actions provides
 * one) to raise the limit. First-party release metadata only — title, tag,
 * URL, date, and a truncated body.
 */

import type { AdapterContext, RawItem, SourceAdapter, SourceConfig } from "../types";

interface GhConfig {
  repos?: string[];
  perRepo?: number;
}

interface GhRelease {
  id: number;
  name: string | null;
  tag_name: string;
  html_url: string;
  published_at: string | null;
  created_at: string | null;
  draft: boolean;
  prerelease: boolean;
  body: string | null;
}

export const githubReleasesAdapter: SourceAdapter = {
  kind: "github_releases",

  canRun(source) {
    const cfg = (source.configuration ?? {}) as GhConfig;
    return Array.isArray(cfg.repos) && cfg.repos.length > 0;
  },

  async discover(source: SourceConfig, ctx: AdapterContext): Promise<RawItem[]> {
    const cfg = (source.configuration ?? {}) as GhConfig;
    const repos = cfg.repos ?? [];
    const perRepo = Math.min(cfg.perRepo ?? 3, 10);
    const token = ctx.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
    };
    if (token) headers.authorization = `Bearer ${token}`;

    const items: RawItem[] = [];

    for (const repo of repos) {
      if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
        ctx.log("gh.repo.invalid", { repo });
        continue;
      }
      try {
        const releases = await ctx.fetchJson<GhRelease[]>(
          `https://api.github.com/repos/${repo}/releases?per_page=${perRepo}`,
          { headers },
        );
        for (const r of releases) {
          if (r.draft) continue;
          const label = r.name?.trim() || r.tag_name;
          items.push({
            externalId: `gh:${repo}:${r.tag_name}`,
            title: `${repo} ${label}`,
            url: r.html_url,
            source: source.name,
            sourceSlug: source.slug,
            adapter: "github_releases",
            publishedAt: r.published_at ?? r.created_at ?? undefined,
            summary: (r.body ?? "").replace(/\s+/g, " ").trim().slice(0, 400),
            signals: { isOfficial: true, isRelease: true },
            raw: { repo, tag: r.tag_name, prerelease: r.prerelease },
          });
        }
      } catch (err) {
        // failure isolation — one bad repo must not kill the adapter
        ctx.log("gh.repo.failed", { repo, error: String(err) });
      }
    }

    return items;
  },
};
