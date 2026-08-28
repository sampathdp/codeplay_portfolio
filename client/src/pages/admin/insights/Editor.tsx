import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Save, Check, CalendarClock, Send, Undo2, X, Archive } from "lucide-react";
import NotFound from "@/pages/not-found";
import { ADMIN_INSIGHTS_BASE, insightsArticleUrl } from "@/lib/insights/routes";
import { renderArticleBody } from "@/lib/insights/markdown";
import type { ArticleRow } from "@/lib/insights/records";
import {
  getArticle,
  listCategories,
  listArticleTagSlugs,
  listArticleSources,
  listImageAssets,
  updateArticle,
  setArticleSources,
  ensureTags,
  publishArticle,
  unpublishArticle,
  scheduleArticle,
  archiveArticle,
  approveArticle,
  markSectionsEdited,
  editImagePrompt,
  regenerateImage,
  removeImage,
  getArticleHistory,
  type ArticleSourceInput,
} from "@/lib/insights/admin";
import { useAsync, useAction } from "@/components/admin/useAsync";
import {
  Card,
  Btn,
  Field,
  inputCls,
  StatusPill,
  Spinner,
  ErrorNote,
  ScoreBar,
  relTime,
} from "@/components/admin/ui";
import AiActionPanel from "@/components/admin/AiActionPanel";
import ArticlePreview from "@/components/admin/ArticlePreview";

type Tab = "content" | "image" | "seo" | "ai" | "preview" | "history";

export default function Editor({ id }: { id: string }) {
  const [, navigate] = useLocation();
  const load = useAsync(
    () =>
      Promise.all([
        getArticle(id),
        listCategories(),
        listArticleTagSlugs(id),
        listArticleSources(id),
        listImageAssets(id),
      ]),
    [id],
  );

  if (load.loading) return <Spinner label="Loading article…" />;
  if (load.error) {
    if (/not found|no data|PGRST116/i.test(load.error)) return <NotFound />;
    return <ErrorNote error={load.error} onRetry={load.reload} />;
  }
  if (!load.data) return <NotFound />;

  const [article, categories, tagSlugs, sources, images] = load.data;

  return (
    <EditorInner
      key={article.id}
      article={article}
      categories={categories}
      initialTags={tagSlugs}
      initialSources={sources as Record<string, unknown>[]}
      images={images}
      reload={load.reload}
      onDeleted={() => navigate(`${ADMIN_INSIGHTS_BASE}/articles`)}
    />
  );
}

function EditorInner({
  article,
  categories,
  initialTags,
  initialSources,
  images,
  reload,
}: {
  article: ArticleRow;
  categories: { id: string; slug: string; name: string }[];
  initialTags: string[];
  initialSources: Record<string, unknown>[];
  images: { url: string; label: string; is_primary: boolean }[];
  reload: () => void;
  onDeleted: () => void;
}) {
  const [tab, setTab] = useState<Tab>("content");
  const action = useAction();

  const [form, setForm] = useState({
    title: article.title,
    subtitle: article.subtitle ?? "",
    excerpt: article.excerpt ?? "",
    content: article.content ?? "",
    category_id: article.category_id,
    seo_title: article.seo_title ?? "",
    seo_description: article.seo_description ?? "",
    featured_image_alt: article.featured_image_alt ?? "",
    image_prompt: article.image_prompt ?? "",
    tags: initialTags.join(", "),
  });
  const [srcRows, setSrcRows] = useState<ArticleSourceInput[]>(
    initialSources.map((s) => ({
      source_name: String(s.source_name ?? ""),
      source_url: String(s.source_url ?? ""),
      primary_source: Boolean(s.primary_source),
      source_author: (s.source_author as string) ?? "",
      notes: (s.notes as string) ?? "",
    })),
  );
  const [scheduleAt, setScheduleAt] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const categorySlug =
    categories.find((c) => c.id === form.category_id)?.slug ?? "software-development";

  const bodyHeadings = useMemo(
    () => renderArticleBody(form.content).headings.map((h) => ({ key: h.id.replace(/-/g, "_"), heading: h.text })),
    [form.content],
  );

  async function save() {
    await action.run("save", async () => {
      const tagNames = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const tagIds = tagNames.length ? await ensureTags(tagNames) : [];

      await updateArticle({
        id: article.id,
        title: form.title,
        subtitle: form.subtitle || undefined,
        excerpt: form.excerpt,
        content: form.content,
        category_id: form.category_id,
        seo_title: form.seo_title || undefined,
        seo_description: form.seo_description || undefined,
        featured_image_alt: form.featured_image_alt || undefined,
        tag_ids: tagIds,
      });
      await setArticleSources(article.id, srcRows);
      // protect the sections a human touched from AI overwrite
      await markSectionsEdited(
        article.id,
        bodyHeadings.map((h) => h.key),
      ).catch(() => {});
      setSavedAt(Date.now());
    }, reload);
  }

  const transition = (key: string, fn: () => Promise<unknown>) =>
    action.run(key, fn, reload);

  const primaryImg = images.find((i) => i.is_primary)?.url ?? article.featured_image_url;

  return (
    <div className="space-y-5">
      {/* Workflow bar */}
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={article.status} />
          {article.needs_review && (
            <span className="text-xs font-semibold text-amber-400">needs review</span>
          )}
          <a
            href={insightsArticleUrl(article.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary"
          >
            /insights/{article.slug}
          </a>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Btn variant="primary" loading={action.pending === "save"} onClick={save}>
              <Save className="h-3.5 w-3.5" /> Save
            </Btn>
            {article.status === "review" && (
              <Btn
                loading={action.pending === "approve"}
                onClick={() => transition("approve", () => approveArticle(article.id))}
              >
                <Check className="h-3.5 w-3.5" /> Approve
              </Btn>
            )}
            {article.status !== "published" && (
              <Btn
                loading={action.pending === "publish"}
                onClick={() => transition("publish", () => publishArticle(article.id))}
              >
                <Send className="h-3.5 w-3.5" /> Publish now
              </Btn>
            )}
            {article.status === "published" && (
              <Btn
                variant="ghost"
                loading={action.pending === "unpub"}
                onClick={() => transition("unpub", () => unpublishArticle(article.id))}
              >
                <Undo2 className="h-3.5 w-3.5" /> Unpublish
              </Btn>
            )}
            {article.status !== "rejected" && article.status !== "archived" && (
              <Btn
                variant="ghost"
                loading={action.pending === "archive"}
                onClick={() => transition("archive", () => archiveArticle(article.id))}
              >
                <Archive className="h-3.5 w-3.5" /> Archive
              </Btn>
            )}
          </div>
        </div>

        {/* Schedule */}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          <input
            type="datetime-local"
            value={scheduleAt}
            onChange={(e) => setScheduleAt(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs"
          />
          <Btn
            disabled={!scheduleAt}
            loading={action.pending === "schedule"}
            onClick={() =>
              transition("schedule", () =>
                scheduleArticle(article.id, new Date(scheduleAt).toISOString()),
              )
            }
          >
            Schedule
          </Btn>
          {article.scheduled_at && (
            <span className="text-xs text-muted-foreground">
              currently scheduled {relTime(article.scheduled_at)}
            </span>
          )}
        </div>

        {action.error && (
          <div className="mt-3">
            <ErrorNote error={action.error} onRetry={action.clearError} />
          </div>
        )}
        {savedAt && !action.error && (
          <p className="mt-2 text-xs text-emerald-400">Saved.</p>
        )}
      </Card>

      {/* Quality snapshot */}
      {(article.quality_score != null || article.review_reasons?.length > 0) && (
        <Card title="Quality">
          <div className="flex flex-wrap items-center gap-4">
            <ScoreBar label="Overall" value={article.quality_score} />
            <ScoreBar label="SEO" value={article.seo_score} />
            <ScoreBar label="Viral" value={article.viral_score} />
          </div>
          {article.review_reasons?.length > 0 && (
            <ul className="mt-3 list-disc space-y-0.5 pl-4 text-xs text-amber-400/90">
              {article.review_reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {(["content", "image", "seo", "ai", "preview", "history"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
              tab === t ? "bg-primary/15 text-primary" : "bg-white/5 text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "content" && (
        <Card>
          <div className="grid gap-4">
            <Field label="Title" htmlFor="f-title">
              <input id="f-title" className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Subtitle / standfirst" htmlFor="f-sub">
              <input id="f-sub" className={inputCls} value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
            </Field>
            <Field label="Excerpt" htmlFor="f-ex" hint={`${form.excerpt.length}/320`}>
              <textarea id="f-ex" rows={2} className={inputCls} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" htmlFor="f-cat">
                <select
                  id="f-cat"
                  className={inputCls}
                  value={form.category_id}
                  onChange={(e) => set("category_id", e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tags (comma separated)" htmlFor="f-tags">
                <input id="f-tags" className={inputCls} value={form.tags} onChange={(e) => set("tags", e.target.value)} />
              </Field>
            </div>
            <Field label="Content (Markdown)" htmlFor="f-body" hint="Body headings you edit are protected from AI overwrite on save.">
              <textarea
                id="f-body"
                rows={20}
                className={`${inputCls} font-mono text-xs leading-relaxed`}
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
              />
            </Field>

            <SourceEditor rows={srcRows} onChange={setSrcRows} />
          </div>
        </Card>
      )}

      {tab === "image" && (
        <Card title="Featured image">
          {primaryImg ? (
            <img src={primaryImg} alt={form.featured_image_alt} className="mb-3 aspect-video w-full max-w-lg rounded-lg border border-white/10 object-cover" />
          ) : (
            <p className="mb-3 text-sm text-muted-foreground">No image yet.</p>
          )}
          <p className="mb-3 text-xs text-muted-foreground">
            Status: <StatusPill status={article.featured_image_status || "none"} />
            {article.featured_image_is_manual && " — manual (never auto-replaced)"}
          </p>
          <div className="grid gap-4 sm:max-w-lg">
            <Field label="Image alt text" htmlFor="f-alt">
              <input id="f-alt" className={inputCls} value={form.featured_image_alt} onChange={(e) => set("featured_image_alt", e.target.value)} />
            </Field>
            <Field label="Image prompt" htmlFor="f-prompt">
              <textarea id="f-prompt" rows={3} className={inputCls} value={form.image_prompt} onChange={(e) => set("image_prompt", e.target.value)} />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Btn
                loading={action.pending === "img-prompt"}
                onClick={() => action.run("img-prompt", () => editImagePrompt(article.id, form.image_prompt), reload)}
              >
                Save prompt
              </Btn>
              <Btn
                variant="primary"
                disabled={article.featured_image_is_manual}
                title={article.featured_image_is_manual ? "Remove the manual image first" : undefined}
                loading={action.pending === "img-gen"}
                onClick={() => action.run("img-gen", () => regenerateImage(article.id, form.image_prompt || undefined), reload)}
              >
                {primaryImg ? "Regenerate image" : "Generate image"}
              </Btn>
              {primaryImg && (
                <Btn
                  variant="danger"
                  loading={action.pending === "img-rm"}
                  onClick={() => action.run("img-rm", () => removeImage(article.id), reload)}
                >
                  <X className="h-3.5 w-3.5" /> Remove
                </Btn>
              )}
            </div>
            <p className="text-[0.7rem] text-muted-foreground">
              Manual upload: use the site&rsquo;s media flow; a manually set image is
              never replaced by generation.
            </p>
          </div>
        </Card>
      )}

      {tab === "seo" && (
        <Card title="SEO">
          <div className="grid gap-4 sm:max-w-2xl">
            <Field label="SEO title" htmlFor="f-st" hint={`${form.seo_title.length}/70`}>
              <input id="f-st" className={inputCls} value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} />
            </Field>
            <Field label="SEO description" htmlFor="f-sd" hint={`${form.seo_description.length}/160`}>
              <textarea id="f-sd" rows={3} className={inputCls} value={form.seo_description} onChange={(e) => set("seo_description", e.target.value)} />
            </Field>
            <Field label="Canonical URL (derived from slug)">
              <input readOnly className={`${inputCls} opacity-60`} value={insightsArticleUrl(article.slug)} />
            </Field>
          </div>
        </Card>
      )}

      {tab === "ai" && (
        <AiActionPanel article={article} sections={bodyHeadings} onApplied={reload} />
      )}

      {tab === "preview" && (
        <ArticlePreview
          data={{
            title: form.title,
            subtitle: form.subtitle,
            category: categorySlug,
            content: form.content,
            imageUrl: primaryImg,
            imageAlt: form.featured_image_alt,
            aiGenerated: article.image_is_ai_generated,
          }}
        />
      )}

      {tab === "history" && <HistoryTab articleId={article.id} />}
    </div>
  );
}

function SourceEditor({
  rows,
  onChange,
}: {
  rows: ArticleSourceInput[];
  onChange: (r: ArticleSourceInput[]) => void;
}) {
  const upd = (i: number, patch: Partial<ArticleSourceInput>) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">Sources</p>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <input
              placeholder="Publisher"
              className="w-36 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs"
              value={r.source_name}
              onChange={(e) => upd(i, { source_name: e.target.value })}
            />
            <input
              placeholder="https://…"
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs"
              value={r.source_url}
              onChange={(e) => upd(i, { source_url: e.target.value })}
            />
            <label className="flex items-center gap-1 text-[0.7rem] text-muted-foreground">
              <input
                type="checkbox"
                checked={Boolean(r.primary_source)}
                onChange={(e) => upd(i, { primary_source: e.target.checked })}
              />
              primary
            </label>
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
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
        onClick={() => onChange([...rows, { source_name: "", source_url: "", primary_source: false }])}
      >
        + Add source
      </Btn>
    </div>
  );
}

function HistoryTab({ articleId }: { articleId: string }) {
  const hist = useAsync(() => getArticleHistory(articleId), [articleId]);
  if (hist.loading) return <Spinner />;
  if (hist.error) return <ErrorNote error={hist.error} onRetry={hist.reload} />;
  return (
    <Card title="Article history">
      <ol className="relative space-y-3 border-l border-white/10 pl-4">
        {(hist.data ?? []).map((e, i) => (
          <li key={i} className="text-sm">
            <span className="absolute -left-[5px] mt-1.5 h-2 w-2 rounded-full bg-primary/60" />
            <p className="font-medium">{e.label}</p>
            <p className="text-[0.7rem] text-muted-foreground">
              {relTime(e.at)}
              {e.actor && ` · ${e.actor}`}
              {e.detail && ` · ${e.detail}`}
            </p>
          </li>
        ))}
        {(hist.data ?? []).length === 0 && (
          <li className="text-sm text-muted-foreground">No history recorded.</li>
        )}
      </ol>
    </Card>
  );
}
