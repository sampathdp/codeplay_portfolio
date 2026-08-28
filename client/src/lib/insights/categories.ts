/**
 * The 16 canonical CodePlay Insights content categories.
 *
 * This is the single source of truth for category slugs/names used by
 * public pages, the admin panel, ranking, and the future Supabase
 * `categories` table seed. Keep `slug` values URL-stable — they appear in
 * `/insights/category/[slug]`.
 */

export interface InsightsCategory {
  slug: string;
  name: string;
  description: string;
}

export const INSIGHTS_CATEGORIES: readonly InsightsCategory[] = [
  {
    slug: "artificial-intelligence",
    name: "Artificial Intelligence",
    description:
      "Models, research, tooling, and the practical impact of AI on how software is built and used.",
  },
  {
    slug: "software-development",
    name: "Software Development",
    description:
      "Languages, frameworks, architecture, engineering practice, and the craft of shipping software.",
  },
  {
    slug: "web-development",
    name: "Web Development",
    description:
      "Browsers, frontend frameworks, web platform APIs, performance, and full-stack web work.",
  },
  {
    slug: "mobile-development",
    name: "Mobile Development",
    description:
      "iOS, Android, cross-platform toolkits, app-store shifts, and mobile product engineering.",
  },
  {
    slug: "game-development",
    name: "Game Development",
    description:
      "Engines, graphics, tooling, studios, and the technical side of making games.",
  },
  {
    slug: "gaming",
    name: "Gaming",
    description:
      "Releases, hardware, platforms, and the business of the games industry.",
  },
  {
    slug: "gaming-community",
    name: "Gaming Community",
    description:
      "Player culture, modding, esports, creators, and community-driven moments.",
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity",
    description:
      "Vulnerabilities, breaches, defensive practice, and security's effect on developers.",
  },
  {
    slug: "cloud-and-devops",
    name: "Cloud & DevOps",
    description:
      "Cloud platforms, infrastructure, CI/CD, observability, and operating software at scale.",
  },
  {
    slug: "developer-tools",
    name: "Developer Tools",
    description:
      "Editors, CLIs, package ecosystems, AI coding assistants, and the everyday developer toolchain.",
  },
  {
    slug: "hardware-and-gpus",
    name: "Hardware & GPUs",
    description:
      "Chips, GPUs, accelerators, devices, and the hardware layer under modern software.",
  },
  {
    slug: "startups",
    name: "Startups",
    description:
      "Founders, funding, product launches, and lessons from early-stage technology companies.",
  },
  {
    slug: "saas",
    name: "SaaS",
    description:
      "Software-as-a-service products, pricing, growth, and the economics of subscription software.",
  },
  {
    slug: "big-tech",
    name: "Big Tech",
    description:
      "Strategy, regulation, and product moves from the largest technology companies.",
  },
  {
    slug: "open-source",
    name: "Open Source",
    description:
      "Projects, licensing, governance, funding, and the health of the open-source ecosystem.",
  },
  {
    slug: "emerging-technology",
    name: "Emerging Technology",
    description:
      "Early-stage and frontier technology — from robotics to novel computing — and why it matters.",
  },
] as const;

export type InsightsCategorySlug = (typeof INSIGHTS_CATEGORIES)[number]["slug"];

export const INSIGHTS_CATEGORY_SLUGS: readonly string[] =
  INSIGHTS_CATEGORIES.map((c) => c.slug);

export function getInsightsCategory(
  slug: string,
): InsightsCategory | undefined {
  return INSIGHTS_CATEGORIES.find((c) => c.slug === slug);
}
