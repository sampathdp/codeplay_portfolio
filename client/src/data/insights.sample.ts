/**
 * TEST FIXTURE ONLY.
 *
 * This dataset is imported exclusively by `feed.test.ts` (via
 * `__setFeedArticlesForTests`). No application code imports it, so it is
 * never bundled and never rendered — in dev or in production. The public
 * site shows only real published articles from `insights.generated.ts`.
 *
 * Not auto-generated — safe to edit.
 */

import type { InsightsArticle } from "@/lib/insights/types";

/** A small on-brand gradient SVG as a data URI (no text, 16:9). */
function heroSvg(a: string, b: string, accent: string, seed: number): string {
  const cx = 1120 + ((seed * 137) % 240);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
<radialGradient id="r" cx="0.72" cy="0.32" r="0.6"><stop offset="0" stop-color="${accent}" stop-opacity="0.4"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient></defs>
<rect width="1600" height="900" fill="url(#g)"/><rect width="1600" height="900" fill="url(#r)"/>
<circle cx="${cx}" cy="320" r="240" fill="none" stroke="${accent}" stroke-opacity="0.5" stroke-width="3"/>
<circle cx="${cx}" cy="320" r="150" fill="${accent}" fill-opacity="0.12"/><circle cx="${cx}" cy="320" r="6" fill="${accent}"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const take = (topic: string) => ({
  developerTake: `From a development perspective, ${topic} is worth a controlled pilot before it touches production. The interesting part is not the headline capability but how it changes day-to-day workflow and review overhead.`,
  businessImpact: `For teams evaluating budgets, the near-term impact is incremental. Model the cost against current tooling spend rather than assuming a step change.`,
  developerImpact: `Developers gain a faster path for well-scoped tasks and take on new review responsibility for anything it produces automatically.`,
  technicalExplanation: `Under the hood this is an iterative loop: decompose the task, act, check the result, and repeat until a stopping condition is met.`,
  risksAndLimitations: `Independent benchmarks are limited, failure modes are quiet, and there is protocol lock-in to weigh.`,
  whyItMatters: `It shifts routine automation from bespoke scripts toward stated intent, which widens who can build internal tooling.`,
  actionableRecommendations: `Pilot on a low-risk repository, cap permissions, and compare review time against the manual baseline before rolling out.`,
});

const body = (heading: string) => `## What Happened?

A notable development landed this week and the reporting has settled enough to look at it properly. This section covers the confirmed facts and links the primary source.

## ${heading}

The change matters because it affects how teams plan the next quarter, not because of any single benchmark. Here is the practical read.

- The capability is real and shipping now.
- Pricing is published; independent numbers are still thin.
- The workflow impact is on multi-step automation, not one-off tasks.

## Technical Breakdown

At a high level the system exposes a planning loop that decomposes a goal, calls tools, checks the output, and iterates. That design is what makes it useful for chores and risky for ambiguous instructions.

## CodePlay Developer Take

From a development perspective, treat this as a capable assistant for bounded work rather than a replacement for design judgement. Sandbox it, measure it, then decide.

## CodePlay Verdict

A measured step forward. Worth evaluating on a real project this month; not worth reorganising a roadmap around yet.`;

const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * 86_400_000).toISOString();

export const SAMPLE_INSIGHTS_ARTICLES: InsightsArticle[] = [
  {
    id: "s1",
    slug: "acme-nimbus-3-agentic-coding-what-developers-need-to-know",
    status: "published",
    title: "Acme Nimbus 3 Adds Agentic Coding — What Developers Need to Know",
    dek: "The new model can plan and execute multi-step coding tasks. Here is what actually changes for engineering teams, and where the limits are.",
    category: "artificial-intelligence",
    tags: [
      { slug: "acme-ai", name: "Acme AI" },
      { slug: "ai-coding", name: "AI coding" },
      { slug: "developer-tools", name: "Developer tools" },
    ],
    body: body("What Changed?"),
    keyTakeaways: [
      "Nimbus 3 introduces an agentic mode that runs multi-step tasks.",
      "Pricing is published; independent benchmarks are not yet available.",
      "The practical value is in bounded automation, with added review overhead.",
    ],
    take: take("agentic coding"),
    sources: [
      { url: "https://openai.com/blog", title: "Official announcement", publisher: "Acme AI", role: "primary" },
      { url: "https://arstechnica.com", title: "Independent reporting on the launch", publisher: "Ars Technica", role: "supporting" },
    ],
    heroImage: {
      src: heroSvg("#0b1120", "#1e1b4b", "#818cf8", 1),
      alt: "Abstract illustration of a translucent branching planning structure over a dark studio void",
      width: 1600,
      height: 900,
      aiGenerated: true,
      kind: "generated",
    },
    author: "CodePlay Studios Editorial Team",
    authorRole: "Editorial Team",
    readingMinutes: 6,
    publishedAt: daysAgo(0.4),
    seo: {
      title: "Acme Nimbus 3 Adds Agentic Coding: Developer Guide",
      description:
        "Acme AI's Nimbus 3 introduces an agentic coding mode. What changes for engineering teams, plus the limitations to watch.",
      canonicalUrl:
        "https://codeplaystudios.com/insights/acme-nimbus-3-agentic-coding-what-developers-need-to-know",
    },
    articleType: "ai_news",
    featured: true,
    trending: true,
    trendingRank: 1,
    breaking: false,
    viewCount: 4200,
    entities: ["Acme AI", "Nimbus 3"],
  },
  {
    id: "s2",
    slug: "react-20-server-components-stable",
    status: "published",
    title: "React 20 Marks Server Components Stable",
    dek: "After two years of iteration, the React team is calling Server Components production-ready. What it means for existing apps.",
    category: "web-development",
    tags: [
      { slug: "react", name: "React" },
      { slug: "nextjs", name: "Next.js" },
    ],
    body: body("Why It Matters"),
    keyTakeaways: [
      "Server Components are now marked stable in React 20.",
      "Migration is incremental for most component trees.",
      "The main win is smaller client bundles for content-heavy pages.",
    ],
    take: take("stable Server Components"),
    sources: [
      { url: "https://react.dev/blog", title: "React 20 release post", publisher: "React", role: "primary" },
    ],
    author: "CodePlay Studios Editorial Team",
    readingMinutes: 7,
    publishedAt: daysAgo(1.2),
    seo: {
      title: "React 20 Marks Server Components Stable",
      description:
        "React 20 declares Server Components production-ready. Migration notes and the practical impact for existing apps.",
      canonicalUrl: "https://codeplaystudios.com/insights/react-20-server-components-stable",
    },
    articleType: "tech_analysis",
    trending: true,
    trendingRank: 2,
    viewCount: 3100,
    entities: ["React", "Next.js"],
  },
  {
    id: "s3",
    slug: "unreal-engine-5-6-nanite-foliage",
    status: "published",
    title: "Unreal Engine 5.6 Brings Nanite Foliage and Faster Lighting Builds",
    dek: "Epic's latest release targets two long-standing pain points for teams shipping open-world games.",
    category: "game-development",
    tags: [
      { slug: "unreal-engine", name: "Unreal Engine" },
      { slug: "game-engine", name: "Game engines" },
    ],
    body: body("Game Developer Impact"),
    keyTakeaways: [
      "Nanite now handles dense foliage without hand-authored LODs.",
      "Lighting builds are reported significantly faster on large levels.",
      "Upgrading mid-project is viable but test your content pipeline first.",
    ],
    take: take("Nanite foliage"),
    sources: [
      { url: "https://www.unrealengine.com/en-US/news", title: "UE 5.6 release notes", publisher: "Epic Games", role: "primary" },
    ],
    heroImage: {
      src: heroSvg("#111014", "#2e1065", "#a78bfa", 3),
      alt: "Abstract wireframe-to-render transition rendered as sculpture in a moody studio",
      width: 1600,
      height: 900,
      aiGenerated: true,
      kind: "generated",
    },
    author: "CodePlay Studios Editorial Team",
    readingMinutes: 5,
    publishedAt: daysAgo(2.1),
    seo: {
      title: "Unreal Engine 5.6: Nanite Foliage and Faster Lighting Builds",
      description:
        "Unreal Engine 5.6 targets foliage and lighting-build times. What it means for teams shipping open-world games.",
      canonicalUrl: "https://codeplaystudios.com/insights/unreal-engine-5-6-nanite-foliage",
    },
    articleType: "game_development",
    trending: true,
    trendingRank: 3,
    viewCount: 2600,
    entities: ["Unreal Engine", "Epic Games"],
  },
  {
    id: "s4",
    slug: "critical-openssl-vulnerability-cve-2026-1234",
    status: "published",
    title: "Critical OpenSSL Vulnerability Disclosed — Patch Guidance",
    dek: "A high-severity flaw affects a widely used TLS code path. Here is who is affected and what to do today.",
    category: "cybersecurity",
    tags: [
      { slug: "openssl", name: "OpenSSL" },
      { slug: "security-vulnerability", name: "Security vulnerability" },
    ],
    body: body("Security Implications"),
    keyTakeaways: [
      "The flaw affects a common TLS handshake path.",
      "A patched release is available now.",
      "Rotate affected certificates after patching.",
    ],
    take: take("the OpenSSL fix"),
    sources: [
      { url: "https://www.openssl.org/news/", title: "OpenSSL security advisory", publisher: "OpenSSL", role: "primary" },
    ],
    author: "CodePlay Studios Editorial Team",
    readingMinutes: 4,
    publishedAt: daysAgo(0.1),
    seo: {
      title: "Critical OpenSSL Vulnerability: Patch Guidance",
      description:
        "A high-severity OpenSSL flaw affects a widely used TLS path. Who is affected and the steps to take today.",
      canonicalUrl: "https://codeplaystudios.com/insights/critical-openssl-vulnerability-cve-2026-1234",
    },
    articleType: "security_alert",
    breaking: true,
    trending: true,
    trendingRank: 4,
    viewCount: 5100,
    entities: ["OpenSSL"],
  },
  {
    id: "s5",
    slug: "nvidia-next-gen-gpu-architecture",
    status: "published",
    title: "NVIDIA Details Its Next GPU Architecture for AI Workloads",
    dek: "The headline numbers are impressive; the interesting details are in memory bandwidth and interconnect.",
    category: "hardware-and-gpus",
    tags: [
      { slug: "nvidia", name: "NVIDIA" },
      { slug: "gpu-news", name: "GPU news" },
    ],
    body: body("Technical Breakdown"),
    keyTakeaways: [
      "Memory bandwidth is the standout improvement.",
      "Interconnect changes matter most for multi-GPU training.",
      "Availability and pricing are not yet confirmed.",
    ],
    take: take("the new architecture"),
    sources: [
      { url: "https://blogs.nvidia.com/", title: "NVIDIA architecture briefing", publisher: "NVIDIA", role: "primary" },
    ],
    heroImage: {
      src: heroSvg("#0a0a0a", "#171717", "#f97316", 5),
      alt: "A GPU die rendered as a jewel-like hero object with hard raking light",
      width: 1600,
      height: 900,
      aiGenerated: true,
      kind: "generated",
    },
    author: "CodePlay Studios Editorial Team",
    readingMinutes: 8,
    publishedAt: daysAgo(3.4),
    seo: {
      title: "NVIDIA's Next GPU Architecture for AI Workloads",
      description:
        "NVIDIA details its next GPU architecture. The bandwidth and interconnect changes that actually matter.",
      canonicalUrl: "https://codeplaystudios.com/insights/nvidia-next-gen-gpu-architecture",
    },
    articleType: "industry_analysis",
    viewCount: 1900,
    entities: ["NVIDIA"],
  },
  {
    id: "s6",
    slug: "supabase-raises-series-d",
    status: "published",
    title: "Supabase Raises Series D to Expand Its Postgres Platform",
    dek: "The funding round comes with a roadmap focused on scale, compliance, and first-party AI features.",
    category: "startups",
    tags: [
      { slug: "supabase", name: "Supabase" },
      { slug: "saas", name: "SaaS" },
    ],
    body: body("Business Impact"),
    keyTakeaways: [
      "New capital is earmarked for scale and compliance work.",
      "AI features are moving into the core platform.",
      "No pricing changes announced for existing tiers.",
    ],
    take: take("the funding round"),
    sources: [
      { url: "https://supabase.com/blog", title: "Series D announcement", publisher: "Supabase", role: "primary" },
    ],
    author: "CodePlay Studios Editorial Team",
    readingMinutes: 5,
    publishedAt: daysAgo(4.8),
    seo: {
      title: "Supabase Raises Series D",
      description:
        "Supabase's Series D funds scale, compliance, and first-party AI features. What it means for teams building on it.",
      canonicalUrl: "https://codeplaystudios.com/insights/supabase-raises-series-d",
    },
    articleType: "industry_analysis",
    viewCount: 1400,
    entities: ["Supabase"],
  },
  {
    id: "s7",
    slug: "steam-adds-native-arm-support",
    status: "published",
    title: "Steam Adds Native ARM Support for Windows Handhelds",
    dek: "Valve's client and Proton layer now run natively on ARM, opening the door to a new class of handheld hardware.",
    category: "gaming",
    tags: [
      { slug: "steam", name: "Steam" },
      { slug: "valve", name: "Valve" },
    ],
    body: body("Why Players Care"),
    keyTakeaways: [
      "The Steam client now runs natively on Windows-on-ARM.",
      "Proton compatibility on ARM is early but functional.",
      "Expect new handheld announcements to follow.",
    ],
    take: take("native ARM support"),
    sources: [
      { url: "https://store.steampowered.com/news/", title: "Steam client update notes", publisher: "Valve", role: "primary" },
    ],
    author: "CodePlay Studios Editorial Team",
    readingMinutes: 4,
    publishedAt: daysAgo(6.2),
    seo: {
      title: "Steam Adds Native ARM Support for Windows Handhelds",
      description:
        "Valve's client and Proton now run natively on ARM. What it opens up for handheld gaming hardware.",
      canonicalUrl: "https://codeplaystudios.com/insights/steam-adds-native-arm-support",
    },
    articleType: "gaming_news",
    viewCount: 2200,
    entities: ["Steam", "Valve"],
  },
  {
    id: "s9",
    slug: "mistral-ships-open-weights-coding-model",
    status: "published",
    title: "Mistral Ships an Open-Weights Coding Model",
    dek: "A capable coding model with permissive weights lands, and the agentic-coding race gets a credible open option.",
    category: "artificial-intelligence",
    tags: [
      { slug: "ai-coding", name: "AI coding" },
      { slug: "open-source", name: "Open source" },
    ],
    body: body("Developer Impact"),
    keyTakeaways: [
      "The weights are downloadable under a permissive licence.",
      "Benchmark parity with closed models on common coding tasks is claimed.",
      "Self-hosting is viable but needs real GPU budget.",
    ],
    take: take("open-weights coding models"),
    sources: [
      { url: "https://mistral.ai/news/", title: "Model release announcement", publisher: "Mistral", role: "primary" },
    ],
    author: "CodePlay Studios Editorial Team",
    readingMinutes: 6,
    publishedAt: daysAgo(1.6),
    seo: {
      title: "Mistral Ships an Open-Weights Coding Model",
      description:
        "A permissively-licensed coding model lands. What open weights change for teams evaluating AI coding tools.",
      canonicalUrl: "https://codeplaystudios.com/insights/mistral-ships-open-weights-coding-model",
    },
    articleType: "ai_news",
    trending: true,
    trendingRank: 5,
    viewCount: 2000,
    entities: ["Mistral"],
  },
  {
    id: "s8",
    slug: "flutter-adds-web-hot-reload",
    status: "published",
    title: "Flutter Adds True Hot Reload for the Web",
    dek: "One of the last major gaps between Flutter's mobile and web developer experience is closing.",
    category: "mobile-development",
    tags: [
      { slug: "flutter", name: "Flutter" },
      { slug: "web-development", name: "Web development" },
    ],
    body: body("Developer Impact"),
    keyTakeaways: [
      "Stateful hot reload now works for Flutter web targets.",
      "Iteration speed on web is close to the mobile experience.",
      "Some plugins still need a full restart.",
    ],
    take: take("web hot reload"),
    sources: [
      { url: "https://blog.flutter.dev/", title: "Flutter release notes", publisher: "Flutter", role: "primary" },
    ],
    author: "CodePlay Studios Editorial Team",
    readingMinutes: 3,
    publishedAt: daysAgo(8.5),
    seo: {
      title: "Flutter Adds True Hot Reload for the Web",
      description:
        "Stateful hot reload now works for Flutter web. The last big gap between mobile and web DX is closing.",
      canonicalUrl: "https://codeplaystudios.com/insights/flutter-adds-web-hot-reload",
    },
    articleType: "developer_guide",
    viewCount: 1100,
    entities: ["Flutter"],
  },
];
