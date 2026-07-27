/**
 * Client-side image format conversion via canvas - no upload, no backend.
 * Runs entirely in the browser: decode with <img>, redraw onto a canvas,
 * re-encode with canvas.toBlob(). Covers the common raster conversions
 * (PNG/JPEG/WebP in either direction); anything the browser itself can't
 * decode (e.g. HEIC) or encode (canvas.toBlob only guarantees PNG - JPEG
 * and WebP support is near-universal but not spec-mandated) surfaces as a
 * rejected promise so the caller can show a per-file error.
 */

export type OutputFormat = "png" | "jpeg" | "webp";

const MIME: Record<OutputFormat, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export const FORMAT_EXTENSION: Record<OutputFormat, string> = {
  png: "png",
  jpeg: "jpg",
  webp: "webp",
};

/**
 * 0 (or omitted) means "don't resize". Otherwise the image is downscaled
 * (never upscaled) so its longer edge is at most maxDimension, preserving
 * aspect ratio - the single biggest lever for "loads instantly on any
 * device": a 4000px camera photo re-encoded as WebP at full resolution is
 * still several megabytes no matter how good the codec is, because most
 * screens will never display it above ~1920-2560px wide anyway.
 */
export function convertImage(file: File, format: OutputFormat, quality: number, maxDimension = 0): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const srcW = img.naturalWidth;
      const srcH = img.naturalHeight;
      const scale = maxDimension > 0 ? Math.min(1, maxDimension / Math.max(srcW, srcH)) : 1;
      const outW = Math.max(1, Math.round(srcW * scale));
      const outH = Math.max(1, Math.round(srcH * scale));

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas is not supported in this browser"));
        return;
      }
      // JPEG has no alpha channel - without a flatten pass, browsers encode
      // transparent pixels as black instead of leaving them white/neutral.
      if (format === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, outW, outH);
      // Re-encoding through canvas also strips all EXIF/ICC metadata for
      // free (canvas pixels carry no metadata) - GPS tags, camera model,
      // color profiles, thumbnails embedded by phone cameras all disappear,
      // which is both a privacy win and extra bytes shaved off for free.
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve(blob);
          else reject(new Error(`This browser can't export ${format.toUpperCase()}`));
        },
        MIME[format],
        format === "png" ? undefined : quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't read this image - unsupported or corrupt file"));
    };
    img.src = url;
  });
}

export function stripExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "");
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
