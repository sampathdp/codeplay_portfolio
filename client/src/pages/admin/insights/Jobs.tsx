import { Link } from "wouter";
import { RefreshCw } from "lucide-react";
import { ADMIN_INSIGHTS_BASE } from "@/lib/insights/routes";
import { listGenerationJobs, retryJob, aiSpendToday } from "@/lib/insights/admin";
import type { GenerationJobRow } from "@/lib/insights/records";
import { useAsync, useAction } from "@/components/admin/useAsync";
import {
  Card,
  Btn,
  Kpi,
  Spinner,
  ErrorNote,
  EmptyRow,
  StatusPill,
  relTime,
} from "@/components/admin/ui";

export default function Jobs() {
  const action = useAction();
  const jobs = useAsync(() => listGenerationJobs({ limit: 80 }), [action.pending]);
  const spend = useAsync(() => aiSpendToday(), []);

  const failed = (jobs.data ?? []).filter(
    (j) => j.status === "failed" || j.status === "cancelled",
  );
  const active = (jobs.data ?? []).filter(
    (j) => j.status === "queued" || j.status === "running",
  );
  const done = (jobs.data ?? []).filter((j) => j.status === "succeeded");

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="AI spend today" value={spend.data ? `$${spend.data.totalUsd.toFixed(2)}` : "…"} />
        <Kpi label="Calls today" value={spend.data?.calls ?? "…"} />
        <Kpi label="In flight" value={active.length} tone={active.length ? "warn" : "default"} />
        <Kpi label="Failed" value={failed.length} tone={failed.length ? "warn" : "default"} />
      </div>

      {jobs.error && <ErrorNote error={jobs.error} onRetry={jobs.reload} />}
      {action.error && <ErrorNote error={action.error} onRetry={action.clearError} />}

      <Card
        title="Failed & retryable"
        action={
          <button onClick={jobs.reload} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        }
      >
        {jobs.loading ? (
          <Spinner />
        ) : failed.length === 0 ? (
          <p className="text-xs text-emerald-400">No failed jobs.</p>
        ) : (
          <ul className="space-y-2">
            {failed.map((j) => (
              <li key={j.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={j.status} />
                  <span className="text-xs font-medium">{j.kind.replace(/_/g, " ")}</span>
                  {j.article_id && (
                    <Link
                      href={`${ADMIN_INSIGHTS_BASE}/articles/${j.article_id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      article
                    </Link>
                  )}
                  <span className="text-[0.7rem] text-muted-foreground">{relTime(j.created_at)}</span>
                  <Btn
                    variant="danger"
                    className="ml-auto"
                    loading={action.pending === `retry-${j.id}`}
                    onClick={() => action.run(`retry-${j.id}`, () => retryJob(j.id), jobs.reload)}
                  >
                    Retry
                  </Btn>
                </div>
                <JobFailureReason job={j} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title={`In flight (${active.length})`}>
        {active.length === 0 ? (
          <EmptyRow>Nothing queued or running.</EmptyRow>
        ) : (
          <ul className="divide-y divide-white/5 text-sm">
            {active.map((j) => (
              <li key={j.id} className="flex items-center gap-2 py-2">
                <StatusPill status={j.status} />
                <span className="text-xs">{j.kind.replace(/_/g, " ")} · {j.step}</span>
                <span className="ml-auto text-[0.7rem] text-muted-foreground">{relTime(j.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title={`Completed (${done.length})`}>
        {done.length === 0 ? (
          <EmptyRow>None yet.</EmptyRow>
        ) : (
          <ul className="divide-y divide-white/5 text-sm">
            {done.slice(0, 30).map((j) => (
              <li key={j.id} className="flex items-center gap-2 py-2">
                <StatusPill status={j.status} />
                <span className="text-xs">{j.kind.replace(/_/g, " ")}</span>
                {j.total_tokens ? (
                  <span className="text-[0.7rem] text-muted-foreground">{j.total_tokens} tok</span>
                ) : null}
                <span className="ml-auto text-[0.7rem] text-muted-foreground">{relTime(j.completed_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

/**
 * A soft-failed generation job (article gated out, budget exhausted, no
 * usable draft) records its reason in `review_reason` / `result`, not the
 * `error` column — only a thrown exception sets `error`. Surface whichever
 * we have so the row is never a silent "FAILED" with no explanation.
 */
function JobFailureReason({ job }: { job: GenerationJobRow }) {
  const result = (job.result ?? {}) as {
    status?: string;
    reasons?: unknown;
    error?: unknown;
  };
  const reasons = Array.isArray(result.reasons)
    ? result.reasons.filter((r): r is string => typeof r === "string")
    : [];

  const detail =
    job.error ||
    job.review_reason ||
    (typeof result.error === "string" ? result.error : "") ||
    reasons.join(" · ");

  if (detail) {
    return (
      <p className="mt-1.5 break-words text-xs text-destructive">{detail}</p>
    );
  }

  return (
    <p className="mt-1.5 text-xs text-muted-foreground">
      No reason recorded
      {result.status ? ` — outcome: ${result.status}` : ""}. Check the
      generation worker logs for this run.
    </p>
  );
}
