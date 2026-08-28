import { useState } from "react";
import { useLocation } from "wouter";
import { Plus, X, ArrowLeft } from "lucide-react";
import { ADMIN_INSIGHTS_BASE } from "@/lib/insights/routes";
import { createArticle, listCategories, ensureTags } from "@/lib/insights/admin";
import { useAsync, useAction } from "@/components/admin/useAsync";
import { Card, Btn, Field, inputCls, Spinner, ErrorNote } from "@/components/admin/ui";

interface SrcRow {
  source_name: string;
  source_url: string;
  primary_source: boolean;
}

/**
 * Manual article creation — write the first (or any) post by hand, without
 * the discovery + Gemini pipeline. Lands as a `draft`; the full editor
 * (Approve / Publish / image / SEO) takes over once it exists.
 */
export default function NewArticle() {
  const [, navigate] = useLocation();
  const cats = useAsync(() => listCategories(), []);
  const action = useAction();

  const [f, setF] = useState({
    title: "",
    slug: "",
    subtitle: "",
    excerpt: "",
    content: "",
    category_id: "",
    tags: "",
    featured_image_url: "",
    featured_image_alt: "",
  });
  const [sources, setSources] = useState<SrcRow[]>([
    { source_name: "", source_url: "", primary_source: true },
  ]);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  if (cats.loading) return <Spinner label="Loading…" />;
  if (cats.error) return <ErrorNote error={cats.error} onRetry={cats.reload} />;

  const categories = cats.data ?? [];
  const categoryId = f.category_id || categories[0]?.id || "";
  const canSubmit = f.title.trim().length >= 3 && categoryId;

  async function submit() {
    await action.run("create", async () => {
      const tagNames = f.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const tag_ids = tagNames.length ? await ensureTags(tagNames) : [];
      const cleanSources = sources
        .filter((s) => s.source_name.trim() && /^https?:\/\//.test(s.source_url.trim()))
        .map((s) => ({
          source_name: s.source_name.trim(),
          source_url: s.source_url.trim(),
          primary_source: s.primary_source,
          verified: false,
          source_type: (s.primary_source ? "official_blog" : "article") as
            | "official_blog"
            | "article",
        }));

      const imgUrl = f.featured_image_url.trim();
      const article = await createArticle({
        title: f.title.trim(),
        slug: f.slug.trim() || undefined,
        subtitle: f.subtitle.trim() || undefined,
        excerpt: f.excerpt.trim(),
        content: f.content,
        content_format: "markdown",
        content_type: "news",
        status: "draft",
        category_id: categoryId,
        featured: false,
        trending: false,
        breaking: false,
        image_is_ai_generated: false,
        featured_image_url: /^https?:\/\//.test(imgUrl) ? imgUrl : undefined,
        featured_image_alt: f.featured_image_alt.trim() || undefined,
        tag_ids,
        sources: cleanSources.length ? cleanSources : undefined,
      });

      navigate(`${ADMIN_INSIGHTS_BASE}/articles/${article.id}`);
    });
  }

  const updSrc = (i: number, patch: Partial<SrcRow>) =>
    setSources((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  return (
    <div className="max-w-3xl space-y-5">
      <button
        onClick={() => navigate(`${ADMIN_INSIGHTS_BASE}/articles`)}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Articles
      </button>

      {action.error && <ErrorNote error={action.error} onRetry={action.clearError} />}

      <Card title="New article">
        <div className="grid gap-4">
          <Field label="Title" htmlFor="n-title" hint="Required, 3+ characters">
            <input
              id="n-title"
              className={inputCls}
              value={f.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Headline"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" htmlFor="n-cat">
              <select
                id="n-cat"
                className={inputCls}
                value={categoryId}
                onChange={(e) => set("category_id", e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Slug (optional)"
              htmlFor="n-slug"
              hint="Auto-derived from the title if left blank"
            >
              <input
                id="n-slug"
                className={inputCls}
                value={f.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="lowercase-hyphenated"
              />
            </Field>
          </div>

          <Field label="Subtitle / standfirst" htmlFor="n-sub">
            <input
              id="n-sub"
              className={inputCls}
              value={f.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
            />
          </Field>

          <Field label="Excerpt" htmlFor="n-ex" hint={`${f.excerpt.length}/600`}>
            <textarea
              id="n-ex"
              rows={2}
              className={inputCls}
              value={f.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
            />
          </Field>

          <Field label="Tags (comma separated)" htmlFor="n-tags">
            <input
              id="n-tags"
              className={inputCls}
              value={f.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="ai, gemini, coding"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Featured image URL (optional)"
              htmlFor="n-img"
              hint="A public https URL. Used for the hero + social cards."
            >
              <input
                id="n-img"
                className={inputCls}
                value={f.featured_image_url}
                onChange={(e) => set("featured_image_url", e.target.value)}
                placeholder="https://…/image.jpg"
              />
            </Field>
            <Field label="Image alt text" htmlFor="n-imgalt">
              <input
                id="n-imgalt"
                className={inputCls}
                value={f.featured_image_alt}
                onChange={(e) => set("featured_image_alt", e.target.value)}
                placeholder="Describe the image"
              />
            </Field>
          </div>

          <Field
            label="Content (Markdown)"
            htmlFor="n-body"
            hint="## headings, - lists, [text](https://url), **bold**"
          >
            <textarea
              id="n-body"
              rows={18}
              className={`${inputCls} font-mono text-xs leading-relaxed`}
              value={f.content}
              onChange={(e) => set("content", e.target.value)}
            />
          </Field>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Sources &amp; further reading
            </p>
            <div className="space-y-2">
              {sources.map((s, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  <input
                    placeholder="Publisher"
                    className="w-36 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs"
                    value={s.source_name}
                    onChange={(e) => updSrc(i, { source_name: e.target.value })}
                  />
                  <input
                    placeholder="https://…"
                    className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs"
                    value={s.source_url}
                    onChange={(e) => updSrc(i, { source_url: e.target.value })}
                  />
                  <label className="flex items-center gap-1 text-[0.7rem] text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={s.primary_source}
                      onChange={(e) => updSrc(i, { primary_source: e.target.checked })}
                    />
                    primary
                  </label>
                  <button
                    type="button"
                    onClick={() => setSources((r) => r.filter((_, idx) => idx !== i))}
                    className="rounded p-1 text-muted-foreground hover:text-destructive"
                    aria-label="Remove source"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <Btn
              className="mt-2"
              onClick={() =>
                setSources((r) => [
                  ...r,
                  { source_name: "", source_url: "", primary_source: false },
                ])
              }
            >
              <Plus className="h-3.5 w-3.5" /> Add source
            </Btn>
          </div>

          <div className="flex items-center gap-3 border-t border-white/10 pt-4">
            <Btn
              variant="primary"
              disabled={!canSubmit}
              loading={action.pending === "create"}
              onClick={submit}
            >
              Create draft
            </Btn>
            <span className="text-xs text-muted-foreground">
              Lands as a draft — review, add an image, then Publish from the editor.
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
