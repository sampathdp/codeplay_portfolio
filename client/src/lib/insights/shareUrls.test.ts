import { describe, it, expect } from "vitest";
import { shareUrls } from "./shareUrls";

describe("shareUrls", () => {
  const url = "https://codeplaystudios.com/insights/some-article";
  const title = "Some Article: A & B";

  it("builds LinkedIn, Facebook and X links with encoded params", () => {
    const s = shareUrls(url, title);
    const enc = encodeURIComponent(url);
    expect(s.linkedin).toBe(
      `https://www.linkedin.com/sharing/share-offsite/?url=${enc}`,
    );
    expect(s.facebook).toBe(
      `https://www.facebook.com/sharer/sharer.php?u=${enc}`,
    );
    expect(s.x).toContain(`url=${enc}`);
    expect(s.x).toContain(`text=${encodeURIComponent(title)}`);
  });

  it("does not point at any tracker/third-party analytics host", () => {
    const s = shareUrls(url, title);
    for (const v of Object.values(s)) {
      expect(v).toMatch(/^https:\/\/(www\.linkedin\.com|www\.facebook\.com|twitter\.com)\//);
    }
  });
});
