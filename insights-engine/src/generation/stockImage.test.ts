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
              alt: "server aisle",
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
    expect(out!.description).toBe("server aisle");
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

  it("throws (for the pipeline to catch) on a non-OK search", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 429, statusText: "Too Many Requests" }),
    );
    await expect(new PexelsStockImageClient("k").find(query)).rejects.toThrow(/429/);
  }, 10_000);
});
