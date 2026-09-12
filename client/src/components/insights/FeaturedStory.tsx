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
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-[2.25rem] border border-white/15 bg-[#0e1424] shadow-2xl shadow-black/60 transition-all duration-500 hover:border-primary/50 hover:shadow-primary/10"
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
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </Link>

      {/* Modern multi-layer gradient scrim for supreme text contrast and legibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080d1a] via-[#080d1a]/80 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#080d1a]/90 via-[#080d1a]/40 to-transparent" />

      <div className="relative flex min-h-[460px] flex-col justify-end gap-5 p-6 sm:min-h-[500px] sm:p-10 md:min-h-[580px] md:p-14">
        <div className="flex flex-wrap items-center gap-3">
          <CategoryBadge category={article.category} asLink />
          {article.breaking && (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider text-white shadow-sm">
              <Zap className="h-3 w-3" aria-hidden="true" /> Breaking
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/15 px-3 py-0.5 text-[0.7rem] font-mono font-semibold uppercase tracking-[0.25em] text-primary backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" aria-hidden="true" />
            Featured Analysis
          </span>
        </div>

        <h2 className="max-w-4xl font-display text-2xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-3xl md:text-5xl lg:text-[3.25rem]">
          <Link
            href={href}
            className="rounded-lg transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {article.title}
          </Link>
        </h2>

        <p className="max-w-3xl text-base leading-relaxed text-slate-200 md:text-lg lg:text-xl font-normal text-balance">
          {article.dek}
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-300">
            <span className="font-medium text-white/90">{article.author}</span>
            <span aria-hidden="true" className="text-white/30">·</span>
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            <span aria-hidden="true" className="text-white/30">·</span>
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-white/80">
              {article.readingMinutes} min read
            </span>
          </div>

          <Link
            href={href}
            className="group/cta inline-flex items-center gap-2.5 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.03] hover:shadow-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span>Read full analysis</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
