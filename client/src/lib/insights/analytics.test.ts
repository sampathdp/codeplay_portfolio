import { describe, it, expect, vi } from "vitest";
import {
  analyticsEnabled,
  initAnalytics,
  pageview,
  track,
  trackArticleView,
  trackShare,
} from "./analytics";

/**
 * With `VITE_GA4_ID` unset (the default, and the case in tests) analytics
 * must be an inert no-op: no globals touched, no script requested, no
 * throw. This is the guarantee the marketing site relies on.
 */

describe("analytics — disabled by default", () => {
  it("reports disabled when no measurement id is configured", () => {
    expect(analyticsEnabled()).toBe(false);
  });

  it("initAnalytics does nothing and adds no script", () => {
    const win = globalThis as unknown as Record<string, unknown>;
    const before = { gtag: win.gtag, dataLayer: win.dataLayer };
    expect(() => initAnalytics()).not.toThrow();
    expect(win.gtag).toBe(before.gtag);
    expect(win.dataLayer).toBe(before.dataLayer);
  });

  it("every tracking helper is a silent no-op", () => {
    const spy = vi.fn();
    (globalThis as unknown as { gtag?: unknown }).gtag = spy;
    expect(() => {
      pageview("/insights/x", "X");
      track("scroll_depth", { percent_scrolled: 50 });
      trackArticleView("slug", "gaming");
      trackShare("slug", "x");
    }).not.toThrow();
    // gtag is never called because the id gate fails first
    expect(spy).not.toHaveBeenCalled();
    delete (globalThis as unknown as { gtag?: unknown }).gtag;
  });
});
