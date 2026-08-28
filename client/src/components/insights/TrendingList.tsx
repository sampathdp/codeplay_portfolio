import { Link } from "wouter";
import { TrendingUp } from "lucide-react";
import type { InsightsArticleSummary } from "@/lib/insights/types";
import { insightsArticlePath } from "@/lib/insights/routes";
import { categoryShort } from "@/lib/insights/visuals";
import { formatDate } from "@/lib/insights/feed";

/**
 * Ranked #1 #2 #3 … list. Visually distinctive via the oversized rank
 * numeral; no per-item animation (the brief: don't overuse animations).
 */
export default function TrendingList({
  articles,
  title = "Trending Now",
}: {
  articles: InsightsArticleSummary[];
  title?: string;
}) {
  if (articles.length === 0) return null;

  return (
    <section aria-labelledby="trending-heading" className="glass rounded-3xl border border-white/10 p-6">
      <div className="mb-5 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-orange-400" aria-hidden="true" />
        <h2
          id="trending-heading"
          className="text-xs font-mono uppercase tracking-[0.3em] text-primary"
        >
          {title}
        </h2>
      </div>

      <ol className="space-y-1">
        {articles.map((a, i) => (
          <li key={a.slug}>
            <Link
              href={insightsArticlePath(a.slug)}
              className="group flex items-start gap-4 rounded-xl p-2 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span
                className="w-8 shrink-0 text-2xl font-black leading-none text-white/15 tabular-nums group-hover:text-primary/40"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-wide text-primary">
                  {categoryShort(a.category)}
                </span>
                <span className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
                  {a.title}
                </span>
                <span className="mt-1 block text-[0.7rem] text-muted-foreground">
                  {formatDate(a.publishedAt)} · {a.readingMinutes} min
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
