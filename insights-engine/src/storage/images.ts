/**
 * Permanent image storage. Generated images are downloaded and stored —
 * never hotlinked from a temporary provider URL.
 *
 * Layout: insights/YYYY/MM/<article-slug>/<label>.webp
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export interface StoredObject {
  path: string;
  url: string;
  size: number;
  contentType: string;
}

export interface ImageStore {
  /** Store bytes at `insights/YYYY/MM/<slug>/<name>` and return a stable public URL. */
  put(
    slug: string,
    name: string,
    bytes: Buffer,
    contentType: string,
    now?: Date,
  ): Promise<StoredObject>;
  /** Best-effort delete of everything under an article's folder. */
  removeArticleFolder(slug: string): Promise<void>;
}

function folder(slug: string, now: Date): string {
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const safe = slug.replace(/[^a-z0-9-]/gi, "-").slice(0, 80) || "article";
  return `insights/${yyyy}/${mm}/${safe}`;
}

export class SupabaseImageStore implements ImageStore {
  constructor(
    private readonly sb: SupabaseClient,
    private readonly bucket = "insights-media",
  ) {}

  async put(
    slug: string,
    name: string,
    bytes: Buffer,
    contentType: string,
    now = new Date(),
  ): Promise<StoredObject> {
    const path = `${folder(slug, now)}/${name}`;
    const { error } = await this.sb.storage.from(this.bucket).upload(path, bytes, {
      contentType,
      upsert: true,
      cacheControl: "31536000",
    });
    if (error) throw new Error(`storage upload (${path}): ${error.message}`);

    const { data } = this.sb.storage.from(this.bucket).getPublicUrl(path);
    return { path, url: data.publicUrl, size: bytes.length, contentType };
  }

  async removeArticleFolder(slug: string): Promise<void> {
    const dir = folder(slug, new Date());
    const { data } = await this.sb.storage.from(this.bucket).list(dir);
    if (!data?.length) return;
    await this.sb.storage
      .from(this.bucket)
      .remove(data.map((f) => `${dir}/${f.name}`));
  }
}

export class MemoryImageStore implements ImageStore {
  readonly objects = new Map<string, { bytes: Buffer; contentType: string }>();

  async put(
    slug: string,
    name: string,
    bytes: Buffer,
    contentType: string,
    now = new Date(),
  ): Promise<StoredObject> {
    const path = `${folder(slug, now)}/${name}`;
    this.objects.set(path, { bytes, contentType });
    return {
      path,
      url: `memory://insights-media/${path}`,
      size: bytes.length,
      contentType,
    };
  }

  async removeArticleFolder(slug: string): Promise<void> {
    const dir = folder(slug, new Date());
    for (const key of [...this.objects.keys()]) {
      if (key.startsWith(dir)) this.objects.delete(key);
    }
  }
}
