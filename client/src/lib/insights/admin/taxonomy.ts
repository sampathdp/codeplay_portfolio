/**
 * Admin CRUD for categories and tags.
 *
 * Reads are public (RLS `*_read` policies); writes require admin. Tags are
 * created on demand — never hardcoded in the app.
 */

import { getInsightsSupabase } from "../supabase";
import type { CategoryRow, TagRow } from "../records";
import { categoryInputSchema, tagInputSchema } from "../schemas";
import { slugify } from "../slug";
import { T } from "./tables";

// --- categories ----------------------------------------------------------

export async function listCategories(): Promise<CategoryRow[]> {
  const res = await getInsightsSupabase()
    .from(T.categories)
    .select("*")
    .order("sort_order", { ascending: true });
  if (res.error) throw new Error(res.error.message);
  return (res.data as CategoryRow[]) ?? [];
}

export async function createCategory(input: unknown): Promise<CategoryRow> {
  const parsed = categoryInputSchema.parse(input);
  const row = { ...parsed, slug: parsed.slug ?? slugify(parsed.name) };
  const res = await getInsightsSupabase()
    .from(T.categories)
    .insert(row)
    .select("*")
    .single();
  if (res.error) throw new Error(res.error.message);
  return res.data as CategoryRow;
}

export async function updateCategory(
  id: string,
  patch: unknown,
): Promise<CategoryRow> {
  const parsed = categoryInputSchema.partial().parse(patch);
  const res = await getInsightsSupabase()
    .from(T.categories)
    .update(parsed)
    .eq("id", id)
    .select("*")
    .single();
  if (res.error) throw new Error(res.error.message);
  return res.data as CategoryRow;
}

// --- tags ---------------------------------------------------------------

export async function listTags(): Promise<TagRow[]> {
  const res = await getInsightsSupabase()
    .from(T.tags)
    .select("*")
    .order("name", { ascending: true });
  if (res.error) throw new Error(res.error.message);
  return (res.data as TagRow[]) ?? [];
}

export async function createTag(input: unknown): Promise<TagRow> {
  const parsed = tagInputSchema.parse(input);
  const row = { ...parsed, slug: parsed.slug ?? slugify(parsed.name) };
  const res = await getInsightsSupabase()
    .from(T.tags)
    .insert(row)
    .select("*")
    .single();
  if (res.error) throw new Error(res.error.message);
  return res.data as TagRow;
}

export async function deleteTag(id: string): Promise<void> {
  const { error } = await getInsightsSupabase().from(T.tags).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * Returns existing tag ids for the given names, creating any that are
 * missing. Used when an editor types free-form tags.
 */
export async function ensureTags(names: string[]): Promise<string[]> {
  const wanted = names.map((n) => ({ name: n.trim(), slug: slugify(n) }))
    .filter((t) => t.slug.length > 0);
  if (wanted.length === 0) return [];

  const sb = getInsightsSupabase();
  const upsert = await sb
    .from(T.tags)
    .upsert(wanted, { onConflict: "slug", ignoreDuplicates: true })
    .select("id,slug");
  if (upsert.error) throw new Error(upsert.error.message);

  const slugs = wanted.map((t) => t.slug);
  const res = await sb.from(T.tags).select("id,slug").in("slug", slugs);
  if (res.error) throw new Error(res.error.message);
  return ((res.data as { id: string }[]) ?? []).map((r) => r.id);
}
