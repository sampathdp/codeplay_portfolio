import { Link } from "wouter";
import { TrendingUp } from "lucide-react";
import type { InsightsArticleSummary } from "@/lib/insights/types";
import { insightsArticlePath } from "@/lib/insights/routes";
import { categoryShort } from "@/lib/insights/visuals";
import { formatDate } from "@/lib/insights/feed";
import ArticleImage from "./ArticleImage";

/**
 * Ranked #1 #2 #3 … list with a thumbnail per story and a rank badge
 * pinned to its corner. No per-item animation (the brief: don't overuse
 * animations).
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
    <section
      aria-labelledby="trending-heading"
      className="glass rounded-3xl border border-white/10 p-6"
    >
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/15">
          <TrendingUp className="h-3.5 w-3.5 text-orange-400" aria-hidden="true" />
        </span>
        <h2
          id="trending-heading"
          className="text-xs font-mono uppercase tracking-[0.3em] text-primary"
        >
          {title}
        </h2>
      </div>

      <ol className="space-y-1.5">
        {articles.map((a, i) => (
          <li key={a.slug}>
            <Link
              href={insightsArticlePath(a.slug)}
              className="group flex items-center gap-3.5 rounded-xl p-2 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="relative shrink-0">
                <span className="block h-14 w-14 overflow-hidden rounded-xl border border-white/10">
                  <ArticleImage
                    image={a.heroImage}
                    category={a.category}
                    sizes="56px"
                    className="h-14 w-14"
                  />
                </span>
                <span
                  className="absolute -bottom-1.5 -left-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary text-[0.65rem] font-black text-primary-foreground tabular-nums"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
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
