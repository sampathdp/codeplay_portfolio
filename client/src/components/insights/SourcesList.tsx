import { ExternalLink } from "lucide-react";
import type { ArticleSourceRef } from "@/lib/insights/types";
import { trackSourceClick } from "@/lib/insights/analytics";

function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function SourcesList({
  sources,
  slug = "",
}: {
  sources: ArticleSourceRef[];
  slug?: string;
}) {
  if (!sources || sources.length === 0) return null;

  const ordered = [...sources].sort(
    (a, b) => Number(b.role === "primary") - Number(a.role === "primary"),
  );

  return (
    <section aria-labelledby="sources-heading" className="mt-14 border-t border-white/10 pt-8">
      <h2 id="sources-heading" className="text-lg font-bold">
        Sources &amp; Further Reading
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        CodePlay Insights references primary sources. Original reporting and
        announcements belong to their publishers.
      </p>
      <ul className="mt-5 space-y-3">
        {ordered.map((s, i) => (
          <li key={`${s.url}-${i}`}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              onClick={() => trackSourceClick(slug, s.url)}
              className="group flex items-start gap-2 rounded text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ExternalLink
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <span>
                <span className="font-medium underline-offset-2 group-hover:text-primary group-hover:underline">
                  {s.title}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {s.publisher || hostOf(s.url)}
                  {s.role === "primary" && " · primary source"}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
