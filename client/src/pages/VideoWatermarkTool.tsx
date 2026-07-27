import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Download,
  Loader2,
  RotateCcw,
  Sparkles,
  Image as ImageIcon,
  Eraser,
  AlertCircle,
} from "lucide-react";
import { VideoUploadDropzone } from "@/components/tools/VideoUploadDropzone";
import { VideoRegionSelector } from "@/components/tools/VideoRegionSelector";
import SEO from "@/components/SEO";
import { probeVideo, removeLogo, replaceLogo, type Region } from "@/lib/videoApi";

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

function cornerRegion(corner: Corner, naturalW: number, naturalH: number): Region {
  const size = Math.round(Math.min(naturalW, naturalH) * 0.18);
  const margin = Math.round(Math.min(naturalW, naturalH) * 0.03);
  const x = corner.endsWith("right") ? naturalW - size - margin : margin;
  const y = corner.startsWith("bottom") ? naturalH - size - margin : margin;
  return { x, y, w: size, h: size };
}

export default function VideoWatermarkTool() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [probing, setProbing] = useState(false);
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [videoW, setVideoW] = useState(0);
  const [videoH, setVideoH] = useState(0);
  const [duration, setDuration] = useState(0);
  const [region, setRegion] = useState<Region>({ x: 0, y: 0, w: 100, h: 100 });

  const [mode, setMode] = useState<"remove" | "replace">("remove");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (frameUrl) URL.revokeObjectURL(frameUrl);
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFileSelected(file: File) {
    setError(null);
    setResultUrl(null);
    setVideoFile(file);
    setProbing(true);
    try {
      const probeResult = await probeVideo(file);
      const url = URL.createObjectURL(probeResult.frameBlob);
      setFrameUrl(url);
      setVideoW(probeResult.width);
      setVideoH(probeResult.height);
      setDuration(probeResult.duration);
      setRegion(cornerRegion("bottom-right", probeResult.width, probeResult.height));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read this video");
      setVideoFile(null);
    } finally {
      setProbing(false);
    }
  }

  function handleLogoSelected(file: File | undefined) {
    if (!file) return;
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    setLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  }

  async function handleProcess() {
    if (!videoFile) return;
    if (mode === "replace" && !logoFile) {
      setError("Choose a logo image to replace the watermark with");
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const blob =
        mode === "remove" ? await removeLogo(videoFile, region) : await replaceLogo(videoFile, region, logoFile!);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video processing failed");
    } finally {
      setProcessing(false);
    }
  }

  function handleDownload() {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${(videoFile?.name || "video").replace(/\.[^/.]+$/, "")}-cleaned.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleStartOver() {
    if (frameUrl) URL.revokeObjectURL(frameUrl);
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setVideoFile(null);
    setFrameUrl(null);
    setLogoFile(null);
    setLogoPreviewUrl(null);
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
        title="Video Watermark Remover"
        description="Mark a watermark or AI-generation icon on a video and remove it or replace it with your own logo. Runs a single ffmpeg pass on the backend."
        keywords="video watermark remover, remove gemini watermark, remove ai watermark, video logo remover, CodePlay Studios tools"
      />

      <header className="flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-xl px-6 py-3">
        <div className="flex items-center gap-4">
          <Link href="/tools" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Tools
          </Link>
          <div className="h-5 w-px bg-white/10" />
          <h1 className="text-base font-semibold text-white">Video Watermark Remover</h1>
        </div>
        {videoFile && (
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
          {!videoFile ? (
            probing ? (
              <div className="flex h-96 flex-col items-center justify-center gap-3 rounded-3xl border border-white/10 bg-white/[0.02]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Reading video…</p>
              </div>
            ) : (
              <div className="h-96">
                <VideoUploadDropzone onFileSelected={handleFileSelected} />
              </div>
            )
          ) : resultUrl ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <video src={resultUrl} controls className="mx-auto max-h-[60vh] w-full rounded-xl bg-black" />
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Download className="h-4 w-4" />
                  Download MP4
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
                {frameUrl && (
                  <VideoRegionSelector
                    frameUrl={frameUrl}
                    naturalWidth={videoW}
                    naturalHeight={videoH}
                    region={region}
                    onRegionChange={setRegion}
                  />
                )}
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Drag the marked box over the watermark/icon, resize with the corner handle. It's applied to every
                frame — {videoW}×{videoH}px, {duration.toFixed(1)}s.
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
                          onClick={() => setRegion(cornerRegion(c.key, videoW, videoH))}
                          className="rounded-md px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Action</p>
                    <div className="flex gap-1 rounded-lg bg-white/5 p-1 text-sm">
                      <button
                        onClick={() => setMode("remove")}
                        className={`inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 font-medium transition-colors ${
                          mode === "remove" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-white"
                        }`}
                      >
                        <Eraser className="h-3.5 w-3.5" />
                        Remove
                      </button>
                      <button
                        onClick={() => setMode("replace")}
                        className={`inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 font-medium transition-colors ${
                          mode === "replace" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-white"
                        }`}
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        Replace with logo
                      </button>
                    </div>
                  </div>

                  {mode === "replace" && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Logo</p>
                      <div className="flex items-center gap-2">
                        {logoPreviewUrl && (
                          <img
                            src={logoPreviewUrl}
                            alt="Logo preview"
                            className="h-9 w-9 rounded-md border border-white/10 object-contain bg-white/5"
                          />
                        )}
                        <button
                          onClick={() => logoInputRef.current?.click()}
                          className="rounded-lg bg-white/5 px-4 py-1.5 text-sm font-medium text-gray-200 hover:bg-white/10 transition-colors"
                        >
                          {logoFile ? "Change logo" : "Choose logo image"}
                        </button>
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/png,image/webp,image/jpeg"
                          className="hidden"
                          onChange={(e) => handleLogoSelected(e.target.files?.[0])}
                        />
                      </div>
                    </div>
                  )}

                  <div className="ml-auto">
                    <button
                      onClick={handleProcess}
                      disabled={processing}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                      {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {processing ? "Processing…" : "Process Video"}
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Runs a single ffmpeg pass on the backend — usually close to real-time, longer for high-resolution
                  or long clips.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
