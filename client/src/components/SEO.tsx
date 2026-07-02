import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  schemas?: any[];
  robots?: string;
  themeColor?: string;
}

const SEO = ({
  title = "CodePlay Studios - Coding Your Vision | Smart Software Solutions",
  description = "CodePlay Studios builds AI-powered business systems, web apps, mobile solutions, and games. We deliver scalable, intelligent software tailored to your needs. Get a quote today.",
  keywords = "AI development, web applications, mobile apps, ERP systems, game development, custom software, CodePlay Studios, software engineering, Sri Lanka",
  ogTitle,
  ogDescription,
  ogImage = "/assets/logo_trans.png",
  ogUrl = typeof window !== "undefined"
    ? window.location.href
    : "https://codeplaystudios.com",
  twitterTitle,
  twitterDescription,
  twitterImage,
  canonical,
  schemas = [],
  robots = "index, follow",
  themeColor = "#020617",
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
  const breadcrumbItems = [
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
      addressLocality: "Panadura",
      addressRegion: "Western Province",
      addressCountry: "Sri Lanka",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+94754453334",
      contactType: "Customer Service",
    },
    sameAs: [
      "https://twitter.com/codeplaystudios",
      "https://linkedin.com/company/codeplaystudios",
      "https://github.com/codeplaystudios",
      "https://facebook.com/codeplaystudios",
    ],
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

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:title" content={ogTitle || siteTitle} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="CodePlay Studios" />

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

      {/* Canonical Link */}
      <link rel="canonical" href={currentCanonical} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
