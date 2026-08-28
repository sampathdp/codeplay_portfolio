import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Type, Square, ImagePlus, Download, RotateCcw, AlertTriangle, Loader2 } from "lucide-react";
import { UploadDropzone } from "@/components/tools/UploadDropzone";
import { PdfLayerEditor } from "@/components/tools/PdfLayerEditor";
import SEO from "@/components/SEO";
import {
  A4,
  exportTemplateToPdf,
  mmScaleForWidth,
  newImageLayer,
  newRectLayer,
  newTextLayer,
  type Layer,
  type TextLayer,
  type RectLayer,
} from "@/lib/pdfLayers";

export default function PdfTemplateTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [splitY, setSplitY] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseImgRef = useRef<HTMLImageElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFileSelected(f: File) {
    setError(null);
    setFile(f);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      baseImgRef.current = img;
      setPreviewUrl(url);
      setNaturalW(img.naturalWidth);
      setNaturalH(img.naturalHeight);
      const targetPage1Px = (0.75 * A4.heightMm) / mmScaleForWidth(img.naturalWidth);
      setSplitY(Math.min(Math.max(targetPage1Px, 24), img.naturalHeight - 24));
      setLayers([]);
      setSelectedId(null);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError("Couldn't read this image - unsupported or corrupt file");
      setFile(null);
    };
    img.src = url;
  }

  function updateLayer(id: string, patch: Partial<Layer>) {
    setLayers((prev) => prev.map((l) => (l.id === id ? ({ ...l, ...patch } as Layer) : l)));
  }

  function deleteLayer(id: string) {
    setLayers((prev) => prev.filter((l) => l.id !== id));
    setSelectedId((s) => (s === id ? null : s));
  }

  function addText() {
    const l = newTextLayer(naturalW * 0.1, naturalH * 0.1);
    setLayers((prev) => [...prev, l]);
    setSelectedId(l.id);
  }

  function addPatch() {
    const l = newRectLayer(naturalW * 0.1, naturalH * 0.1);
    setLayers((prev) => [...prev, l]);
    setSelectedId(l.id);
  }

  function handleLogoFile(f: File) {
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      const w = Math.min(naturalW * 0.25, img.naturalWidth);
      const h = w * (img.naturalHeight / img.naturalWidth);
      const l = newImageLayer(naturalW * 0.1, naturalH * 0.1, w, h, url);
      setLayers((prev) => [...prev, l]);
      setSelectedId(l.id);
    };
    img.src = url;
  }

  async function handleExport() {
    if (!baseImgRef.current || !naturalW || !naturalH) return;
    setExporting(true);
    setError(null);
    try {
      await exportTemplateToPdf({
        baseImage: baseImgRef.current,
        naturalW,
        naturalH,
        layers,
        splitY,
        filename: `${(file?.name || "document").replace(/\.[^/.]+$/, "")}.pdf`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  function handleStartOver() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setLayers([]);
    setSelectedId(null);
    setError(null);
  }

  const selectedLayer = layers.find((l) => l.id === selectedId) || null;
  const scale = naturalW ? mmScaleForWidth(naturalW) : 0;
  const page1Mm = splitY * scale;
  const page2Mm = (naturalH - splitY) * scale;
  const page1Percent = A4.heightMm ? Math.round((page1Mm / A4.heightMm) * 100) : 0;
  const overflow1 = page1Mm > A4.heightMm;
  const overflow2 = page2Mm > A4.heightMm;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <SEO
        title="Image to PDF Template Editor"
        description="Turn any certificate, form, or document image into an editable, print-ready A4 PDF. Add text, patch out old text, swap logos, and split content across two pages."
        keywords="image to pdf, editable pdf template, certificate generator, a4 pdf tool, CodePlay Studios tools"
      />

      <header className="flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-xl px-6 py-3">
        <div className="flex items-center gap-4">
          <Link href="/tools" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Tools
          </Link>
          <div className="h-5 w-px bg-white/10" />
          <h1 className="text-base font-semibold text-white">Image to PDF Template Editor</h1>
        </div>
        {file && (
          <button
            onClick={handleStartOver}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Start over
          </button>
        )}
      </header>

      {error && (
        <div className="flex items-center gap-2 border-b border-red-500/20 bg-red-500/10 px-6 py-2 text-sm text-red-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
          <button className="ml-3 underline" onClick={() => setError(null)}>
            dismiss
          </button>
        </div>
      )}

      <div className="flex-1 p-4 sm:p-6">
        {!file ? (
          <div className="mx-auto h-96 max-w-5xl">
            <UploadDropzone onFileSelected={handleFileSelected} />
          </div>
        ) : (
          <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1fr_280px]">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                <button
                  onClick={addText}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-4 py-2 text-xs font-medium text-gray-200 hover:bg-white/10"
                >
                  <Type className="h-3.5 w-3.5" />
                  Add Text
                </button>
                <button
                  onClick={addPatch}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-4 py-2 text-xs font-medium text-gray-200 hover:bg-white/10"
                >
                  <Square className="h-3.5 w-3.5" />
                  Add Patch
                </button>
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-4 py-2 text-xs font-medium text-gray-200 hover:bg-white/10"
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                  Add Logo / Image
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleLogoFile(f);
                    e.target.value = "";
                  }}
                />

                <div className="ml-auto flex items-center gap-3">
                  <span className={`text-xs ${overflow1 || overflow2 ? "text-amber-400" : "text-muted-foreground"}`}>
                    Page 1: {page1Mm.toFixed(0)}mm ({page1Percent}% of A4) — Page 2: {page2Mm.toFixed(0)}mm
                    {(overflow1 || overflow2) && " — exceeds A4 height, will overflow when printed"}
                  </span>
                  <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    {exporting ? "Exporting…" : "Export A4 PDF"}
                  </button>
                </div>
              </div>

              <div className="h-[70vh] min-h-[420px]">
                {previewUrl && (
                  <PdfLayerEditor
                    imageUrl={previewUrl}
                    naturalWidth={naturalW}
                    naturalHeight={naturalH}
                    layers={layers}
                    selectedId={selectedId}
                    onSelectLayer={setSelectedId}
                    onLayerChange={updateLayer}
                    onLayerDelete={deleteLayer}
                    splitY={splitY}
                    onSplitChange={setSplitY}
                  />
                )}
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Drag the amber line to set where page 1 ends and page 2 begins. Double-click a text box to edit its
                content. Everything below the line prints on page 2 of the PDF.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Layer</p>
              {!selectedLayer ? (
                <p className="text-sm text-muted-foreground">Select a layer to edit it, or add a new one above.</p>
              ) : selectedLayer.kind === "text" ? (
                <TextInspector layer={selectedLayer} onChange={(patch) => updateLayer(selectedLayer.id, patch)} />
              ) : selectedLayer.kind === "rect" ? (
                <RectInspector layer={selectedLayer} onChange={(patch) => updateLayer(selectedLayer.id, patch)} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Drag to move, use the corner handle to resize. Use "Add Logo / Image" again for another image.
                </p>
              )}

              {layers.length > 0 && (
                <div className="border-t border-white/10 pt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    All layers ({layers.length})
                  </p>
                  <div className="space-y-1">
                    {layers.map((l, i) => (
                      <button
                        key={l.id}
                        onClick={() => setSelectedId(l.id)}
                        className={`block w-full truncate rounded-md px-2 py-1.5 text-left text-xs ${
                          l.id === selectedId ? "bg-primary/20 text-white" : "text-muted-foreground hover:bg-white/5"
                        }`}
                      >
                        {i + 1}. {l.kind === "text" ? l.text || "(empty text)" : l.kind === "rect" ? "Patch box" : "Image / logo"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TextInspector({ layer, onChange }: { layer: TextLayer; onChange: (patch: Partial<TextLayer>) => void }) {
  return (
    <div className="space-y-3 text-sm">
      <textarea
        value={layer.text}
        onChange={(e) => onChange({ text: e.target.value })}
        rows={3}
        className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-white"
      />
      <div className="flex items-center gap-2">
        <label className="w-20 text-xs text-muted-foreground">Size</label>
        <input
          type="number"
          min={8}
          max={200}
          value={layer.fontSize}
          onChange={(e) => onChange({ fontSize: parseInt(e.target.value, 10) || layer.fontSize })}
          className="w-20 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-white"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="w-20 text-xs text-muted-foreground">Color</label>
        <input
          type="color"
          value={layer.color}
          onChange={(e) => onChange({ color: e.target.value })}
          className="h-8 w-16 rounded-md border border-white/10 bg-transparent"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="w-20 text-xs text-muted-foreground">Weight</label>
        <select
          value={layer.fontWeight}
          onChange={(e) => onChange({ fontWeight: e.target.value as TextLayer["fontWeight"] })}
          className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-white"
        >
          <option value="normal">Normal</option>
          <option value="bold">Bold</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="w-20 text-xs text-muted-foreground">Align</label>
        <select
          value={layer.align}
          onChange={(e) => onChange({ align: e.target.value as TextLayer["align"] })}
          className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-white"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
  );
}

function RectInspector({ layer, onChange }: { layer: RectLayer; onChange: (patch: Partial<RectLayer>) => void }) {
  return (
    <div className="space-y-3 text-sm">
      <p className="text-xs text-muted-foreground">Use this to cover old text/logo, then add a Text or Image layer on top.</p>
      <div className="flex items-center gap-2">
        <label className="w-20 text-xs text-muted-foreground">Color</label>
        <input
          type="color"
          value={layer.color}
          onChange={(e) => onChange({ color: e.target.value })}
          className="h-8 w-16 rounded-md border border-white/10 bg-transparent"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="w-20 text-xs text-muted-foreground">Opacity</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={layer.opacity}
          onChange={(e) => onChange({ opacity: parseFloat(e.target.value) })}
          className="flex-1 accent-primary"
        />
      </div>
    </div>
  );
}
