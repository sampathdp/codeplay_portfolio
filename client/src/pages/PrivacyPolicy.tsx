import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MatrixRain from "@/components/MatrixRain";
import SEO from "@/components/SEO";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 relative">
      <SEO
        title="Privacy Policy | CodePlay Studios"
        description="How CodePlay Studios collects, uses, and protects information from visitors and clients."
        robots="index, follow"
      />

      <div className="fixed inset-0 z-0 h-full w-full bg-background pointer-events-none">
        <MatrixRain />
        <div className="absolute inset-0 bg-background/90 z-0" />
      </div>

      <Navigation />

      <main className="relative z-10 pt-40 pb-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground mb-12">Last updated: September 12, 2026</p>

          <div className="space-y-10 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Who we are</h2>
              <p>
                CodePlay Studios ("we", "us") is a software development company
                based in Panadura, Sri Lanka, operating the website
                codeplaystudios.com. This policy explains what information we
                collect through this site and how we use it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Information you provide</h2>
              <p>
                When you use a contact form on this site, the fields you fill
                in (name, email address, and your message) are sent directly
                to our inbox via your own email client — we do not store form
                submissions on a server or database. If you contact us by
                phone, WhatsApp, or email directly, we handle that information
                the same way any business handles a customer inquiry: to
                respond to you and, if you become a client, to deliver the
                agreed project.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Cookies and local storage</h2>
              <p>
                This site uses your browser's local storage (not third-party
                cookies) for a small number of preferences, such as your
                selected currency display and whether you've already seen the
                homepage intro animation. This data stays on your device and
                is never transmitted to us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Analytics</h2>
              <p>
                We may use privacy-conscious analytics (such as Google
                Analytics 4) to understand aggregate traffic to this site —
                for example, which pages are visited and roughly how many
                visitors we get. This is not used to build individual
                advertising profiles, and is only active when explicitly
                configured for this deployment.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">CodePlay Insights</h2>
              <p>
                Our Insights section (codeplaystudios.com/insights) is
                published through Supabase, a managed database platform with
                row-level security. Article view counts are aggregate and not
                tied to your identity. Our editorial and AI-usage practices
                for that content are described separately in the{" "}
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
              <h2 className="text-2xl font-bold text-foreground mb-4">Third-party links</h2>
              <p>
                This site links out to third-party services we use or
                recommend — for example WhatsApp (for chat) and our free
                tools app at wipeclip.co. Those services have their own
                privacy policies, which we encourage you to review.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Data we don't do</h2>
              <p>
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Contact us</h2>
              <p>
                Questions about this policy can be sent to{" "}
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
