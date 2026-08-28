import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import type { Layer, TextLayer } from "@/lib/pdfLayers";

interface PdfLayerEditorProps {
  imageUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  layers: Layer[];
  selectedId: string | null;
  onSelectLayer: (id: string | null) => void;
  onLayerChange: (id: string, patch: Partial<Layer>) => void;
  onLayerDelete: (id: string) => void;
  splitY: number;
  onSplitChange: (y: number) => void;
}

const MIN_SIZE = 16;
const MIN_GAP = 24;

export function PdfLayerEditor({
  imageUrl,
  naturalWidth,
  naturalHeight,
  layers,
  selectedId,
  onSelectLayer,
  onLayerChange,
  onLayerDelete,
  splitY,
  onSplitChange,
}: PdfLayerEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  const layerDrag = useRef<{
    id: string;
    mode: "move" | "resize";
    startClientX: number;
    startClientY: number;
    start: Layer;
  } | null>(null);
  const splitDrag = useRef<{ startClientY: number; startY: number } | null>(null);

  useEffect(() => {
    function recompute() {
      const container = containerRef.current;
      if (!container || !naturalWidth) return;
      const padding = 32;
      setScale(Math.max(0.02, (container.clientWidth - padding) / naturalWidth));
    }
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [naturalWidth]);

  function clampLayer(l: Layer): Layer {
    const w = Math.min(Math.max(l.w, MIN_SIZE), naturalWidth);
    const h = Math.min(Math.max(l.h, MIN_SIZE), naturalHeight);
    const x = Math.min(Math.max(l.x, 0), naturalWidth - w);
    const y = Math.min(Math.max(l.y, 0), naturalHeight - h);
    return { ...l, x, y, w, h };
  }

  function startLayerDrag(layer: Layer, mode: "move" | "resize") {
    return (e: React.PointerEvent) => {
      e.stopPropagation();
      onSelectLayer(layer.id);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      layerDrag.current = { id: layer.id, mode, startClientX: e.clientX, startClientY: e.clientY, start: layer };
    };
  }

  function onLayerPointerMove(e: React.PointerEvent) {
    const d = layerDrag.current;
    if (!d) return;
    const dx = (e.clientX - d.startClientX) / scale;
    const dy = (e.clientY - d.startClientY) / scale;
    if (d.mode === "move") {
      const clamped = clampLayer({ ...d.start, x: d.start.x + dx, y: d.start.y + dy });
      onLayerChange(d.id, clamped);
    } else {
      const clamped = clampLayer({ ...d.start, w: d.start.w + dx, h: d.start.h + dy });
      onLayerChange(d.id, clamped);
    }
  }

  function endLayerDrag(e: React.PointerEvent) {
    if (layerDrag.current) (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    layerDrag.current = null;
  }

  function startSplitDrag(e: React.PointerEvent) {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    splitDrag.current = { startClientY: e.clientY, startY: splitY };
  }

  function onSplitPointerMove(e: React.PointerEvent) {
    const d = splitDrag.current;
    if (!d) return;
    const dy = (e.clientY - d.startClientY) / scale;
    const y = Math.min(Math.max(d.startY + dy, MIN_GAP), naturalHeight - MIN_GAP);
    onSplitChange(y);
  }

  function endSplitDrag(e: React.PointerEvent) {
    if (splitDrag.current) (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    splitDrag.current = null;
  }

  const displayW = naturalWidth * scale;
  const displayH = naturalHeight * scale;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-auto rounded-2xl border border-white/10 bg-[#0b0d14] p-4"
      onClick={() => onSelectLayer(null)}
    >
      <div className="relative mx-auto shadow-2xl" style={{ width: displayW, height: displayH }}>
        <img src={imageUrl} alt="Template" className="absolute inset-0 h-full w-full select-none" draggable={false} />

        {layers.map((layer) => {
          const selected = layer.id === selectedId;
          const style: React.CSSProperties = {
            left: layer.x * scale,
            top: layer.y * scale,
            width: layer.w * scale,
            height: layer.h * scale,
          };
          return (
            <div
              key={layer.id}
              onPointerDown={startLayerDrag(layer, "move")}
              onPointerMove={onLayerPointerMove}
              onPointerUp={endLayerDrag}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (layer.kind === "text") setEditingId(layer.id);
              }}
              className={`absolute cursor-move overflow-hidden ${
                selected ? "border-2 border-primary" : "border border-dashed border-white/30 hover:border-white/60"
              }`}
              style={style}
            >
              {layer.kind === "rect" && (
                <div className="h-full w-full" style={{ backgroundColor: layer.color, opacity: layer.opacity }} />
              )}
              {layer.kind === "image" && <img src={layer.src} alt="" className="h-full w-full object-fill" draggable={false} />}
              {layer.kind === "text" &&
                (editingId === layer.id ? (
                  <textarea
                    autoFocus
                    value={layer.text}
                    onPointerDown={(e) => e.stopPropagation()}
                    onChange={(e) => onLayerChange(layer.id, { text: e.target.value } as Partial<TextLayer>)}
                    onBlur={() => setEditingId(null)}
                    className="h-full w-full resize-none border-none bg-white/90 p-1 text-black outline-none"
                    style={{ fontSize: layer.fontSize * scale }}
                  />
                ) : (
                  <div
                    className="h-full w-full whitespace-pre-wrap"
                    style={{
                      color: layer.color,
                      fontSize: layer.fontSize * scale,
                      fontWeight: layer.fontWeight,
                      fontFamily: layer.fontFamily,
                      textAlign: layer.align,
                      lineHeight: 1.25,
                    }}
                  >
                    {layer.text}
                  </div>
                ))}

              {selected && (
                <>
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerDelete(layer.id);
                    }}
                    className="absolute -top-3 -right-3 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow"
                    title="Delete layer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div
                    onPointerDown={startLayerDrag(layer, "resize")}
                    onPointerMove={onLayerPointerMove}
                    onPointerUp={endLayerDrag}
                    className="absolute -bottom-1.5 -right-1.5 h-4 w-4 cursor-nwse-resize rounded-sm border border-white bg-primary"
                  />
                </>
              )}
            </div>
          );
        })}

        <div
          onPointerDown={startSplitDrag}
          onPointerMove={onSplitPointerMove}
          onPointerUp={endSplitDrag}
          className="absolute left-0 -mt-2 flex h-4 w-full cursor-row-resize items-center"
          style={{ top: splitY * scale }}
        >
          <div className="h-0.5 w-full bg-amber-400" />
          <span className="absolute left-2 -translate-y-1/2 rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-semibold text-black">
            Page break — drag to adjust
          </span>
        </div>
      </div>
    </div>
  );
}
