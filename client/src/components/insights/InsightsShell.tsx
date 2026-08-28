import { useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MatrixRain from "@/components/MatrixRain";
import { useScrollToTopOnNavigate } from "@/hooks/useScrollToTopOnNavigate";
import { initAnalytics, pageview } from "@/lib/insights/analytics";

/**
 * Page frame shared by every /insights route — same Navigation, footer and
 * animated backdrop as the rest of CodePlay Studios, so Insights reads as
 * part of the same site. Mirrors the layout the existing detail pages use.
 */
export default function InsightsShell({ children }: { children: ReactNode }) {
  useScrollToTopOnNavigate();
  const [location] = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    // Helmet updates the title on the same tick; defer a frame so GA4
    // reports the new document.title.
    const id = window.requestAnimationFrame(() => pageview(location));
    return () => window.cancelAnimationFrame(id);
  }, [location]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-primary/20">
      <a
        href="#main"
        className="sr-only z-50 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <div className="pointer-events-none fixed inset-0 z-0">
        <MatrixRain />
        <div className="absolute inset-0 bg-background/85" />
      </div>

      <div className="relative z-10">
        <Navigation />
        <main id="main" className="overflow-x-hidden pt-32 pb-24 md:pt-36">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
