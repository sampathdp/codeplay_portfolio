/**
 * Ping IndexNow (Bing/Yandex/etc.) with every URL in the built sitemaps.
 *
 *   tsx insights-engine/src/publish/indexnow.ts
 *
 * Must run AFTER `vite build` (and ideally after the FTP sync, once the
 * host actually serves the new pages + key file). Reads the sitemap XML
 * straight out of dist/public rather than hitting Supabase, so it always
 * pings exactly what was just shipped.
 *
 * Self-guards like run.ts / prerender.ts: no key, no sitemap, or a failed
 * network call all just log and exit 0 — IndexNow is a nice-to-have ping,
 * never a deploy gate.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { SITE_ORIGIN } from "./feeds";

const ROOT = process.cwd();
const DIST = join(ROOT, "dist", "public");

// IndexNow keys are meant to be public (they're published as a plain-text
// file at the site root) — this is not a secret.
const INDEXNOW_KEY = "3552a1ff5d03b46106847c5fde98b6cf";
const KEY_LOCATION = `${SITE_ORIGIN}/${INDEXNOW_KEY}.txt`;
const HOST = new URL(SITE_ORIGIN).host;

function extractLocs(path: string): string[] {
  if (!existsSync(path)) return [];
  const xml = readFileSync(path, "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function main(): Promise<void> {
  const urls = [
    ...extractLocs(join(DIST, "sitemap-pages.xml")),
    ...extractLocs(join(DIST, "sitemap-insights.xml")),
  ];

  if (urls.length === 0) {
    console.log("insights:indexnow — no URLs found, skipping");
    return;
  }

  console.log(`insights:indexnow — pinging ${urls.length} URL(s)`);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls,
    }),
  });
  console.log(`insights:indexnow — response ${res.status}`);
}

main().catch((err) => {
  console.error("insights:indexnow — unexpected error (continuing):", err);
  process.exit(0);
});
