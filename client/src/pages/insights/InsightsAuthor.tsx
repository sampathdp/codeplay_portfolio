import { useParams } from "wouter";
import NotFound from "@/pages/not-found";
import SEO from "@/components/SEO";
import { INSIGHTS_BASE, SITE_ORIGIN } from "@/lib/insights/routes";
import { INSIGHTS_AUTHORS, getInsightsAuthor } from "@/lib/insights/authors";
import { allArticles, toSummary } from "@/lib/insights/feed";
import { InsightsShell, Breadcrumb, ArticleGrid } from "@/components/insights";

/**
 * Author profile. CodePlay has not supplied individual bios, so this
 * resolves to the editorial-team entity — a real, accountable publisher
 * with a documented process, not an invented person.
 */
export default function InsightsAuthor() {
  const { slug = "" } = useParams();
  const known = INSIGHTS_AUTHORS.some((a) => a.slug === slug);
  if (!known) return <NotFound />;

  const author = getInsightsAuthor(slug);
  const url = author.url;
  const articles = allArticles()
    .filter((a) => getInsightsAuthor(a.author).slug === author.slug)
    .map(toSummary);

  const personSchema = {
    "@context": "https://schema.org",
    "@type": author.type,
    name: author.name,
    url,
    description: author.bio,
    worksFor: {
      "@type": "Organization",
      name: "CodePlay Studios",
      url: SITE_ORIGIN,
    },
  };

  return (
    <InsightsShell>
      <SEO
        title={`${author.name} | CodePlay Insights`}
        description={author.bio}
        canonical={url}
        breadcrumbs={[
          { name: "Home", item: SITE_ORIGIN },
          { name: "Insights", item: `${SITE_ORIGIN}${INSIGHTS_BASE}` },
          { name: author.name, item: url },
        ]}
        schemas={[personSchema]}
      />

      <div className="container mx-auto max-w-4xl px-5 sm:px-6">
        <Breadcrumb
          items={[
            { label: "Insights", href: INSIGHTS_BASE },
            { label: author.name },
          ]}
        />

        <header className="mb-10 mt-6">
          <p className="text-[0.7rem] font-mono uppercase tracking-[0.3em] text-primary">
            {author.role}
          </p>
          <h1 className="mt-1 font-['Outfit'] text-3xl font-bold tracking-tight md:text-4xl">
            {author.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {author.bio}
          </p>
          <p className="mt-3 text-sm">
            <a
              href={`${INSIGHTS_BASE}/editorial-policy`}
              className="text-primary hover:underline"
            >
              Editorial Policy
            </a>
            <span className="mx-2 text-muted-foreground">·</span>
            <a
              href={`${INSIGHTS_BASE}/ai-policy`}
              className="text-primary hover:underline"
            >
              AI Usage Policy
            </a>
          </p>
        </header>

        {articles.length > 0 && (
          <>
            <h2 className="mb-6 text-lg font-bold">Recent articles</h2>
            <ArticleGrid articles={articles} columns={3} />
          </>
        )}
      </div>
    </InsightsShell>
  );
}
