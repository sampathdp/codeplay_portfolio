import {
  categoryGradient,
  categoryIcon,
  categoryTint,
  categoryShort,
} from "@/lib/insights/visuals";
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
    const Icon = categoryIcon(category);
    return (
      <div
        aria-hidden="true"
        className={`relative flex aspect-video w-full items-center justify-center overflow-hidden bg-gradient-to-br ${categoryGradient(
          category,
        )} bg-neutral-900 ${className}`}
      >
        {/* ambient glow */}
        <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -right-6 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
        {/* dot-grid texture */}
        <div className="absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1px)] bg-[length:18px_18px] text-white opacity-[0.08]" />
        <Icon
          className={`relative h-9 w-9 ${categoryTint(category)} opacity-80 sm:h-11 sm:w-11`}
          strokeWidth={1.5}
        />
        <span className="absolute bottom-2.5 left-3 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/40">
          {categoryShort(category)}
        </span>
      </div>
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
