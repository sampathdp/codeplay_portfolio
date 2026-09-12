import { useEffect } from "react";
import { useParams } from "wouter";
import SEO from "@/components/SEO";
import NotFound from "@/pages/not-found";
import { trackCategoryView } from "@/lib/insights/analytics";
import { getInsightsCategory } from "@/lib/insights/categories";
import { INSIGHTS_BASE, SITE_ORIGIN, insightsCategoryPath } from "@/lib/insights/routes";
import { byCategory } from "@/lib/insights/feed";
import { useInsightsFeed } from "@/hooks/useInsightsFeed";
import {
  InsightsShell,
  Breadcrumb,
  CategoryNav,
  ArticleGrid,
  EmptyState,
} from "@/components/insights";

export default function InsightsCategory() {
  const { slug } = useParams();
  useInsightsFeed();
  const category = slug ? getInsightsCategory(slug) : undefined;
  const articles = category ? byCategory(category.slug) : [];

  useEffect(() => {
    if (category) trackCategoryView(category.slug, articles.length);
  }, [category, articles.length]);

  if (!category) return <NotFound />;

  return (
    <InsightsShell>
      <SEO
        title={`${category.name} News & Analysis | CodePlay Insights`}
        description={category.description}
        canonical={`${SITE_ORIGIN}${insightsCategoryPath(category.slug)}`}
      />

      <div className="container mx-auto max-w-7xl px-5 sm:px-6">
        <Breadcrumb
          items={[
            { label: "Insights", href: INSIGHTS_BASE },
            { label: category.name },
          ]}
        />

        <header className="mb-8 mt-6 max-w-3xl">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            {category.name}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-200 sm:text-lg">
            {category.description}
          </p>
          <p className="mt-2 text-sm font-medium text-primary">
            {articles.length} {articles.length === 1 ? "article published" : "articles published"}
          </p>
        </header>

        <div className="mb-10">
          <CategoryNav activeSlug={category.slug} onlyNonEmpty={false} />
        </div>

        {articles.length > 0 ? (
          <ArticleGrid articles={articles} columns={3} />
        ) : (
          <EmptyState
            title={`No ${category.name} articles yet`}
            message="This category is new. Browse other Insights in the meantime."
            showBack
          />
        )}
      </div>
    </InsightsShell>
  );
}
