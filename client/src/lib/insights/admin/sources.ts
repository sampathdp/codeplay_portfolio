/**
 * Admin CRUD for the approved-source registry (`insights_news_sources`).
 * All access is admin-only via RLS.
 */

import { getInsightsSupabase } from "../supabase";
import type { NewsSourceRow } from "../records";
import { newsSourceInputSchema } from "../schemas";
import { slugify } from "../slug";
import { T, RPC } from "./tables";

export async function listSources(): Promise<NewsSourceRow[]> {
  const res = await getInsightsSupabase()
    .from(T.newsSources)
    .select("*")
    .order("priority", { ascending: true });
  if (res.error) throw new Error(res.error.message);
  return (res.data as NewsSourceRow[]) ?? [];
}

export async function createSource(
  input: unknown,
): Promise<NewsSourceRow> {
  const parsed = newsSourceInputSchema.parse(input);
  const res = await getInsightsSupabase()
    .from(T.newsSources)
    .insert(parsed)
    .select("*")
    .single();
  if (res.error) throw new Error(res.error.message);
  return res.data as NewsSourceRow;
}

export async function updateSource(
  id: string,
  patch: Partial<Record<string, unknown>>,
): Promise<NewsSourceRow> {
  const allowed = newsSourceInputSchema.partial().parse(patch);
  const res = await getInsightsSupabase()
    .from(T.newsSources)
    .update(allowed)
    .eq("id", id)
    .select("*")
    .single();
  if (res.error) throw new Error(res.error.message);
  return res.data as NewsSourceRow;
}

export async function setSourceEnabled(
  id: string,
  enabled: boolean,
): Promise<NewsSourceRow> {
  return updateSource(id, { enabled });
}

export async function deleteSource(id: string): Promise<void> {
  const { error } = await getInsightsSupabase()
    .from(T.newsSources)
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * Flag a source to be fetched on the next discovery run. The discovery
 * engine runs on a schedule (every ~3h) — this does not trigger it
 * immediately.
 */
export async function requestSourceRun(id: string): Promise<NewsSourceRow> {
  const { data, error } = await getInsightsSupabase().rpc(RPC.requestSourceRun, {
    p_id: id,
  });
  if (error) throw new Error(error.message);
  return data as NewsSourceRow;
}

/** Convenience for seeding a source from just its name + URL. */
export function draftSourceKey(name: string): string {
  return slugify(name);
}
