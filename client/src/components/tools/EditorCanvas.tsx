import { useEffect, useRef, useState, useCallback } from "react";
import { ArtifactCandidate } from "@/lib/toolsApi";

export interface DisplayCandidate extends ArtifactCandidate {
  id: string;
}

interface EditorCanvasProps {
  imageUrl: string;
  brushActive: boolean;
  brushMode: "paint" | "erase";
  brushSize: number;
  /** Called with a same-size mask PNG blob (white = painted) whenever the
   * user finishes a stroke, so the parent can track "has anything been
   * painted yet" without owning canvas internals. */
  onMaskChange: (hasPaint: boolean) => void;
  /** Exposes an imperative handle for the parent to pull the current mask,
   * clear it, and to paint accepted detector suggestions onto it. */
  maskApiRef: React.MutableRefObject<{
    getMaskBlob: () => Promise<Blob>;
    clearMask: () => void;
    paintRects: (rects: { x: number; y: number; w: number; h: number }[]) => void;
  } | null>;
  /** Detector suggestions to render as reviewable overlay boxes - purely
   * visual until the user accepts one (accepted ones get painted onto the
   * mask via paintRects, same as a manual brush stroke). */
  candidates: DisplayCandidate[];
  selectedCandidateIds: Set<string>;
  onToggleCandidate: (id: string) => void;
}

/**
 * Displays the working image over a checkerboard (so transparency reads
 * clearly), scaled to fit the available space, with an optional brush
 * overlay for the manual spot-removal tool. The overlay is a same-resolution
 * canvas so the mask painted here maps 1:1 onto the full-size image sent to
 * the backend - no coordinate translation bugs from display scaling.
 */
export function EditorCanvas({
  imageUrl,
  brushActive,
  brushMode,
  brushSize,
  onMaskChange,
  maskApiRef,
  candidates,
  selectedCandidateIds,
  onToggleCandidate,
}: EditorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [displayScale, setDisplayScale] = useState(1);
  const isPainting = useRef(false);

  function reportHasPaint() {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext("2d");
    if (!ctx) return;
    // Cheap non-empty check: sample the alpha channel at low res instead of
    // scanning every pixel of a potentially multi-megapixel mask.
    const sample = document.createElement("canvas");
    sample.width = 64;
    sample.height = 64;
    const sctx = sample.getContext("2d");
    if (!sctx) return;
    sctx.drawImage(maskCanvas, 0, 0, 64, 64);
    const data = sctx.getImageData(0, 0, 64, 64).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 10) {
        onMaskChange(true);
        return;
      }
    }
    onMaskChange(false);
  }

  // Load the image into the display canvas and record its natural size.
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      const canvas = imageCanvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      ctx?.drawImage(img, 0, 0);

      const maskCanvas = maskCanvasRef.current;
      if (maskCanvas) {
        maskCanvas.width = img.naturalWidth;
        maskCanvas.height = img.naturalHeight;
        maskCanvas.getContext("2d")?.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      }
      onMaskChange(false);
    };
    img.src = imageUrl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  // Recompute the fit-to-container scale whenever the container or image
  // size changes.
  useEffect(() => {
    function recompute() {
      const container = containerRef.current;
      if (!container || !naturalSize) return;
      const padding = 32;
      const availW = container.clientWidth - padding;
      const availH = container.clientHeight - padding;
      const scale = Math.min(availW / naturalSize.w, availH / naturalSize.h, 1);
      setDisplayScale(scale > 0 ? scale : 1);
    }
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [naturalSize]);

  const clearMask = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    maskCanvas.getContext("2d")?.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    onMaskChange(false);
  }, [onMaskChange]);

  const paintRects = useCallback(
    (rects: { x: number; y: number; w: number; h: number }[]) => {
      const maskCanvas = maskCanvasRef.current;
      if (!maskCanvas || rects.length === 0) return;
      const ctx = maskCanvas.getContext("2d");
      if (!ctx) return;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(255, 90, 90, 0.85)";
      for (const r of rects) {
        ctx.fillRect(r.x, r.y, r.w, r.h);
      }
      onMaskChange(true);
    },
    [onMaskChange]
  );

  useEffect(() => {
    maskApiRef.current = {
      clearMask,
      paintRects,
      getMaskBlob: () =>
        new Promise<Blob>((resolve, reject) => {
          const maskCanvas = maskCanvasRef.current;
          if (!maskCanvas) {
            reject(new Error("No mask canvas"));
            return;
          }
          maskCanvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to export mask"));
          }, "image/png");
        }),
    };
  }, [maskApiRef, clearMask, paintRects]);

  function toImageCoords(e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } {
    const canvas = maskCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  }

  function paintDot(x: number, y: number) {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = brushMode === "erase" ? "destination-out" : "source-over";
    ctx.fillStyle = "rgba(255, 90, 90, 0.85)";
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!brushActive) return;
    isPainting.current = true;
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    const { x, y } = toImageCoords(e);
    paintDot(x, y);
    reportHasPaint();
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!brushActive || !isPainting.current) return;
    const { x, y } = toImageCoords(e);
    paintDot(x, y);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    isPainting.current = false;
    (e.target as HTMLCanvasElement).releasePointerCapture(e.pointerId);
    reportHasPaint();
  }

  const displayW = naturalSize ? naturalSize.w * displayScale : 0;
  const displayH = naturalSize ? naturalSize.h * displayScale : 0;

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10"
      style={{
        backgroundImage:
          "linear-gradient(45deg, rgba(255,255,255,0.06) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.06) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.06) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.06) 75%)",
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
        backgroundColor: "#0b0d14",
      }}
    >
      <div className="relative shadow-2xl" style={{ width: displayW, height: displayH }}>
        <canvas
          ref={imageCanvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ imageRendering: displayScale > 1 ? "pixelated" : "auto" }}
        />
        <canvas
          ref={maskCanvasRef}
          className="absolute inset-0 h-full w-full"
          style={{
            cursor: brushActive ? (brushMode === "erase" ? "cell" : "crosshair") : "default",
            pointerEvents: brushActive ? "auto" : "none",
            opacity: 0.75,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
        {candidates.map((c) => {
          const selected = selectedCandidateIds.has(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onToggleCandidate(c.id)}
              title={`Confidence ${(c.confidence * 100).toFixed(0)}% - click to ${selected ? "deselect" : "select"}`}
              className="absolute box-content flex items-start justify-end rounded-sm transition-colors"
              style={{
                left: c.x * displayScale,
                top: c.y * displayScale,
                width: c.w * displayScale,
                height: c.h * displayScale,
                border: selected ? "2px solid #16a34a" : "2px dashed #f59e0b",
                backgroundColor: selected ? "rgba(22,163,74,0.15)" : "rgba(245,158,11,0.08)",
              }}
            >
              <span
                className="-mt-2 -mr-1 rounded px-1 text-[10px] font-semibold text-white shadow"
                style={{ backgroundColor: selected ? "#16a34a" : "#f59e0b" }}
              >
                {selected ? "✓" : `${Math.round(c.confidence * 100)}%`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
