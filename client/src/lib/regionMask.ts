import type { Region } from "./region";

/**
 * Builds a same-resolution black/white mask PNG (white = region to repair)
 * from a single marked rectangle, matching what the backend's /api/inpaint
 * endpoint expects. Full image resolution, not the on-screen display size,
 * so the repaired region lines up exactly - this is also why the mask
 * itself never touches image quality: it's a separate, disposable input,
 * not something that gets blended into or re-compresses the source pixels.
 */
export function regionToMaskBlob(region: Region, width: number, height: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas is not supported in this browser"));
      return;
    }
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(Math.round(region.x), Math.round(region.y), Math.round(region.w), Math.round(region.h));
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to build mask"));
    }, "image/png");
  });
}
