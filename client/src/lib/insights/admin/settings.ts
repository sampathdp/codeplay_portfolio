/**
 * Admin read/write for engine configuration (`insights_settings`).
 * Writes go through the `insights_set_setting` security-definer RPC.
 */

import { getInsightsSupabase } from "../supabase";
import type { SettingRow } from "../records";
import { T, RPC } from "./tables";

export async function listSettings(): Promise<SettingRow[]> {
  const res = await getInsightsSupabase()
    .from(T.settings)
    .select("*")
    .order("key", { ascending: true });
  if (res.error) throw new Error(res.error.message);
  return (res.data as SettingRow[]) ?? [];
}

export async function getSetting<T = unknown>(key: string): Promise<T | null> {
  const res = await getInsightsSupabase()
    .from(T.settings)
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (res.error) throw new Error(res.error.message);
  return (res.data as { value: T } | null)?.value ?? null;
}

export async function setSetting(key: string, value: unknown): Promise<SettingRow> {
  const { data, error } = await getInsightsSupabase().rpc(RPC.setSetting, {
    p_key: key,
    p_value: value,
  });
  if (error) throw new Error(error.message);
  return data as SettingRow;
}
