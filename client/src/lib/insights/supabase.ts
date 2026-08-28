/**
 * Browser Supabase client for CodePlay Insights.
 *
 * Only ever uses the anon key (`VITE_SUPABASE_ANON_KEY`). Row Level
 * Security in the database is what actually authorizes every read and
 * write — see `supabase/migrations/20260827000500_insights_rls.sql`. The
 * service-role key and every server-only secret are out of scope for the
 * browser and must never be imported into client code.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export class InsightsConfigError extends Error {}

export function isInsightsConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
  );
}

/**
 * Returns the shared Supabase client. Throws `InsightsConfigError` when
 * the environment is not configured, so importing this module never
 * crashes a build or an unrelated page.
 */
export function getInsightsSupabase(): SupabaseClient {
  if (cached) return cached;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new InsightsConfigError(
      "CodePlay Insights is not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }

  cached = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return cached;
}

/** Test/HMR helper — drops the memoized client. */
export function resetInsightsSupabase(): void {
  cached = null;
}
