import { Helmet } from "react-helmet-async";

interface BreadcrumbInput {
  name: string;
  item: string;
}

interface ArticleMeta {
  publishedTime: string;
  modifiedTime?: string;
  authorName?: string;
  section?: string;
  tags?: string[];
}

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogImageWidth?: number | string;
  ogImageHeight?: number | string;
  ogUrl?: string;
  /** "website" (default) or "article". */
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  schemas?: any[];
  robots?: string;
  themeColor?: string;
  /** Article Open Graph tags (only rendered when ogType is "article"). */
  article?: ArticleMeta;
  /** Explicit breadcrumb trail. When given, replaces the path-derived one. */
  breadcrumbs?: BreadcrumbInput[];
}

const GSC_VERIFICATION = import.meta.env.VITE_GSC_VERIFICATION as
  | string
  | undefined;

/**
 * Serialise JSON-LD so a stray `</script>` (or `<!--`) inside a string
 * value — e.g. an article title — can never break out of the script tag.
 * `JSON.stringify` does not escape `<`, `>` or `&` on its own.
 */
function jsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

const SEO = ({
  title = "CodePlay Studios — Software Development Company in Sri Lanka",
  description = "CodePlay Studios is a software development company in Sri Lanka building AI-powered business systems, web apps, mobile apps, and games. Scalable, intelligent software tailored to your needs.",
  keywords = "software development company Sri Lanka, software company Sri Lanka, AI development, web applications, mobile apps, ERP systems, game development, custom software, CodePlay Studios",
  ogTitle,
  ogDescription,
  ogImage = "/assets/logo_trans.png",
  ogImageAlt,
  ogImageWidth,
  ogImageHeight,
  ogUrl = typeof window !== "undefined"
    ? window.location.href
    : "https://codeplaystudios.com",
  ogType = "website",
  twitterTitle,
  twitterDescription,
  twitterImage,
  canonical,
  schemas = [],
  robots = "index, follow",
  themeColor = "#020617",
  article,
  breadcrumbs,
}: SEOProps) => {
  const siteTitle = title.includes("CodePlay Studios")
    ? title
    : `${title} | CodePlay Studios`;

  const baseUrl = "https://codeplaystudios.com";
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "";
  const currentCanonical = canonical || `${baseUrl}${currentPath}`;

  // Generate Breadcrumb Schema
  const pathnames = currentPath.split("/").filter((x) => x);
  const breadcrumbItems =
    breadcrumbs && breadcrumbs.length > 0
      ? breadcrumbs.map((b, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: b.name,
          item: b.item,
        }))
      : [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: baseUrl,
          },
          ...pathnames.map((name, index) => ({
            "@type": "ListItem",
            position: index + 2,
            name: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " "),
            item: `${baseUrl}/${pathnames.slice(0, index + 1).join("/")}`,
          })),
        ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CodePlay Studios",
    url: baseUrl,
    logo: `${baseUrl}/assets/logo_trans.png`,
    description: description,
    founder: {
      "@type": "Person",
      name: "Sampath Dananjaya"
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "115/A, Gagabada Road, Hirana",
      addressLocality: "Panadura",
      addressRegion: "Western Province",
      addressCountry: "Sri Lanka",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+94754453334",
      contactType: "Customer Service",
      email: "info@codeplaystudios.com",
      areaServed: ["LK", "Worldwide"],
    },
    // No verified social profiles exist yet — `sameAs` stays empty rather
    // than asserting accounts nobody can click through to. Add real URLs
    // here (and to the icons in Navigation/Footer) once accounts exist.
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: baseUrl,
    name: "CodePlay Studios",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />
      <meta name="theme-color" content={themeColor} />
      {GSC_VERIFICATION && (
        <meta name="google-site-verification" content={GSC_VERIFICATION} />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:title" content={ogTitle || siteTitle} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImage} />
      {ogImageAlt && <meta property="og:image:alt" content={ogImageAlt} />}
      {ogImageWidth && (
        <meta property="og:image:width" content={String(ogImageWidth)} />
      )}
      {ogImageHeight && (
        <meta property="og:image:height" content={String(ogImageHeight)} />
      )}
      <meta property="og:site_name" content="CodePlay Studios" />
      <meta property="og:locale" content="en_US" />

      {/* Article Open Graph */}
      {ogType === "article" && article && (
        <meta
          property="article:published_time"
          content={article.publishedTime}
        />
      )}
      {ogType === "article" && article?.modifiedTime && (
        <meta property="article:modified_time" content={article.modifiedTime} />
      )}
      {ogType === "article" && article?.authorName && (
        <meta property="article:author" content={article.authorName} />
      )}
      {ogType === "article" && article?.section && (
        <meta property="article:section" content={article.section} />
      )}
      {ogType === "article" &&
        (article?.tags ?? []).map((t) => (
          <meta key={t} property="article:tag" content={t} />
        ))}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={ogUrl} />
      <meta
        property="twitter:title"
        content={twitterTitle || ogTitle || siteTitle}
      />
      <meta
        property="twitter:description"
        content={twitterDescription || ogDescription || description}
      />
      <meta property="twitter:image" content={twitterImage || ogImage} />
      {ogImageAlt && <meta property="twitter:image:alt" content={ogImageAlt} />}

      {/* Canonical Link */}
      <link rel="canonical" href={currentCanonical} />

      {/* Structured Data */}
      <script type="application/ld+json">{jsonLd(organizationSchema)}</script>
      <script type="application/ld+json">{jsonLd(breadcrumbSchema)}</script>
      <script type="application/ld+json">{jsonLd(websiteSchema)}</script>
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {jsonLd(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
