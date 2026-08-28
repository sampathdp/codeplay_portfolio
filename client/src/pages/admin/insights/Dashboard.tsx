import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { ADMIN_INSIGHTS_BASE } from "@/lib/insights/routes";
import {
  getTodayKpis,
  getWeekKpis,
  getTodayPublishPlan,
  listArticles,
} from "@/lib/insights/admin";
import { useAsync } from "@/components/admin/useAsync";
import { Card, Kpi, Spinner, ErrorNote, EmptyRow, StatusPill } from "@/components/admin/ui";

export default function Dashboard() {
  const today = useAsync(() => getTodayKpis(), []);
  const week = useAsync(() => getWeekKpis(), []);
  const plan = useAsync(() => getTodayPublishPlan(), []);
  const queue = useAsync(
    () => listArticles({ status: "review", limit: 6 }),
    [],
  );

  return (
    <div className="space-y-6">
      {/* Today */}
      <section>
        <h2 className="mb-3 text-xs font-mono uppercase tracking-[0.25em] text-primary">
          Today
        </h2>
        {today.error && <ErrorNote error={today.error} onRetry={today.reload} />}
        {today.loading ? (
          <Spinner />
        ) : today.data ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            <Kpi label="Stories discovered" value={today.data.storiesDiscovered} />
            <Kpi label="Trending candidates" value={today.data.trendingCandidates} />
            <Kpi label="Drafts generated" value={today.data.draftsGenerated} />
            <Kpi
              label="Awaiting review"
              value={today.data.awaitingReview}
              tone={today.data.awaitingReview > 0 ? "warn" : "default"}
            />
            <Kpi label="Published" value={today.data.published} tone="good" />
            <Kpi label="Gemini requests" value={today.data.geminiRequests} />
            <Kpi label="Image requests" value={today.data.imageRequests} />
          </div>
        ) : null}
      </section>

      {/* Publish plan */}
      <Card title="Today's publishing plan">
        {plan.loading ? (
          <Spinner />
        ) : plan.error ? (
          <ErrorNote error={plan.error} onRetry={plan.reload} />
        ) : plan.data ? (
          <>
            <p className="mb-3 text-sm text-muted-foreground">
              Target {plan.data.minPerDay}–{plan.data.maxPerDay} articles ·{" "}
              <span className="font-semibold text-foreground">
                {plan.data.publishedToday} published
              </span>
              . Quality &gt; quota — never publish filler.
            </p>
            <ul className="space-y-2">
              {plan.data.slots.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  {s.filled ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span>
                    <span className="capitalize">{s.slot}</span>
                    {s.article && (
                      <span className="block text-xs text-muted-foreground">
                        {s.article.title}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Strong breaking news may override this distribution.
            </p>
          </>
        ) : null}
      </Card>

      {/* This week */}
      <section>
        <h2 className="mb-3 text-xs font-mono uppercase tracking-[0.25em] text-primary">
          This week
        </h2>
        {week.error && <ErrorNote error={week.error} onRetry={week.reload} />}
        {week.loading ? (
          <Spinner />
        ) : week.data ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <Kpi label="Published" value={week.data.published} />
            <Kpi label="Views" value={week.data.views.toLocaleString()} />
            <Kpi
              label="Top article"
              value={
                week.data.topArticle ? (
                  <span className="line-clamp-2 text-sm font-semibold">
                    {week.data.topArticle.title}
                  </span>
                ) : (
                  "—"
                )
              }
              hint={
                week.data.topArticle
                  ? `${week.data.topArticle.views.toLocaleString()} views`
                  : undefined
              }
            />
            <Kpi
              label="Top category"
              value={
                week.data.topCategory ? (
                  <span className="text-base font-semibold">
                    {week.data.topCategory.name}
                  </span>
                ) : (
                  "—"
                )
              }
              hint={
                week.data.topCategory
                  ? `${week.data.topCategory.count} published`
                  : undefined
              }
            />
            <Kpi
              label="Avg quality"
              value={week.data.avgQualityScore ?? "—"}
              tone={
                week.data.avgQualityScore != null && week.data.avgQualityScore >= 70
                  ? "good"
                  : "default"
              }
            />
          </div>
        ) : null}
      </section>

      {/* Review queue */}
      <Card
        title="Awaiting review"
        action={
          <Link
            href={`${ADMIN_INSIGHTS_BASE}/articles`}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            All articles <ArrowRight className="h-3 w-3" />
          </Link>
        }
      >
        {queue.loading ? (
          <Spinner />
        ) : queue.error ? (
          <ErrorNote error={queue.error} onRetry={queue.reload} />
        ) : !queue.data || queue.data.length === 0 ? (
          <EmptyRow>Nothing waiting. Generate a draft from a trending candidate.</EmptyRow>
        ) : (
          <ul className="divide-y divide-white/5">
            {queue.data.map((a) => (
              <li key={a.id} className="py-2.5 text-sm">
                <Link
                  href={`${ADMIN_INSIGHTS_BASE}/articles/${a.id}`}
                  className="flex items-center gap-3 rounded hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {a.needs_review && <StatusPill status="review" />}
                  <span className="min-w-0 flex-1 truncate">{a.title}</span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    Q {a.quality_score ?? "—"}
                  </span>
                </Link>
                {a.needs_review && a.review_reasons?.length > 0 && (
                  <p className="mt-1 pl-1 text-[0.7rem] text-amber-400/80">
                    {a.review_reasons.slice(0, 2).join(" · ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
