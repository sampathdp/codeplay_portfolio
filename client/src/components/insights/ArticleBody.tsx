import { useMemo } from "react";
import { renderArticleBody } from "@/lib/insights/markdown";

/**
 * Renders the article's Markdown body to safe HTML (escaped first — no
 * sanitiser dependency needed) inside Tailwind Typography `prose`.
 */
export default function ArticleBody({ markdown }: { markdown: string }) {
  const { html } = useMemo(() => renderArticleBody(markdown), [markdown]);
  return (
    <div
      className="insights-prose prose prose-invert mt-8 max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:mt-12 prose-h2:text-2xl prose-h3:text-xl prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-li:marker:text-primary/60"
      // Content is our own generated Markdown, HTML-escaped by the renderer.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
