/**
 * Article history — a merged timeline of admin-action audit entries and
 * generation jobs for one article.
 */

import { getInsightsSupabase } from "../supabase";
import { T } from "./tables";
import type { AdminActionLogRow, GenerationJobRow } from "../records";

export interface HistoryEvent {
  at: string;
  kind:
    | "created"
    | "ai_generated"
    | "ai_job"
    | "edit"
    | "status_change"
    | "approve"
    | "schedule"
    | "publish"
    | "unpublish"
    | "archive"
    | "image"
    | "other";
  label: string;
  actor?: string | null;
  detail?: string;
}

const ACTION_KIND: Record<string, HistoryEvent["kind"]> = {
  request_generation: "ai_job",
  request_image: "image",
  edit: "edit",
  status_change: "status_change",
  approve: "approve",
  schedule: "schedule",
  publish: "publish",
  unpublish: "unpublish",
  archive: "archive",
  apply_section: "edit",
  edit_image_prompt: "edit",
  upload_manual_image: "image",
  remove_image: "image",
};

export async function getArticleHistory(articleId: string): Promise<HistoryEvent[]> {
  const sb = getInsightsSupabase();

  const [article, logs, jobs] = await Promise.all([
    sb
      .from(T.articles)
      .select("created_at,generation_job_id,article_type,status")
      .eq("id", articleId)
      .single(),
    sb
      .from(T.auditLogs)
      .select("*")
      .eq("entity_type", "article")
      .eq("entity_id", articleId)
      .order("created_at", { ascending: true }),
    sb
      .from(T.generationJobs)
      .select("*")
      .eq("article_id", articleId)
      .order("created_at", { ascending: true }),
  ]);

  const events: HistoryEvent[] = [];

  if (!article.error && article.data) {
    const a = article.data as {
      created_at: string;
      generation_job_id: string | null;
      article_type: string | null;
    };
    events.push({
      at: a.created_at,
      kind: a.generation_job_id ? "ai_generated" : "created",
      label: a.generation_job_id
        ? `Draft generated${a.article_type ? ` (${a.article_type})` : ""}`
        : "Article created",
    });
  }

  const IMAGE_KINDS = ["generate_image", "regenerate_image"];
  for (const raw of (jobs.data as GenerationJobRow[]) ?? []) {
    events.push({
      at: raw.completed_at ?? raw.updated_at,
      kind: IMAGE_KINDS.includes(raw.kind) ? "image" : "ai_job",
      label: jobLabel(raw),
      detail: raw.status === "failed" ? raw.error ?? "failed" : raw.status,
    });
  }

  for (const raw of (logs.data as AdminActionLogRow[]) ?? []) {
    const kind = ACTION_KIND[raw.action] ?? "other";
    events.push({
      at: raw.created_at,
      kind,
      label: logLabel(raw),
      actor: raw.actor_email,
    });
  }

  return events.sort((x, y) => Date.parse(x.at) - Date.parse(y.at));
}

function jobLabel(j: GenerationJobRow): string {
  const map: Record<string, string> = {
    full_article: "Full draft",
    regenerate_section: "Section rewrite",
    improve_title: "Headline improvement",
    improve_seo: "SEO regenerated",
    regenerate_summary: "Summary regenerated",
    fact_check: "Fact check",
    generate_image: "Image generated",
    regenerate_image: "Image regenerated",
  };
  return `AI: ${map[j.kind] ?? j.kind} — ${j.status}`;
}

function logLabel(l: AdminActionLogRow): string {
  const m = l.metadata as Record<string, unknown>;
  switch (l.action) {
    case "status_change":
      return `Status: ${m.from} → ${m.to}`;
    case "edit":
      return `Edited: ${(m.fields as string[] | undefined)?.join(", ") ?? "fields"}`;
    case "schedule":
      return `Scheduled for ${m.scheduled_at ?? "a later time"}`;
    case "publish":
      return "Published";
    case "unpublish":
      return "Unpublished";
    case "approve":
      return "Approved by editor";
    case "archive":
      return "Archived";
    case "apply_section":
      return `Applied AI section: ${m.section ?? ""}`;
    case "request_generation":
      return "Requested AI generation";
    case "request_image":
      return "Requested image generation";
    case "upload_manual_image":
      return "Manual image uploaded";
    case "remove_image":
      return "Image removed";
    case "edit_image_prompt":
      return "Image prompt edited";
    default:
      return l.action.replace(/_/g, " ");
  }
}
