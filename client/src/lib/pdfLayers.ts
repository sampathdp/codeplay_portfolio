import { jsPDF } from "jspdf";

export type LayerCommon = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type TextLayer = LayerCommon & {
  kind: "text";
  text: string;
  color: string;
  fontSize: number;
  fontWeight: "normal" | "bold";
  fontFamily: string;
  align: "left" | "center" | "right";
};

export type RectLayer = LayerCommon & {
  kind: "rect";
  color: string;
  opacity: number;
};

export type ImageLayer = LayerCommon & {
  kind: "image";
  src: string;
};

export type Layer = TextLayer | RectLayer | ImageLayer;

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

export function newTextLayer(x: number, y: number): TextLayer {
  return {
    id: crypto.randomUUID(),
    kind: "text",
    x,
    y,
    w: 320,
    h: 60,
    text: "Double-click to edit",
    color: "#111111",
    fontSize: 28,
    fontWeight: "normal",
    fontFamily: "Arial",
    align: "left",
  };
}

export function newRectLayer(x: number, y: number): RectLayer {
  return {
    id: crypto.randomUUID(),
    kind: "rect",
    x,
    y,
    w: 260,
    h: 60,
    color: "#ffffff",
    opacity: 1,
  };
}

export function newImageLayer(x: number, y: number, w: number, h: number, src: string): ImageLayer {
  return { id: crypto.randomUUID(), kind: "image", x, y, w, h, src };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image layer"));
    img.src = src;
  });
}

function drawTextLayer(ctx: CanvasRenderingContext2D, layer: TextLayer) {
  ctx.save();
  ctx.fillStyle = layer.color;
  ctx.font = `${layer.fontWeight} ${layer.fontSize}px ${layer.fontFamily}`;
  ctx.textBaseline = "top";
  ctx.textAlign = layer.align;
  const anchorX = layer.align === "center" ? layer.x + layer.w / 2 : layer.align === "right" ? layer.x + layer.w : layer.x;
  const lineHeight = layer.fontSize * 1.25;
  const lines = layer.text.split("\n");
  lines.forEach((line, i) => {
    ctx.fillText(line, anchorX, layer.y + i * lineHeight);
  });
  ctx.restore();
}

function drawRectLayer(ctx: CanvasRenderingContext2D, layer: RectLayer) {
  ctx.save();
  ctx.globalAlpha = layer.opacity;
  ctx.fillStyle = layer.color;
  ctx.fillRect(layer.x, layer.y, layer.w, layer.h);
  ctx.restore();
}

/** Renders the base image plus all layers, in order, onto an offscreen canvas at natural resolution. */
async function composite(baseImage: HTMLImageElement, naturalW: number, naturalH: number, layers: Layer[]): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = naturalW;
  canvas.height = naturalH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(baseImage, 0, 0, naturalW, naturalH);

  const imageEls = await Promise.all(
    layers.map((l) => (l.kind === "image" ? loadImage(l.src) : Promise.resolve(null)))
  );

  layers.forEach((layer, i) => {
    if (layer.kind === "rect") drawRectLayer(ctx, layer);
    else if (layer.kind === "text") drawTextLayer(ctx, layer);
    else if (layer.kind === "image") {
      const img = imageEls[i];
      if (img) ctx.drawImage(img, layer.x, layer.y, layer.w, layer.h);
    }
  });

  return canvas;
}

function cropCanvas(source: HTMLCanvasElement, y0: number, y1: number): HTMLCanvasElement {
  const h = Math.max(1, y1 - y0);
  const out = document.createElement("canvas");
  out.width = source.width;
  out.height = h;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(source, 0, y0, source.width, h, 0, 0, source.width, h);
  return out;
}

/** mm-per-natural-pixel when the image is stretched edge-to-edge across an A4 page width. */
export function mmScaleForWidth(naturalW: number): number {
  return A4_WIDTH_MM / naturalW;
}

export function pageHeightMm(splitPx: number, naturalW: number): number {
  return splitPx * mmScaleForWidth(naturalW);
}

export const A4 = { widthMm: A4_WIDTH_MM, heightMm: A4_HEIGHT_MM };

export async function exportTemplateToPdf(opts: {
  baseImage: HTMLImageElement;
  naturalW: number;
  naturalH: number;
  layers: Layer[];
  splitY: number;
  filename: string;
}): Promise<void> {
  const { baseImage, naturalW, naturalH, layers, splitY, filename } = opts;
  const full = await composite(baseImage, naturalW, naturalH, layers);

  const splitClamped = Math.min(Math.max(splitY, 1), naturalH - 1);
  const page1Canvas = cropCanvas(full, 0, splitClamped);
  const page2Canvas = cropCanvas(full, splitClamped, naturalH);

  const scale = mmScaleForWidth(naturalW);
  const page1H = page1Canvas.height * scale;
  const page2H = page2Canvas.height * scale;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.addImage(page1Canvas.toDataURL("image/png"), "PNG", 0, 0, A4_WIDTH_MM, page1H);
  doc.addPage("a4");
  doc.addImage(page2Canvas.toDataURL("image/png"), "PNG", 0, 0, A4_WIDTH_MM, page2H);
  doc.save(filename);
}
