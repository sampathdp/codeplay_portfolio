import { useCallback, useRef, useState } from "react";
import { FileVideo, UploadCloud } from "lucide-react";

interface VideoUploadDropzoneProps {
  onFileSelected: (file: File) => void;
}

export function VideoUploadDropzone({ onFileSelected }: VideoUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-colors ${
        dragOver ? "border-primary bg-primary/10" : "border-white/10 bg-white/[0.02]"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
        <FileVideo className="h-8 w-8 text-primary" />
      </div>
      <p className="mb-1 text-lg font-medium text-white">Drop a video here</p>
      <p className="mb-6 text-sm text-muted-foreground">MP4, WebM, or MOV — up to 10 minutes</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
      >
        <UploadCloud className="h-4 w-4" />
        Choose a video
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
