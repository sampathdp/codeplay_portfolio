import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Download, Loader2, RotateCcw, Sparkles, AlertCircle, ShieldCheck } from "lucide-react";
import { UploadDropzone } from "@/components/tools/UploadDropzone";
import { RegionSelector } from "@/components/tools/RegionSelector";
import SEO from "@/components/SEO";
import { inpaint } from "@/lib/toolsApi";
import { regionToMaskBlob } from "@/lib/regionMask";
import type { Region } from "@/lib/region";

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

function cornerRegion(corner: Corner, naturalW: number, naturalH: number): Region {
  const size = Math.round(Math.min(naturalW, naturalH) * 0.18);
  const margin = Math.round(Math.min(naturalW, naturalH) * 0.03);
  const x = corner.endsWith("right") ? naturalW - size - margin : margin;
  const y = corner.startsWith("bottom") ? naturalH - size - margin : margin;
  return { x, y, w: size, h: size };
}

const DEFAULT_REPAIR_RADIUS = 8;

export default function ImageWatermarkTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);
  const [region, setRegion] = useState<Region>({ x: 0, y: 0, w: 100, h: 100 });
  const [radius, setRadius] = useState(DEFAULT_REPAIR_RADIUS);

  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFileSelected(f: File) {
    setError(null);
    setResultUrl(null);
    setFile(f);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      setPreviewUrl(url);
      setNaturalW(img.naturalWidth);
      setNaturalH(img.naturalHeight);
      setRegion(cornerRegion("bottom-right", img.naturalWidth, img.naturalHeight));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError("Couldn't read this image - unsupported or corrupt file");
      setFile(null);
    };
    img.src = url;
  }

  async function handleProcess() {
    if (!file || !naturalW || !naturalH) return;
    setProcessing(true);
    setError(null);
    try {
      const mask = await regionToMaskBlob(region, naturalW, naturalH);
      const blob = await inpaint(file, mask, radius);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Removal failed");
    } finally {
      setProcessing(false);
    }
  }

  function handleDownload() {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${(file?.name || "image").replace(/\.[^/.]+$/, "")}-cleaned.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleStartOver() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setError(null);
  }

  const corners: { key: Corner; label: string }[] = [
    { key: "top-left", label: "Top-left" },
    { key: "top-right", label: "Top-right" },
    { key: "bottom-left", label: "Bottom-left" },
    { key: "bottom-right", label: "Bottom-right" },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <SEO
        title="Image Watermark Remover"
        description="Mark the Gemini icon or any watermark on an image and remove it with lossless, content-aware repair - full original resolution, no quality loss."
        keywords="remove gemini watermark, image watermark remover, remove ai watermark, lossless watermark removal, CodePlay Studios tools"
      />

      <header className="flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-xl px-6 py-3">
        <div className="flex items-center gap-4">
          <Link href="/tools" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Tools
          </Link>
          <div className="h-5 w-px bg-white/10" />
          <h1 className="text-base font-semibold text-white">Image Watermark Remover</h1>
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
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button className="ml-3 underline" onClick={() => setError(null)}>
            dismiss
          </button>
        </div>
      )}

      <div className="flex-1 p-4 sm:p-6">
        <div className="mx-auto max-w-5xl">
          {!file ? (
            <div className="h-96">
              <UploadDropzone onFileSelected={handleFileSelected} />
            </div>
          ) : resultUrl ? (
            <div className="space-y-4">
              <div
                className="mx-auto flex max-h-[60vh] items-center justify-center rounded-2xl border border-white/10 p-4 overflow-hidden"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, rgba(255,255,255,0.06) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.06) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.06) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.06) 75%)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                  backgroundColor: "#0b0d14",
                }}
              >
                <img src={resultUrl} alt="Cleaned result" className="max-h-[56vh] max-w-full object-contain" />
              </div>
              <p className="text-center text-xs text-muted-foreground">
                {naturalW}×{naturalH}px - same as the original, lossless PNG ({(resultSize / 1024).toFixed(0)} KB)
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Download className="h-4 w-4" />
                  Download PNG
                </button>
                <button
                  onClick={handleStartOver}
                  className="inline-flex items-center gap-2 rounded-full bg-white/5 px-6 py-2.5 text-sm font-medium text-gray-200 transition-colors hover:bg-white/10"
                >
                  <RotateCcw className="h-4 w-4" />
                  Process another
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-[50vh] min-h-[320px]">
                {previewUrl && (
                  <RegionSelector
                    imageUrl={previewUrl}
                    naturalWidth={naturalW}
                    naturalHeight={naturalH}
                    region={region}
                    onRegionChange={setRegion}
                  />
                )}
              </div>
              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Drag the box over the icon, resize with the corner handle — {naturalW}×{naturalH}px. Only the marked
                area is touched; everything else stays pixel-identical, output is lossless PNG at full resolution.
              </p>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Snap to corner
                    </p>
                    <div className="flex flex-wrap gap-1 rounded-lg bg-white/5 p-1 text-xs">
                      {corners.map((c) => (
                        <button
                          key={c.key}
                          onClick={() => setRegion(cornerRegion(c.key, naturalW, naturalH))}
                          className="rounded-md px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="min-w-[180px] flex-1">
                    <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-semibold uppercase tracking-widest">Repair strength</span>
                      <span className="font-mono">{radius}</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={40}
                      step={1}
                      value={radius}
                      onChange={(e) => setRadius(parseInt(e.target.value, 10))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="ml-auto">
                    <button
                      onClick={handleProcess}
                      disabled={processing}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                      {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {processing ? "Removing…" : "Remove Icon"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
