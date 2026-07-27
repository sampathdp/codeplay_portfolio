import { ReactNode } from "react";
import { Sparkles, Eraser, Wand2, ScanSearch, Paintbrush, Undo2, RotateCcw, Download } from "lucide-react";
import { BgMode } from "@/lib/toolsApi";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b border-white/5 px-4 py-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="mb-3 block last:mb-0">
      <div className="mb-1 flex items-center justify-between text-sm text-gray-300">
        <span>{label}</span>
        <span className="font-mono text-xs text-muted-foreground">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-primary"
      />
    </label>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  variant = "secondary",
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}) {
  const styles = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-primary/30",
    secondary: "bg-white/5 text-gray-200 hover:bg-white/10 disabled:text-muted-foreground",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:text-red-400/40",
  }[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${styles}`}
    >
      {children}
    </button>
  );
}

export interface ToolState {
  bgMode: BgMode;
  bgTolerance: number;
  strength: number;
  alphaErode: number;
  sharpenAmount: number;
  sharpenRadius: number;
  brushSize: number;
  inpaintRadius: number;
}

interface ToolbarProps {
  state: ToolState;
  onChange: (patch: Partial<ToolState>) => void;
  onAutoEnhance: () => void;
  onRemoveBackground: () => void;
  onCleanEdges: () => void;
  onSharpen: () => void;
  brushActive: boolean;
  onToggleBrush: () => void;
  brushMode: "paint" | "erase";
  onSetBrushMode: (mode: "paint" | "erase") => void;
  maskHasPaint: boolean;
  onApplyInpaint: () => void;
  onClearMask: () => void;
  onUndo: () => void;
  onReset: () => void;
  canUndo: boolean;
  onDownload: () => void;
  busy: boolean;
  onDetectWatermark: () => void;
  detecting: boolean;
  candidateCount: number;
  selectedCandidateCount: number;
  detectRan: boolean;
}

export function Toolbar({
  state,
  onChange,
  onAutoEnhance,
  onRemoveBackground,
  onCleanEdges,
  onSharpen,
  brushActive,
  onToggleBrush,
  brushMode,
  onSetBrushMode,
  maskHasPaint,
  onApplyInpaint,
  onClearMask,
  onUndo,
  onReset,
  canUndo,
  onDownload,
  busy,
  onDetectWatermark,
  detecting,
  candidateCount,
  selectedCandidateCount,
  detectRan,
}: ToolbarProps) {
  return (
    <div className="flex h-full w-80 flex-col overflow-y-auto border-l border-white/10 bg-black/40 backdrop-blur-xl">
      <Section title="One-click">
        <ActionButton onClick={onAutoEnhance} disabled={busy} variant="primary">
          <span className="inline-flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" /> Auto Enhance
          </span>
        </ActionButton>
        <p className="mt-2 text-xs text-muted-foreground">
          Runs background removal, edge cleanup, and sharpening in one pass.
        </p>
      </Section>

      <Section title="Background removal">
        <div className="mb-3 flex gap-1 rounded-lg bg-white/5 p-1 text-xs">
          {(["auto", "ml", "chroma"] as BgMode[]).map((m) => (
            <button
              key={m}
              onClick={() => onChange({ bgMode: m })}
              className={`flex-1 rounded-md py-1.5 font-medium capitalize transition-colors ${
                state.bgMode === m ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-white"
              }`}
            >
              {m === "ml" ? "AI model" : m}
            </button>
          ))}
        </div>
        {state.bgMode !== "ml" && (
          <SliderRow
            label="Chroma tolerance"
            value={state.bgTolerance}
            min={5}
            max={80}
            step={1}
            onChange={(v) => onChange({ bgTolerance: v })}
          />
        )}
        <div className="mt-3">
          <ActionButton onClick={onRemoveBackground} disabled={busy}>
            <span className="inline-flex items-center justify-center gap-2">
              <Eraser className="h-4 w-4" /> Remove Background
            </span>
          </ActionButton>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Auto picks chroma-key for flat/solid backdrops (best for sprite sheets) and the AI model for busy or
          photographic backgrounds.
        </p>
      </Section>

      <Section title="Clean edges">
        <SliderRow
          label="Halo strength"
          value={state.strength}
          min={0.2}
          max={2.5}
          step={0.1}
          onChange={(v) => onChange({ strength: v })}
        />
        <SliderRow
          label="Alpha erode"
          value={state.alphaErode}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => onChange({ alphaErode: v })}
        />
        <div className="mt-3">
          <ActionButton onClick={onCleanEdges} disabled={busy}>
            Clean Edges
          </ActionButton>
        </div>
      </Section>

      <Section title="Sharpen">
        <SliderRow
          label="Amount"
          value={state.sharpenAmount}
          min={0}
          max={1.5}
          step={0.05}
          onChange={(v) => onChange({ sharpenAmount: v })}
        />
        <SliderRow
          label="Radius"
          value={state.sharpenRadius}
          min={0.3}
          max={2}
          step={0.1}
          onChange={(v) => onChange({ sharpenRadius: v })}
        />
        <div className="mt-3">
          <ActionButton onClick={onSharpen} disabled={busy}>
            <span className="inline-flex items-center justify-center gap-2">
              <Wand2 className="h-4 w-4" /> Sharpen
            </span>
          </ActionButton>
        </div>
      </Section>

      <Section title="Watermark / spot removal">
        <ActionButton onClick={onDetectWatermark} disabled={busy || detecting} variant="secondary">
          <span className="inline-flex items-center justify-center gap-2">
            <ScanSearch className="h-4 w-4" /> {detecting ? "Scanning…" : "Detect Watermark"}
          </span>
        </ActionButton>
        <p className="mt-2 text-xs text-muted-foreground">
          Suggests regions worth a look — it never removes anything on its own. Review each suggestion (click a box
          on the canvas to accept/reject) before applying. It can miss real artifacts or flag ordinary detail; the
          brush below is the reliable fallback.
        </p>
        {detectRan && (
          <div className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-xs text-gray-300">
            {candidateCount === 0
              ? "No candidate regions found. Try the brush below."
              : `${candidateCount} suggestion${candidateCount === 1 ? "" : "s"} — ${selectedCandidateCount} accepted`}
          </div>
        )}
        {selectedCandidateCount > 0 && (
          <div className="mt-2">
            <ActionButton onClick={onApplyInpaint} disabled={busy} variant="primary">
              Remove {selectedCandidateCount} Accepted Region{selectedCandidateCount === 1 ? "" : "s"}
            </ActionButton>
          </div>
        )}

        <div className="mt-4 border-t border-white/5 pt-4">
          <div className="mb-3 flex gap-1 rounded-lg bg-white/5 p-1 text-xs">
            <button
              onClick={() => onSetBrushMode("paint")}
              className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
                brushMode === "paint" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-white"
              }`}
            >
              <span className="inline-flex items-center justify-center gap-1.5">
                <Paintbrush className="h-3.5 w-3.5" /> Paint
              </span>
            </button>
            <button
              onClick={() => onSetBrushMode("erase")}
              className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
                brushMode === "erase" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-white"
              }`}
            >
              <span className="inline-flex items-center justify-center gap-1.5">
                <Eraser className="h-3.5 w-3.5" /> Erase
              </span>
            </button>
          </div>
          <ActionButton onClick={onToggleBrush} disabled={busy} variant={brushActive ? "primary" : "secondary"}>
            {brushActive ? "Brush active — click to stop" : "Start painting"}
          </ActionButton>
          <div className="mt-3">
            <SliderRow
              label="Brush size"
              value={state.brushSize}
              min={4}
              max={120}
              step={2}
              onChange={(v) => onChange({ brushSize: v })}
            />
            <SliderRow
              label="Repair radius"
              value={state.inpaintRadius}
              min={2}
              max={40}
              step={1}
              onChange={(v) => onChange({ inpaintRadius: v })}
            />
          </div>
          <div className="mt-3 flex gap-2">
            <div className="flex-1">
              <ActionButton onClick={onApplyInpaint} disabled={busy || !maskHasPaint} variant="primary">
                Apply
              </ActionButton>
            </div>
            <div className="flex-1">
              <ActionButton onClick={onClearMask} disabled={busy || !maskHasPaint} variant="danger">
                Clear
              </ActionButton>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Paint over what to remove (or erase parts of a detector suggestion you disagree with), then hit Apply.
          </p>
        </div>
      </Section>

      <div className="mt-auto flex flex-col gap-2 border-t border-white/10 p-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <ActionButton onClick={onUndo} disabled={busy || !canUndo}>
              <span className="inline-flex items-center justify-center gap-2">
                <Undo2 className="h-4 w-4" /> Undo
              </span>
            </ActionButton>
          </div>
          <div className="flex-1">
            <ActionButton onClick={onReset} disabled={busy || !canUndo}>
              <span className="inline-flex items-center justify-center gap-2">
                <RotateCcw className="h-4 w-4" /> Reset
              </span>
            </ActionButton>
          </div>
        </div>
        <ActionButton onClick={onDownload} disabled={busy} variant="primary">
          <span className="inline-flex items-center justify-center gap-2">
            <Download className="h-4 w-4" /> Download PNG
          </span>
        </ActionButton>
      </div>
    </div>
  );
}
