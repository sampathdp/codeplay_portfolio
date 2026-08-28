import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { categoryName } from "@/lib/insights/feed";
import { insightsCategoryPath } from "@/lib/insights/routes";

interface Props {
  category: string;
  /** Overlay style for use on top of an image. */
  overlay?: boolean;
  asLink?: boolean;
  className?: string;
}

export default function CategoryBadge({
  category,
  overlay = false,
  asLink = false,
  className = "",
}: Props) {
  const label = categoryName(category);
  const badge = (
    <Badge
      className={`${
        overlay
          ? "bg-white/15 text-white border-white/20 backdrop-blur-md"
          : "bg-primary/15 text-primary border-primary/20"
      } font-semibold uppercase tracking-wide text-[0.65rem] ${className}`}
    >
      {label}
    </Badge>
  );

  if (!asLink) return badge;
  return (
    <Link
      href={insightsCategoryPath(category)}
      className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`Browse ${label}`}
    >
      {badge}
    </Link>
  );
}
