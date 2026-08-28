import type { InsightsArticle } from "@/lib/insights/types";
import { relatedArticles } from "@/lib/insights/feed";
import { trackRelatedClick } from "@/lib/insights/analytics";
import SectionHeader from "./SectionHeader";
import ArticleCard from "./ArticleCard";

export default function RelatedStories({ article }: { article: InsightsArticle }) {
  const related = relatedArticles(article, 6).slice(0, 6);
  if (related.length < 1) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-16">
      <SectionHeader id="related-heading" title="Related Stories" as="h2" />
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((a, i) => (
          <div
            key={a.slug}
            onClickCapture={() => trackRelatedClick(article.slug, a.slug)}
          >
            <ArticleCard article={a} index={i} showExcerpt={false} />
          </div>
        ))}
      </div>
    </section>
  );
}
