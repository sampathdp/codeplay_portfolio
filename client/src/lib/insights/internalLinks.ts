/**
 * Natural internal linking: given an article's category, entities and tags,
 * suggest the most relevant CodePlay Studios service page(s).
 *
 * The goal is helpfulness, not link stuffing — `relatedServices()` returns
 * at most two suggestions, and only when the match is reasonably strong.
 */

import type { InsightsArticle, InsightsArticleSummary } from "./types";

export interface ServiceLink {
  href: string;
  label: string;
  /** One-line reason this service is relevant to the article. */
  blurb: string;
}

const SERVICES: Record<string, ServiceLink> = {
  web: {
    href: "/web-development",
    label: "Web Development",
    blurb: "CodePlay Studios builds production web apps and platforms.",
  },
  mobile: {
    href: "/mobile-development",
    label: "Mobile App Development",
    blurb: "CodePlay Studios ships native and cross-platform mobile apps.",
  },
  ai: {
    href: "/ai-development",
    label: "AI Software Development",
    blurb: "CodePlay Studios integrates AI into real products, not demos.",
  },
  game: {
    href: "/unity-game-development",
    label: "Game Development",
    blurb: "CodePlay Studios develops games and interactive experiences.",
  },
  erp: {
    href: "/erp-systems",
    label: "ERP & Business Systems",
    blurb: "CodePlay Studios builds internal systems that scale with the business.",
  },
  contact: {
    href: "/contact",
    label: "Talk to CodePlay Studios",
    blurb: "Tell us about the project — we scope and build custom software.",
  },
};

/** Category slug → ordered service keys (strongest first). */
const CATEGORY_SERVICES: Record<string, string[]> = {
  "artificial-intelligence": ["ai"],
  "software-development": ["web", "erp"],
  "web-development": ["web"],
  "mobile-development": ["mobile"],
  "game-development": ["game"],
  gaming: ["game"],
  "gaming-community": ["game"],
  cybersecurity: ["contact"],
  "cloud-and-devops": ["erp", "web"],
  "developer-tools": ["web", "ai"],
  "hardware-and-gpus": ["contact"],
  startups: ["web", "mobile"],
  saas: ["web", "erp"],
  "big-tech": ["contact"],
  "open-source": ["web"],
  "emerging-technology": ["ai", "contact"],
};

/** Entity / tag keyword → service key. Checked against lowercased text. */
const KEYWORD_SERVICES: Array<[RegExp, string]> = [
  [/\b(flutter|react native|swift|kotlin|android|ios|expo)\b/, "mobile"],
  [/\b(unity|unreal|godot|game engine|gamedev|game dev)\b/, "game"],
  [/\b(next\.?js|react|vue|svelte|angular|astro|web ?assembly|wasm)\b/, "web"],
  [/\b(openai|anthropic|gemini|llm|rag|langchain|ml model|machine learning|agent)\b/, "ai"],
  [/\b(erp|crm|inventory|logistics|enterprise|back ?office|workflow automation)\b/, "erp"],
];

function textOf(article: InsightsArticle | InsightsArticleSummary): string {
  const parts: string[] = [
    ...(article.entities ?? []),
    ...article.tags.map((t) => t.name),
  ];
  if ("dek" in article && article.dek) parts.push(article.dek);
  if ("title" in article && article.title) parts.push(article.title);
  return parts.join(" ").toLowerCase();
}

export function relatedServices(
  article: InsightsArticle | InsightsArticleSummary,
  limit = 2,
): ServiceLink[] {
  const keys: string[] = [];
  const push = (k?: string) => {
    if (k && !keys.includes(k)) keys.push(k);
  };

  const text = textOf(article);
  for (const [re, key] of KEYWORD_SERVICES) {
    if (re.test(text)) push(key);
  }
  for (const key of CATEGORY_SERVICES[article.category] ?? []) push(key);
  push("contact"); // always a safe fallback so the section is never empty

  return keys
    .slice(0, Math.max(1, limit))
    .map((k) => SERVICES[k])
    .filter(Boolean);
}
