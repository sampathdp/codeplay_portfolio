import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { Flame, Zap } from "lucide-react";
import type { InsightsArticleSummary } from "@/lib/insights/types";
import { insightsArticlePath } from "@/lib/insights/routes";
import { categoryShort } from "@/lib/insights/visuals";
import ArticleImage from "./ArticleImage";
import CategoryBadge from "./CategoryBadge";
import ArticleMetaLine from "./ArticleMetaLine";

type Variant = "default" | "compact" | "wide";

interface Props {
  article: InsightsArticleSummary;
  variant?: Variant;
  index?: number;
  showExcerpt?: boolean;
  priority?: boolean;
}

function Indicators({ article }: { article: InsightsArticleSummary }) {
  if (!article.breaking && !article.trending) return null;
  return (
    <div className="flex items-center gap-1.5">
      {article.breaking && (
        <span className="inline-flex items-center gap-1 rounded-md bg-destructive/15 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-destructive">
          <Zap className="h-3 w-3" aria-hidden="true" /> Breaking
        </span>
      )}
      {article.trending && !article.breaking && (
        <span className="inline-flex items-center gap-1 rounded-md bg-orange-500/15 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-orange-400">
          <Flame className="h-3 w-3" aria-hidden="true" /> Trending
        </span>
      )}
    </div>
  );
}

export default function ArticleCard({
  article,
  variant = "default",
  index = 0,
  showExcerpt = true,
  priority = false,
}: Props) {
  const reduce = useReducedMotion();
  const href = insightsArticlePath(article.slug);

  const inner =
    variant === "wide" ? (
      <div className="grid gap-5 sm:grid-cols-[minmax(0,240px)_1fr] items-stretch">
        <div className="relative overflow-hidden rounded-2xl border border-white/10">
          <ArticleImage
            image={article.heroImage}
            category={article.category}
            sizes="(min-width: 640px) 240px, 100vw"
            className="transition-transform duration-500 group-hover:scale-[1.03]"
            priority={priority}
          />
        </div>
        <div className="flex flex-col justify-center gap-3 py-1">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={article.category} />
            <Indicators article={article} />
          </div>
          <h3 className="text-lg font-bold leading-snug transition-colors group-hover:text-primary md:text-xl">
            {article.title}
          </h3>
          {showExcerpt && (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {article.dek}
            </p>
          )}
          <ArticleMetaLine
            publishedAt={article.publishedAt}
            readingMinutes={article.readingMinutes}
          />
        </div>
      </div>
    ) : variant === "compact" ? (
      <div className="flex gap-4">
        <div className="w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 sm:w-28">
          <ArticleImage
            image={article.heroImage}
            category={article.category}
            sizes="112px"
          />
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-primary">
              {categoryShort(article.category)}
            </span>
            <Indicators article={article} />
          </div>
          <h3 className="line-clamp-3 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
            {article.title}
          </h3>
          <ArticleMetaLine
            publishedAt={article.publishedAt}
            readingMinutes={article.readingMinutes}
            className="text-[0.7rem]"
          />
        </div>
      </div>
    ) : (
      <>
        <div className="relative overflow-hidden rounded-2xl border border-white/10">
          <ArticleImage
            image={article.heroImage}
            category={article.category}
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw"
            className="transition-transform duration-500 group-hover:scale-[1.04]"
            priority={priority}
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <CategoryBadge category={article.category} overlay />
            <Indicators article={article} />
          </div>
        </div>
        <div className="mt-4 flex flex-1 flex-col gap-2.5">
          <h3 className="text-lg font-bold leading-snug transition-colors group-hover:text-primary">
            {article.title}
          </h3>
          {showExcerpt && (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {article.dek}
            </p>
          )}
          <ArticleMetaLine
            publishedAt={article.publishedAt}
            readingMinutes={article.readingMinutes}
            className="mt-auto pt-1"
          />
        </div>
      </>
    );

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="group flex h-full flex-col"
    >
      <Link
        href={href}
        className="flex h-full flex-col rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {inner}
      </Link>
    </motion.article>
  );
}
