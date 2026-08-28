import { useEffect, useState } from "react";
import {
  Sparkles,
  Type,
  AlignLeft,
  Braces,
  Lightbulb,
  Building2,
  Gamepad2,
  ShieldCheck,
  Search,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";
import type { ArticleRow, GenerationJobRow } from "@/lib/insights/records";
import {
  listGenerationJobs,
  improveTitle,
  improveSeo,
  regenerateSummary,
  regenerateSection,
  runFactCheck,
  requestArticleGeneration,
  applySectionProposal,
  retryJob,
} from "@/lib/insights/admin";
import { generateImage } from "@/lib/insights/admin";
import { useAsync, useAction } from "./useAsync";
import { Card, Btn, StatusPill, ErrorNote, EmptyRow, relTime } from "./ui";

interface Props {
  article: ArticleRow;
  sections: { key: string; heading: string }[];
  onApplied: () => void;
}

/**
 * Deliberate AI tools. Every action queues ONE server-side job scoped to a
 * single piece of content. Nothing is auto-applied — the worker writes a
 * proposal, and the editor applies it explicitly. Manual edits are never
 * overwritten.
 */
export default function AiActionPanel({ article, sections, onApplied }: Props) {
  const [sectionKey, setSectionKey] = useState(sections[0]?.key ?? "");
  const [instruction, setInstruction] = useState("");
  const action = useAction();

  const jobs = useAsync(
    () => listGenerationJobs({ articleId: article.id, limit: 25 }),
    [article.id, action.pending],
  );

  // poll while work is in flight
  useEffect(() => {
    const busy = jobs.data?.some(
      (j) => j.status === "queued" || j.status === "running",
    );
    if (!busy) return;
    const t = setInterval(jobs.reload, 12_000);
    return () => clearInterval(t);
  }, [jobs.data, jobs.reload]);

  const queue = (key: string, fn: () => Promise<unknown>) =>
    action.run(key, fn, jobs.reload);

  const TOOLS: {
    key: string;
    label: string;
    icon: typeof Sparkles;
    run: () => Promise<unknown>;
    disabled?: boolean;
    hint?: string;
  }[] = [
    {
      key: "draft",
      label: "Generate Draft",
      icon: Sparkles,
      disabled: !article.cluster_id,
      hint: article.cluster_id ? undefined : "no linked trending cluster",
      run: () => requestArticleGeneration(article.cluster_id as string),
    },
    { key: "title", label: "Improve Headline", icon: Type, run: () => improveTitle(article.id) },
    {
      key: "intro",
      label: "Improve Introduction",
      icon: AlignLeft,
      run: () => regenerateSummary(article.id),
    },
    {
      key: "devtake",
      label: "Developer Take",
      icon: Lightbulb,
      run: () =>
        regenerateSection(
          article.id,
          "codeplay_developer_take",
          "Regenerate the CodePlay Developer Take only.",
        ),
    },
    {
      key: "biz",
      label: "Business Impact",
      icon: Building2,
      run: () =>
        regenerateSection(
          article.id,
          "business_impact",
          "Regenerate the business-impact analysis only.",
        ),
    },
    {
      key: "gaming",
      label: "Gaming Analysis",
      icon: Gamepad2,
      run: () =>
        regenerateSection(
          article.id,
          "gaming_community_reaction",
          "Regenerate the gaming community / player reaction analysis only.",
        ),
    },
    { key: "factcheck", label: "Run Fact Check", icon: ShieldCheck, run: () => runFactCheck(article.id) },
    { key: "seo", label: "Generate SEO", icon: Search, run: () => improveSeo(article.id) },
    { key: "image", label: "Generate Image", icon: ImageIcon, run: () => generateImage(article.id) },
  ];

  return (
    <div className="space-y-4">
      <Card title={<span className="flex items-center gap-1.5"><Braces className="h-3.5 w-3.5" /> AI tools</span>}>
        <p className="mb-3 text-xs text-muted-foreground">
          Each tool queues one job that affects only the selected content.
          Nothing is applied automatically.
        </p>
        {action.error && <ErrorNote error={action.error} onRetry={action.clearError} />}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TOOLS.map((t) => (
            <Btn
              key={t.key}
              variant={t.key === "draft" ? "primary" : "subtle"}
              disabled={t.disabled}
              title={t.hint}
              loading={action.pending === t.key}
              onClick={() => queue(t.key, t.run)}
              className="justify-start"
            >
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </Btn>
          ))}
        </div>

        {/* Improve arbitrary section */}
        <div className="mt-4 space-y-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <p className="text-xs font-medium">Improve a specific section</p>
          <div className="flex flex-wrap gap-2">
            <select
              value={sectionKey}
              onChange={(e) => setSectionKey(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs"
            >
              {sections.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.heading}
                </option>
              ))}
            </select>
            <Btn
              loading={action.pending === "section"}
              disabled={!sectionKey}
              onClick={() =>
                queue("section", () =>
                  regenerateSection(article.id, sectionKey, instruction || undefined),
                )
              }
            >
              Rewrite section
            </Btn>
          </div>
          <input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Optional instruction (e.g. 'tighten, add a concrete example')"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs"
          />
        </div>
      </Card>

      <Card
        title="AI jobs for this article"
        action={
          <button
            onClick={jobs.reload}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        }
      >
        {jobs.loading ? (
          <p className="py-4 text-sm text-muted-foreground">Loading…</p>
        ) : jobs.error ? (
          <ErrorNote error={jobs.error} onRetry={jobs.reload} />
        ) : !jobs.data || jobs.data.length === 0 ? (
          <EmptyRow>No AI jobs yet.</EmptyRow>
        ) : (
          <ul className="space-y-2">
            {jobs.data.map((j) => (
              <JobItem
                key={j.id}
                job={j}
                onApply={onApplied}
                reload={jobs.reload}
              />
            ))}
          </ul>
        )}
        <p className="mt-3 text-[0.7rem] text-muted-foreground">
          Queued jobs are processed by the generation worker (runs on a
          schedule after discovery).
        </p>
      </Card>
    </div>
  );
}

function JobItem({
  job,
  onApply,
  reload,
}: {
  job: GenerationJobRow;
  onApply: () => void;
  reload: () => void;
}) {
  const action = useAction();
  const result = job.result as Record<string, unknown> | null;
  const proposalText =
    (result?.content as string) ??
    (result?.chosenHeadline as string) ??
    (typeof result === "object" && result ? JSON.stringify(result, null, 2) : "");

  return (
    <li className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill status={job.status} />
        <span className="text-xs font-medium">{job.kind.replace(/_/g, " ")}</span>
        <span className="text-[0.7rem] text-muted-foreground">{relTime(job.created_at)}</span>
        {(job.status === "failed" || job.status === "cancelled") && (
          <Btn
            variant="danger"
            className="ml-auto"
            loading={action.pending === "retry"}
            onClick={() => action.run("retry", () => retryJob(job.id), reload)}
          >
            Retry
          </Btn>
        )}
      </div>

      {job.error && (
        <p className="mt-1.5 break-words text-xs text-destructive">{job.error}</p>
      )}

      {job.status === "succeeded" && proposalText && (
        <div className="mt-2">
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-black/30 p-2 text-[0.72rem] text-foreground/80">
            {proposalText.slice(0, 4000)}
          </pre>
          {job.kind === "regenerate_section" && (
            <Btn
              variant="primary"
              className="mt-2"
              loading={action.pending === "apply"}
              onClick={() =>
                action.run("apply", () => applySectionProposal(job.id, false), () => {
                  onApply();
                  reload();
                })
              }
            >
              Apply to article
            </Btn>
          )}
          {job.kind !== "regenerate_section" && (
            <p className="mt-1 text-[0.7rem] text-muted-foreground">
              Copy the parts you want into the editor fields — nothing is applied automatically.
            </p>
          )}
        </div>
      )}
      {action.error && (
        <p className="mt-1.5 text-xs text-destructive">{action.error}</p>
      )}
    </li>
  );
}
