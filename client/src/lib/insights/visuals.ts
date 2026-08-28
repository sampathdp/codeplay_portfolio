/**
 * Per-category visual accents for the Insights UI, kept on-brand with the
 * CodePlay Studios palette (cyan primary, dark surfaces).
 */

/** Tailwind gradient classes for a card's image-fallback area. */
export const CATEGORY_GRADIENT: Record<string, string> = {
  "artificial-intelligence": "from-indigo-500/25 via-violet-500/10 to-transparent",
  "software-development": "from-sky-500/25 via-cyan-500/10 to-transparent",
  "web-development": "from-cyan-500/25 via-teal-500/10 to-transparent",
  "mobile-development": "from-emerald-500/25 via-teal-500/10 to-transparent",
  "game-development": "from-violet-500/25 via-fuchsia-500/10 to-transparent",
  gaming: "from-fuchsia-500/25 via-pink-500/10 to-transparent",
  "gaming-community": "from-rose-500/25 via-pink-500/10 to-transparent",
  cybersecurity: "from-teal-500/25 via-emerald-500/10 to-transparent",
  "cloud-and-devops": "from-blue-500/25 via-sky-500/10 to-transparent",
  "developer-tools": "from-amber-500/25 via-yellow-500/10 to-transparent",
  "hardware-and-gpus": "from-orange-500/25 via-amber-500/10 to-transparent",
  startups: "from-green-500/25 via-emerald-500/10 to-transparent",
  saas: "from-sky-500/25 via-blue-500/10 to-transparent",
  "big-tech": "from-slate-400/25 via-slate-500/10 to-transparent",
  "open-source": "from-lime-500/25 via-green-500/10 to-transparent",
  "emerging-technology": "from-purple-500/25 via-violet-500/10 to-transparent",
};

export function categoryGradient(slug: string): string {
  return CATEGORY_GRADIENT[slug] ?? "from-primary/20 via-primary/5 to-transparent";
}

/** Short nav label per category (for the compact category bar). */
export const CATEGORY_SHORT: Record<string, string> = {
  "artificial-intelligence": "AI",
  "software-development": "Development",
  "web-development": "Web",
  "mobile-development": "Mobile",
  "game-development": "Game Dev",
  gaming: "Gaming",
  "gaming-community": "Community",
  cybersecurity: "Cybersecurity",
  "cloud-and-devops": "Cloud",
  "developer-tools": "Dev Tools",
  "hardware-and-gpus": "Hardware",
  startups: "Startups",
  saas: "SaaS",
  "big-tech": "Big Tech",
  "open-source": "Open Source",
  "emerging-technology": "Emerging Tech",
};

export function categoryShort(slug: string): string {
  return CATEGORY_SHORT[slug] ?? slug.replace(/-/g, " ");
}

/** Category-aware business CTA copy → links to the existing contact route. */
export function businessCtaCopy(categorySlug: string): { hook: string } {
  switch (categorySlug) {
    case "artificial-intelligence":
      return { hook: "Building an AI product?" };
    case "mobile-development":
      return { hook: "Need a mobile application?" };
    case "game-development":
    case "gaming":
    case "gaming-community":
      return { hook: "Planning a game?" };
    case "web-development":
    case "saas":
      return { hook: "Need a web platform?" };
    case "cybersecurity":
      return { hook: "Need a security review of your stack?" };
    case "cloud-and-devops":
      return { hook: "Scaling your infrastructure?" };
    case "startups":
      return { hook: "Turning an idea into a product?" };
    default:
      return { hook: "Have a software project in mind?" };
  }
}
