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
          <p className="text-muted-foreground mb-12">Last updated: October 8, 2026</p>

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
                This site uses your browser's local storage for a small number
                of preferences, such as your selected currency display and
                whether you've already seen the homepage intro animation. This
                data stays on your device and is never transmitted to us.
                Analytics and advertising services described below may set
                their own cookies. See our{" "}
                <a href="/cookie-policy" className="text-primary hover:underline">
                  Cookie Policy
                </a>{" "}
                for the full list and how to control them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Analytics</h2>
              <p>
                We use Google Analytics 4 to understand aggregate traffic to
                this site — for example, which pages are visited and roughly
                how many visitors we get. Google Analytics uses cookies and
                collects information such as pages viewed, approximate
                location, device and browser type. We use this only to
                improve the site. You can opt out with the{" "}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Analytics opt-out add-on
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Advertising (Google AdSense)</h2>
              <p className="mb-4">
                Some content pages, such as articles in CodePlay Insights, may
                show ads served by Google AdSense. Our service and business
                pages do not carry ads.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Third-party vendors, including Google, use cookies to serve
                  ads based on your prior visits to this website or other
                  websites.
                </li>
                <li>
                  Google's use of advertising cookies enables it and its
                  partners to serve ads to you based on your visits to this
                  site and/or other sites on the Internet.
                </li>
                <li>
                  You may opt out of personalised advertising by visiting{" "}
                  <a
                    href="https://adssettings.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google Ads Settings
                  </a>
                  , or opt out of some third-party vendors' use of cookies for
                  personalised advertising at{" "}
                  <a
                    href="https://www.aboutads.info/choices/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    aboutads.info
                  </a>.
                </li>
                <li>
                  Learn more about{" "}
                  <a
                    href="https://policies.google.com/technologies/partner-sites"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    how Google uses information from sites that use its services
                  </a>.
                </li>
              </ul>
              <p className="mt-4">
                Visitors in the European Economic Area, the UK and Switzerland
                are asked for consent before personalised ads or advertising
                cookies are used, through a Google-certified consent message.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Service providers</h2>
              <p>
                This site is delivered through Cloudflare (security, DNS and
                content delivery), which processes technical request data such
                as IP address, browser type and the page requested in order to
                protect the site from abuse and attacks. The site is hosted on
                a shared web-hosting provider, and Insights content is served
                from Supabase. These providers process data only to run the
                service for us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Data retention</h2>
              <p>
                Inquiry emails are kept for as long as needed to respond and,
                for clients, for the duration of the project and our legal
                record-keeping obligations. Analytics data is kept in
                aggregate under Google Analytics' retention settings (14
                months at most). Security logs held by Cloudflare are kept for
                a short period under Cloudflare's own policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Your rights</h2>
              <p>
                You can ask us to access, correct or delete personal
                information you have sent us, or object to how we use it, by
                emailing the address below. Depending on where you live (for
                example under Sri Lanka's Personal Data Protection Act or the
                EU/UK GDPR) you may also have the right to complain to your
                local data protection authority.
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
