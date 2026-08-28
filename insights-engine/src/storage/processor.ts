/**
 * Image processing: decode a generated image and produce web-optimised
 * WebP variants at fixed 16:9 sizes. Backed by `sharp` (optional
 * dependency, loaded lazily). If sharp is unavailable the passthrough
 * processor stores the original bytes as a single variant.
 */

export interface VariantSpec {
  label: string;
  width: number;
  height: number;
}

export interface ProcessedVariant extends VariantSpec {
  bytes: Buffer;
  contentType: string;
  size: number;
}

export interface ProcessedImage {
  variants: ProcessedVariant[];
  primary: ProcessedVariant;
  sourceWidth: number;
  sourceHeight: number;
}

export interface ImageProcessor {
  process(
    input: Buffer,
    inputMime: string,
    specs: VariantSpec[],
    quality: number,
  ): Promise<ProcessedImage>;
}

export const DEFAULT_VARIANTS: VariantSpec[] = [
  { label: "primary", width: 1600, height: 900 },
  { label: "og", width: 1200, height: 630 },
  { label: "w1200", width: 1200, height: 675 },
  { label: "w800", width: 800, height: 450 },
  { label: "w400", width: 400, height: 225 },
];

export class SharpImageProcessor implements ImageProcessor {
  async process(
    input: Buffer,
    _inputMime: string,
    specs: VariantSpec[],
    quality: number,
  ): Promise<ProcessedImage> {
    const mod = await import("sharp").catch(() => null);
    if (!mod) {
      return new PassthroughImageProcessor().process(input, _inputMime, specs, quality);
    }
    const sharp = mod.default;
    const meta = await sharp(input).metadata();

    const variants: ProcessedVariant[] = [];
    for (const spec of specs) {
      const bytes = await sharp(input)
        .resize(spec.width, spec.height, { fit: "cover", position: "attention" })
        .webp({ quality, effort: 4 })
        .toBuffer();
      variants.push({
        ...spec,
        bytes,
        contentType: "image/webp",
        size: bytes.length,
      });
    }
    const primary = variants.find((v) => v.label === "primary") ?? variants[0];
    return {
      variants,
      primary,
      sourceWidth: meta.width ?? spec0(specs).width,
      sourceHeight: meta.height ?? spec0(specs).height,
    };
  }
}

/** No resize/convert — used in tests and as a last-resort fallback. */
export class PassthroughImageProcessor implements ImageProcessor {
  async process(
    input: Buffer,
    inputMime: string,
    specs: VariantSpec[],
    _quality: number,
  ): Promise<ProcessedImage> {
    const primary: ProcessedVariant = {
      ...spec0(specs),
      bytes: input,
      contentType: inputMime || "image/png",
      size: input.length,
    };
    return {
      variants: [primary],
      primary,
      sourceWidth: primary.width,
      sourceHeight: primary.height,
    };
  }
}

function spec0(specs: VariantSpec[]): VariantSpec {
  return specs[0] ?? { label: "primary", width: 1600, height: 900 };
}
