# Security & AdSense readiness — action checklist (2026-10-08)

Findings from the Cloudflare 30-day analytics, live checks of the site, and
an AdSense readiness review. Code fixes are already in the repo; everything
below needs the Cloudflare / hosting / Google dashboards.

## What the analytics actually show

- **The "traffic drop" is not lost visitors.** The zone's nameservers are
  Cloudflare, but `codeplaystudios.com`, `www`, `admin` and `vipclub`
  resolve straight to the origin (`66.29.148.24`, LiteSpeed). They are
  DNS-only (grey cloud), so since about Sep 24 requests skip Cloudflare
  and its analytics read near zero. It also means the origin IP is public
  and no WAF protects it.
- **The Sep 17–23 spike was mostly bots.** 67.6k of the requests were
  `403 Forbidden`. Top paths are scanner probes: `/.env*`, `/.git/config`,
  `/@fs/.env` (Vite dev-server exploit), `/__vite_rsc_findSourceMapURL`,
  `/graphql`, `/Ajax/php/payment.php`, `/cgi-bin`. Top IPs (`45.148.10.*`,
  `185.177.72.68`) are known scanners. The origin already returns 403 for
  dotfiles. Live check: `/.env` and `/.git/config` are blocked, and no
  Vite dev server is exposed.
- **`api.codeplaystudios.com` and `erp.codeplaystudios.com` have no DNS
  record.** The Tools backend still runs on the origin, but the site is
  built with `VITE_TOOLS_API_URL=https://api.codeplaystudios.com`, so the
  live Free Tools cannot reach it.
- `ftp.codeplaystudios.com` is proxied, which returns `526` (FTP can't run
  through the Cloudflare proxy).
- Ports `:8080` on `api` / `admin` were reachable through Cloudflare.

## 1. Cloudflare — DNS (do first)

| Record | Set to |
|---|---|
| `codeplaystudios.com`, `www`, `admin`, `vipclub`, `microf`, `kasu-media-labs` | **Proxied** (orange) |
| `api` | Add `A` record to `66.29.148.24`, **Proxied** |
| `erp` | Re-add if that app is still used, **Proxied** |
| `ftp`, `mail`, `cpanel` and similar | **DNS only** (grey) |

On the host, run **AutoSSL** (cPanel → SSL/TLS Status) so every subdomain
has a valid certificate. Then use **SSL/TLS → Full (strict)** and turn on
**Always Use HTTPS**.

Once proxied, the origin IP stays visible in old DNS history. If attacks
continue, ask the host to firewall the origin to
[Cloudflare IP ranges](https://www.cloudflare.com/ips/) only.

## 2. Cloudflare — Security

- **Security → Bots:** Bot Fight Mode **On**.
- **Security → WAF → Custom rules** (the free plan allows 5):

  1. *Block scanner paths*, action **Block**:
     ```
     (http.request.uri.path contains "/.env") or
     (http.request.uri.path contains "/.git") or
     (starts_with(http.request.uri.path, "/@fs")) or
     (http.request.uri.path contains "__vite") or
     (http.request.uri.path contains "/cgi-bin") or
     (http.request.uri.path contains "wp-login") or
     (http.request.uri.path contains "xmlrpc.php") or
     (http.request.uri.path contains "phpmyadmin") or
     (http.host in {"codeplaystudios.com" "www.codeplaystudios.com"} and
       (ends_with(http.request.uri.path, ".php") or starts_with(http.request.uri.path, "/graphql")))
     ```
     The `.php` / `/graphql` part is scoped to the main site, which is
     static. `vipclub` / `erp` / `microf` are PHP apps.
  2. *Block non-standard ports*, action **Block**:
     ```
     not (cf.edge.server_port in {80 443})
     ```
  3. *Protect admin*: use **Zero Trust → Access** (free up to 50 users).
     Put an application on `admin.codeplaystudios.com` with an email
     one-time-PIN policy for your own address. If you skip Access, add a
     **Managed Challenge** rule for `http.host eq "admin.codeplaystudios.com"`.
- **Security → WAF → Rate limiting** (1 free rule): 100 requests / 10 s per
  IP on the main site, action Block for 1 minute.

## 3. Secrets — rotate now

- `pass.txt` (an email login plus passwords) was committed in `acbc223`.
  It is now untracked and git-ignored, but it **stays in git history**.
  Change those passwords (FTP / cPanel / whatever account it is) and
  update the GitHub secrets that use them.
- A real `PEXELS_API_KEY` was committed in `.env.example`. It is now
  blanked. Regenerate the key at pexels.com/api and put the new one only
  in `.env` and the GitHub secret.
- The repo is private today. If it ever goes public, every secret in its
  history goes with it. Clean the history first (`git filter-repo`).

## 4. AdSense — code fixes done in this change

- `/ads.txt` is emitted at build time from `VITE_ADSENSE_CLIENT`
  (`vite.config.ts`, `adsense()` plugin). Before, the host served the
  SPA's index.html at `/ads.txt`.
- The `<meta name="google-adsense-account">` ownership tag is added at
  build time, so the site can be verified without switching ads on.
- The privacy policy now covers Google AdSense (Google's required
  disclosures), Analytics cookies, Cloudflare, retention and user rights.
- New `/cookie-policy` page, linked in the footer and sitemap.
- Ads are already restricted to Insights pages. `AdSlot` only renders when
  `VITE_ADSENSE_ENABLED=true`.

Set the repository **variable** `VITE_ADSENSE_CLIENT=ca-pub-…` before the
next deploy. Keep `VITE_ADSENSE_ENABLED` unset until approval.

## 5. AdSense — before you apply

- **Consent:** in AdSense → Privacy & messaging, create the **European
  regulations** (GDPR) message using Google's certified CMP. The privacy
  policy now says EEA / UK / CH visitors are asked for consent, so this
  must be live.
- **Content risk (biggest one).** Insights auto-publishes 2–3 AI-written
  news rewrites a day with no human review (~45 so far). Google rejects
  sites for "low value / scaled auto-generated content", and the reviewer
  looks at the whole site. Before applying:
  - autopilot stays on (owner's decision). Every draft now goes through
    an editor pass (`editDraft` in `generation/steps.ts`) before the
    fact-check. The public AI Usage / Editorial policies now say honestly
    that articles can auto-publish. Spot-read published posts daily and
    fix or unpublish weak ones;
  - write 10–20 original guides from real experience (website cost in Sri
    Lanka, payment gateways for Sri Lankan businesses, restaurant / salon
    system features, Next.js vs WordPress, and so on);
  - consider `noindex` on thin AI news posts, or unpublishing them.
- **Images:** keep featured images to Gemini-generated, official press
  images, or Pexels. Never use news-site photos (see
  `docs/codeplay-insights-images.md`).
- **Search Console:** check Coverage / Pages for errors after the DNS
  change, and resubmit the sitemaps.
- **Traffic:** never buy traffic or use click / traffic exchanges. The bot
  traffic above is not monetisable and gets filtered.

## 6. Traffic

- **Measure real traffic in GA4 and Search Console, not Cloudflare.**
  Cloudflare only counts proxied requests, and most of what it did count
  was scanner bots.
- **Full-page prerender (done in code).** `scripts/prerender-pages.mjs`
  (`npm run prerender:pages`, run on deploy) renders every sitemap URL in
  headless Chrome. Before, all 34 business pages served the same shell:
  the homepage title, no `<h1>`, no canonical, no body text. Now each URL
  ships its own. `client/src/main.tsx` keeps the snapshot on screen until
  the app has rendered, then swaps.
- After deploying: in Search Console → URL Inspection, request indexing
  for the main pages, and resubmit `sitemap.xml`.
- Content: 1–2 original guides a week on searchable questions (costs,
  comparisons, "how to" for Sri Lankan businesses). Link each guide to the
  matching service page.
- Google Business Profile for CodePlay Studios (Panadura). Add the site
  link, services and photos, and ask past clients for reviews.
- Share each guide on LinkedIn and Facebook groups, and on relevant
  Reddit / dev.to communities where it is genuinely useful.
