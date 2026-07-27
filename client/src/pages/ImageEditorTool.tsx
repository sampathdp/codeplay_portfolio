import { useCallback, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { UploadDropzone } from "@/components/tools/UploadDropzone";
import { EditorCanvas, DisplayCandidate } from "@/components/tools/EditorCanvas";
import { Toolbar, ToolState } from "@/components/tools/Toolbar";
import SEO from "@/components/SEO";
import * as api from "@/lib/toolsApi";

interface HistoryEntry {
  blob: Blob;
  url: string;
  label: string;
}

const DEFAULT_TOOL_STATE: ToolState = {
  bgMode: "auto",
  bgTolerance: 30,
  strength: 1.0,
  alphaErode: 0.5,
  sharpenAmount: 0.8,
  sharpenRadius: 0.8,
  brushSize: 30,
  inpaintRadius: 8,
};

export default function ImageEditorTool() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [toolState, setToolState] = useState<ToolState>(DEFAULT_TOOL_STATE);
  const [brushActive, setBrushActive] = useState(false);
  const [brushMode, setBrushMode] = useState<"paint" | "erase">("paint");
  const [maskHasPaint, setMaskHasPaint] = useState(false);
  const [busy, setBusy] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileBaseName, setFileBaseName] = useState("sprite");

  const [candidates, setCandidates] = useState<DisplayCandidate[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set());
  const [detectRan, setDetectRan] = useState(false);

  const maskApiRef = useRef<{
    getMaskBlob: () => Promise<Blob>;
    clearMask: () => void;
    paintRects: (rects: { x: number; y: number; w: number; h: number }[]) => void;
  } | null>(null);

  const current = historyIndex >= 0 ? history[historyIndex] : null;

  function resetCandidates() {
    setCandidates([]);
    setSelectedCandidateIds(new Set());
    setDetectRan(false);
  }

  const pushHistory = useCallback(
    (blob: Blob, label: string) => {
      const url = URL.createObjectURL(blob);
      setHistory((prev) => {
        const truncated = prev.slice(0, historyIndex + 1);
        return [...truncated, { blob, url, label }];
      });
      setHistoryIndex((i) => i + 1);
    },
    [historyIndex]
  );

  function handleFileSelected(file: File) {
    setFileBaseName(file.name.replace(/\.[^/.]+$/, ""));
    const url = URL.createObjectURL(file);
    setHistory([{ blob: file, url, label: "Original" }]);
    setHistoryIndex(0);
    setError(null);
    resetCandidates();
  }

  async function runTool(label: string, action: (blob: Blob) => Promise<Blob>) {
    if (!current) return;
    setBusy(true);
    setError(null);
    try {
      const result = await action(current.blob);
      pushHistory(result, label);
      resetCandidates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const handleAutoEnhance = () =>
    runTool("Auto Enhance", (blob) =>
      api.autoEnhance(blob, {
        bgMode: toolState.bgMode,
        bgTolerance: toolState.bgTolerance,
        strength: toolState.strength,
        alphaErode: toolState.alphaErode,
        sharpenAmount: toolState.sharpenAmount,
        sharpenRadius: toolState.sharpenRadius,
      })
    );

  const handleRemoveBackground = () =>
    runTool("Remove Background", (blob) => api.removeBackground(blob, toolState.bgMode, toolState.bgTolerance));

  const handleCleanEdges = () =>
    runTool("Clean Edges", (blob) => api.cleanEdges(blob, toolState.strength, toolState.alphaErode));

  const handleSharpen = () =>
    runTool("Sharpen", (blob) => api.sharpen(blob, toolState.sharpenAmount, toolState.sharpenRadius));

  async function handleDetectWatermark() {
    if (!current) return;
    setDetecting(true);
    setError(null);
    try {
      const found = await api.detectArtifacts(current.blob);
      setCandidates(found.map((c, i) => ({ ...c, id: `${historyIndex}-${i}-${Date.now()}` })));
      setSelectedCandidateIds(new Set());
      setDetectRan(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Detection failed");
    } finally {
      setDetecting(false);
    }
  }

  function handleToggleCandidate(id: string) {
    setSelectedCandidateIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleApplyInpaint() {
    if (!current || !maskApiRef.current) return;

    // Any accepted detector suggestions get painted onto the mask alongside
    // whatever the user has manually brushed, so one Apply covers both.
    const acceptedRects = candidates.filter((c) => selectedCandidateIds.has(c.id));
    if (acceptedRects.length > 0) {
      maskApiRef.current.paintRects(acceptedRects);
    }

    setBusy(true);
    setError(null);
    try {
      const maskBlob = await maskApiRef.current.getMaskBlob();
      const result = await api.inpaint(current.blob, maskBlob, toolState.inpaintRadius);
      pushHistory(result, "Spot Remove");
      maskApiRef.current.clearMask();
      setMaskHasPaint(false);
      resetCandidates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  function handleClearMask() {
    maskApiRef.current?.clearMask();
    setMaskHasPaint(false);
  }

  function handleUndo() {
    if (historyIndex > 0) {
      maskApiRef.current?.clearMask();
      setMaskHasPaint(false);
      resetCandidates();
      setHistoryIndex(historyIndex - 1);
    }
  }

  function handleReset() {
    if (historyIndex > 0) {
      maskApiRef.current?.clearMask();
      setMaskHasPaint(false);
      resetCandidates();
      setHistoryIndex(0);
    }
  }

  function handleDownload() {
    if (!current) return;
    const a = document.createElement("a");
    a.href = current.url;
    a.download = `${fileBaseName}-cleaned.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-background text-foreground">
      <SEO
        title="Image Editor — Background Removal & Sprite Cleanup"
        description="Free in-browser image editor: AI background removal, edge cleanup, sharpening, and watermark/spot removal for sprites and images."
        keywords="background removal tool, image editor, sprite cleaner, watermark remover, CodePlay Studios tools"
      />

      <header className="flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-xl px-6 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/tools"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Tools
          </Link>
          <div className="h-5 w-px bg-white/10" />
          <h1 className="text-base font-semibold text-white">Image Editor</h1>
        </div>
        {current && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {busy ? (
              <span className="flex items-center gap-2 text-primary">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                Processing…
              </span>
            ) : (
              <span>{current.label}</span>
            )}
          </div>
        )}
      </header>

      {error && (
        <div className="border-b border-red-500/20 bg-red-500/10 px-6 py-2 text-sm text-red-300">
          {error}
          <button className="ml-3 underline" onClick={() => setError(null)}>
            dismiss
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <main className="min-w-0 min-h-0 flex-1 p-4">
          {current ? (
            <EditorCanvas
              imageUrl={current.url}
              brushActive={brushActive}
              brushMode={brushMode}
              brushSize={toolState.brushSize}
              onMaskChange={setMaskHasPaint}
              maskApiRef={maskApiRef}
              candidates={candidates}
              selectedCandidateIds={selectedCandidateIds}
              onToggleCandidate={handleToggleCandidate}
            />
          ) : (
            <UploadDropzone onFileSelected={handleFileSelected} />
          )}
        </main>

        {current && (
          <Toolbar
            state={toolState}
            onChange={(patch) => setToolState((s) => ({ ...s, ...patch }))}
            onAutoEnhance={handleAutoEnhance}
            onRemoveBackground={handleRemoveBackground}
            onCleanEdges={handleCleanEdges}
            onSharpen={handleSharpen}
            brushActive={brushActive}
            onToggleBrush={() => setBrushActive((v) => !v)}
            brushMode={brushMode}
            onSetBrushMode={setBrushMode}
            maskHasPaint={maskHasPaint}
            onApplyInpaint={handleApplyInpaint}
            onClearMask={handleClearMask}
            onUndo={handleUndo}
            onReset={handleReset}
            canUndo={historyIndex > 0}
            onDownload={handleDownload}
            busy={busy}
            onDetectWatermark={handleDetectWatermark}
            detecting={detecting}
            candidateCount={candidates.length}
            selectedCandidateCount={selectedCandidateIds.size}
            detectRan={detectRan}
          />
        )}
      </div>
    </div>
  );
}
