import { useEffect, useRef, useState } from "react";
import type { Region } from "@/lib/videoApi";

interface VideoRegionSelectorProps {
  frameUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  region: Region;
  onRegionChange: (region: Region) => void;
}

const MIN_SIZE = 12;

/**
 * Lets the user drag/resize a rectangle over a still video frame to mark
 * the watermark's location. The region is tracked in natural (source video
 * pixel) coordinates - the single source of truth - and only converted
 * to/from on-screen pixels for rendering and pointer math, so it maps 1:1
 * onto the coordinates the backend needs regardless of how the frame is
 * scaled to fit the container.
 */
export function VideoRegionSelector({
  frameUrl,
  naturalWidth,
  naturalHeight,
  region,
  onRegionChange,
}: VideoRegionSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const drag = useRef<{
    mode: "move" | "resize";
    startClientX: number;
    startClientY: number;
    startRegion: Region;
  } | null>(null);

  useEffect(() => {
    function recompute() {
      const container = containerRef.current;
      if (!container || !naturalWidth || !naturalHeight) return;
      const padding = 32;
      const availW = container.clientWidth - padding;
      const availH = container.clientHeight - padding;
      setScale(Math.max(0.01, Math.min(availW / naturalWidth, availH / naturalHeight, 1)));
    }
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [naturalWidth, naturalHeight]);

  function clampRegion(r: Region): Region {
    const w = Math.min(Math.max(r.w, MIN_SIZE), naturalWidth);
    const h = Math.min(Math.max(r.h, MIN_SIZE), naturalHeight);
    const x = Math.min(Math.max(r.x, 0), naturalWidth - w);
    const y = Math.min(Math.max(r.y, 0), naturalHeight - h);
    return { x, y, w, h };
  }

  function startDrag(mode: "move" | "resize") {
    return (e: React.PointerEvent) => {
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      drag.current = { mode, startClientX: e.clientX, startClientY: e.clientY, startRegion: region };
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.startClientX) / scale;
    const dy = (e.clientY - d.startClientY) / scale;
    if (d.mode === "move") {
      onRegionChange(clampRegion({ ...d.startRegion, x: d.startRegion.x + dx, y: d.startRegion.y + dy }));
    } else {
      onRegionChange(clampRegion({ ...d.startRegion, w: d.startRegion.w + dx, h: d.startRegion.h + dy }));
    }
  }

  function endDrag(e: React.PointerEvent) {
    if (drag.current) (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    drag.current = null;
  }

  const displayW = naturalWidth * scale;
  const displayH = naturalHeight * scale;

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d14]"
    >
      <div className="relative shadow-2xl" style={{ width: displayW, height: displayH }}>
        <img src={frameUrl} alt="Video preview frame" className="absolute inset-0 h-full w-full select-none" draggable={false} />
        <div
          onPointerDown={startDrag("move")}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          className="absolute cursor-move border-2 border-primary bg-primary/20"
          style={{
            left: region.x * scale,
            top: region.y * scale,
            width: region.w * scale,
            height: region.h * scale,
          }}
        >
          <span className="absolute -top-6 left-0 whitespace-nowrap rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
            {Math.round(region.w)}×{Math.round(region.h)}
          </span>
          <div
            onPointerDown={startDrag("resize")}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            className="absolute -bottom-1.5 -right-1.5 h-4 w-4 cursor-nwse-resize rounded-sm border border-white bg-primary"
          />
        </div>
      </div>
    </div>
  );
}
