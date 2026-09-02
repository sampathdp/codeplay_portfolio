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
  const excludeFromLatest = [
    featured?.slug,
    ...trending.slice(0, 3).map((t) => t.slug),
  ].filter(Boolean) as string[];
  const latest = getLatest(9, excludeFromLatest);
  const total = allArticles().length;

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
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <p className="mb-3 text-[0.7rem] font-mono uppercase tracking-[0.4em] text-primary">
              CodePlay Insights
            </p>
            <h1 className="font-['Outfit'] text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Technology that matters.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground md:text-xl">
              Explained for developers, gamers and businesses. Primary sources,
              real analysis, and the CodePlay developer take on every story.
            </p>
          </motion.div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CategoryNav />
            <Link
              href={insightsSearchPath()}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
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
