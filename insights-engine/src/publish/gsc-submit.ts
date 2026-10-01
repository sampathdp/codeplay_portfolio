/**
 * Re-submit the sitemaps to Google Search Console after a deploy.
 *
 *   tsx insights-engine/src/publish/gsc-submit.ts
 *
 * Uses the Search Console API (`sitemaps.submit`) with a service account
 * whose email has been added as a user on the property. Must run AFTER the
 * FTP sync so Google fetches the freshly deployed files.
 *
 * Env:
 *   GSC_SERVICE_ACCOUNT_JSON  full service-account key JSON (required)
 *   GSC_SITE_URL              property id: "sc-domain:codeplaystudios.com"
 *                             (Domain property) or "https://codeplaystudios.com/"
 *                             (URL-prefix). Defaults to the URL-prefix form.
 *
 * Self-guards like indexnow.ts: missing secret or any failure logs and
 * exits 0 — never a deploy gate.
 */

import { createSign } from "node:crypto";
import { SITE_ORIGIN } from "./feeds";

const SCOPE = "https://www.googleapis.com/auth/webmasters";
const SITEMAPS = ["sitemap.xml", "sitemap-insights.xml", "news-sitemap.xml"];

const b64url = (v: string | Buffer) => Buffer.from(v).toString("base64url");

async function accessToken(email: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const unsigned =
    b64url(JSON.stringify({ alg: "RS256", typ: "JWT" })) +
    "." +
    b64url(
      JSON.stringify({
        iss: email,
        scope: SCOPE,
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
      }),
    );
  const sig = createSign("RSA-SHA256").update(unsigned).sign(privateKey);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${b64url(sig)}`,
    }),
  });
  if (!res.ok) throw new Error(`token request failed: ${res.status} ${await res.text()}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

async function main(): Promise<void> {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.log("insights:gsc — GSC_SERVICE_ACCOUNT_JSON not set, skipping");
    return;
  }
  const key = JSON.parse(raw) as { client_email: string; private_key: string };
  const site = process.env.GSC_SITE_URL || `${SITE_ORIGIN}/`;
  const token = await accessToken(key.client_email, key.private_key);

  for (const name of SITEMAPS) {
    const feed = `${SITE_ORIGIN}/${name}`;
    const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
      site,
    )}/sitemaps/${encodeURIComponent(feed)}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Length": "0" },
    });
    console.log(`insights:gsc — ${name}: ${res.status}${res.ok ? "" : " " + (await res.text())}`);
  }
}

main().catch((err) => {
  console.error("insights:gsc — unexpected error (continuing):", err);
  process.exit(0);
});
