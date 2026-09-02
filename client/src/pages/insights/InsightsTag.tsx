import { useParams } from "wouter";
import SEO from "@/components/SEO";
import { INSIGHTS_BASE, SITE_ORIGIN, insightsTagPath } from "@/lib/insights/routes";
import { byTag, allArticles } from "@/lib/insights/feed";
import { useInsightsFeed } from "@/hooks/useInsightsFeed";
import {
  InsightsShell,
  Breadcrumb,
  ArticleGrid,
  EmptyState,
} from "@/components/insights";

function tagName(slug: string): string {
  for (const a of allArticles()) {
    const t = a.tags.find((x) => x.slug === slug);
    if (t) return t.name;
  }
  return slug.replace(/-/g, " ");
}

export default function InsightsTag() {
  const { slug = "" } = useParams();
  useInsightsFeed();
  const name = tagName(slug);
  const articles = byTag(slug);

  return (
    <InsightsShell>
      <SEO
        title={`${name} | CodePlay Insights`}
        description={`CodePlay Insights articles tagged ${name} — analysis with the developer take.`}
        canonical={`${SITE_ORIGIN}${insightsTagPath(slug)}`}
        robots={articles.length ? "index, follow" : "noindex, follow"}
      />

      <div className="container mx-auto max-w-7xl px-5 sm:px-6">
        <Breadcrumb
          items={[
            { label: "Insights", href: INSIGHTS_BASE },
            { label: `#${name}` },
          ]}
        />

        <header className="mb-10 mt-6">
          <p className="text-[0.7rem] font-mono uppercase tracking-[0.3em] text-primary">
            Tag
          </p>
          <h1 className="mt-1 font-['Outfit'] text-3xl font-bold tracking-tight md:text-5xl">
            {name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {articles.length} {articles.length === 1 ? "article" : "articles"}
          </p>
        </header>

        {articles.length > 0 ? (
          <ArticleGrid articles={articles} columns={3} />
        ) : (
          <EmptyState
            title={`Nothing tagged ${name} yet`}
            message="Try browsing by category instead."
            showBack
          />
        )}
      </div>
    </InsightsShell>
  );
}
