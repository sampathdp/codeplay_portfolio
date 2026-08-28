import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Guardrail: the browser bundle must never reference server-only secrets.
 * Only the anon-safe VITE_ vars may be read from `import.meta.env`, and
 * `process.env` has no place in client code.
 */

const CLIENT_SRC = join(process.cwd(), "client", "src");

const ALLOWED_ENV = new Set([
  "VITE_TOOLS_API_URL",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  // Phase 8 — SEO / analytics / ads. All public by nature: a GA4
  // measurement ID, an AdSense publisher ID, an on/off flag, and a
  // Search Console verification token are all meant to ship in HTML.
  "VITE_GA4_ID",
  "VITE_ADSENSE_CLIENT",
  "VITE_ADSENSE_ENABLED",
  "VITE_GSC_VERIFICATION",
  // Vite built-ins
  "MODE",
  "DEV",
  "PROD",
  "SSR",
  "BASE_URL",
]);

const FORBIDDEN = [
  /SUPABASE_SERVICE_ROLE_KEY/,
  /SERVICE_ROLE_KEY/,
  /GEMINI_API_KEY/,
  /\bCRON_SECRET\b/,
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry) && !/\.test\.tsx?$/.test(entry))
      out.push(full);
  }
  return out;
}

const files = walk(CLIENT_SRC);

describe("client bundle secret hygiene", () => {
  it("finds source files to scan", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("never names a server-only secret", () => {
    const offenders: string[] = [];
    for (const f of files) {
      const src = readFileSync(f, "utf8");
      for (const re of FORBIDDEN) {
        if (re.test(src)) offenders.push(`${f} :: ${re}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("only reads allow-listed import.meta.env keys", () => {
    const offenders: string[] = [];
    for (const f of files) {
      const src = readFileSync(f, "utf8");
      for (const m of src.matchAll(/import\.meta\.env\.([A-Za-z_][A-Za-z0-9_]*)/g)) {
        if (!ALLOWED_ENV.has(m[1])) offenders.push(`${f} :: ${m[1]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("does not use process.env in client code", () => {
    const offenders = files.filter((f) =>
      /process\.env\b/.test(readFileSync(f, "utf8")),
    );
    expect(offenders).toEqual([]);
  });
});
