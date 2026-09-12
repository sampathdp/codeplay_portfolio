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
      className="rounded-3xl border border-white/10 bg-[#0e1424]/80 p-6 backdrop-blur-md shadow-xl shadow-black/20"
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2
            id="trending-heading"
            className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-primary"
          >
            {title}
          </h2>
        </div>
        <span className="text-[0.68rem] font-mono text-slate-400">LIVE FEED</span>
      </div>

      <ol className="space-y-2">
        {articles.map((a, i) => (
          <li key={a.slug}>
            <Link
              href={insightsArticlePath(a.slug)}
              className="group flex items-center gap-3.5 rounded-2xl p-2.5 transition-all duration-200 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="relative shrink-0">
                <span className="block h-14 w-14 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                  <ArticleImage
                    image={a.heroImage}
                    category={a.category}
                    sizes="56px"
                    className="h-14 w-14 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </span>
                <span
                  className="absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[0.62rem] font-black text-primary-foreground shadow-md shadow-primary/30 tabular-nums"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="mb-0.5 block text-[0.65rem] font-bold uppercase tracking-wider text-primary">
                  {categoryShort(a.category)}
                </span>
                <span className="line-clamp-2 font-display text-sm font-semibold leading-snug text-white transition-colors group-hover:text-primary">
                  {a.title}
                </span>
                <span className="mt-1 block text-[0.72rem] text-slate-400">
                  {formatDate(a.publishedAt)} · {a.readingMinutes} min read
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
