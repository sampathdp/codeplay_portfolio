import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MatrixRain from "@/components/MatrixRain";
import SEO from "@/components/SEO";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 relative">
      <SEO
        title="Terms & Conditions | CodePlay Studios"
        description="The terms that govern use of the CodePlay Studios website and engagement of our software development services."
        robots="index, follow"
      />

      <div className="fixed inset-0 z-0 h-full w-full bg-background pointer-events-none">
        <MatrixRain />
        <div className="absolute inset-0 bg-background/90 z-0" />
      </div>

      <Navigation />

      <main className="relative z-10 pt-40 pb-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Terms & Conditions</h1>
          <p className="text-muted-foreground mb-12">Last updated: September 12, 2026</p>

          <div className="space-y-10 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Using this website</h2>
              <p>
                This website (codeplaystudios.com) is operated by CodePlay
                Studios, a software development company based in Panadura,
                Sri Lanka. By browsing this site you agree to use it lawfully
                and not to attempt to disrupt, scrape at scale, or gain
                unauthorized access to it or the systems behind it (including
                CodePlay Insights and the admin area).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Content and ownership</h2>
              <p>
                The design, code, illustrations, and written content on this
                site belong to CodePlay Studios unless otherwise credited.
                Case study names, logos, and screenshots belong to their
                respective clients and are shown with permission to describe
                work we delivered for them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">CodePlay Insights</h2>
              <p>
                Articles published under codeplaystudios.com/insights are
                editorial content, not professional advice. Our editorial
                standards and use of AI in research and drafting are
                described in the{" "}
                <a href="/insights/editorial-policy" className="text-primary hover:underline">
                  Editorial Policy
                </a>{" "}
                and{" "}
                <a href="/insights/ai-policy" className="text-primary hover:underline">
                  AI Usage Policy
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Project engagements</h2>
              <p>
                Pricing shown on this site (including the Pricing section and
                individual service pages) is indicative — every project is
                custom-scoped, and final pricing, timelines, and deliverables
                are agreed in writing with each client before work begins.
                Nothing on this website constitutes a binding quote or
                contract on its own.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">No warranty on site availability</h2>
              <p>
                We aim to keep this website accurate and available, but it is
                provided "as is" without guarantees of uninterrupted access.
                We may update its content, including these terms, at any
                time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Contact us</h2>
              <p>
                Questions about these terms can be sent to{" "}
                <a href="mailto:info@codeplaystudios.com" className="text-primary hover:underline">
                  info@codeplaystudios.com
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
