import { Link } from "wouter";
import { Newspaper } from "lucide-react";
import { INSIGHTS_BASE } from "@/lib/insights/routes";

interface Props {
  title?: string;
  message?: string;
  showBack?: boolean;
}

export default function EmptyState({
  title = "Nothing here yet",
  message = "New CodePlay Insights articles are on the way. Check back shortly.",
  showBack = false,
}: Props) {
  return (
    <div className="glass mx-auto max-w-xl rounded-3xl border border-white/10 px-8 py-14 text-center">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Newspaper className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="text-lg font-semibold">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      {showBack && (
        <Link
          href={INSIGHTS_BASE}
          className="mt-6 inline-block rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Back to Insights
        </Link>
      )}
    </div>
  );
}
