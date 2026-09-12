import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import type { InsightsArticle } from "@/lib/insights/types";
import { insightsArticlePath } from "@/lib/insights/routes";
import { formatDate } from "@/lib/insights/feed";
import ArticleImage from "./ArticleImage";
import CategoryBadge from "./CategoryBadge";

/** Full-bleed magazine-style hero: photo fills the card, headline sits in
 * a scrim at the bottom. Reads as one large, confident story instead of a
 * split image/text box. */
export default function FeaturedStory({ article }: { article: InsightsArticle }) {
  const reduce = useReducedMotion();
  const href = insightsArticlePath(article.slug);

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/40 transition-colors duration-300 hover:border-primary/30"
    >
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="absolute inset-0 block h-full w-full overflow-hidden"
      >
        <ArticleImage
          image={article.heroImage}
          category={article.category}
          sizes="100vw"
          priority
          className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </Link>

      {/* scrim — strong at the bottom for text contrast, a wash across the rest */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

      <div className="relative flex min-h-[440px] flex-col justify-end gap-5 p-7 sm:min-h-[480px] md:min-h-[560px] md:p-12">
        <div className="flex flex-wrap items-center gap-3">
          <CategoryBadge category={article.category} asLink />
          {article.breaking && (
            <span className="inline-flex items-center gap-1 rounded-md bg-destructive px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white">
              <Zap className="h-3 w-3" aria-hidden="true" /> Breaking
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            Featured Story
          </span>
        </div>

        <h2 className="max-w-3xl text-2xl font-bold leading-[1.1] tracking-tight text-white md:text-5xl">
          <Link
            href={href}
            className="rounded transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {article.title}
          </Link>
        </h2>

        <p className="max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
          {article.dek}
        </p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
          <div className="flex items-center gap-x-3 text-sm text-white/55">
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span>{article.readingMinutes} min read</span>
          </div>

          <Link
            href={href}
            className="group/cta inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-[1.03] hover:shadow-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Read the full story
            <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
