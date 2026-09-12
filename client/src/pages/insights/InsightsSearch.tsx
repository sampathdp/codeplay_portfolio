import { useEffect, useMemo, useState } from "react";
import { useSearch, useLocation, Link } from "wouter";
import { Search as SearchIcon, X } from "lucide-react";
import SEO from "@/components/SEO";
import { INSIGHTS_BASE, SITE_ORIGIN, insightsSearchPath } from "@/lib/insights/routes";
import { searchArticles, categoryName } from "@/lib/insights/feed";
import { useInsightsFeed } from "@/hooks/useInsightsFeed";
import { trackSearch } from "@/lib/insights/analytics";
import { insightsArticlePath } from "@/lib/insights/routes";
import {
  InsightsShell,
  Breadcrumb,
  ArticleGrid,
  CategoryNav,
} from "@/components/insights";

export default function InsightsSearch() {
  const rawSearch = useSearch();
  useInsightsFeed();
  const [, navigate] = useLocation();
  const initial = new URLSearchParams(rawSearch).get("q") ?? "";
  const [query, setQuery] = useState(initial);

  // keep the URL in sync (shareable results, no reload)
  useEffect(() => {
    setQuery(new URLSearchParams(rawSearch).get("q") ?? "");
  }, [rawSearch]);

  const trimmed = query.trim();
  const hits = useMemo(() => searchArticles(trimmed, 40), [trimmed]);
  const articles = hits.map((h) => h.article);

  // Report a search once the query settles (debounced), not on every keystroke.
  useEffect(() => {
    if (trimmed.length < 2) return;
    const id = setTimeout(() => trackSearch(trimmed, hits.length), 800);
    return () => clearTimeout(id);
  }, [trimmed, hits.length]);

  function submit(value: string) {
    const v = value.trim();
    navigate(v ? insightsSearchPath(v) : insightsSearchPath(), { replace: true });
  }

  return (
    <InsightsShell>
      <SEO
        title={
          trimmed
            ? `Search: ${trimmed} | CodePlay Insights`
            : "Search | CodePlay Insights"
        }
        description="Search CodePlay Insights articles by headline, topic, tag or category."
        canonical={`${SITE_ORIGIN}${INSIGHTS_BASE}/search`}
        robots="noindex, follow"
      />

      <div className="container mx-auto max-w-5xl px-5 sm:px-6">
        <Breadcrumb
          items={[{ label: "Insights", href: INSIGHTS_BASE }, { label: "Search" }]}
        />

        <header className="mb-8 mt-6">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Search Insights
          </h1>
          <form
            className="mt-6"
            onSubmit={(e) => {
              e.preventDefault();
              submit(query);
            }}
          >
            <div className="relative">
              <SearchIcon
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary"
                aria-hidden="true"
              />
              <label htmlFor="insights-search" className="sr-only">
                Search articles
              </label>
              <input
                id="insights-search"
                type="search"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => submit(query)}
                placeholder="Search headlines, engineering topics, tags, categories…"
                className="min-h-[52px] w-full rounded-2xl border border-white/15 bg-[#0e1424]/90 pl-12 pr-12 text-base text-white outline-none placeholder:text-slate-400 focus:border-primary/50 focus:bg-[#131b30] focus-visible:ring-2 focus-visible:ring-primary shadow-xl shadow-black/20 transition-all"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setQuery("");
                    submit("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </form>
        </header>

        {trimmed.length < 2 ? (
          <div>
            <p className="mb-6 text-sm text-muted-foreground">
              Type at least two characters, or browse by category:
            </p>
            <CategoryNav onlyNonEmpty={false} />
          </div>
        ) : articles.length > 0 ? (
          <>
            <p className="mb-6 text-sm text-muted-foreground" aria-live="polite">
              {articles.length}{" "}
              {articles.length === 1 ? "result" : "results"} for &ldquo;
              {trimmed}&rdquo;
            </p>
            <ArticleGrid articles={articles} columns={3} showExcerpt />
          </>
        ) : (
          <div className="glass rounded-2xl border border-white/10 p-8 text-center" aria-live="polite">
            <p className="font-medium">No results for &ldquo;{trimmed}&rdquo;</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a broader term, or{" "}
              <Link href={INSIGHTS_BASE} className="text-primary hover:underline">
                browse the latest Insights
              </Link>
              .
            </p>
          </div>
        )}

        {/* semantic list for crawlers even when JS search UI is used */}
        {articles.length > 0 && (
          <ul className="sr-only">
            {articles.map((a) => (
              <li key={a.slug}>
                <a href={insightsArticlePath(a.slug)}>
                  {a.title} — {categoryName(a.category)}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </InsightsShell>
  );
}
