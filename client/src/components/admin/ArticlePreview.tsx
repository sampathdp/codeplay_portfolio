import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { renderArticleBody } from "@/lib/insights/markdown";
import { categoryName } from "@/lib/insights/feed";

export interface PreviewData {
  title: string;
  subtitle: string;
  category: string; // slug
  content: string; // markdown
  imageUrl?: string | null;
  imageAlt?: string | null;
  keyTakeaways?: string[];
  aiGenerated?: boolean;
}

export default function ArticlePreview({ data }: { data: PreviewData }) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const { html } = renderArticleBody(data.content || "");

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={() => setDevice("desktop")}
          aria-pressed={device === "desktop"}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
            device === "desktop" ? "bg-primary/15 text-primary" : "bg-white/5 text-muted-foreground"
          }`}
        >
          <Monitor className="h-3.5 w-3.5" /> Desktop
        </button>
        <button
          onClick={() => setDevice("mobile")}
          aria-pressed={device === "mobile"}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
            device === "mobile" ? "bg-primary/15 text-primary" : "bg-white/5 text-muted-foreground"
          }`}
        >
          <Smartphone className="h-3.5 w-3.5" /> Mobile
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-background">
        <div
          className={`mx-auto overflow-y-auto p-6 ${
            device === "mobile" ? "max-w-[390px]" : "max-w-[720px]"
          }`}
          style={{ maxHeight: "70vh" }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {categoryName(data.category)}
          </p>
          <h1 className="mt-2 text-2xl font-bold leading-tight md:text-3xl">
            {data.title || "Untitled"}
          </h1>
          {data.subtitle && (
            <p className="mt-3 text-base text-muted-foreground">{data.subtitle}</p>
          )}

          {data.imageUrl && (
            <figure className="mt-5 overflow-hidden rounded-xl border border-white/10">
              <img
                src={data.imageUrl}
                alt={data.imageAlt || ""}
                className="aspect-video w-full object-cover"
              />
              {data.aiGenerated && (
                <figcaption className="bg-black/30 px-3 py-1.5 text-xs text-muted-foreground">
                  AI-generated editorial illustration
                </figcaption>
              )}
            </figure>
          )}

          {data.keyTakeaways && data.keyTakeaways.length > 0 && (
            <aside className="my-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="mb-2 text-[0.7rem] font-mono uppercase tracking-[0.3em] text-primary">
                Key Takeaways
              </p>
              <ul className="list-disc space-y-1 pl-4 text-sm">
                {data.keyTakeaways.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </aside>
          )}

          <div
            className="insights-prose prose prose-invert prose-sm mt-6 max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
