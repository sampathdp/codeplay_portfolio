# CodePlay Insights — Google Search Console setup

No verification token is committed to the repo. Pick **one** verification
method below, then submit the sitemaps.

## 1. Verify ownership

### Option A — DNS TXT record (recommended, verifies the whole domain)

1. Search Console → *Add property* → **Domain** → `codeplaystudios.com`.
2. Copy the `google-site-verification=…` TXT value it shows.
3. Add it as a TXT record on `codeplaystudios.com` at the DNS host.
4. Wait for propagation, click **Verify**.

Nothing to deploy. This also covers `www.` and any subdomain.

### Option B — HTML meta tag (URL-prefix property)

1. Search Console → *Add property* → **URL prefix** →
   `https://codeplaystudios.com`.
2. Choose the *HTML tag* method and copy only the `content` value
   (the token, e.g. `abcd1234…`), **not** the whole `<meta>` tag.
3. In GitHub → Settings → Variables, set:
   ```
   VITE_GSC_VERIFICATION = abcd1234...
   ```
4. Re-run the deploy. `components/SEO.tsx` renders
   `<meta name="google-site-verification" content="…">` on every page
   when that variable is set.
5. Click **Verify**.

### Option C — HTML file

1. Download the `googleXXXXXXXXXXXX.html` file Search Console provides.
2. Drop it into `client/public/` and commit.
3. Deploy, then **Verify**. It will be served at
   `https://codeplaystudios.com/googleXXXXXXXXXXXX.html`.

## 2. Submit sitemaps

Search Console → *Sitemaps* → add:

```
https://codeplaystudios.com/sitemap.xml
https://codeplaystudios.com/sitemap-insights.xml
```

`sitemap-insights.xml` is regenerated on every deploy by
`npm run insights:seo` and lists only published articles with accurate
`lastmod`.

## 3. Optional — Google News / Publisher Center

If pursuing Google News inclusion, add the publication in
[Publisher Center](https://publishercenter.google.com/) using
`https://codeplaystudios.com/insights` as the section URL. The RSS feed
at `https://codeplaystudios.com/insights/rss.xml` can be used as the feed
source. Do not apply until there is a steady cadence of original,
well-sourced articles.

## 4. After verification — what to watch

- **Pages** report: confirm `/insights/*` URLs are *Indexed*, not
  *Crawled – currently not indexed*.
- **Page indexing** → *Sitemaps*: both sitemaps *Success*, discovered URL
  count matches published articles + sections.
- **Core Web Vitals** and **Mobile Usability** for `/insights/*`.
- **Removals** / manual actions: none expected.
