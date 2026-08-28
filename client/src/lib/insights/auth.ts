/**
 * Admin auth helpers for CodePlay Insights.
 *
 * Sign-in is passwordless (email magic link / OTP). Whether a signed-in
 * user is actually an admin is decided by the database: they must have a
 * row in `insights_admins`, which they can read about themselves via RLS
 * (`insights_admins_self_read`). The client check here is UX only —
 * every privileged query is independently enforced by RLS.
 */

import type { Session, User } from "@supabase/supabase-js";
import { getInsightsSupabase } from "./supabase";
import type { AdminRow } from "./records";

export async function getSession(): Promise<Session | null> {
  const { data, error } = await getInsightsSupabase().auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getUser(): Promise<User | null> {
  const { data, error } = await getInsightsSupabase().auth.getUser();
  if (error) return null;
  return data.user;
}

/** Sends a magic-link / OTP email. No account is created if none exists
 * (signup is disabled project-wide). The link returns the user straight
 * to the admin panel — the target must also be in the Supabase project's
 * Auth → URL Configuration → Redirect URLs allow-list, otherwise Supabase
 * falls back to the Site URL (usually the homepage). */
export async function signInWithEmail(email: string): Promise<void> {
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/admin/insights`
      : undefined;
  const { error } = await getInsightsSupabase().auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: redirectTo },
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await getInsightsSupabase().auth.signOut();
  if (error) throw error;
}

/** Returns the caller's `insights_admins` row, or null if they are not an
 * admin (or not signed in). */
export async function getAdminProfile(): Promise<AdminRow | null> {
  const user = await getUser();
  if (!user) return null;

  const { data, error } = await getInsightsSupabase()
    .from("insights_admins")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return (data as AdminRow | null) ?? null;
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  return (await getAdminProfile()) !== null;
}

export function onAuthStateChange(cb: (session: Session | null) => void) {
  return getInsightsSupabase().auth.onAuthStateChange((_event, session) => {
    cb(session);
  });
}
