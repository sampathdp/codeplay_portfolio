import { Link } from "wouter";
import { insightsRoutes, insightsCategoryPath } from "@/lib/insights/routes";
import { categoryShort } from "@/lib/insights/visuals";
import { nonEmptyCategories } from "@/lib/insights/feed";

/** Preferred order for the top category bar. */
const PRIORITY = [
  "artificial-intelligence",
  "software-development",
  "web-development",
  "gaming",
  "game-development",
  "cybersecurity",
  "cloud-and-devops",
  "hardware-and-gpus",
  "startups",
];

interface Props {
  activeSlug?: string;
  /** When true, only categories that currently have articles are shown. */
  onlyNonEmpty?: boolean;
}

export default function CategoryNav({ activeSlug, onlyNonEmpty = true }: Props) {
  const available = new Set(nonEmptyCategories().map((c) => c.slug));
  const slugs = onlyNonEmpty
    ? PRIORITY.filter((s) => available.has(s))
    : PRIORITY;

  return (
    <nav
      aria-label="Insights categories"
      className="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <CatLink href={insightsRoutes.home} label="All" active={!activeSlug} />
      {slugs.map((slug) => (
        <CatLink
          key={slug}
          href={insightsCategoryPath(slug)}
          label={categoryShort(slug)}
          active={activeSlug === slug}
        />
      ))}
    </nav>
  );
}

function CatLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        active
          ? "border-primary/40 bg-primary/15 text-primary"
          : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}
