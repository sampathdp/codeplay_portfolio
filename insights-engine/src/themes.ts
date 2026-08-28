/**
 * Viral technology / gaming themes the discovery engine classifies stories
 * into, plus the keyword patterns and CodePlay-category mapping that drive
 * classification and relevance.
 *
 * This is code, not DB config, because it is large and closely coupled to
 * the classifier. Operator-facing knobs (weights, windows, schedule) live
 * in `insights_settings`.
 */

export interface ThemeDef {
  /** kebab-case theme id. */
  id: string;
  label: string;
  /** Lowercase substrings / tokens that signal this theme. */
  keywords: string[];
  /** Named entities that strongly imply this theme. */
  entities?: string[];
  /** CodePlay Insights category slug this theme maps to. */
  category: string;
  /** Base CodePlay relevance contribution for this theme (0-100). */
  relevance: number;
}

export const THEMES: ThemeDef[] = [
  { id: "ai-model-release", label: "AI model releases", category: "artificial-intelligence", relevance: 95,
    keywords: ["model release", "new model", "gpt-", "gemini", "claude", "llama", "mistral", "frontier model", "flagship model", "o1", "o3", "grok"],
    entities: ["OpenAI", "Anthropic", "Google DeepMind", "Meta AI", "Mistral", "xAI"] },
  { id: "ai-agents", label: "AI agents", category: "artificial-intelligence", relevance: 92,
    keywords: ["ai agent", "agentic", "autonomous agent", "computer use", "tool use", "multi-agent"] },
  { id: "ai-coding", label: "AI coding", category: "developer-tools", relevance: 95,
    keywords: ["copilot", "code assistant", "ai coding", "code generation", "cursor", "codegen", "pair programming", "coding agent"] },
  { id: "ai-video", label: "AI video", category: "artificial-intelligence", relevance: 80,
    keywords: ["text-to-video", "ai video", "sora", "veo", "runway", "video generation"] },
  { id: "ai-image", label: "AI image generation", category: "artificial-intelligence", relevance: 78,
    keywords: ["text-to-image", "image generation", "midjourney", "stable diffusion", "dall-e", "imagen", "flux"] },
  { id: "robotics", label: "Robotics", category: "emerging-technology", relevance: 70,
    keywords: ["robot", "robotics", "humanoid", "boston dynamics", "actuator", "embodied ai"] },
  { id: "dev-tools", label: "New developer tools", category: "developer-tools", relevance: 90,
    keywords: ["developer tool", "cli", "ide", "editor", "sdk", "devtools", "toolchain", "linter", "formatter", "package manager"] },
  { id: "software-release", label: "Major software releases", category: "software-development", relevance: 85,
    keywords: ["released", "ga release", "general availability", "version ", "v1.0", "v2.0", "stable release", "1.0 release"] },
  { id: "open-source-launch", label: "Open-source launches", category: "open-source", relevance: 88,
    keywords: ["open source", "open-source", "oss", "mit license", "apache 2.0", "now open source", "released as open source"] },
  { id: "github-trending", label: "GitHub trending projects", category: "open-source", relevance: 80,
    keywords: ["github", "repo", "stars", "trending repository", "show hn"] },
  { id: "security-vuln", label: "Security vulnerabilities", category: "cybersecurity", relevance: 90,
    keywords: ["cve-", "vulnerability", "zero-day", "0-day", "rce", "exploit", "privilege escalation", "supply chain attack", "patch tuesday"] },
  { id: "data-breach", label: "Data breaches", category: "cybersecurity", relevance: 85,
    keywords: ["data breach", "leaked", "hacked", "ransomware", "exposed database", "credential stuffing"] },
  { id: "platform-outage", label: "Major platform outages", category: "cloud-and-devops", relevance: 80,
    keywords: ["outage", "downtime", "degraded", "incident", "status page", "service disruption"] },
  { id: "cloud-release", label: "Cloud releases", category: "cloud-and-devops", relevance: 82,
    keywords: ["aws re:invent", "azure", "gcp", "cloud region", "managed service", "serverless", "kubernetes"] },
  { id: "browser-tech", label: "Browser technology", category: "web-development", relevance: 80,
    keywords: ["chrome", "firefox", "safari", "webkit", "chromium", "web platform", "baseline", "web api", "wasm", "webgpu"] },
  { id: "mobile-dev", label: "Mobile development", category: "mobile-development", relevance: 85,
    keywords: ["ios ", "android ", "swiftui", "jetpack compose", "app store", "play store", "kotlin multiplatform"] },
  { id: "flutter", label: "Flutter", category: "mobile-development", relevance: 88, keywords: ["flutter", "dart "] },
  { id: "react", label: "React", category: "web-development", relevance: 90, keywords: ["react ", "react.js", "react native", "jsx", "react server components"] },
  { id: "nextjs", label: "Next.js", category: "web-development", relevance: 88, keywords: ["next.js", "nextjs", "vercel"] },
  { id: "nodejs", label: "Node.js", category: "web-development", relevance: 85, keywords: ["node.js", "nodejs", "npm", "deno", "bun "] },
  { id: "python", label: "Python", category: "software-development", relevance: 82, keywords: ["python ", "pypi", "cpython", "pep "] },
  { id: "game-engine", label: "Game engines", category: "game-development", relevance: 90, keywords: ["game engine", "unity", "unreal engine", "godot", "engine update"] },
  { id: "unity", label: "Unity", category: "game-development", relevance: 90, keywords: ["unity", "unity 6", "unity engine", "unity technologies"] },
  { id: "unreal", label: "Unreal Engine", category: "game-development", relevance: 90, keywords: ["unreal engine", "ue5", "epic games", "nanite", "lumen"] },
  { id: "new-games", label: "New games", category: "gaming", relevance: 65, keywords: ["announced", "reveal trailer", "release date", "launches on", "now available on", "gameplay trailer"] },
  { id: "gaming-controversy", label: "Gaming controversies", category: "gaming-community", relevance: 60, keywords: ["backlash", "controversy", "review bomb", "layoffs", "studio closure", "boycott", "eula", "always online"] },
  { id: "steam-trends", label: "Steam trends", category: "gaming", relevance: 60, keywords: ["steam", "valve", "steam deck", "steam charts", "wishlist"] },
  { id: "console-news", label: "Console news", category: "gaming", relevance: 62, keywords: ["playstation", "ps5", "xbox", "nintendo switch", "series x", "console"] },
  { id: "gpu-news", label: "GPU news", category: "hardware-and-gpus", relevance: 78, keywords: ["gpu", "graphics card", "geforce", "radeon", "rtx", "rdna", "vram", "ray tracing"] },
  { id: "nvidia", label: "NVIDIA", category: "hardware-and-gpus", relevance: 78, keywords: ["nvidia", "cuda", "geforce", "blackwell", "hopper", "dgx"] },
  { id: "amd", label: "AMD", category: "hardware-and-gpus", relevance: 72, keywords: ["amd", "ryzen", "radeon", "epyc", "instinct"] },
  { id: "apple", label: "Apple", category: "big-tech", relevance: 70, keywords: ["apple", "iphone", "macbook", "apple silicon", "m4", "visionos", "wwdc"] },
  { id: "android", label: "Android", category: "mobile-development", relevance: 75, keywords: ["android", "pixel", "google play", "android studio"] },
  { id: "windows", label: "Windows", category: "big-tech", relevance: 68, keywords: ["windows 11", "windows 12", "microsoft", "wsl", "powertoys"] },
  { id: "startup-launch", label: "Startup launches", category: "startups", relevance: 72, keywords: ["launches", "comes out of stealth", "seed round", "series a", "series b", "yc "] },
  { id: "acquisition", label: "Major acquisitions", category: "big-tech", relevance: 75, keywords: ["acquires", "acquisition", "to buy", "merger", "acquired by"] },
  { id: "saas", label: "SaaS", category: "saas", relevance: 72, keywords: ["saas", "pricing change", "subscription", "per seat", "enterprise plan"] },
  { id: "dev-productivity", label: "Developer productivity", category: "developer-tools", relevance: 80, keywords: ["developer productivity", "dx ", "developer experience", "ci/cd", "build times", "monorepo"] },
  { id: "tech-policy", label: "Technology policy affecting developers", category: "big-tech", relevance: 68, keywords: ["regulation", "eu ai act", "dma", "antitrust", "gdpr", "executive order", "ban", "open source license"] },
  { id: "consumer-tech", label: "Viral consumer technology", category: "emerging-technology", relevance: 55, keywords: ["gadget", "wearable", "smart glasses", "smart home", "consumer"] },
  { id: "new-hardware", label: "New hardware", category: "hardware-and-gpus", relevance: 68, keywords: ["chip", "soc", "processor", "silicon", "arm ", "risc-v", "npu", "accelerator"] },
  { id: "vr-ar", label: "VR / AR / spatial computing", category: "emerging-technology", relevance: 65, keywords: ["vr ", "ar ", "virtual reality", "augmented reality", "spatial computing", "headset", "quest", "vision pro", "mixed reality"] },
  { id: "blockchain", label: "Blockchain (when genuinely relevant)", category: "emerging-technology", relevance: 35, keywords: ["blockchain", "crypto", "web3", "ethereum", "zero-knowledge proof", "stablecoin"] },
];

export const THEME_IDS = THEMES.map((t) => t.id);

/** Entities we track for cross-source matching + theme hints. */
export const KNOWN_ENTITIES: string[] = [
  "OpenAI", "Anthropic", "Google", "Google DeepMind", "DeepMind", "Microsoft",
  "GitHub", "Meta", "Apple", "NVIDIA", "AMD", "Intel", "Cloudflare", "Vercel",
  "Supabase", "Firebase", "AWS", "Amazon", "Unity", "Unreal Engine", "Epic Games",
  "Steam", "Valve", "PlayStation", "Sony", "Xbox", "Nintendo", "Netflix",
  "OpenAI", "xAI", "Mistral", "Hugging Face", "Stability AI", "Midjourney",
  "React", "Next.js", "Node.js", "Deno", "Bun", "Flutter", "Angular", "Vue",
  "Svelte", "TypeScript", "Python", "Rust", "Go", "Kubernetes", "Docker",
  "Tailwind CSS", "Figma", "Slack", "Discord", "Notion", "Linear", "Stripe",
];
