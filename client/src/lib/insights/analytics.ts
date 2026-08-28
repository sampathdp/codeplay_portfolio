/**
 * Optional, privacy-conscious analytics for CodePlay Insights.
 *
 * GA4 is loaded ONLY when `VITE_GA4_ID` is set at build time. When unset
 * (the default) every function here is a no-op and no third-party script
 * is ever requested. If another analytics tag is already present on the
 * page we do not add a second one — we reuse the existing `gtag`.
 *
 * SPA note: GA4 auto page_view is disabled; `pageview()` is called on
 * every Insights route change so virtual navigations are counted once.
 */

const GA4_ID = import.meta.env.VITE_GA4_ID as string | undefined;

type GtagFn = (...args: unknown[]) => void;

interface AnalyticsWindow extends Window {
  dataLayer?: unknown[];
  gtag?: GtagFn;
  __insightsAnalyticsReady?: boolean;
}

function w(): AnalyticsWindow | null {
  return typeof window === "undefined" ? null : (window as AnalyticsWindow);
}

export function analyticsEnabled(): boolean {
  return Boolean(GA4_ID);
}

/** True if some Google tag (ours or one added elsewhere) is on the page. */
function existingGoogleTag(win: AnalyticsWindow): boolean {
  if (typeof win.gtag === "function") return true;
  return Boolean(
    win.document?.querySelector?.(
      'script[src*="googletagmanager.com/gtag/js"]',
    ),
  );
}

/** Idempotent. Injects gtag.js once, only when configured and not already present. */
export function initAnalytics(): void {
  const win = w();
  if (!win || !GA4_ID || win.__insightsAnalyticsReady) return;

  if (!existingGoogleTag(win)) {
    const s = win.document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_ID)}`;
    win.document.head.appendChild(s);
  }

  win.dataLayer = win.dataLayer || [];
  const gtag: GtagFn = function gtag(...args: unknown[]) {
    win.dataLayer!.push(args);
  };
  if (typeof win.gtag !== "function") win.gtag = gtag;
  win.gtag("js", new Date());
  win.gtag("config", GA4_ID, {
    anonymize_ip: true,
    send_page_view: false,
  });
  win.__insightsAnalyticsReady = true;
}

export function pageview(path: string, title?: string): void {
  const win = w();
  if (!win || !GA4_ID || typeof win.gtag !== "function") return;
  win.gtag("event", "page_view", {
    page_path: path,
    page_location: win.location?.href,
    page_title: title ?? win.document?.title,
  });
}

export type InsightsEvent =
  | "article_view"
  | "article_share"
  | "source_click"
  | "related_article_click"
  | "codeplay_cta_click"
  | "category_view"
  | "search"
  | "scroll_depth";

export function track(
  event: InsightsEvent,
  params: Record<string, unknown> = {},
): void {
  const win = w();
  if (!win || !GA4_ID || typeof win.gtag !== "function") return;
  win.gtag("event", event, params);
}

// --- typed helpers ---------------------------------------------------

export const trackArticleView = (slug: string, category: string) =>
  track("article_view", { article_slug: slug, article_category: category });

export const trackShare = (slug: string, network: string) =>
  track("article_share", { article_slug: slug, method: network });

export const trackSourceClick = (slug: string, sourceUrl: string) =>
  track("source_click", { article_slug: slug, link_url: sourceUrl });

export const trackRelatedClick = (fromSlug: string, toSlug: string) =>
  track("related_article_click", { from_slug: fromSlug, to_slug: toSlug });

export const trackCtaClick = (context: string, href: string) =>
  track("codeplay_cta_click", { cta_context: context, link_url: href });

export const trackCategoryView = (category: string, count: number) =>
  track("category_view", { article_category: category, result_count: count });

export const trackSearch = (query: string, results: number) =>
  track("search", { search_term: query, result_count: results });

export const trackScrollDepth = (slug: string, percent: number) =>
  track("scroll_depth", { article_slug: slug, percent_scrolled: percent });
