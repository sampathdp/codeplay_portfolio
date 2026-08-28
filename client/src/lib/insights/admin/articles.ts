/**
 * Admin article operations for CodePlay Insights.
 *
 * Every call goes through the anon-key Supabase client; the database
 * authorizes it via RLS (`insights_articles_admin`, which requires
 * `insights_is_admin()`) and, for workflow transitions, via
 * security-definer RPCs that re-check admin status server-side. Nothing
 * here trusts the browser.
 */

import { getInsightsSupabase } from "../supabase";
import type { ArticleRow } from "../records";
import {
  articleCreateSchema,
  articleUpdateSchema,
  scheduleArticleSchema,
  type ArticleCreateInput,
  type ArticleUpdateInput,
} from "../schemas";
import { T, RPC } from "./tables";

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  if (res.data == null) throw new Error("no data returned");
  return res.data;
}

const EDITABLE_COLUMNS = [
  "title",
  "slug",
  "subtitle",
  "excerpt",
  "content",
  "content_format",
  "content_type",
  "status",
  "category_id",
  "author_id",
  "candidate_id",
  "featured",
  "trending",
  "breaking",
  "featured_image_url",
  "featured_image_alt",
  "image_prompt",
  "image_is_ai_generated",
  "seo_title",
  "seo_description",
  "canonical_url",
  "developer_take",
  "business_impact",
  "developer_impact",
  "risks_limitations",
  "why_it_matters",
  "recommendations",
] as const;

function pickColumns(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of EDITABLE_COLUMNS) {
    if (key in input && input[key] !== undefined) out[key] = input[key];
  }
  return out;
}

async function resolveDefaultAuthorId(): Promise<string> {
  const res = await getInsightsSupabase()
    .from(T.authors)
    .select("id")
    .eq("slug", "codeplay-studios-editorial-team")
    .single();
  return unwrap(res).id as string;
}

export async function createArticle(
  input: ArticleCreateInput,
): Promise<ArticleRow> {
  const parsed = articleCreateSchema.parse(input);
  const { tag_ids, sources, author_id, ...rest } = parsed;

  const row = pickColumns({
    ...rest,
    author_id: author_id ?? (await resolveDefaultAuthorId()),
  });

  const sb = getInsightsSupabase();
  const article = unwrap(
    await sb.from(T.articles).insert(row).select("*").single(),
  ) as ArticleRow;

  if (tag_ids?.length) await setArticleTags(article.id, tag_ids);
  if (sources?.length) {
    unwrap(
      await sb
        .from(T.articleSources)
        .insert(sources.map((s) => ({ ...s, article_id: article.id })))
        .select("id"),
    );
  }

  return article;
}

export async function updateArticle(
  input: ArticleUpdateInput,
): Promise<ArticleRow> {
  const parsed = articleUpdateSchema.parse(input);
  const { id, tag_ids, sources: _sources, ...rest } = parsed;
  const patch = pickColumns(rest);

  const sb = getInsightsSupabase();
  const article = unwrap(
    await sb.from(T.articles).update(patch).eq("id", id).select("*").single(),
  ) as ArticleRow;

  if (tag_ids) await setArticleTags(id, tag_ids);
  return article;
}

export async function getArticle(id: string): Promise<ArticleRow> {
  return unwrap(
    await getInsightsSupabase().from(T.articles).select("*").eq("id", id).single(),
  ) as ArticleRow;
}

export async function getArticleBySlug(slug: string): Promise<ArticleRow | null> {
  const res = await getInsightsSupabase()
    .from(T.articles)
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (res.error) throw new Error(res.error.message);
  return (res.data as ArticleRow | null) ?? null;
}

export interface ListArticlesOptions {
  status?: ArticleRow["status"] | ArticleRow["status"][];
  categoryId?: string;
  limit?: number;
  offset?: number;
}

export async function listArticles(
  opts: ListArticlesOptions = {},
): Promise<ArticleRow[]> {
  let filter = getInsightsSupabase().from(T.articles).select("*");

  if (Array.isArray(opts.status)) filter = filter.in("status", opts.status);
  else if (opts.status) filter = filter.eq("status", opts.status);
  if (opts.categoryId) filter = filter.eq("category_id", opts.categoryId);

  let query = filter.order("updated_at", { ascending: false });
  if (opts.limit != null) {
    const from = opts.offset ?? 0;
    query = query.range(from, from + opts.limit - 1);
  }

  const res = await query;
  if (res.error) throw new Error(res.error.message);
  return (res.data as ArticleRow[]) ?? [];
}

export function listDrafts(): Promise<ArticleRow[]> {
  return listArticles({ status: ["idea", "researching", "draft", "review"] });
}

export function listPublished(limit = 50): Promise<ArticleRow[]> {
  return listArticles({ status: "published", limit });
}

export function listScheduled(): Promise<ArticleRow[]> {
  return listArticles({ status: "scheduled" });
}

export async function listArticleTagSlugs(articleId: string): Promise<string[]> {
  const sb = getInsightsSupabase();
  const links = await sb
    .from(T.articleTags)
    .select("tag_id")
    .eq("article_id", articleId);
  if (links.error) throw new Error(links.error.message);
  const ids = ((links.data as { tag_id: string }[]) ?? []).map((r) => r.tag_id);
  if (ids.length === 0) return [];

  const tags = await sb.from(T.tags).select("name").in("id", ids);
  if (tags.error) throw new Error(tags.error.message);
  return ((tags.data as { name: string }[]) ?? []).map((t) => t.name);
}

export interface ArticleSourceInput {
  source_name: string;
  source_url: string;
  primary_source?: boolean;
  source_author?: string | null;
  notes?: string | null;
}

export async function listArticleSources(articleId: string) {
  const res = await getInsightsSupabase()
    .from(T.articleSources)
    .select("*")
    .eq("article_id", articleId)
    .order("primary_source", { ascending: false });
  if (res.error) throw new Error(res.error.message);
  return (res.data as Record<string, unknown>[]) ?? [];
}

/** Replace an article's source list. */
export async function setArticleSources(
  articleId: string,
  sources: ArticleSourceInput[],
): Promise<void> {
  const sb = getInsightsSupabase();
  const del = await sb
    .from(T.articleSources)
    .delete()
    .eq("article_id", articleId);
  if (del.error) throw new Error(del.error.message);

  const clean = sources.filter((s) => s.source_url.trim() && s.source_name.trim());
  if (clean.length === 0) return;

  const ins = await sb.from(T.articleSources).insert(
    clean.map((s) => ({
      article_id: articleId,
      source_name: s.source_name.trim(),
      source_url: s.source_url.trim(),
      source_type: s.primary_source ? "official_blog" : "article",
      primary_source: Boolean(s.primary_source),
      verified: Boolean(s.primary_source),
      source_author: s.source_author || null,
      notes: s.notes || null,
    })),
  );
  if (ins.error) throw new Error(ins.error.message);
}

export async function setArticleTags(
  articleId: string,
  tagIds: string[],
): Promise<void> {
  const sb = getInsightsSupabase();
  const del = await sb.from(T.articleTags).delete().eq("article_id", articleId);
  if (del.error) throw new Error(del.error.message);
  if (tagIds.length === 0) return;

  const ins = await sb
    .from(T.articleTags)
    .insert(tagIds.map((tag_id) => ({ article_id: articleId, tag_id })));
  if (ins.error) throw new Error(ins.error.message);
}

// --- workflow transitions (security-definer RPCs) -------------------------

async function callRpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await getInsightsSupabase().rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

export function publishArticle(id: string): Promise<ArticleRow> {
  return callRpc<ArticleRow>(RPC.publishArticle, { p_id: id });
}

export function unpublishArticle(id: string): Promise<ArticleRow> {
  return callRpc<ArticleRow>(RPC.unpublishArticle, { p_id: id });
}

export function archiveArticle(id: string): Promise<ArticleRow> {
  return callRpc<ArticleRow>(RPC.archiveArticle, { p_id: id });
}

export async function scheduleArticle(
  id: string,
  scheduledAt: string,
): Promise<ArticleRow> {
  const { id: pId, scheduled_at } = scheduleArticleSchema.parse({
    id,
    scheduled_at: scheduledAt,
  });
  return callRpc<ArticleRow>(RPC.scheduleArticle, {
    p_id: pId,
    p_when: scheduled_at,
  });
}

/**
 * Hard delete. Prefer `archiveArticle`; this is for drafts/junk only and
 * still requires admin RLS.
 */
export async function deleteArticle(id: string): Promise<void> {
  const { error } = await getInsightsSupabase()
    .from(T.articles)
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}
