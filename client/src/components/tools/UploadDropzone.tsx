import { useCallback, useRef, useState } from "react";
import { ImagePlus, UploadCloud } from "lucide-react";

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
}

export function UploadDropzone({ onFileSelected }: UploadDropzoneProps) {
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
        <ImagePlus className="h-8 w-8 text-primary" />
      </div>
      <p className="mb-1 text-lg font-medium text-white">Drop a sprite sheet or image here</p>
      <p className="mb-6 text-sm text-muted-foreground">PNG, JPG, or WebP — any size sprite sheet works</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
      >
        <UploadCloud className="h-4 w-4" />
        Choose a file
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
