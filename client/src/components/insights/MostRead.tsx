import { Link } from "wouter";
import type { InsightsArticleSummary } from "@/lib/insights/types";
import { insightsArticlePath } from "@/lib/insights/routes";
import { categoryShort } from "@/lib/insights/visuals";

export default function MostRead({
  articles,
}: {
  articles: InsightsArticleSummary[];
}) {
  if (articles.length === 0) return null;

  return (
    <section aria-labelledby="most-read-heading">
      <h2
        id="most-read-heading"
        className="mb-5 text-xs font-mono uppercase tracking-[0.3em] text-primary"
      >
        Most Read
      </h2>
      <ol className="divide-y divide-white/5">
        {articles.map((a, i) => (
          <li key={a.slug}>
            <Link
              href={insightsArticlePath(a.slug)}
              className="group flex items-center gap-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary/80 tabular-nums transition-colors group-hover:bg-primary/20"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="line-clamp-2 text-sm font-medium leading-snug transition-colors group-hover:text-primary">
                  {a.title}
                </span>
                <span className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
                  {categoryShort(a.category)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
