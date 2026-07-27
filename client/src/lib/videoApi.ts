/**
 * Thin client for the video-watermark endpoints on the same FastAPI backend
 * used by the image editor (Tools/backend). See toolsApi.ts for the image
 * endpoints and the reasoning behind the API_BASE default.
 */

import type { Region } from "./region";

export type { Region } from "./region";

const API_BASE = import.meta.env.VITE_TOOLS_API_URL || "http://127.0.0.1:8001";

export class VideoApiError extends Error {}

async function postFormRaw(path: string, form: FormData): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { method: "POST", body: form });
  } catch {
    throw new VideoApiError(`Could not reach the tools backend at ${API_BASE}. Is it running?`);
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = await res.json();
      detail = j.detail || detail;
    } catch {
      // response wasn't JSON - keep the status text
    }
    throw new VideoApiError(detail);
  }
  return res;
}

export interface VideoProbeResult {
  frameBlob: Blob;
  width: number;
  height: number;
  duration: number;
  fps: number;
}

/** Uploads the video once to get back a preview frame + pixel dimensions,
 * so the region the user draws maps to real video coordinates. */
export async function probeVideo(file: File): Promise<VideoProbeResult> {
  const form = new FormData();
  form.append("file", file, file.name || "video.mp4");
  const res = await postFormRaw("/api/video/probe", form);
  const frameBlob = await res.blob();
  return {
    frameBlob,
    width: Number(res.headers.get("X-Video-Width") ?? 0),
    height: Number(res.headers.get("X-Video-Height") ?? 0),
    duration: Number(res.headers.get("X-Video-Duration") ?? 0),
    fps: Number(res.headers.get("X-Video-Fps") ?? 0),
  };
}

/** Re-uploads the full video (the backend is stateless between requests)
 * along with the marked region, and gets back the processed MP4. */
export function removeLogo(file: File, region: Region): Promise<Blob> {
  const form = new FormData();
  form.append("file", file, file.name || "video.mp4");
  form.append("mode", "remove");
  form.append("x", String(Math.round(region.x)));
  form.append("y", String(Math.round(region.y)));
  form.append("w", String(Math.round(region.w)));
  form.append("h", String(Math.round(region.h)));
  return postFormRaw("/api/video/process", form).then((res) => res.blob());
}

export function replaceLogo(file: File, region: Region, logo: File): Promise<Blob> {
  const form = new FormData();
  form.append("file", file, file.name || "video.mp4");
  form.append("mode", "replace");
  form.append("x", String(Math.round(region.x)));
  form.append("y", String(Math.round(region.y)));
  form.append("w", String(Math.round(region.w)));
  form.append("h", String(Math.round(region.h)));
  form.append("logo", logo, logo.name || "logo.png");
  return postFormRaw("/api/video/process", form).then((res) => res.blob());
}
