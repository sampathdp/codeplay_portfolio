/**
 * Full-page prerender for crawlers.
 *
 * The site is a client-rendered SPA: without this, every URL ships the
 * same index.html — the homepage <title>, no <h1>, no canonical, no body
 * text — until JavaScript runs. Bing, social previews and AI crawlers
 * never see the page, and Google sees duplicate titles on first crawl.
 *
 * This serves dist/public locally, opens every URL from the sitemaps in
 * headless Chrome, waits for the page to render, and writes the result to
 * dist/public/<path>/index.html. The host then serves real HTML per URL;
 * main.tsx boots the app on top (see the prerender swap there).
 *
 *   node scripts/prerender-pages.mjs        (after `vite build`)
 *
 * Never fails the build: any error logs and exits 0, leaving the plain
 * SPA output in place.
 */

import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, extname, normalize } from "node:path";

const DIST = join(import.meta.dirname, "..", "dist", "public");
const ORIGIN = "https://codeplaystudios.com";
const SITEMAPS = ["sitemap-pages.xml", "sitemap-insights.xml"];
// Interactive tool pages have little crawlable text and heavy client code.
const SKIP = [/^\/tools(\/|$)/, /^\/admin(\/|$)/];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".webmanifest": "application/manifest+json",
};

function routesFromSitemaps() {
  const out = new Set();
  for (const file of SITEMAPS) {
    const p = join(DIST, file);
    if (!existsSync(p)) continue;
    for (const m of readFileSync(p, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const url = m[1].trim();
      if (!url.startsWith(ORIGIN)) continue;
      const path = url.slice(ORIGIN.length) || "/";
      if (SKIP.some((re) => re.test(path))) continue;
      out.add(path);
    }
  }
  // "/" last: its output replaces index.html, the SPA shell other routes load.
  return [...out].sort((a, b) => (a === "/" ? 1 : b === "/" ? -1 : 0));
}

/** An installed Chrome/Edge — GitHub's ubuntu runners ship Chrome. */
function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  return candidates.find((p) => p && existsSync(p)) ?? null;
}

/** Static server with SPA fallback; always serves the ORIGINAL shell. */
function startServer(shell) {
  const server = createServer((req, res) => {
    const path = decodeURIComponent((req.url ?? "/").split("?")[0]);
    const file = normalize(join(DIST, path));
    if (file.startsWith(DIST) && existsSync(file) && statSync(file).isFile()) {
      res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
      res.end(readFileSync(file));
      return;
    }
    res.writeHead(200, { "content-type": MIME[".html"] });
    res.end(shell);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

const HELMET_DESCRIPTION = /<meta[^>]*data-rh="true"[^>]*name="description"|<meta[^>]*name="description"[^>]*data-rh="true"/;

/** Clean the captured DOM so it is a good static document. */
function finalize(html, path) {
  let out = html
    // Mark which route this markup belongs to (main.tsx checks it).
    .replace(/<div id="root"/, `<div id="root" data-prerendered="${path}"`)
    // Elements mid-animation (framer-motion whileInView) are captured at
    // opacity 0 — make their text visible in the static copy.
    .replace(/ style="[^"]*opacity:\s*0(?=[;"])[^"]*"/g, "")
    // Third-party scripts injected at runtime re-inject themselves.
    .replace(/<script[^>]+(googletagmanager|googlesyndication|google-analytics)[^>]*><\/script>/g, "");
  // Helmet adds its own description (data-rh); drop the shell's copy so
  // each page has exactly one.
  if (HELMET_DESCRIPTION.test(out)) {
    out = out.replace(/<meta\s+name="description"(?![^>]*data-rh)[^>]*>\s*/g, "");
  }
  return out;
}

async function main() {
  const shellPath = join(DIST, "index.html");
  if (!existsSync(shellPath)) {
    console.log('prerender-pages — no build output; run "vite build" first');
    return;
  }
  let puppeteer;
  try {
    puppeteer = (await import("puppeteer-core")).default;
  } catch {
    console.log("prerender-pages — puppeteer-core not installed; skipping");
    return;
  }
  const executablePath = findBrowser();
  if (!executablePath) {
    console.log("prerender-pages — no Chrome/Edge found (set CHROME_PATH); skipping");
    return;
  }

  const shell = readFileSync(shellPath, "utf8");
  const routes = routesFromSitemaps();
  const server = await startServer(shell);
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const results = [];
  let failed = 0;
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 900 });
    await page.evaluateOnNewDocument(() => {
      try {
        sessionStorage.setItem("preloaderShown", "1");
      } catch {}
      window.__PRERENDER__ = true;
    });
    // Keep analytics/ads out of the snapshot and off the network.
    await page.setRequestInterception(true);
    page.on("request", (r) => {
      const u = r.url();
      if (/googletagmanager|google-analytics|googlesyndication|doubleclick/.test(u)) r.abort();
      else r.continue();
    });

    for (const path of routes) {
      try {
        await page.goto(base + path, { waitUntil: "networkidle0", timeout: 30_000 });
        await page.waitForSelector("h1", { timeout: 10_000 });
        // Let Helmet flush head tags and entrance animations settle.
        await new Promise((r) => setTimeout(r, 400));
        const html = "<!doctype html>\n" + (await page.evaluate(() => document.documentElement.outerHTML));
        results.push({ path, html: finalize(html, path) });
      } catch (err) {
        failed++;
        console.warn(`prerender-pages — ${path} skipped: ${err.message}`);
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  for (const { path, html } of results) {
    const dir = path === "/" ? DIST : join(DIST, path);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), html, "utf8");
  }
  console.log(`prerender-pages — wrote ${results.length} page(s), ${failed} skipped`);
}

main().catch((err) => {
  console.error("prerender-pages — unexpected error (continuing):", err);
});
