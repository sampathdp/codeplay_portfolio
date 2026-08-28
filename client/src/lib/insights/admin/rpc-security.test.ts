import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { RPC } from "./tables";

/**
 * Authorization contract test (static analysis of the migrations).
 *
 * Every admin RPC MUST re-check `insights_require_admin()` server-side, so
 * an unauthenticated or non-admin caller can never mutate anything even if
 * they bypass the client `RequireAdmin` gate or call PostgREST directly.
 */

const MIGRATIONS_DIR = join(process.cwd(), "supabase", "migrations");
const sql = readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith(".sql"))
  .map((f) => readFileSync(join(MIGRATIONS_DIR, f), "utf8"))
  .join("\n\n");

/** Functions that are deliberately public / unauthenticated. */
const PUBLIC_FUNCTIONS = new Set([
  "insights_slugify",
  "insights_article_unique_slug",
  "insights_is_admin",
  "insights_current_email",
  "insights_require_admin",
  "insights_touch_updated_at",
  "insights_articles_before_write",
  "insights_articles_audit",
  "insights_sync_source_count",
  "insights_log_admin_action",
  "insights_record_view", // public view counter — only bumps a vanity number
]);

/** Service-role-only functions (execute revoked from public; no admin check needed). */
const SERVICE_ROLE_ONLY = new Set([
  "insights_publish_due_scheduled",
  "insights_grant_admin",
]);

function bodyOf(name: string): string | null {
  const re = new RegExp(
    `create or replace function ${name}\\s*\\([^)]*\\)[\\s\\S]*?\\$\\$([\\s\\S]*?)\\$\\$;`,
    "i",
  );
  return sql.match(re)?.[1] ?? null;
}

describe("admin RPC authorization contract", () => {
  const defined = [
    ...sql.matchAll(/create or replace function (insights_[a-z_]+)\s*\(/gi),
  ].map((m) => m[1]);

  it("every non-public Insights function re-checks admin (or is service-role-only)", () => {
    const offenders: string[] = [];
    for (const name of new Set(defined)) {
      if (PUBLIC_FUNCTIONS.has(name)) continue;
      const body = bodyOf(name);
      if (!body) continue;
      const guarded = /insights_require_admin\(\)/.test(body);
      const revoked = new RegExp(`revoke all on function ${name}\\b`, "i").test(sql);
      if (SERVICE_ROLE_ONLY.has(name)) {
        if (!revoked) offenders.push(`${name}: service-role fn without revoke`);
        continue;
      }
      if (!guarded) offenders.push(`${name}: missing insights_require_admin()`);
    }
    expect(offenders).toEqual([]);
  });

  it("every admin RPC referenced by the client exists as a guarded function", () => {
    const missing: string[] = [];
    const unguarded: string[] = [];
    for (const fn of Object.values(RPC)) {
      if (PUBLIC_FUNCTIONS.has(fn) || SERVICE_ROLE_ONLY.has(fn)) continue;
      const body = bodyOf(fn);
      if (!body) {
        missing.push(fn);
        continue;
      }
      if (!/insights_require_admin\(\)/.test(body)) unguarded.push(fn);
    }
    expect(missing).toEqual([]);
    expect(unguarded).toEqual([]);
  });

  it("public reads are limited to published articles (RLS)", () => {
    expect(sql).toMatch(/insights_articles_read_published/);
    expect(sql).toMatch(
      /for select using \(\s*status = 'published'/i,
    );
    // no anon INSERT/UPDATE/DELETE grant on the article table
    expect(sql).not.toMatch(/grant\s+(insert|update|delete)[^;]*insights_articles[^;]*to anon/i);
  });

  it("RLS is enabled on every core Insights table", () => {
    for (const t of [
      "insights_articles",
      "insights_topic_clusters",
      "insights_news_candidates",
      "insights_news_sources",
      "insights_settings",
      "insights_content_generation_jobs",
      "insights_ai_usage",
      "insights_admin_action_logs",
      "insights_image_assets",
    ]) {
      expect(sql).toMatch(
        new RegExp(`alter table ${t}\\s+enable row level security`, "i"),
      );
    }
  });
});
