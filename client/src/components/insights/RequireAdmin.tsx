import { useEffect, useState, type ReactNode } from "react";
import { isInsightsConfigured } from "@/lib/insights/supabase";
import {
  getAdminProfile,
  getSession,
  signInWithEmail,
  signOut,
  onAuthStateChange,
} from "@/lib/insights/auth";

type Phase = "loading" | "anon" | "denied" | "admin" | "unconfigured";

/**
 * Client-side gate for `/admin/insights`. This is UX only — every
 * privileged query is independently enforced by Supabase RLS, so a user
 * who bypasses this component still cannot read or write anything.
 */
export default function RequireAdmin({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>(
    isInsightsConfigured() ? "loading" : "unconfigured",
  );
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isInsightsConfigured()) return;
    let active = true;

    const check = async () => {
      try {
        const p = await getAdminProfile();
        if (!active) return;
        if (p) {
          setPhase("admin");
        } else {
          setPhase((await getSession()) ? "denied" : "anon");
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : String(e));
      }
    };

    check();
    const { data } = onAuthStateChange(() => check());
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (phase === "unconfigured") {
    return (
      <Shell>
        <p className="text-sm text-gray-400">
          Insights is not configured in this environment. Set{" "}
          <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.
        </p>
      </Shell>
    );
  }

  if (phase === "loading") {
    return (
      <Shell>
        <p className="text-sm text-gray-400">Checking access…</p>
      </Shell>
    );
  }

  if (phase === "admin") return <>{children}</>;

  if (phase === "denied") {
    return (
      <Shell>
        <p className="text-sm text-gray-300">
          You are signed in but not an Insights admin.
        </p>
        <button
          className="mt-4 text-sm underline text-gray-400"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="text-sm text-gray-300 mb-4">
        Sign in with your editorial email to continue.
      </p>
      {sent ? (
        <p className="text-sm text-emerald-400">
          Check your inbox for a sign-in link.
        </p>
      ) : (
        <form
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            try {
              await signInWithEmail(email);
              setSent(true);
            } catch (err) {
              setError(err instanceof Error ? err.message : String(err));
            }
          }}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@codeplaystudios.com"
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Send link
          </button>
        </form>
      )}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gray-950 text-gray-100 px-6 py-16">
      <div className="mx-auto max-w-md">
        <h1 className="text-xl font-bold mb-4">CodePlay Insights — Admin</h1>
        {children}
      </div>
    </div>
  );
}
