import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { InsightsArticle } from "@/lib/insights/types";
import { insightsArticlePath } from "@/lib/insights/routes";
import { formatDate } from "@/lib/insights/feed";
import ArticleImage from "./ArticleImage";
import CategoryBadge from "./CategoryBadge";

export default function FeaturedStory({ article }: { article: InsightsArticle }) {
  const reduce = useReducedMotion();
  const href = insightsArticlePath(article.slug);

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass overflow-hidden rounded-3xl border border-white/10"
    >
      <div className="grid lg:grid-cols-2">
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden="true"
          className="relative block h-full min-h-[220px] overflow-hidden"
        >
          <ArticleImage
            image={article.heroImage}
            category={article.category}
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            className="h-full lg:aspect-auto lg:min-h-[420px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent lg:bg-gradient-to-r" />
        </Link>

        <div className="flex flex-col justify-center gap-5 p-7 md:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <CategoryBadge category={article.category} asLink />
            {article.breaking && (
              <span className="rounded-md bg-destructive/15 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-destructive">
                Breaking
              </span>
            )}
            <span className="text-xs text-muted-foreground">Featured</span>
          </div>

          <h2 className="text-2xl font-bold leading-tight tracking-tight md:text-4xl">
            <Link
              href={href}
              className="rounded transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {article.title}
            </Link>
          </h2>

          <p className="max-w-prose text-base leading-relaxed text-muted-foreground md:text-lg">
            {article.dek}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span>{article.readingMinutes} min read</span>
          </div>

          <Link
            href={href}
            className="group inline-flex w-fit items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Read the full story
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
