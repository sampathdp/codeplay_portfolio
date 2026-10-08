import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MatrixRain from "@/components/MatrixRain";
import SEO from "@/components/SEO";

const COOKIES = [
  {
    name: "Local storage (currency, intro seen)",
    provider: "CodePlay Studios",
    purpose: "Remembers your display preferences. Never sent to us.",
    type: "Essential / preference",
  },
  {
    name: "__cf_bm, cf_clearance",
    provider: "Cloudflare",
    purpose: "Bot protection and security checks that keep the site available.",
    type: "Essential",
  },
  {
    name: "_ga, _ga_*",
    provider: "Google Analytics",
    purpose: "Counts visits and pages viewed so we can improve the site.",
    type: "Analytics",
  },
  {
    name: "__gads, __gpi, IDE, and similar",
    provider: "Google AdSense",
    purpose: "Serves and measures ads on content pages, limits repeat ads, and (with consent) personalises ads.",
    type: "Advertising",
  },
];

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 relative">
      <SEO
        title="Cookie Policy | CodePlay Studios"
        description="Which cookies and similar technologies codeplaystudios.com uses, why, and how to control them."
        robots="index, follow"
      />

      <div className="fixed inset-0 z-0 h-full w-full bg-background pointer-events-none">
        <MatrixRain />
        <div className="absolute inset-0 bg-background/90 z-0" />
      </div>

      <Navigation />

      <main className="relative z-10 pt-40 pb-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Cookie Policy</h1>
          <p className="text-muted-foreground mb-12">Last updated: October 8, 2026</p>

          <div className="space-y-10 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">What cookies are</h2>
              <p>
                Cookies are small text files a website stores in your browser.
                Local storage works the same way but is never sent with
                requests. We use both, kept to what the site needs to run, to
                measure traffic, and to show ads on content pages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Cookies we use</h2>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-left text-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold">Provider</th>
                      <th className="px-4 py-3 font-semibold">Purpose</th>
                      <th className="px-4 py-3 font-semibold">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COOKIES.map((c) => (
                      <tr key={c.name} className="border-t border-white/10 align-top">
                        <td className="px-4 py-3 font-mono text-xs">{c.name}</td>
                        <td className="px-4 py-3">{c.provider}</td>
                        <td className="px-4 py-3">{c.purpose}</td>
                        <td className="px-4 py-3">{c.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4">
                Analytics and advertising cookies are only set when those
                services are active on the page. Business and service pages do
                not show ads.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Your choices</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Visitors in the EEA, UK and Switzerland are asked for consent
                  before advertising cookies are used, and can change that
                  choice at any time from the consent message.
                </li>
                <li>
                  Turn off personalised ads at{" "}
                  <a
                    href="https://adssettings.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google Ads Settings
                  </a>{" "}
                  or{" "}
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
                  Block analytics with the{" "}
                  <a
                    href="https://tools.google.com/dlpage/gaoptout"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google Analytics opt-out add-on
                  </a>.
                </li>
                <li>
                  Every browser lets you view, block and delete cookies in its
                  settings. Blocking Cloudflare's security cookies may stop
                  some pages from loading.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">More information</h2>
              <p>
                How we handle personal information overall is described in our{" "}
                <a href="/privacy-policy" className="text-primary hover:underline">
                  Privacy Policy
                </a>
                . Questions can be sent to{" "}
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
