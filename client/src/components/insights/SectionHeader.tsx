import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

interface Props {
  title: string;
  eyebrow?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  as?: "h2" | "h3";
  id?: string;
}

export default function SectionHeader({
  title,
  eyebrow,
  viewAllHref,
  viewAllLabel = "View all",
  as: Tag = "h2",
  id,
}: Props) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-[0.7rem] font-mono uppercase tracking-[0.3em] text-primary">
            {eyebrow}
          </p>
        )}
        <Tag id={id} className="text-2xl font-bold tracking-tight md:text-3xl">
          {title}
        </Tag>
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="group inline-flex shrink-0 items-center gap-1 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {viewAllLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
