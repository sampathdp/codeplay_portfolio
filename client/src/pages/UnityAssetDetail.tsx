import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, ExternalLink } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MatrixRain from "@/components/MatrixRain";
import SEO from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UNITY_ASSETS, getUnityAsset } from "@/data/unityAssets";
import NotFound from "./not-found";

export default function UnityAssetDetail() {
  const { slug } = useParams();
  const asset = getUnityAsset(slug ?? "");
  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [slug]);

  if (!asset) return <NotFound />;

  const gallery = [asset.cover, ...asset.screenshots];
  const others = UNITY_ASSETS.filter((a) => a.slug !== asset.slug);
  const url = `https://codeplaystudios.com/unity-assets/${asset.slug}`;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative selection:bg-primary/20">
      <SEO
        title={`${asset.name} | Unity Assets | CodePlay Studios`}
        description={asset.tagline}
        keywords={`${asset.name}, Unity Asset Store, ${asset.tags.join(", ")}`}
        ogImage={`https://codeplaystudios.com${asset.cover}`}
        ogImageAlt={asset.name}
        ogUrl={url}
        canonical={url}
        breadcrumbs={[
          { name: "Home", item: "https://codeplaystudios.com" },
          { name: "Unity Assets", item: "https://codeplaystudios.com/unity-assets" },
          { name: asset.name, item: url },
        ]}
        schemas={[
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: asset.name,
            description: asset.tagline,
            image: gallery.map((g) => `https://codeplaystudios.com${g}`),
            brand: { "@type": "Brand", name: "CodePlayStudio" },
            offers: {
              "@type": "Offer",
              price: asset.price.replace("$", ""),
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url: asset.storeUrl,
            },
          },
        ]}
      />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <MatrixRain />
        <div className="absolute inset-0 bg-background/60" />
      </div>

      <div className="relative z-10">
        <Navigation />

        <main className="pt-36 pb-24">
          <div className="container mx-auto px-6">
            <Link
              href="/unity-assets"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> All Unity assets
            </Link>

            <div className="grid lg:grid-cols-5 gap-10">
              {/* Gallery */}
              <div className="lg:col-span-3 space-y-4">
                <motion.div
                  key={active}
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  className="aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/30"
                >
                  <img
                    src={gallery[active]}
                    alt={`${asset.name} screenshot ${active + 1}`}
                    className="w-full h-full object-contain"
                  />
                </motion.div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {gallery.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setActive(i)}
                      aria-label={`Show image ${i + 1}`}
                      className={`aspect-video rounded-lg overflow-hidden border-2 transition-colors ${
                        i === active ? "border-primary" : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="lg:col-span-2 space-y-6">
                <Badge variant="secondary">{asset.category}</Badge>
                <h1 className="text-4xl font-bold leading-tight">{asset.name}</h1>
                <p className="text-muted-foreground text-lg">{asset.tagline}</p>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-mono text-primary">{asset.price}</span>
                  <span className="text-xs text-muted-foreground">USD, one-time</span>
                </div>
                <Button asChild size="lg" className="w-full">
                  <a href={asset.storeUrl} target="_blank" rel="noopener noreferrer">
                    Get it on the Asset Store <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <div className="flex flex-wrap gap-2 pt-2">
                  {asset.tags.map((t) => (
                    <Badge key={t} variant="outline">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="grid lg:grid-cols-5 gap-10 mt-16">
              <div className="lg:col-span-3 space-y-10">
                <section>
                  <h2 className="text-2xl font-bold mb-4">About this asset</h2>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    {asset.description.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                </section>
                <section>
                  <h2 className="text-2xl font-bold mb-4">Key features</h2>
                  <ul className="space-y-3">
                    {asset.features.map((f) => (
                      <li key={f} className="flex gap-3 text-muted-foreground">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <aside className="lg:col-span-2">
                <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-sm p-6">
                  <h2 className="text-xl font-bold mb-4">Technical details</h2>
                  <dl className="divide-y divide-white/10">
                    {asset.specs.map((s) => (
                      <div key={s.label} className="flex justify-between gap-4 py-3 text-sm">
                        <dt className="text-muted-foreground">{s.label}</dt>
                        <dd className="text-right font-medium">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </aside>
            </div>

            {/* More */}
            <section className="mt-20">
              <h2 className="text-2xl font-bold mb-6">More from CodePlayStudio</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {others.map((o) => (
                  <Link
                    key={o.slug}
                    href={`/unity-assets/${o.slug}`}
                    className="flex gap-4 rounded-2xl border border-white/10 bg-card/60 p-4 hover:border-primary/50 transition-colors"
                  >
                    <img
                      src={o.cover}
                      alt=""
                      loading="lazy"
                      className="w-28 aspect-video object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-semibold">{o.name}</p>
                      <p className="text-sm text-muted-foreground">{o.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
