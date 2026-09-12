import { useMemo } from "react";
import { renderArticleBody } from "@/lib/insights/markdown";

/**
 * Renders the article's Markdown body to safe HTML (escaped first — no
 * sanitiser dependency needed) inside Tailwind Typography `prose`.
 */
interface ArticleBodyProps {
  markdown: string;
  fontSizeClass?: string;
  className?: string;
}

export default function ArticleBody({
  markdown,
  fontSizeClass = "reading-font-comfortable",
  className = "",
}: ArticleBodyProps) {
  const { html } = useMemo(() => renderArticleBody(markdown), [markdown]);
  return (
    <div
      className={`insights-prose prose prose-invert mt-10 max-w-none prose-headings:font-display prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-li:marker:text-primary/70 ${fontSizeClass} ${className}`}
      // Content is our own generated Markdown, HTML-escaped by the renderer.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
