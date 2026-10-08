import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { Clock, ShieldCheck, Type, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import NotFound from "@/pages/not-found";
import { recordArticleView } from "@/lib/insights/views";
import {
  trackArticleView,
  trackShare,
  trackScrollDepth,
} from "@/lib/insights/analytics";
import { useScrollDepth } from "@/hooks/useScrollDepth";
import {
  INSIGHTS_BASE,
  insightsArticleUrl,
  insightsCategoryPath,
} from "@/lib/insights/routes";
import { getArticle, categoryName, formatDate } from "@/lib/insights/feed";
import { useInsightsFeed } from "@/hooks/useInsightsFeed";
import {
  InsightsShell,
  ArticleSEO,
  Breadcrumb,
  ArticleImage,
  ArticleBody,
  KeyTakeaways,
  BusinessCta,
  ShareControls,
  SourcesList,
  RelatedStories,
  RelatedServices,
  AdSlot,
} from "@/components/insights";

type FontSize = "standard" | "comfortable" | "large";

export default function InsightsArticle() {
  const { slug } = useParams();
  const feedStatus = useInsightsFeed();
  const article = slug ? getArticle(slug) : undefined;
  const [scrollProgress, setScrollProgress] = useState(0);
  const [fontSize, setFontSize] = useState<FontSize>("comfortable");

  useEffect(() => {
    if (article) {
      recordArticleView(article.slug);
      trackArticleView(article.slug, article.category);
    }
  }, [article]);

  useScrollDepth((pct) => {
    if (article) trackScrollDepth(article.slug, pct);
  });

  // Track scroll position for dynamic reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      if (total > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / total) * 100)));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!article) {
    if (feedStatus === "loading") {
      return (
        <InsightsShell>
          <div className="container mx-auto max-w-3xl px-5 py-24 text-center text-base text-slate-300">
            Loading analysis…
          </div>
        </InsightsShell>
      );
    }
    return <NotFound />;
  }

  const url = insightsArticleUrl(article.slug);
  const catName = categoryName(article.category);
  const fontSizeClass =
    fontSize === "standard"
      ? "reading-font-standard"
      : fontSize === "large"
      ? "reading-font-large"
      : "reading-font-comfortable";

  return (
    <InsightsShell>
      <ArticleSEO article={article} />

      {/* Top Reading Progress Bar */}
      <div
        className="reading-progress-bar"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Article reading progress"
      />

      <article className="container mx-auto max-w-3xl px-5 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Breadcrumb
            items={[
              { label: "Insights", href: INSIGHTS_BASE },
              { label: catName, href: insightsCategoryPath(article.category) },
              { label: article.title },
            ]}
          />
          <Link
            href={INSIGHTS_BASE}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to hub
          </Link>
        </div>

        <header className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={insightsCategoryPath(article.category)}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono font-semibold uppercase tracking-[0.18em] text-primary hover:bg-primary/20 transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              {catName}
            </a>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400/90">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Analysis
            </span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-extrabold leading-[1.16] tracking-tight text-white sm:text-4xl md:text-[2.85rem]">
            {article.title}
          </h1>

          <p className="mt-4 text-lg leading-relaxed text-slate-200 sm:text-xl font-normal text-balance">
            {article.dek}
          </p>

          {/* Author & Publication Metadata Row */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0e1424]/60 p-4 backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm">
                CP
              </div>
              <div className="flex flex-col">
                <a
                  href={`${INSIGHTS_BASE}/authors/codeplay-studios-editorial-team`}
                  className="font-semibold text-white hover:text-primary transition-colors leading-snug"
                >
                  {article.author}
                </a>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <time dateTime={article.publishedAt}>
                    {formatDate(article.publishedAt)}
                  </time>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {article.readingMinutes} min read
                  </span>
                </div>
              </div>
            </div>

            <ShareControls
              url={url}
              title={article.title}
              compact
              onShare={(n) => trackShare(article.slug, n)}
            />
          </div>

          {/* Reading Comfort & Typography Toolbar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Type className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span className="font-medium text-slate-300">Reading Size:</span>
              <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5">
                <button
                  type="button"
                  onClick={() => setFontSize("standard")}
                  className={`rounded px-2 py-0.5 text-xs transition-colors ${
                    fontSize === "standard"
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Standard reading font size"
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize("comfortable")}
                  className={`rounded px-2 py-0.5 text-xs transition-colors ${
                    fontSize === "comfortable"
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Comfortable reading font size"
                >
                  Comfortable
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize("large")}
                  className={`rounded px-2 py-0.5 text-xs transition-colors ${
                    fontSize === "large"
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Large reading font size"
                >
                  Large
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[0.7rem] text-slate-400">
                {Math.round(scrollProgress)}% completed
              </span>
            </div>
          </div>
        </header>

        {article.heroImage && (
          <figure className="mt-8 overflow-hidden rounded-3xl border border-white/15 bg-black/40 shadow-2xl shadow-black/40">
            <ArticleImage
              image={article.heroImage}
              category={article.category}
              sizes="(min-width: 768px) 768px, 100vw"
              priority
              className="w-full object-cover"
            />
            {article.heroImage.kind === "stock" &&
            article.heroImage.credit?.provider === "source" ? (
              <figcaption className="bg-black/50 px-4 py-2 text-xs text-slate-400">
                Image:{" "}
                <a
                  href={article.heroImage.credit.photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="underline hover:text-white"
                >
                  {article.heroImage.credit.photographer}
                </a>
              </figcaption>
            ) : article.heroImage.kind === "stock" && article.heroImage.credit ? (
              <figcaption className="bg-black/50 px-4 py-2 text-xs text-slate-400">
                Photo:{" "}
                <a
                  href={article.heroImage.credit.photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="underline hover:text-white"
                >
                  {article.heroImage.credit.photographer}
                </a>{" "}
                on{" "}
                <a
                  href={article.heroImage.credit.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="underline hover:text-white"
                >
                  Pexels
                </a>
              </figcaption>
            ) : article.heroImage.aiGenerated ? (
              <figcaption className="bg-black/50 px-4 py-2 text-xs text-slate-400">
                AI-generated editorial illustration
              </figcaption>
            ) : null}
          </figure>
        )}

        {article.keyTakeaways && article.keyTakeaways.length > 0 && (
          <KeyTakeaways points={article.keyTakeaways} />
        )}

        <AdSlot placement="in-article-top" />

        <ArticleBody markdown={article.body} fontSizeClass={fontSizeClass} />

        <AdSlot placement="in-article-mid" />

        <BusinessCta categorySlug={article.category} />

        <RelatedServices article={article} />

        <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6">
          <p className="text-sm text-muted-foreground">
            Found this useful? Share it.
          </p>
          <ShareControls
            url={url}
            title={article.title}
            onShare={(n) => trackShare(article.slug, n)}
          />
        </div>

        <SourcesList sources={article.sources} slug={article.slug} />

        <AdSlot placement="after-article" />

        <RelatedStories article={article} />

        <footer className="mt-14 border-t border-white/10 pt-6 text-xs text-muted-foreground">
          CodePlay Insights follows a documented editorial process.{" "}
          <a href={`${INSIGHTS_BASE}/editorial-policy`} className="text-primary hover:underline">
            Editorial Policy
          </a>
          {" · "}
          <a href={`${INSIGHTS_BASE}/ai-policy`} className="text-primary hover:underline">
            AI Usage Policy
          </a>
          {" · "}
          <a href={`${INSIGHTS_BASE}/corrections`} className="text-primary hover:underline">
            Corrections
          </a>
        </footer>
      </article>
    </InsightsShell>
  );
}
