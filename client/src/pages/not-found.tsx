import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Compass, Home as HomeIcon } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MatrixRain from "@/components/MatrixRain";
import { Button } from "@/components/ui/button";

const usefulLinks = [
  { href: "/", label: "Home" },
  { href: "/web-development", label: "Web Development" },
  { href: "/mobile-development", label: "Mobile App Development" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/insights", label: "Insights" },
  { href: "/contact", label: "Contact" },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 relative">
      <Helmet>
        <title>Page Not Found | CodePlay Studios</title>
        {/* No indexable content on this route — keep it out of search results. */}
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="fixed inset-0 z-0 h-full w-full bg-background pointer-events-none">
        <MatrixRain />
        <div className="absolute inset-0 bg-background/90 z-0" />
      </div>

      <Navigation />

      <main className="relative z-10 pt-40 pb-24">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8">
            <Compass className="w-10 h-10 text-primary" aria-hidden="true" />
          </div>
          <span className="text-primary font-mono tracking-widest uppercase text-sm mb-4 block">
            404
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
            The page you're looking for doesn't exist or may have moved.
            Here are some places to pick back up.
          </p>

          <Button asChild size="lg" className="rounded-full px-8 h-12 mb-16">
            <Link href="/">
              <HomeIcon className="mr-2 h-5 w-5" aria-hidden="true" />
              Back to Home
            </Link>
          </Button>

          <div className="flex flex-wrap justify-center gap-3">
            {usefulLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-5 py-2 rounded-full text-sm font-medium bg-white/5 border border-white/10 hover:border-primary/50 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
