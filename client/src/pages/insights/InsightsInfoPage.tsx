import { useMemo } from "react";
import { useParams } from "wouter";
import NotFound from "@/pages/not-found";
import SEO from "@/components/SEO";
import { renderMarkdown } from "@/lib/insights/markdown";
import { getEditorialPage } from "@/lib/insights/editorialPages";
import {
  INSIGHTS_BASE,
  SITE_ORIGIN,
} from "@/lib/insights/routes";
import { InsightsShell, Breadcrumb } from "@/components/insights";

/**
 * Renders the CodePlay Insights trust pages — About, Editorial Policy,
 * AI Usage Policy, Corrections Policy — from `editorialPages.ts`.
 */
export default function InsightsInfoPage({ slug: slugProp }: { slug?: string }) {
  const params = useParams();
  const slug = slugProp ?? params.slug ?? "";
  const page = getEditorialPage(slug);

  const html = useMemo(
    () => (page ? renderMarkdown(page.body, { headingShift: 1 }) : ""),
    [page],
  );

  if (!page) return <NotFound />;

  const url = `${SITE_ORIGIN}${page.path}`;

  return (
    <InsightsShell>
      <SEO
        title={`${page.title} | CodePlay Insights`}
        description={page.description}
        canonical={url}
        breadcrumbs={[
          { name: "Home", item: SITE_ORIGIN },
          { name: "Insights", item: `${SITE_ORIGIN}${INSIGHTS_BASE}` },
          { name: page.title, item: url },
        ]}
      />

      <div className="container mx-auto max-w-3xl px-5 sm:px-6">
        <Breadcrumb
          items={[
            { label: "Insights", href: INSIGHTS_BASE },
            { label: page.title },
          ]}
        />

        <header className="mb-8 mt-6">
          <h1 className="font-['Outfit'] text-3xl font-bold tracking-tight md:text-4xl">
            {page.title}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{page.description}</p>
        </header>

        <div
          className="insights-prose prose prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:mt-10 prose-h2:text-2xl prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </InsightsShell>
  );
}
