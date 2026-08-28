import type { InsightsArticleSummary } from "@/lib/insights/types";
import ArticleCard from "./ArticleCard";

interface Props {
  articles: InsightsArticleSummary[];
  columns?: 2 | 3;
  showExcerpt?: boolean;
  startIndex?: number;
}

const COLS: Record<2 | 3, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
};

export default function ArticleGrid({
  articles,
  columns = 3,
  showExcerpt = true,
  startIndex = 0,
}: Props) {
  return (
    <div className={`grid grid-cols-1 gap-x-6 gap-y-8 ${COLS[columns]}`}>
      {articles.map((a, i) => (
        <ArticleCard
          key={a.slug}
          article={a}
          index={startIndex + i}
          showExcerpt={showExcerpt}
        />
      ))}
    </div>
  );
}
