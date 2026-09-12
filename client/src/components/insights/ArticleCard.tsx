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
        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/90 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white shadow-sm">
          <Zap className="h-3 w-3" aria-hidden="true" /> Breaking
        </span>
      )}
      {article.trending && !article.breaking && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-black shadow-sm">
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
      <div className="grid gap-5 sm:grid-cols-[minmax(0,260px)_1fr] items-stretch">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20">
          <ArticleImage
            image={article.heroImage}
            category={article.category}
            sizes="(min-width: 640px) 260px, 100vw"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
        </div>
        <div className="flex flex-col justify-center gap-2.5 py-1">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={article.category} />
            <Indicators article={article} />
          </div>
          <h3 className="font-display text-lg font-bold leading-snug text-white transition-colors group-hover:text-primary md:text-xl">
            {article.title}
          </h3>
          {showExcerpt && (
            <p className="line-clamp-2 text-sm leading-relaxed text-slate-300">
              {article.dek}
            </p>
          )}
          <ArticleMetaLine
            publishedAt={article.publishedAt}
            readingMinutes={article.readingMinutes}
            className="text-slate-400 mt-auto pt-1"
          />
        </div>
      </div>
    ) : variant === "compact" ? (
      <div className="flex gap-4 items-center">
        <div className="w-24 h-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/20 sm:w-28 sm:h-24">
          <ArticleImage
            image={article.heroImage}
            category={article.category}
            sizes="112px"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-primary">
              {categoryShort(article.category)}
            </span>
            <Indicators article={article} />
          </div>
          <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug text-white transition-colors group-hover:text-primary">
            {article.title}
          </h3>
          <ArticleMetaLine
            publishedAt={article.publishedAt}
            readingMinutes={article.readingMinutes}
            className="text-[0.72rem] text-slate-400"
          />
        </div>
      </div>
    ) : (
      <div className="flex h-full flex-col">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 aspect-[16/10]">
          <ArticleImage
            image={article.heroImage}
            category={article.category}
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw"
            className="h-full w-full object-cover transition-transform duration-600 ease-out group-hover:scale-105"
            priority={priority}
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <CategoryBadge category={article.category} overlay />
            <Indicators article={article} />
          </div>
        </div>
        <div className="mt-4 flex flex-1 flex-col gap-2.5">
          <h3 className="font-display text-lg font-bold leading-snug text-white transition-colors group-hover:text-primary sm:text-xl">
            {article.title}
          </h3>
          {showExcerpt && (
            <p className="line-clamp-2 text-sm leading-relaxed text-slate-300">
              {article.dek}
            </p>
          )}
          <ArticleMetaLine
            publishedAt={article.publishedAt}
            readingMinutes={article.readingMinutes}
            className="mt-auto pt-2 text-slate-400 text-xs"
          />
        </div>
      </div>
    );

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      whileHover={reduce ? undefined : { y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="group flex h-full flex-col"
    >
      <Link
        href={href}
        className="flex h-full flex-col rounded-3xl border border-white/10 bg-[#0e1424]/70 p-4 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:bg-[#131b30]/90 hover:shadow-xl hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {inner}
      </Link>
    </motion.article>
  );
}
