import { describe, it, expect, vi, afterEach } from "vitest";
import {
  NullStockImageClient,
  PexelsStockImageClient,
  createStockImageClient,
  stockQuery,
} from "./stockImage";

const TINY_JPEG = Buffer.from(
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=",
  "base64",
);

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("stockQuery", () => {
  it("maps a known category to concrete search terms", () => {
    expect(
      stockQuery({ title: "x", category: "cloud-and-devops", entities: [] }),
    ).toBe("data center server room");
  });

  it("falls back to the category visual subject for an unknown category", () => {
    const q = stockQuery({ title: "x", category: "not-a-real-category", entities: [] });
    expect(q.length).toBeGreaterThan(0);
  });
});

describe("createStockImageClient", () => {
  it("returns a Null client when no key is set", () => {
    expect(createStockImageClient({})).toBeInstanceOf(NullStockImageClient);
  });
  it("returns a Pexels client when the key is set", () => {
    expect(createStockImageClient({ PEXELS_API_KEY: "k" })).toBeInstanceOf(
      PexelsStockImageClient,
    );
  });
});

describe("NullStockImageClient", () => {
  it("always resolves null", async () => {
    expect(await new NullStockImageClient().find({ title: "x", category: null, entities: [] })).toBeNull();
  });
});

describe("PexelsStockImageClient", () => {
  const query = { title: "Cloudflare cuts RAM", category: "cloud-and-devops", entities: ["Cloudflare"] };

  it("searches, downloads the landscape crop, and returns a credit", async () => {
    const fetchMock = vi
      .fn()
      // search
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          photos: [
            {
              url: "https://www.pexels.com/photo/999/",
              photographer: "Ada L",
              photographer_url: "https://www.pexels.com/@ada",
              alt: "RAM memory upgrade",
              src: {
                original: "https://images.pexels.com/999/orig.jpg",
                large2x: "https://images.pexels.com/999/l2x.jpg",
                large: "https://images.pexels.com/999/l.jpg",
                landscape: "https://images.pexels.com/999/landscape.jpg",
              },
            },
          ],
        }),
      })
      // download
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => new Uint8Array(TINY_JPEG).buffer,
      });
    vi.stubGlobal("fetch", fetchMock);

    const out = await new PexelsStockImageClient("test-key").find(query);

    expect(out).not.toBeNull();
    expect(out!.credit).toEqual({
      provider: "pexels",
      photographer: "Ada L",
      photographerUrl: "https://www.pexels.com/@ada",
      sourceUrl: "https://www.pexels.com/photo/999/",
    });
    expect(out!.description).toBe("RAM memory upgrade");
    expect(out!.bytes.length).toBeGreaterThan(0);

    const [searchUrl, searchInit] = fetchMock.mock.calls[0];
    expect(searchUrl).toContain("orientation=landscape");
    expect(searchUrl).toContain("query=cloudflare%20cuts%20ram");
    expect((searchInit as RequestInit).headers).toMatchObject({ Authorization: "test-key" });
    expect(fetchMock.mock.calls[1][0]).toBe("https://images.pexels.com/999/landscape.jpg");
  });

  it("returns null when the search has no photos", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ photos: [] }) }),
    );
    expect(await new PexelsStockImageClient("k").find(query)).toBeNull();
  });

  it("skips a headline-tier match on pure word-collision and falls to the category tier", async () => {
    // "Arc Raiders October Test Introduces Optional PvE Mode for Extraction
    // Shooters" — the headline-tier query picks up "test" as a keyword, which
    // real Pexels traffic resolves against vehicle *crash-test* photography,
    // not the game. None of those photos share a real word with the title,
    // so that tier must be rejected in favor of the generic gaming term.
    const gameQuery = {
      title: "Arc Raiders October Test Introduces Optional PvE Mode for Extraction Shooters",
      category: "gaming",
      entities: [],
    };
    const fetchMock = vi
      .fn()
      // tier 1: "arc raiders october test" -> unrelated vehicle test-track photo
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          photos: [
            {
              url: "https://www.pexels.com/photo/111/",
              photographer: "Vehicle Photog",
              photographer_url: "https://www.pexels.com/@vp",
              alt: "off-road vehicle suspension test rig",
              src: {
                original: "o.jpg",
                large2x: "l2x.jpg",
                large: "l.jpg",
                landscape: "landscape.jpg",
              },
            },
          ],
        }),
      })
      // tier 2: "arc raiders" -> nothing relevant either
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          photos: [
            {
              url: "https://www.pexels.com/photo/222/",
              photographer: "Sports Photog",
              photographer_url: "https://www.pexels.com/@sp",
              alt: "stadium crowd cheering fans",
              src: {
                original: "o.jpg",
                large2x: "l2x.jpg",
                large: "l.jpg",
                landscape: "landscape.jpg",
              },
            },
          ],
        }),
      })
      // tier 3 (generic category term): accepted even without word overlap
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          photos: [
            {
              url: "https://www.pexels.com/photo/333/",
              photographer: "Gaming Photog",
              photographer_url: "https://www.pexels.com/@gp",
              alt: "neon gaming controller setup",
              src: {
                original: "o.jpg",
                large2x: "l2x.jpg",
                large: "l.jpg",
                landscape: "landscape.jpg",
              },
            },
          ],
        }),
      })
      // download
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => new Uint8Array(TINY_JPEG).buffer,
      });
    vi.stubGlobal("fetch", fetchMock);

    const out = await new PexelsStockImageClient("test-key").find(gameQuery);

    expect(out).not.toBeNull();
    expect(out!.credit.sourceUrl).toBe("https://www.pexels.com/photo/333/");
    expect(fetchMock.mock.calls).toHaveLength(4);
  });

  it("throws (for the pipeline to catch) on a non-OK search", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 429, statusText: "Too Many Requests" }),
    );
    await expect(new PexelsStockImageClient("k").find(query)).rejects.toThrow(/429/);
  }, 10_000);
});
