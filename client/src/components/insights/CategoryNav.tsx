import { Link } from "wouter";
import { LayoutGrid, type LucideIcon } from "lucide-react";
import { insightsRoutes, insightsCategoryPath } from "@/lib/insights/routes";
import { categoryShort, categoryIcon } from "@/lib/insights/visuals";
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
      className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <CatLink href={insightsRoutes.home} label="All" active={!activeSlug} icon={LayoutGrid} />
      {slugs.map((slug) => (
        <CatLink
          key={slug}
          href={insightsCategoryPath(slug)}
          label={categoryShort(slug)}
          active={activeSlug === slug}
          icon={categoryIcon(slug)}
        />
      ))}
    </nav>
  );
}

function CatLink({
  href,
  label,
  active,
  icon: Icon,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        active
          ? "border-transparent bg-primary text-primary-foreground shadow-md shadow-primary/25"
          : "border-white/10 bg-white/[0.04] text-muted-foreground hover:border-white/20 hover:bg-white/[0.08] hover:text-foreground"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}
