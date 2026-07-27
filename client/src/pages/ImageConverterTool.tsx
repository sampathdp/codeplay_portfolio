import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Download, RefreshCw, Trash2, X, CheckCircle2, AlertCircle, Loader2, Gauge } from "lucide-react";
import { MultiUploadDropzone } from "@/components/tools/MultiUploadDropzone";
import SEO from "@/components/SEO";
import {
  convertImage,
  formatBytes,
  stripExtension,
  FORMAT_EXTENSION,
  type OutputFormat,
} from "@/lib/imageConvert";

interface ConvertItem {
  id: string;
  file: File;
  previewUrl: string;
  status: "pending" | "converting" | "done" | "error";
  resultBlob?: Blob;
  resultUrl?: string;
  errorMessage?: string;
}

// Sensible default quality per format - WebP holds visual quality well below
// the JPEG "sweet spot" of ~85%, so defaulting it lower gives noticeably
// smaller files for web use without a visible difference at normal viewing
// sizes. PNG is always lossless (quality is ignored by the encoder).
const DEFAULT_QUALITY: Record<OutputFormat, number> = { png: 1, jpeg: 0.85, webp: 0.75 };

// Longer-edge caps for the resize control. 0 means "don't resize". Most
// screens - including high-DPI phones and laptops - never display an
// in-page image wider than ~1920-2560 CSS px, so shipping camera-native
// resolutions (often 4000px+) just wastes bandwidth and load time.
const RESIZE_PRESETS: { label: string; value: number }[] = [
  { label: "Original", value: 0 },
  { label: "2560px", value: 2560 },
  { label: "1920px", value: 1920 },
  { label: "1600px", value: 1600 },
  { label: "1280px", value: 1280 },
  { label: "800px", value: 800 },
];

let nextId = 0;

export default function ImageConverterTool() {
  const [items, setItems] = useState<ConvertItem[]>([]);
  const [format, setFormat] = useState<OutputFormat>("webp");
  const [quality, setQuality] = useState(DEFAULT_QUALITY.webp);
  const [maxDimension, setMaxDimension] = useState(1920);
  const [converting, setConverting] = useState(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  function selectFormat(f: OutputFormat) {
    setFormat(f);
    setQuality(DEFAULT_QUALITY[f]);
  }

  // Revoke every blob URL we've created once the component unmounts, so
  // large batches of images don't leak memory across navigations.
  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) {
        URL.revokeObjectURL(item.previewUrl);
        if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
      }
    };
  }, []);

  const handleFilesSelected = useCallback((files: File[]) => {
    const newItems: ConvertItem[] = files.map((file) => ({
      id: String(nextId++),
      file,
      previewUrl: URL.createObjectURL(file),
      status: "pending",
    }));
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  function removeItem(id: string) {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
        if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
  }

  function clearAll() {
    for (const item of items) {
      URL.revokeObjectURL(item.previewUrl);
      if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
    }
    setItems([]);
  }

  async function convertAll() {
    setConverting(true);
    setItems((prev) => prev.map((i) => ({ ...i, status: "converting" as const })));

    await Promise.all(
      itemsRef.current.map(async (item) => {
        try {
          const blob = await convertImage(item.file, format, quality, maxDimension);
          setItems((prev) =>
            prev.map((i) => {
              if (i.id !== item.id) return i;
              if (i.resultUrl) URL.revokeObjectURL(i.resultUrl);
              return { ...i, status: "done", resultBlob: blob, resultUrl: URL.createObjectURL(blob) };
            })
          );
        } catch (err) {
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? { ...i, status: "error", errorMessage: err instanceof Error ? err.message : "Conversion failed" }
                : i
            )
          );
        }
      })
    );

    setConverting(false);
  }

  function downloadItem(item: ConvertItem) {
    if (!item.resultUrl) return;
    const a = document.createElement("a");
    a.href = item.resultUrl;
    a.download = `${stripExtension(item.file.name)}.${FORMAT_EXTENSION[format]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function downloadAll() {
    const done = items.filter((i) => i.status === "done" && i.resultUrl);
    done.forEach((item, index) => {
      setTimeout(() => downloadItem(item), index * 150);
    });
  }

  const doneItems = items.filter((i) => i.status === "done" && i.resultBlob);
  const doneCount = doneItems.length;
  const hasItems = items.length > 0;
  const totalOriginal = doneItems.reduce((sum, i) => sum + i.file.size, 0);
  const totalConverted = doneItems.reduce((sum, i) => sum + (i.resultBlob?.size ?? 0), 0);
  const totalSavedPct = totalOriginal > 0 ? Math.round((1 - totalConverted / totalOriginal) * 100) : 0;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <SEO
        title="Image Format Converter — JPEG, PNG, WebP"
        description="Free in-browser image format converter. Convert JPEG to PNG, PNG to WebP, and more — batch convert, nothing uploaded, everything stays on your device."
        keywords="image converter, jpeg to png, png to webp, webp to jpeg, image format converter, CodePlay Studios tools"
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
          <h1 className="text-base font-semibold text-white">Format Converter</h1>
        </div>
        <p className="hidden sm:block text-xs text-muted-foreground">
          Runs entirely in your browser — nothing is uploaded
        </p>
      </header>

      <div className="flex-1 p-4 sm:p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          {!hasItems ? (
            <MultiUploadDropzone onFilesSelected={handleFilesSelected} />
          ) : (
            <>
              {/* Controls */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Convert to
                    </p>
                    <div className="flex gap-1 rounded-lg bg-white/5 p-1 text-sm">
                      {(["png", "jpeg", "webp"] as OutputFormat[]).map((f) => (
                        <button
                          key={f}
                          onClick={() => selectFormat(f)}
                          className={`rounded-md px-4 py-1.5 font-medium uppercase transition-colors ${
                            format === f ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-white"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    {format === "webp" && (
                      <p className="mt-1.5 text-[11px] text-emerald-400">Best for web — smallest files, wide support</p>
                    )}
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Resize (longer edge)
                    </p>
                    <select
                      value={maxDimension}
                      onChange={(e) => setMaxDimension(parseInt(e.target.value, 10))}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {RESIZE_PRESETS.map((p) => (
                        <option key={p.value} value={p.value} className="bg-slate-900">
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {format !== "png" && (
                    <div className="min-w-[180px] flex-1">
                      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-semibold uppercase tracking-widest">Quality</span>
                        <span className="font-mono">{Math.round(quality * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0.1}
                        max={1}
                        step={0.05}
                        value={quality}
                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                        className="w-full accent-primary"
                      />
                    </div>
                  )}

                  <div className="ml-auto flex flex-wrap gap-2">
                    <button
                      onClick={convertAll}
                      disabled={converting}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                      {converting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                      Convert All
                    </button>
                    <button
                      onClick={downloadAll}
                      disabled={doneCount === 0}
                      className="inline-flex items-center gap-2 rounded-full bg-white/5 px-5 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-white/10 disabled:opacity-40"
                    >
                      <Download className="h-4 w-4" />
                      Download All ({doneCount})
                    </button>
                    <button
                      onClick={clearAll}
                      className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-5 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear
                    </button>
                  </div>
                </div>

                {doneCount > 0 && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
                    <Gauge className="h-4 w-4 shrink-0" />
                    <span>
                      {formatBytes(totalOriginal)} → {formatBytes(totalConverted)}
                      {totalSavedPct > 0 && (
                        <span className="ml-1 font-semibold">({totalSavedPct}% smaller)</span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* File list */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-3"
                  >
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-gray-300 hover:bg-black/80 hover:text-white transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div
                      className="mb-3 flex h-32 items-center justify-center rounded-xl overflow-hidden"
                      style={{
                        backgroundImage:
                          "linear-gradient(45deg, rgba(255,255,255,0.06) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.06) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.06) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.06) 75%)",
                        backgroundSize: "16px 16px",
                        backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                        backgroundColor: "#0b0d14",
                      }}
                    >
                      <img src={item.previewUrl} alt={item.file.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <p className="truncate text-sm font-medium text-white" title={item.file.name}>
                      {item.file.name}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {formatBytes(item.file.size)}
                        {item.status === "done" && item.resultBlob && (
                          <>
                            {" "}
                            → {formatBytes(item.resultBlob.size)}
                            {item.resultBlob.size < item.file.size && (
                              <span className="ml-1 text-emerald-400">
                                (-{Math.round((1 - item.resultBlob.size / item.file.size) * 100)}%)
                              </span>
                            )}
                          </>
                        )}
                      </span>
                      {item.status === "converting" && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
                      {item.status === "done" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                      {item.status === "error" && <AlertCircle className="h-3.5 w-3.5 text-red-400" />}
                    </div>
                    {item.status === "error" && (
                      <p className="mt-1 text-xs text-red-400">{item.errorMessage}</p>
                    )}
                    {item.status === "done" && (
                      <button
                        onClick={() => downloadItem(item)}
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200 hover:bg-white/10 transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download .{FORMAT_EXTENSION[format]}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <MultiUploadDropzone onFilesSelected={handleFilesSelected} compact />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
