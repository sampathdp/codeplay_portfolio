import { Clock } from "lucide-react";
import { formatDate } from "@/lib/insights/feed";

interface Props {
  publishedAt: string;
  readingMinutes: number;
  author?: string;
  className?: string;
}

/** Compact date · reading-time (· author) line for cards. */
export default function ArticleMetaLine({
  publishedAt,
  readingMinutes,
  author,
  className = "",
}: Props) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground ${className}`}
    >
      <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
      <span aria-hidden="true">·</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3" aria-hidden="true" />
        {readingMinutes} min read
      </span>
      {author && (
        <>
          <span aria-hidden="true">·</span>
          <span className="truncate">{author}</span>
        </>
      )}
    </div>
  );
}
