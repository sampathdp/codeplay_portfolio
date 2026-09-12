import { motion } from "framer-motion";
import { Link } from "wouter";
import { Search } from "lucide-react";
import SEO from "@/components/SEO";
import { useInsightsFeed } from "@/hooks/useInsightsFeed";
import { insightsSearchPath, SITE_ORIGIN, INSIGHTS_BASE } from "@/lib/insights/routes";
import {
  allArticles,
  getFeatured,
  getTrending,
  getMostRead,
  getLatest,
  hasContent,
  nonEmptyCategories,
} from "@/lib/insights/feed";
import {
  InsightsShell,
  FeaturedStory,
  TrendingList,
  MostRead,
  CategoryNav,
  CategorySection,
  ArticleGrid,
  SectionHeader,
  NewsletterCta,
  EmptyState,
} from "@/components/insights";

export default function InsightsHome() {
  const feedStatus = useInsightsFeed();
  const featured = getFeatured();
  const trending = getTrending(5);
  const mostRead = getMostRead(5);
  // Trending stories lead the "Latest Insights" grid; the featured story
  // stays out of it (it already has the hero slot above).
  const pinnedTrending = trending.slice(0, 3).map((t) => t.slug);
  const latest = getLatest(
    9,
    featured?.slug ? [featured.slug] : [],
    pinnedTrending,
  );
  const total = allArticles().length;
  const categoriesCount = nonEmptyCategories().length;

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "CodePlay Insights",
    description:
      "Technology, AI, software development, gaming and cybersecurity analysis with the CodePlay developer take.",
    url: `${SITE_ORIGIN}/insights`,
  };

  return (
    <InsightsShell>
      <SEO
        title="CodePlay Insights | Technology That Matters, Explained for Developers"
        description="Original analysis on AI, software development, gaming, game development, cybersecurity, hardware and startups — with the CodePlay developer take on every story."
        canonical={`${SITE_ORIGIN}/insights`}
        schemas={[websiteSchema]}
      />

      <div className="container mx-auto max-w-7xl px-5 sm:px-6">
        {/* Hero — compact: eyebrow + headline + description share one line
            of breathing room each, stats ride the same row as the search
            box so the fold reaches real stories sooner. */}
        {/* Compact, Modern Editorial Header */}
        <header className="relative mb-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 left-0 -z-10 h-44 w-80 rounded-full bg-primary/10 blur-[100px]"
          />

          {/* Top Bar: Eyebrow + Stats on left, Quick Search on right */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="text-[0.68rem] font-mono font-bold uppercase tracking-[0.22em] text-primary">
                  CodePlay Insights
                </span>
              </div>
              {total > 0 && (
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <span className="h-3 w-px bg-white/15" aria-hidden="true" />
                  <span>
                    <strong className="text-white font-semibold">{total}</strong> stories
                  </span>
                  <span>·</span>
                  <span>
                    <strong className="text-white font-semibold">{categoriesCount}</strong> categories
                  </span>
                </div>
              )}
            </div>

            <Link
              href={insightsSearchPath()}
              className="group inline-flex items-center gap-2.5 self-start rounded-full border border-white/15 bg-[#0e1424]/85 px-3.5 py-1.5 text-xs text-slate-300 shadow-sm backdrop-blur-md transition-all hover:border-primary/50 hover:bg-[#131b30] hover:text-white sm:self-auto"
            >
              <Search className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span>Search insights…</span>
              <kbd className="hidden sm:inline-flex rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-[0.62rem] font-mono font-medium text-slate-400">
                Ctrl K
              </kbd>
            </Link>
          </div>

          {/* Headline & Subhead in one compact row */}
          <div className="mt-3.5 flex flex-col gap-1.5 md:flex-row md:items-baseline md:justify-between">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl md:text-4xl">
              Technology that{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                matters.
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 md:max-w-md lg:max-w-lg leading-relaxed text-balance">
              Original engineering analysis, primary sources, and the developer take on every story.
            </p>
          </div>

          {/* Category Navigation */}
          <div className="mt-3.5 border-t border-white/10 pt-3">
            <CategoryNav />
          </div>
        </header>

        {!hasContent() ? (
          feedStatus === "loading" ? (
            <p className="py-10 text-sm text-muted-foreground">Loading the latest Insights…</p>
          ) : (
            <EmptyState
              title="CodePlay Insights is launching soon"
              message="We're preparing the first articles — original analysis on AI, software, gaming and security. Check back shortly."
            />
          )
        ) : (
          <>
            {featured && (
              <section aria-label="Featured story" className="mb-12">
                <FeaturedStory article={featured} />
              </section>
            )}

            {/* Latest + Trending sidebar */}
            <div className="mb-14 grid gap-8 lg:grid-cols-[1fr_320px]">
              <div>
                <SectionHeader
                  title="Latest Insights"
                  eyebrow="Fresh"
                  viewAllHref={insightsSearchPath()}
                  viewAllLabel="Browse all"
                />
                {latest.length > 0 ? (
                  <ArticleGrid articles={latest} columns={2} />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    More stories are on the way.
                  </p>
                )}
              </div>

              <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
                <TrendingList articles={trending} />
                {mostRead.length >= 3 && (
                  <div className="rounded-3xl border border-white/10 bg-[#0e1424]/80 p-6 backdrop-blur-md shadow-xl shadow-black/20">
                    <MostRead articles={mostRead} />
                  </div>
                )}
              </aside>
            </div>

            {/* Category rows — each hides itself when empty */}
            <div className="space-y-14">
              <CategorySection categorySlug="artificial-intelligence" title="Artificial Intelligence" />
              <CategorySection categorySlug="software-development" title="Software & Development" />
              <CategorySection categorySlug="web-development" title="Web Development" />
              <CategorySection categorySlug="game-development" title="Gaming & Game Development" />
              <CategorySection categorySlug="gaming" title="Gaming" />
              <CategorySection categorySlug="cybersecurity" title="Cybersecurity" />
              <CategorySection categorySlug="hardware-and-gpus" title="Hardware & GPUs" />
              <CategorySection categorySlug="startups" title="Startups & SaaS" />
            </div>

            {total < 6 && (
              <p className="mt-10 text-center text-sm text-muted-foreground">
                CodePlay Insights is new — {total}{" "}
                {total === 1 ? "article" : "articles"} published so far, with
                2–3 added on publishing days.
              </p>
            )}

            <div className="mt-16">
              <NewsletterCta />
            </div>
          </>
        )}

        <nav
          aria-label="About CodePlay Insights"
          className="mt-12 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-6 text-xs text-muted-foreground"
        >
          <Link href={`${INSIGHTS_BASE}/about`} className="hover:text-primary">
            About
          </Link>
          <Link href={`${INSIGHTS_BASE}/editorial-policy`} className="hover:text-primary">
            Editorial Policy
          </Link>
          <Link href={`${INSIGHTS_BASE}/ai-policy`} className="hover:text-primary">
            AI Usage Policy
          </Link>
          <Link href={`${INSIGHTS_BASE}/corrections`} className="hover:text-primary">
            Corrections
          </Link>
          <a href="/insights/rss.xml" className="hover:text-primary">
            RSS
          </a>
        </nav>
      </div>
    </InsightsShell>
  );
}
