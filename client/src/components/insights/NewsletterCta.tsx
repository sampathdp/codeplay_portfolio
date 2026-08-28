import { useState } from "react";
import { Send } from "lucide-react";

/**
 * Newsletter sign-up. No backend is wired in this phase — the form
 * validates and shows a confirmation state. Point `action`/handler at a
 * real endpoint (or Supabase) when subscriptions are implemented.
 */
export default function NewsletterCta() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="glass overflow-hidden rounded-3xl border border-white/10 p-8 md:p-12"
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-2 text-[0.7rem] font-mono uppercase tracking-[0.3em] text-primary">
          CodePlay Insights
        </p>
        <h2 id="newsletter-heading" className="text-2xl font-bold md:text-3xl">
          Technology that matters, in your inbox
        </h2>
        <p className="mt-3 text-muted-foreground">
          A short brief on AI, software, gaming and security — with the
          CodePlay developer take. No spam, unsubscribe any time.
        </p>

        {done ? (
          <p className="mt-6 font-medium text-primary">
            Thanks — you&rsquo;re on the list.
          </p>
        ) : (
          <form
            className="mt-6 flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (email.includes("@")) setDone(true);
            }}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="min-h-[44px] flex-1 rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
            />
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Send className="h-4 w-4" aria-hidden="true" /> Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
