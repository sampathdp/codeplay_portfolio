import { useCallback, useRef, useState } from "react";
import { ImagePlus, UploadCloud } from "lucide-react";

interface MultiUploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  compact?: boolean;
}

export function MultiUploadDropzone({ onFilesSelected, compact }: MultiUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      onFilesSelected(Array.from(files).filter((f) => f.type.startsWith("image/")));
    },
    [onFilesSelected]
  );

  return (
    <div
      className={`flex w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-colors ${
        compact ? "py-8" : "h-full py-20"
      } ${dragOver ? "border-primary bg-primary/10" : "border-white/10 bg-white/[0.02]"}`}
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
      <p className="mb-1 text-lg font-medium text-white">
        {compact ? "Drop more images to add them" : "Drop images here"}
      </p>
      <p className="mb-6 text-sm text-muted-foreground">PNG, JPG, WebP, GIF, or BMP — convert as many as you like</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
      >
        <UploadCloud className="h-4 w-4" />
        Choose files
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
