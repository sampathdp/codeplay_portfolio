import { categoryGradient } from "@/lib/insights/visuals";
import type { ArticleImage as ArticleImageData } from "@/lib/insights/types";

interface Props {
  image?: ArticleImageData;
  category: string;
  /** e.g. "(min-width: 1024px) 640px, 100vw" */
  sizes?: string;
  className?: string;
  priority?: boolean;
}

/**
 * Responsive article image with a branded gradient fallback. Explicit
 * dimensions + `aspect-video` keep layout stable (CLS). Decorative
 * fallback is `aria-hidden`.
 */
export default function ArticleImage({
  image,
  category,
  sizes = "100vw",
  className = "",
  priority = false,
}: Props) {
  if (!image?.src) {
    return (
      <div
        aria-hidden="true"
        className={`aspect-video w-full bg-gradient-to-br ${categoryGradient(
          category,
        )} bg-black/30 ${className}`}
      />
    );
  }

  const srcSet = image.variants
    ?.filter((v) => v.label.startsWith("w") || v.label === "primary")
    .map((v) => `${v.url} ${v.width}w`)
    .join(", ");

  return (
    <img
      src={image.src}
      srcSet={srcSet || undefined}
      sizes={srcSet ? sizes : undefined}
      alt={image.alt || ""}
      width={image.width}
      height={image.height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`aspect-video w-full object-cover ${className}`}
    />
  );
}
