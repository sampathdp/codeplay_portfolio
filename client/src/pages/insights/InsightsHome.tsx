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
        {/* Hero */}
        <header className="relative mb-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 left-0 -z-10 h-72 w-72 rounded-full bg-primary/25 blur-[110px] sm:h-96 sm:w-96"
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              <span className="text-[0.7rem] font-mono uppercase tracking-[0.35em] text-primary">
                CodePlay Insights
              </span>
            </div>

            <h1 className="font-['Outfit'] text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Technology that{" "}
              <span className="bg-gradient-to-r from-primary via-cyan-300 to-primary bg-clip-text text-transparent">
                matters.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground md:text-xl">
              Explained for developers, gamers and businesses. Primary sources,
              real analysis, and the CodePlay developer take on every story.
            </p>

            {total > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span>
                  <strong className="font-semibold text-foreground">{total}</strong>{" "}
                  {total === 1 ? "story" : "stories"}
                </span>
                <span className="h-1 w-1 rounded-full bg-white/20" aria-hidden="true" />
                <span>
                  <strong className="font-semibold text-foreground">{categoriesCount}</strong>{" "}
                  {categoriesCount === 1 ? "category" : "categories"}
                </span>
                <span className="h-1 w-1 rounded-full bg-white/20" aria-hidden="true" />
                <span>Updated daily</span>
              </div>
            )}
          </motion.div>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CategoryNav />
            <Link
              href={insightsSearchPath()}
              className="group inline-flex shrink-0 items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-2 pl-2 pr-4 text-sm text-muted-foreground backdrop-blur-md transition-all hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary transition-colors group-hover:bg-primary/25">
                <Search className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              Search Insights
            </Link>
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
              <section aria-label="Featured story" className="mb-16">
                <FeaturedStory article={featured} />
              </section>
            )}

            {/* Latest + Trending sidebar */}
            <div className="mb-16 grid gap-10 lg:grid-cols-[1fr_320px]">
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
                  <div className="glass rounded-3xl border border-white/10 p-6">
                    <MostRead articles={mostRead} />
                  </div>
                )}
              </aside>
            </div>

            {/* Category rows — each hides itself when empty */}
            <div className="space-y-16">
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
              <p className="mt-14 text-center text-sm text-muted-foreground">
                CodePlay Insights is new — {total}{" "}
                {total === 1 ? "article" : "articles"} published so far, with
                2–3 added on publishing days.
              </p>
            )}

            <div className="mt-20">
              <NewsletterCta />
            </div>
          </>
        )}

        <nav
          aria-label="About CodePlay Insights"
          className="mt-16 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-6 text-xs text-muted-foreground"
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
