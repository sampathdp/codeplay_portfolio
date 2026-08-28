import { useState } from "react";
import { useLocation } from "wouter";
import {
  Search as SearchIcon,
  Sparkles,
  X,
  EyeOff,
  Copy,
  ChevronDown,
} from "lucide-react";
import { ADMIN_INSIGHTS_BASE } from "@/lib/insights/routes";
import { categoryName } from "@/lib/insights/feed";
import type { CandidateStatusRow } from "@/lib/insights/records";
import {
  listClusters,
  getClusterDetail,
  forceResearch,
  rejectCluster,
  ignoreCluster,
  markDuplicate,
  requestArticleGeneration,
} from "@/lib/insights/admin";
import { useAsync, useAction } from "@/components/admin/useAsync";
import {
  Card,
  Btn,
  Spinner,
  ErrorNote,
  EmptyRow,
  StatusPill,
  ScoreBar,
  relTime,
} from "@/components/admin/ui";

const TABS: { key: CandidateStatusRow | "all"; label: string }[] = [
  { key: "discovered", label: "New" },
  { key: "selected", label: "Selected" },
  { key: "rejected", label: "Rejected" },
  { key: "ignored", label: "Ignored" },
  { key: "all", label: "All" },
];

export default function Candidates() {
  const [tab, setTab] = useState<CandidateStatusRow | "all">("discovered");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dupFor, setDupFor] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const action = useAction();

  const clusters = useAsync(
    () =>
      listClusters(
        tab === "all"
          ? { limit: 60 }
          : { status: tab === "discovered" ? ["discovered", "filtered"] : tab, limit: 60 },
      ),
    [tab, action.pending],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              tab === t.key
                ? "bg-primary/15 text-primary"
                : "bg-white/5 text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {action.error && (
        <ErrorNote error={action.error} onRetry={action.clearError} />
      )}

      {clusters.loading ? (
        <Spinner />
      ) : clusters.error ? (
        <ErrorNote error={clusters.error} onRetry={clusters.reload} />
      ) : !clusters.data || clusters.data.length === 0 ? (
        <EmptyRow>
          No candidates. The discovery engine runs on a schedule (every ~3h).
        </EmptyRow>
      ) : (
        <ul className="space-y-3">
          {clusters.data.map((c) => {
            const isOpen = expanded === c.id;
            return (
              <li key={c.id}>
                <Card className="overflow-hidden">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <StatusPill status={c.status} />
                        <StatusPill status={c.fact_confidence} />
                        {c.breaking && <StatusPill status="rejected" />}
                        <span className="text-[0.7rem] uppercase tracking-wide text-primary">
                          {c.category ? categoryName(c.category) : c.primary_theme ?? "uncategorised"}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold leading-snug">{c.title}</h3>
                      <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[0.7rem] text-muted-foreground">
                        <span>{c.source_count} source{c.source_count === 1 ? "" : "s"}</span>
                        <span>age {relTime(c.earliest_published_at ?? c.first_seen_at)}</span>
                        <span>seen {relTime(c.last_seen_at)}</span>
                        {c.selection_reason && <span>· {c.selection_reason}</span>}
                      </p>
                    </div>

                    <div className="grid w-full grid-cols-2 gap-x-4 gap-y-1.5 sm:w-56">
                      <ScoreBar label="Viral" value={c.viral_score} />
                      <ScoreBar label="Community" value={c.community_score} />
                      <ScoreBar label="Authority" value={c.authority_score} />
                      <ScoreBar label="Relevance" value={c.relevance_score} />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
                    <Btn
                      variant="primary"
                      loading={action.pending === `gen-${c.id}`}
                      onClick={() =>
                        action.run(`gen-${c.id}`, () => requestArticleGeneration(c.id), () => {
                          clusters.reload();
                          navigate(`${ADMIN_INSIGHTS_BASE}/jobs`);
                        })
                      }
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Generate Draft
                    </Btn>
                    <Btn
                      loading={action.pending === `res-${c.id}`}
                      onClick={() =>
                        action.run(`res-${c.id}`, () => forceResearch(c.id), clusters.reload)
                      }
                    >
                      <SearchIcon className="h-3.5 w-3.5" /> Research
                    </Btn>
                    <Btn
                      variant="ghost"
                      loading={action.pending === `rej-${c.id}`}
                      onClick={() =>
                        action.run(`rej-${c.id}`, () => rejectCluster(c.id, "rejected by editor"), clusters.reload)
                      }
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </Btn>
                    <Btn
                      variant="ghost"
                      loading={action.pending === `ign-${c.id}`}
                      onClick={() =>
                        action.run(`ign-${c.id}`, () => ignoreCluster(c.id), clusters.reload)
                      }
                    >
                      <EyeOff className="h-3.5 w-3.5" /> Ignore
                    </Btn>
                    <Btn
                      variant="ghost"
                      onClick={() => setDupFor(dupFor === c.id ? null : c.id)}
                    >
                      <Copy className="h-3.5 w-3.5" /> Mark Duplicate
                    </Btn>
                    <button
                      className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setExpanded(isOpen ? null : c.id);
                      }}
                    >
                      Sources
                      <ChevronDown
                        className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>

                  {dupFor === c.id && (
                    <DuplicatePicker
                      sourceId={c.id}
                      candidates={(clusters.data ?? []).filter((x) => x.id !== c.id)}
                      onDone={() => {
                        setDupFor(null);
                        clusters.reload();
                      }}
                      pending={action.pending}
                      run={action.run}
                    />
                  )}

                  {isOpen && <ClusterSources id={c.id} />}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function DuplicatePicker({
  sourceId,
  candidates,
  onDone,
  pending,
  run,
}: {
  sourceId: string;
  candidates: { id: string; title: string }[];
  onDone: () => void;
  pending: string | null;
  run: ReturnType<typeof useAction>["run"];
}) {
  const [target, setTarget] = useState("");
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
      <span className="text-xs text-muted-foreground">Merge this into:</span>
      <select
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs"
      >
        <option value="">Select the canonical story…</option>
        {candidates.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title.slice(0, 80)}
          </option>
        ))}
      </select>
      <Btn
        variant="primary"
        disabled={!target}
        loading={pending === `dup-${sourceId}`}
        onClick={() => run(`dup-${sourceId}`, () => markDuplicate(sourceId, target), onDone)}
      >
        Merge
      </Btn>
    </div>
  );
}

function ClusterSources({ id }: { id: string }) {
  const detail = useAsync(() => getClusterDetail(id), [id]);
  if (detail.loading) return <Spinner label="Loading sources…" />;
  if (detail.error) return <ErrorNote error={detail.error} />;
  return (
    <ul className="mt-3 space-y-1.5 border-t border-white/10 pt-3 text-xs">
      {detail.data?.sources.map((s) => (
        <li key={s.id} className="flex items-center gap-2">
          <StatusPill status={s.fact_confidence} />
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="min-w-0 flex-1 truncate text-muted-foreground hover:text-primary"
          >
            {s.source} — {s.title}
          </a>
          <span className="shrink-0 text-muted-foreground">{relTime(s.published_at)}</span>
        </li>
      ))}
      {(!detail.data || detail.data.sources.length === 0) && (
        <li className="text-muted-foreground">No source items recorded.</li>
      )}
    </ul>
  );
}
