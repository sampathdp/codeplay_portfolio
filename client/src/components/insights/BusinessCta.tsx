import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { businessCtaCopy } from "@/lib/insights/visuals";
import { trackCtaClick } from "@/lib/insights/analytics";

/**
 * Subtle, category-aware lead-gen prompt inside an article. Deliberately
 * understated — a single line + link, not an advert block. Links to the
 * existing contact route.
 */
export default function BusinessCta({ categorySlug }: { categorySlug: string }) {
  const { hook } = businessCtaCopy(categorySlug);
  return (
    <aside className="my-10 flex flex-col gap-2 rounded-2xl border border-primary/20 bg-primary/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium">
        {hook}{" "}
        <span className="text-muted-foreground">
          CodePlay Studios builds production software and games.
        </span>
      </p>
      <Link
        href="/contact"
        onClick={() => trackCtaClick("in_article", "/contact")}
        className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
      >
        Talk to CodePlay Studios
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </aside>
  );
}
