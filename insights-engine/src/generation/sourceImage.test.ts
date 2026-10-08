import { describe, it, expect, vi, afterEach } from "vitest";
import {
  HttpSourceImageClient,
  NullSourceImageClient,
  createSourceImageClient,
  extractLeadImage,
  orderSources,
} from "./sourceImage";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("extractLeadImage", () => {
  it("prefers og:image and resolves relative URLs", () => {
    const html = `<head>
      <meta name="twitter:image" content="https://cdn.example.com/tw.jpg">
      <meta property="og:image" content="/media/lead.jpg?w=1200&amp;h=630">
      <meta property="og:image:alt" content="A GPU on a desk">
    </head>`;
    expect(extractLeadImage(html, "https://news.example.com/story/1")).toEqual({
      url: "https://news.example.com/media/lead.jpg?w=1200&h=630",
      alt: "A GPU on a desk",
    });
  });

  it("handles content-before-property attribute order", () => {
    const html = `<meta content='https://x.com/a.png' property='og:image'/>`;
    expect(extractLeadImage(html, "https://x.com/")?.url).toBe("https://x.com/a.png");
  });

  it("falls back to twitter:image", () => {
    const html = `<meta name="twitter:image" content="https://cdn.example.com/tw.jpg">`;
    expect(extractLeadImage(html, "https://example.com/")?.url).toBe(
      "https://cdn.example.com/tw.jpg",
    );
  });

  it("rejects logos and placeholders", () => {
    const html = `<meta property="og:image" content="https://example.com/static/logo-share.png">`;
    expect(extractLeadImage(html, "https://example.com/")).toBeNull();
  });

  it("returns null when nothing is declared", () => {
    expect(extractLeadImage("<html><head></head></html>", "https://example.com/")).toBeNull();
  });
});

describe("orderSources", () => {
  it("keeps only primary/official sources, primary first, aggregators dropped", () => {
    const out = orderSources([
      { name: "hn", url: "https://news.ycombinator.com/item?id=1", primary: true },
      { name: "blog", url: "https://blog.example.com/a" },
      { name: "official", url: "https://nvidia.com/news", official: true },
      { name: "primary", url: "https://openai.com/index/x", primary: true },
      { name: "reddit", url: "https://www.reddit.com/r/x" },
    ]);
    expect(out.map((s) => s.name)).toEqual(["primary", "official"]);
  });
});

describe("createSourceImageClient", () => {
  it("is on by default and can be switched off", () => {
    expect(createSourceImageClient({})).toBeInstanceOf(HttpSourceImageClient);
    expect(createSourceImageClient({ INSIGHTS_SOURCE_IMAGES: "off" })).toBeInstanceOf(
      NullSourceImageClient,
    );
  });
});

describe("HttpSourceImageClient", () => {
  const bigImage = new Uint8Array(20_000);

  function stubFetch(pages: Record<string, { body: string | Uint8Array; type: string }>) {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        const p = pages[url];
        if (!p) return new Response("nope", { status: 404, statusText: "Not Found" });
        return new Response(p.body, { status: 200, headers: { "content-type": p.type } });
      }),
    );
  }

  it("returns the first source's lead image with a publisher credit", async () => {
    stubFetch({
      "https://site.com/story": {
        body: `<meta property="og:image" content="https://site.com/lead.jpg">`,
        type: "text/html",
      },
      "https://site.com/lead.jpg": { body: bigImage, type: "image/jpeg" },
    });
    const img = await new HttpSourceImageClient().find({
      sources: [{ name: "site.com", url: "https://site.com/story", primary: true }],
    });
    expect(img?.mimeType).toBe("image/jpeg");
    expect(img?.credit).toEqual({
      provider: "source",
      photographer: "site.com",
      photographerUrl: "https://site.com/story",
      sourceUrl: "https://site.com/lead.jpg",
    });
  });

  it("skips images already used and too-small downloads, then tries the next source", async () => {
    stubFetch({
      "https://a.com/1": { body: `<meta property="og:image" content="https://a.com/used.jpg">`, type: "text/html" },
      "https://b.com/2": { body: `<meta property="og:image" content="https://b.com/tiny.jpg">`, type: "text/html" },
      "https://b.com/tiny.jpg": { body: new Uint8Array(500), type: "image/jpeg" },
      "https://c.com/3": { body: `<meta property="og:image" content="https://c.com/ok.webp">`, type: "text/html" },
      "https://c.com/ok.webp": { body: bigImage, type: "image/webp" },
    });
    const img = await new HttpSourceImageClient().find({
      sources: [
        { name: "a", url: "https://a.com/1", official: true },
        { name: "b", url: "https://b.com/2", official: true },
        { name: "c", url: "https://c.com/3", official: true },
      ],
      excludeImageUrls: ["https://a.com/used.jpg"],
    });
    expect(img?.credit.sourceUrl).toBe("https://c.com/ok.webp");
  });

  it("returns null when no source yields an image", async () => {
    stubFetch({});
    const img = await new HttpSourceImageClient().find({
      sources: [{ name: "x", url: "https://x.org/story", primary: true }],
    });
    expect(img).toBeNull();
  });
});

describe("HttpSourceImageClient — news sites", () => {
  it("never fetches a non-official source", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const img = await new HttpSourceImageClient().find({
      sources: [{ name: "theverge.com", url: "https://www.theverge.com/story" }],
    });
    expect(img).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
