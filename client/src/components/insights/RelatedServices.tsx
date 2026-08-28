import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import type { InsightsArticle } from "@/lib/insights/types";
import { relatedServices } from "@/lib/insights/internalLinks";
import { trackCtaClick } from "@/lib/insights/analytics";

/**
 * Natural internal linking: one small block pointing to the CodePlay
 * service most relevant to the article's topic. Understated — a labelled
 * "From CodePlay Studios" aside, not an ad.
 */
export default function RelatedServices({
  article,
}: {
  article: InsightsArticle;
}) {
  const services = relatedServices(article, 2);
  if (services.length === 0) return null;

  return (
    <aside className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-[0.7rem] font-mono uppercase tracking-[0.3em] text-primary">
        From CodePlay Studios
      </p>
      <ul className="mt-3 space-y-2.5">
        {services.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              onClick={() => trackCtaClick("related_services", s.href)}
              className="group flex items-start gap-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>
                <span className="font-semibold text-foreground group-hover:text-primary group-hover:underline">
                  {s.label}
                </span>
                <span className="ml-2 text-muted-foreground">{s.blurb}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
