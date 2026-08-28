import { useState } from "react";
import { Play, AlertTriangle, ChevronDown } from "lucide-react";
import type { NewsSourceRow } from "@/lib/insights/records";
import {
  listSources,
  updateSource,
  setSourceEnabled,
  requestSourceRun,
  listIngestionRuns,
} from "@/lib/insights/admin";
import { useAsync, useAction } from "@/components/admin/useAsync";
import {
  Card,
  Btn,
  Spinner,
  ErrorNote,
  EmptyRow,
  StatusPill,
  relTime,
} from "@/components/admin/ui";

export default function Sources() {
  const action = useAction();
  const sources = useAsync(() => listSources(), [action.pending]);
  const [showFailures, setShowFailures] = useState(false);

  return (
    <div className="space-y-4">
      {action.error && <ErrorNote error={action.error} onRetry={action.clearError} />}

      <Card
        title="Recent adapter failures"
        action={
          <button
            onClick={() => setShowFailures((s) => !s)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {showFailures ? "Hide" : "Show"}
            <ChevronDown className={`h-3 w-3 transition-transform ${showFailures ? "rotate-180" : ""}`} />
          </button>
        }
      >
        {showFailures ? <Failures /> : <p className="text-xs text-muted-foreground">Failures from the last discovery runs.</p>}
      </Card>

      {sources.loading ? (
        <Spinner />
      ) : sources.error ? (
        <ErrorNote error={sources.error} onRetry={sources.reload} />
      ) : !sources.data || sources.data.length === 0 ? (
        <EmptyRow>No sources configured. Run the Phase 3 seed migration.</EmptyRow>
      ) : (
        <div className="space-y-2">
          {sources.data.map((s) => (
            <SourceRow key={s.id} source={s} action={action} onChange={sources.reload} />
          ))}
        </div>
      )}
    </div>
  );
}

function SourceRow({
  source: s,
  action,
  onChange,
}: {
  source: NewsSourceRow;
  action: ReturnType<typeof useAction>;
  onChange: () => void;
}) {
  const [trust, setTrust] = useState(String(s.trust_score));
  const [priority, setPriority] = useState(String(s.priority));
  const dirty = trust !== String(s.trust_score) || priority !== String(s.priority);

  return (
    <Card className="!p-0">
      <div className="flex flex-wrap items-center gap-3 p-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={s.enabled}
            onChange={(e) =>
              action.run(`en-${s.id}`, () => setSourceEnabled(s.id, e.target.checked), onChange)
            }
            className="h-4 w-4"
          />
          <span className="sr-only">Enabled</span>
        </label>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{s.name}</p>
          <p className="text-[0.7rem] text-muted-foreground">
            {s.adapter ?? "rss"} · {s.source_type} · checked {relTime(s.last_checked_at)}
            {s.run_requested_at && " · run queued"}
          </p>
        </div>

        <label className="text-[0.7rem] text-muted-foreground">
          trust
          <input
            type="number"
            min={0}
            max={100}
            value={trust}
            onChange={(e) => setTrust(e.target.value)}
            className="ml-1 w-16 rounded border border-white/10 bg-white/5 px-1.5 py-1 text-xs text-foreground"
          />
        </label>
        <label className="text-[0.7rem] text-muted-foreground">
          priority
          <input
            type="number"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="ml-1 w-16 rounded border border-white/10 bg-white/5 px-1.5 py-1 text-xs text-foreground"
          />
        </label>

        {dirty && (
          <Btn
            variant="primary"
            loading={action.pending === `save-${s.id}`}
            onClick={() =>
              action.run(
                `save-${s.id}`,
                () =>
                  updateSource(s.id, {
                    trust_score: Number(trust),
                    priority: Number(priority),
                  }),
                onChange,
              )
            }
          >
            Save
          </Btn>
        )}
        <Btn
          loading={action.pending === `run-${s.id}`}
          onClick={() => action.run(`run-${s.id}`, () => requestSourceRun(s.id), onChange)}
        >
          <Play className="h-3.5 w-3.5" /> Run
        </Btn>
      </div>
    </Card>
  );
}

function Failures() {
  const runs = useAsync(() => listIngestionRuns(60), []);
  if (runs.loading) return <Spinner />;
  if (runs.error) return <ErrorNote error={runs.error} onRetry={runs.reload} />;
  const failed = (runs.data ?? []).filter((r) => r.status === "failed");
  if (failed.length === 0)
    return <p className="text-xs text-emerald-400">No failures in the recent runs.</p>;
  return (
    <ul className="space-y-1.5">
      {failed.map((r) => (
        <li key={r.id} className="flex items-start gap-2 text-xs">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
          <span>
            <span className="font-medium">{r.source_slug ?? r.adapter}</span>{" "}
            <span className="text-muted-foreground">— {r.error ?? "failed"}</span>
            <span className="ml-1 text-muted-foreground">({relTime(r.started_at)})</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
