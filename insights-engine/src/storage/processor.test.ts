import { describe, it, expect, beforeAll } from "vitest";
import {
  SharpImageProcessor,
  PassthroughImageProcessor,
  DEFAULT_VARIANTS,
} from "./processor";

let PNG: Buffer;

beforeAll(async () => {
  const sharp = (await import("sharp")).default;
  PNG = await sharp({
    create: { width: 640, height: 360, channels: 3, background: { r: 20, g: 30, b: 60 } },
  })
    .png()
    .toBuffer();
});

describe("PassthroughImageProcessor", () => {
  it("returns the original bytes as a single primary variant", async () => {
    const input = PNG;
    const out = await new PassthroughImageProcessor().process(input, "image/png", DEFAULT_VARIANTS, 80);
    expect(out.variants).toHaveLength(1);
    expect(out.primary.bytes).toBe(input);
    expect(out.primary.contentType).toBe("image/png");
  });
});

describe("SharpImageProcessor", () => {
  it("produces one 16:9 WebP per spec", async () => {
    const out = await new SharpImageProcessor().process(PNG, "image/png", DEFAULT_VARIANTS, 82);

    expect(out.variants.length).toBe(DEFAULT_VARIANTS.length);
    for (const v of out.variants) {
      expect(v.contentType).toBe("image/webp");
      expect(v.size).toBeGreaterThan(0);
      // RIFF/WEBP magic bytes
      expect(v.bytes.subarray(0, 4).toString("ascii")).toBe("RIFF");
      expect(v.bytes.subarray(8, 12).toString("ascii")).toBe("WEBP");
    }
    const primary = out.variants.find((v) => v.label === "primary")!;
    expect(primary.width).toBe(1600);
    expect(primary.height).toBe(900);
    expect(out.primary.label).toBe("primary");
  });
});
