/**
 * Admin actions for featured images.
 *
 *   Generate Image / Regenerate Image → queue a server-side job (the
 *     Gemini image call and storage happen in the worker; keys never reach
 *     the browser).
 *   Edit Prompt        → updates `image_prompt` only, no regeneration.
 *   Upload Manual Image → uploads the file to Storage with the admin's
 *     session, then records it; `featured_image_is_manual` is set so the
 *     worker never auto-replaces it.
 *   Remove Image       → clears image metadata + asset rows.
 */

import { getInsightsSupabase } from "../supabase";
import type {
  GenerationJobRow,
  ArticleRow,
  ImageAssetRow,
} from "../records";
import { T, RPC, INSIGHTS_MEDIA_BUCKET } from "./tables";

async function callRpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await getInsightsSupabase().rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

export function generateImage(articleId: string): Promise<GenerationJobRow> {
  return callRpc<GenerationJobRow>(RPC.requestImage, {
    p_article_id: articleId,
    p_kind: "generate_image",
    p_prompt: null,
  });
}

export function regenerateImage(
  articleId: string,
  promptOverride?: string,
): Promise<GenerationJobRow> {
  return callRpc<GenerationJobRow>(RPC.requestImage, {
    p_article_id: articleId,
    p_kind: "regenerate_image",
    p_prompt: promptOverride ?? null,
  });
}

/** Edit Prompt — stores the prompt; does not regenerate. */
export function editImagePrompt(
  articleId: string,
  prompt: string,
): Promise<ArticleRow> {
  return callRpc<ArticleRow>(RPC.setImagePrompt, {
    p_article_id: articleId,
    p_prompt: prompt,
  });
}

export interface ManualImageMeta {
  alt: string;
  width: number;
  height: number;
}

/**
 * Upload a manually-chosen image. It is stored under the article's folder
 * and marked manual so automatic generation never overwrites it.
 */
export async function uploadManualImage(
  articleId: string,
  slug: string,
  file: File | Blob,
  meta: ManualImageMeta,
): Promise<ArticleRow> {
  const sb = getInsightsSupabase();
  const now = new Date();
  const ext = fileExt(file);
  const path = `insights/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${slug}/manual.${ext}`;

  const up = await sb.storage.from(INSIGHTS_MEDIA_BUCKET).upload(path, file, {
    upsert: true,
    contentType: (file as File).type || "image/webp",
    cacheControl: "31536000",
  });
  if (up.error) throw new Error(`upload: ${up.error.message}`);

  const { data } = sb.storage.from(INSIGHTS_MEDIA_BUCKET).getPublicUrl(path);

  return callRpc<ArticleRow>(RPC.setManualImage, {
    p_article_id: articleId,
    p_url: data.publicUrl,
    p_storage_path: path,
    p_alt: meta.alt,
    p_width: meta.width,
    p_height: meta.height,
    p_bytes: (file as File).size ?? 0,
    p_content_type: (file as File).type || "image/webp",
  });
}

export function removeImage(articleId: string): Promise<ArticleRow> {
  return callRpc<ArticleRow>(RPC.removeImage, { p_article_id: articleId });
}

export async function listImageAssets(articleId: string): Promise<ImageAssetRow[]> {
  const res = await getInsightsSupabase()
    .from(T.imageAssets)
    .select("*")
    .eq("article_id", articleId)
    .order("is_primary", { ascending: false });
  if (res.error) throw new Error(res.error.message);
  return (res.data as ImageAssetRow[]) ?? [];
}

function fileExt(file: File | Blob): string {
  const type = (file as File).type || "";
  if (type.includes("webp")) return "webp";
  if (type.includes("png")) return "png";
  if (type.includes("jpeg") || type.includes("jpg")) return "jpg";
  if (type.includes("svg")) return "svg";
  return "webp";
}
