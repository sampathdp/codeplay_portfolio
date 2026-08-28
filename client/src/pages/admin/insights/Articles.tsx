import { useState } from "react";
import { Link } from "wouter";
import { FileText, Plus } from "lucide-react";
import { ADMIN_INSIGHTS_BASE } from "@/lib/insights/routes";
import type { ArticleStatusRow } from "@/lib/insights/records";
import { listArticles } from "@/lib/insights/admin";
import { useAsync } from "@/components/admin/useAsync";
import {
  Spinner,
  ErrorNote,
  EmptyRow,
  StatusPill,
  relTime,
} from "@/components/admin/ui";

const GROUPS: { key: string; label: string; statuses: ArticleStatusRow[] }[] = [
  { key: "review", label: "Review", statuses: ["review"] },
  { key: "drafts", label: "Drafts", statuses: ["idea", "researching", "draft"] },
  { key: "scheduled", label: "Scheduled", statuses: ["scheduled"] },
  { key: "published", label: "Published", statuses: ["published"] },
  { key: "rejected", label: "Rejected / archived", statuses: ["rejected", "archived"] },
];

export default function Articles() {
  const [group, setGroup] = useState("review");
  const active = GROUPS.find((g) => g.key === group)!;
  const list = useAsync(
    () => listArticles({ status: active.statuses, limit: 100 }),
    [group],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {GROUPS.map((g) => (
          <button
            key={g.key}
            onClick={() => setGroup(g.key)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              group === g.key
                ? "bg-primary/15 text-primary"
                : "bg-white/5 text-muted-foreground hover:text-foreground"
            }`}
          >
            {g.label}
          </button>
        ))}
        <Link
          href={`${ADMIN_INSIGHTS_BASE}/articles/new`}
          className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Plus className="h-3.5 w-3.5" /> New article
        </Link>
      </div>

      {list.loading ? (
        <Spinner />
      ) : list.error ? (
        <ErrorNote error={list.error} onRetry={list.reload} />
      ) : !list.data || list.data.length === 0 ? (
        <EmptyRow>
          <FileText className="mx-auto mb-2 h-5 w-5 opacity-50" />
          Nothing in “{active.label}”.
        </EmptyRow>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-white/[0.03] text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Quality</th>
                <th className="px-3 py-2 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {list.data.map((a) => (
                <tr key={a.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5">
                    <Link
                      href={`${ADMIN_INSIGHTS_BASE}/articles/${a.id}`}
                      className="font-medium hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {a.title}
                    </Link>
                    {a.needs_review && a.review_reasons?.length > 0 && (
                      <p className="mt-0.5 text-[0.7rem] text-amber-400/80">
                        {a.review_reasons[0]}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">
                    {a.article_type ? a.article_type.replace(/_/g, " ") : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusPill status={a.status} />
                  </td>
                  <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                    {a.quality_score ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">
                    {relTime(a.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
