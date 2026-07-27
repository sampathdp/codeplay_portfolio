/**
 * Thin client for the sprite-cleaner FastAPI backend (Tools/backend). Every
 * call sends the current working image as multipart/form-data and gets a
 * fresh PNG blob back - the frontend owns undo history, the backend stays
 * stateless.
 */

// Pinned to 127.0.0.1 rather than "localhost": on machines running other
// local dev servers, "localhost" can resolve to ::1 (IPv6) instead of
// 127.0.0.1 depending on connection timing, silently routing requests to
// an unrelated service if one happens to also be bound on this port.
const API_BASE = import.meta.env.VITE_TOOLS_API_URL || "http://127.0.0.1:8001";

export class ApiError extends Error {}

async function postFormRaw(path: string, form: FormData): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { method: "POST", body: form });
  } catch {
    throw new ApiError(`Could not reach the image editor backend at ${API_BASE}. Is it running?`);
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = await res.json();
      detail = j.detail || detail;
    } catch {
      // response wasn't JSON - keep the status text
    }
    throw new ApiError(detail);
  }
  return res;
}

async function postForm(path: string, form: FormData): Promise<Blob> {
  const res = await postFormRaw(path, form);
  return res.blob();
}

export type BgMode = "auto" | "ml" | "chroma";

export function removeBackground(file: Blob, mode: BgMode, tolerance: number): Promise<Blob> {
  const form = new FormData();
  form.append("file", file, "image.png");
  form.append("mode", mode);
  form.append("tolerance", String(tolerance));
  return postForm("/api/remove-background", form);
}

export function cleanEdges(file: Blob, strength: number, alphaErode: number): Promise<Blob> {
  const form = new FormData();
  form.append("file", file, "image.png");
  form.append("strength", String(strength));
  form.append("alpha_erode", String(alphaErode));
  return postForm("/api/clean-edges", form);
}

export function sharpen(file: Blob, amount: number, radius: number): Promise<Blob> {
  const form = new FormData();
  form.append("file", file, "image.png");
  form.append("amount", String(amount));
  form.append("radius", String(radius));
  return postForm("/api/sharpen", form);
}

export function inpaint(file: Blob, mask: Blob, radius: number): Promise<Blob> {
  const form = new FormData();
  form.append("file", file, "image.png");
  form.append("mask", mask, "mask.png");
  form.append("radius", String(radius));
  return postForm("/api/inpaint", form);
}

export interface ArtifactCandidate {
  x: number;
  y: number;
  w: number;
  h: number;
  confidence: number;
}

/**
 * Suggests candidate watermark/glare/blemish regions - purely informational,
 * never modifies the image. Pairs with `inpaint()`: the caller must let the
 * user review and select candidates, then build a mask from the accepted
 * ones and call `inpaint()` itself. Treat results as "worth a look," not a
 * guarantee - dense ornamental art can produce false positives.
 */
export async function detectArtifacts(file: Blob): Promise<ArtifactCandidate[]> {
  const form = new FormData();
  form.append("file", file, "image.png");
  const res = await postFormRaw("/api/detect-artifacts", form);
  const json = await res.json();
  return json.candidates as ArtifactCandidate[];
}

export interface AutoEnhanceOptions {
  bgMode: BgMode | "off";
  bgTolerance: number;
  strength: number;
  alphaErode: number;
  sharpenAmount: number;
  sharpenRadius: number;
}

export function autoEnhance(file: Blob, opts: AutoEnhanceOptions): Promise<Blob> {
  const form = new FormData();
  form.append("file", file, "image.png");
  form.append("bg_mode", opts.bgMode);
  form.append("bg_tolerance", String(opts.bgTolerance));
  form.append("strength", String(opts.strength));
  form.append("alpha_erode", String(opts.alphaErode));
  form.append("sharpen_amount", String(opts.sharpenAmount));
  form.append("sharpen_radius", String(opts.sharpenRadius));
  return postForm("/api/auto-enhance", form);
}
