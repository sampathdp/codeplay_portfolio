import type { InsightsArticleSummary } from "@/lib/insights/types";
import { insightsCategoryPath } from "@/lib/insights/routes";
import { byCategory } from "@/lib/insights/feed";
import SectionHeader from "./SectionHeader";
import ArticleCard from "./ArticleCard";

interface Props {
  categorySlug: string;
  title: string;
  limit?: number;
}

/**
 * A homepage row for one category. Renders nothing when the category has
 * no articles, so the page stays clean with a small library.
 */
export default function CategorySection({ categorySlug, title, limit = 4 }: Props) {
  const articles: InsightsArticleSummary[] = byCategory(categorySlug, limit);
  if (articles.length === 0) return null;

  const [lead, ...rest] = articles;

  return (
    <section aria-labelledby={`cat-${categorySlug}`}>
      <SectionHeader
        id={`cat-${categorySlug}`}
        title={title}
        viewAllHref={insightsCategoryPath(categorySlug)}
      />
      <div className="grid gap-x-6 gap-y-8 lg:grid-cols-2">
        <ArticleCard article={lead} priority={false} />
        {rest.length > 0 && (
          <div className="flex flex-col gap-6">
            {rest.slice(0, 3).map((a, i) => (
              <ArticleCard key={a.slug} article={a} variant="compact" index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
