/**
 * Best-effort article view counter. Fires a single lightweight POST to the
 * Supabase `insights_record_view` RPC (public, increments `view_count` for
 * published articles) — no SDK, no third-party script. Silently does
 * nothing when Insights isn't configured.
 */

export function recordArticleView(slug: string): void {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key || !slug) return;

  const guard = `insights:viewed:${slug}`;
  try {
    if (sessionStorage.getItem(guard)) return;
    sessionStorage.setItem(guard, "1");
  } catch {
    /* private mode — still fine to count once per load */
  }

  fetch(`${url}/rest/v1/rpc/insights_record_view`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: key,
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ p_slug: slug }),
    keepalive: true,
  }).catch(() => {
    /* vanity metric — never surface an error to the reader */
  });
}
