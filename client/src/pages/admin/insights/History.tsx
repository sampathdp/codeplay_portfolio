import { useState } from "react";
import { Link } from "wouter";
import { ADMIN_INSIGHTS_BASE } from "@/lib/insights/routes";
import { listAuditLogs } from "@/lib/insights/admin";
import { useAsync } from "@/components/admin/useAsync";
import { Card, Spinner, ErrorNote, EmptyRow, relTime } from "@/components/admin/ui";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "article", label: "Articles" },
  { key: "topic_cluster", label: "Candidates" },
  { key: "news_source", label: "Sources" },
  { key: "generation_job", label: "AI jobs" },
  { key: "setting", label: "Settings" },
];

export default function History() {
  const [filter, setFilter] = useState("all");
  const logs = useAsync(
    () => listAuditLogs(filter === "all" ? { limit: 150 } : { entityType: filter, limit: 150 }),
    [filter],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              filter === f.key ? "bg-primary/15 text-primary" : "bg-white/5 text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card title="Activity log">
        {logs.loading ? (
          <Spinner />
        ) : logs.error ? (
          <ErrorNote error={logs.error} onRetry={logs.reload} />
        ) : !logs.data || logs.data.length === 0 ? (
          <EmptyRow>No recorded activity.</EmptyRow>
        ) : (
          <ol className="divide-y divide-white/5">
            {logs.data.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                <span className="font-medium">{l.action.replace(/_/g, " ")}</span>
                <span className="text-xs text-muted-foreground">
                  {l.entity_type}
                  {l.entity_type === "article" && l.entity_id ? (
                    <Link
                      href={`${ADMIN_INSIGHTS_BASE}/articles/${l.entity_id}`}
                      className="ml-1 text-primary hover:underline"
                    >
                      open
                    </Link>
                  ) : null}
                </span>
                <span className="ml-auto text-[0.7rem] text-muted-foreground">
                  {l.actor_email ?? "system"} · {relTime(l.created_at)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
