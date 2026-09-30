import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MatrixRain from "@/components/MatrixRain";
import SEO from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UNITY_ASSETS, PUBLISHER_URL } from "@/data/unityAssets";

export default function UnityAssets() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative selection:bg-primary/20">
      <SEO
        title="Unity Asset Store Assets | CodePlay Studios"
        description="Unity Asset Store packages published by CodePlayStudio: 3D environments, terrains and 2D card sprites, ready to drop into your game."
        keywords="Unity Asset Store, Unity terrain asset, Unity environment, Unity playing cards, CodePlayStudio, Unity assets"
        breadcrumbs={[
          { name: "Home", item: "https://codeplaystudios.com" },
          { name: "Unity Assets", item: "https://codeplaystudios.com/unity-assets" },
        ]}
      />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <MatrixRain />
        <div className="absolute inset-0 bg-background/60" />
      </div>

      <div className="relative z-10">
        <Navigation />

        <main className="pt-40 pb-24">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mb-16">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-primary font-medium tracking-widest uppercase text-sm mb-4 block"
              >
                Unity Asset Store
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold leading-tight mb-8"
              >
                Assets Built For{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-indigo-500">
                  Your Next Game
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-xl mb-8"
              >
                The same craft we put into client games, packaged for developers.
                Terrains, environments and 2D sprites we publish on the Unity Asset Store.
              </motion.p>
              <Button asChild size="lg">
                <a href={PUBLISHER_URL} target="_blank" rel="noopener noreferrer">
                  View Publisher Page <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {UNITY_ASSETS.map((asset, index) => (
                <motion.div
                  key={asset.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Link
                    href={`/unity-assets/${asset.slug}`}
                    className="block h-full rounded-2xl overflow-hidden border border-white/10 bg-card/60 backdrop-blur-sm hover:border-primary/50 transition-colors"
                  >
                    <div className="aspect-video overflow-hidden bg-black/30">
                      <img
                        src={asset.cover}
                        alt={asset.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{asset.category}</Badge>
                        <span className="font-mono text-primary">{asset.price}</span>
                      </div>
                      <h2 className="text-xl font-bold leading-snug">{asset.name}</h2>
                      <p className="text-muted-foreground text-sm">{asset.tagline}</p>
                      <span className="inline-flex items-center text-sm text-primary font-medium">
                        View details
                        <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
