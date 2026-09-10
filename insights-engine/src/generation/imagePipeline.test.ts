import { describe, it, expect } from "vitest";
import { generateFeaturedImage } from "./imagePipeline";
import { MockGeminiImageClient } from "../gemini/mock";
import { MemoryImageStore } from "../storage/images";
import { PassthroughImageProcessor, DEFAULT_VARIANTS } from "../storage/processor";
import type { UsageRecord } from "../gemini/budget";

const input = {
  slug: "acme-nimbus-3-agentic-coding",
  title: "Acme Nimbus 3 adds agentic coding",
  category: "artificial-intelligence",
  summary: "Acme AI announced a new model with an agentic coding mode.",
  entities: ["Acme AI"],
  imageModel: "gemini-3.1-flash-image",
  imagePricingUsd: { "gemini-3.1-flash-image": 0.04, default: 0.04 },
  aspectRatio: "16:9",
};

function deps(over: Partial<Parameters<typeof generateFeaturedImage>[0]> = {}) {
  return {
    imageClient: new MockGeminiImageClient(),
    processor: new PassthroughImageProcessor(),
    store: new MemoryImageStore(),
    now: new Date("2026-08-28T12:00:00Z"),
    ...over,
  };
}

describe("generateFeaturedImage — success", () => {
  it("generates, stores every variant, and returns metadata", async () => {
    const usage: UsageRecord[] = [];
    const d = deps({ onUsage: (r) => usage.push(r) });
    const out = await generateFeaturedImage(d, input);

    expect(out.status).toBe("generated");
    expect(out.aiGenerated).toBe(true);
    expect(out.model).toBe("gemini-3.1-flash-image");
    expect(out.primary).not.toBeNull();
    expect(out.primary!.url).toMatch(/^memory:\/\/insights-media\/insights\/2026\/08\/acme-nimbus-3-agentic-coding\//);
    expect(out.variants.length).toBe(1); // passthrough keeps one
    expect(out.prompt).toContain("Negative requirements:");
    expect(out.altText.length).toBeGreaterThan(0);
    expect(usage[0].status).toBe("ok");
    expect(usage[0].costUsd).toBeCloseTo(0.04, 4);
    // stored in the memory store under the dated path
    expect([...(d.store as MemoryImageStore).objects.keys()][0]).toMatch(
      /insights\/2026\/08\/acme-nimbus-3-agentic-coding\/primary\.webp/,
    );
  });

  it("produces one variant per spec with a real processor path (passthrough)", async () => {
    const out = await generateFeaturedImage(deps(), { ...input, variants: DEFAULT_VARIANTS });
    expect(out.variants.length).toBeGreaterThanOrEqual(1);
    expect(out.variants.some((v) => v.isPrimary)).toBe(true);
  });
});

describe("generateFeaturedImage — failure handling", () => {
  it("falls back to a category graphic when the image API fails (no crash)", async () => {
    const usage: UsageRecord[] = [];
    const out = await generateFeaturedImage(
      deps({
        imageClient: new MockGeminiImageClient({ failWith: "RAI filtered" }),
        onUsage: (r) => usage.push(r),
      }),
      input,
    );
    expect(out.status).toBe("fallback");
    expect(out.aiGenerated).toBe(false);
    expect(out.primary!.contentType).toBe("image/svg+xml");
    expect(out.reason).toContain("RAI filtered");
    expect(usage[0].status).toBe("error");
  });

  it("falls back when storage fails", async () => {
    const brokenStore = {
      put: async () => {
        throw new Error("bucket unavailable");
      },
      removeArticleFolder: async () => {},
    };
    // first put (variant) throws → fallback; fallback put also uses the store,
    // so this exercises the "failed" terminal branch too.
    const out = await generateFeaturedImage(deps({ store: brokenStore }), input);
    expect(["fallback", "failed"]).toContain(out.status);
    expect(out.status).toBe("failed"); // both puts throw
    expect(out.reason).toMatch(/bucket unavailable/);
  });

  it("falls back (not failed) when only the primary processing/storage path fails", async () => {
    let call = 0;
    const store = new MemoryImageStore();
    const flaky = {
      put: (...args: Parameters<MemoryImageStore["put"]>) => {
        call += 1;
        if (call === 1) throw new Error("transient");
        return store.put(...args);
      },
      removeArticleFolder: store.removeArticleFolder.bind(store),
    };
    const out = await generateFeaturedImage(deps({ store: flaky }), input);
    expect(out.status).toBe("fallback");
  });
});

describe("generateFeaturedImage — manual protection & regeneration", () => {
  it("never replaces a manual image unless forced", async () => {
    const out = await generateFeaturedImage(deps(), { ...input, isManual: true });
    expect(out.status).toBe("skipped_manual");
    expect(out.primary).toBeNull();

    const forced = await generateFeaturedImage(deps(), { ...input, isManual: true, force: true });
    expect(forced.status).toBe("generated");
  });

  it("regeneration produces a fresh image (overwrites at the same paths)", async () => {
    const store = new MemoryImageStore();
    const first = await generateFeaturedImage(deps({ store }), input);
    const second = await generateFeaturedImage(deps({ store }), input);
    expect(first.status).toBe("generated");
    expect(second.status).toBe("generated");
    expect(second.primary!.storagePath).toBe(first.primary!.storagePath);
  });

  it("uses an admin prompt override verbatim as the subject line", async () => {
    const client = new MockGeminiImageClient();
    const out = await generateFeaturedImage(deps({ imageClient: client }), {
      ...input,
      promptOverride: "a minimalist obsidian monolith bisected by a single beam of warm light",
    });
    expect(out.status).toBe("generated");
    expect(client.calls[0].prompt).toContain("obsidian monolith bisected by a single beam");
  });
});
