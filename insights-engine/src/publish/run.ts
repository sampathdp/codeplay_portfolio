/**
 * Build the CodePlay Insights SEO artefacts before `vite build`.
 *
 *   tsx insights-engine/src/publish/run.ts
 *
 * With SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY set it pulls published
 * articles and regenerates the content snapshot, the Insights sitemap and
 * the RSS feed. Without them it still writes valid (article-less) sitemap
 * and RSS files so the deploy never ships a stale or missing feed.
 *
 * Never throws on a "no data" / "not configured" condition — a failed SEO
 * refresh must not block a deploy.
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createServiceClient } from "../store/supabase";
import { INSIGHTS_CATEGORY_SLUGS } from "../categories";
import { loadPublishedArticles } from "./snapshot";
import {
  buildInsightsSitemap,
  buildNewsSitemapXml,
  buildRssXml,
  renderArticlesModule,
  type PublishArticle,
} from "./feeds";

// npm scripts run from the repo root.
const ROOT = process.cwd();
const SNAPSHOT = join(ROOT, "client", "src", "data", "insights.generated.ts");
const SITEMAP = join(ROOT, "client", "public", "sitemap-insights.xml");
const NEWS_SITEMAP = join(ROOT, "client", "public", "news-sitemap.xml");
const RSS = join(ROOT, "client", "public", "insights", "rss.xml");

function write(path: string, contents: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents, "utf8");
  console.log(`  wrote ${path}`);
}

async function main(): Promise<void> {
  const env = process.env as Record<string, string | undefined>;
  const configured = Boolean(
    env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY,
  );

  let articles: PublishArticle[] = [];
  let snapshotFromDb = false;

  if (configured) {
    try {
      const sb = createServiceClient(env);
      articles = await loadPublishedArticles(sb);
      snapshotFromDb = true;
      console.log(`insights:seo — ${articles.length} published article(s)`);
    } catch (err) {
      console.error(
        `insights:seo — DB read failed, writing article-less artefacts: ${
          (err as Error).message
        }`,
      );
    }
  } else {
    console.log("insights:seo — no Supabase env; writing article-less artefacts");
  }

  // Only rewrite artefacts when we actually queried the DB, so a
  // mis-configured or secret-less run (e.g. CI without Supabase secrets)
  // can never wipe a good, committed snapshot / sitemap / feed. When not
  // configured we only *bootstrap* missing files so a fresh checkout still
  // ships something valid.
  const bootstrap = !snapshotFromDb;

  if (snapshotFromDb) {
    write(SNAPSHOT, renderArticlesModule(articles));
  }

  if (snapshotFromDb || !existsSync(SITEMAP)) {
    write(SITEMAP, buildInsightsSitemap(articles, [...INSIGHTS_CATEGORY_SLUGS]));
  }
  // Always rebuild (even with no fresh DB read) so articles that age out of
  // the 48h news window still drop out of this file on every deploy.
  write(NEWS_SITEMAP, buildNewsSitemapXml(articles));
  if (snapshotFromDb || !existsSync(RSS)) {
    write(RSS, buildRssXml(articles));
  }

  console.log(
    bootstrap
      ? "insights:seo — no DB; kept existing artefacts (bootstrapped any missing)"
      : "insights:seo — done",
  );
}

main().catch((err) => {
  // Last-resort guard: log and exit 0 so the deploy still proceeds.
  console.error("insights:seo — unexpected error (continuing):", err);
  process.exit(0);
});
