import { useEffect } from "react";
import { useParams } from "wouter";
import { Clock } from "lucide-react";
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

export default function InsightsArticle() {
  const { slug } = useParams();
  const feedStatus = useInsightsFeed();
  const article = slug ? getArticle(slug) : undefined;

  useEffect(() => {
    if (article) {
      recordArticleView(article.slug);
      trackArticleView(article.slug, article.category);
    }
  }, [article]);

  useScrollDepth((pct) => {
    if (article) trackScrollDepth(article.slug, pct);
  });

  if (!article) {
    if (feedStatus === "loading") {
      return (
        <InsightsShell>
          <div className="container mx-auto max-w-3xl px-5 py-24 text-center text-sm text-muted-foreground">
            Loading…
          </div>
        </InsightsShell>
      );
    }
    return <NotFound />;
  }

  const url = insightsArticleUrl(article.slug);
  const catName = categoryName(article.category);

  return (
    <InsightsShell>
      <ArticleSEO article={article} />

      <article className="container mx-auto max-w-3xl px-5 sm:px-6">
        <Breadcrumb
          items={[
            { label: "Insights", href: INSIGHTS_BASE },
            { label: catName, href: insightsCategoryPath(article.category) },
            { label: article.title },
          ]}
        />

        <header className="mt-6">
          <a
            href={insightsCategoryPath(article.category)}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-primary hover:underline"
          >
            {catName}
          </a>
          <h1 className="mt-3 break-words text-[1.75rem] font-bold leading-tight tracking-tight sm:text-3xl md:text-[2.7rem]">
            {article.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
            {article.dek}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-white/10 py-4 text-sm text-muted-foreground">
            <a
              href={`${INSIGHTS_BASE}/authors/codeplay-studios-editorial-team`}
              className="font-medium text-foreground/90 hover:text-primary hover:underline"
            >
              {article.author}
            </a>
            {article.authorRole && (
              <span className="text-xs">{article.authorRole}</span>
            )}
            <span aria-hidden="true">·</span>
            <time dateTime={article.publishedAt}>
              {formatDate(article.publishedAt)}
            </time>
            {article.updatedAt && article.updatedAt !== article.publishedAt && (
              <span className="text-xs">
                (updated {formatDate(article.updatedAt)})
              </span>
            )}
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {article.readingMinutes} min read
            </span>
            <span className="mt-1 w-full sm:mt-0 sm:ml-auto sm:w-auto">
              <ShareControls
                url={url}
                title={article.title}
                compact
                onShare={(n) => trackShare(article.slug, n)}
              />
            </span>
          </div>
        </header>

        {article.heroImage && (
          <figure className="mt-8 overflow-hidden rounded-2xl border border-white/10">
            <ArticleImage
              image={article.heroImage}
              category={article.category}
              sizes="(min-width: 768px) 768px, 100vw"
              priority
            />
            {article.heroImage.aiGenerated && (
              <figcaption className="bg-black/30 px-4 py-2 text-xs text-muted-foreground">
                AI-generated editorial illustration
              </figcaption>
            )}
          </figure>
        )}

        {article.keyTakeaways && article.keyTakeaways.length > 0 && (
          <KeyTakeaways points={article.keyTakeaways} />
        )}

        <AdSlot placement="in-article-top" />

        <ArticleBody markdown={article.body} />

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
