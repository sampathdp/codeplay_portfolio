/**
 * Professional category fallback graphic. Used when image generation
 * fails so the publish workflow never crashes. Deterministic SVG — a
 * restrained gradient with a category-tinted geometric motif, on brand,
 * no text.
 */

interface Palette {
  a: string;
  b: string;
  accent: string;
}

const PALETTES: Record<string, Palette> = {
  "artificial-intelligence": { a: "#0b1120", b: "#1e1b4b", accent: "#818cf8" },
  "software-development": { a: "#0b1120", b: "#0f172a", accent: "#38bdf8" },
  "web-development": { a: "#0b1120", b: "#082f49", accent: "#22d3ee" },
  "mobile-development": { a: "#0b1120", b: "#0f172a", accent: "#34d399" },
  "game-development": { a: "#111014", b: "#2e1065", accent: "#a78bfa" },
  gaming: { a: "#0a0a0f", b: "#1a1030", accent: "#f472b6" },
  "gaming-community": { a: "#0a0a0f", b: "#111827", accent: "#fb7185" },
  cybersecurity: { a: "#080b12", b: "#0f172a", accent: "#2dd4bf" },
  "cloud-and-devops": { a: "#0b1120", b: "#0c1a2b", accent: "#60a5fa" },
  "developer-tools": { a: "#100f0c", b: "#1c1917", accent: "#fbbf24" },
  "hardware-and-gpus": { a: "#0a0a0a", b: "#171717", accent: "#f97316" },
  startups: { a: "#0b1120", b: "#0f172a", accent: "#4ade80" },
  saas: { a: "#0b1120", b: "#0e1626", accent: "#38bdf8" },
  "big-tech": { a: "#0b0f17", b: "#111827", accent: "#94a3b8" },
  "open-source": { a: "#0b1120", b: "#14210f", accent: "#84cc16" },
  "emerging-technology": { a: "#0a0a12", b: "#1e1b4b", accent: "#c084fc" },
};

const DEFAULT_PALETTE: Palette = { a: "#0b1120", b: "#0f172a", accent: "#38bdf8" };

export function fallbackPalette(category: string | null): Palette {
  return (category && PALETTES[category]) || DEFAULT_PALETTE;
}

/** 1600x900 (16:9) SVG string. Deterministic per category + seed. */
export function fallbackSvg(category: string | null, seed = ""): string {
  const p = fallbackPalette(category);
  // stable pseudo-random from the seed
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const r = (n: number) => (((h = Math.imul(h ^ (h >>> 15), 2246822507)) >>> 0) % n);

  const cx = 1120 + r(240);
  const cy = 300 + r(240);
  const rad = 220 + r(160);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.a}"/>
      <stop offset="1" stop-color="${p.b}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.7" cy="0.35" r="0.6">
      <stop offset="0" stop-color="${p.accent}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${p.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/>
  <rect width="1600" height="900" fill="url(#glow)"/>
  <g fill="none" stroke="${p.accent}" stroke-opacity="0.18" stroke-width="2">
    ${Array.from({ length: 7 }, (_, i) => `<line x1="0" y1="${120 + i * 110}" x2="1600" y2="${60 + i * 110}"/>`).join("\n    ")}
  </g>
  <circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="${p.accent}" stroke-opacity="0.5" stroke-width="3"/>
  <circle cx="${cx}" cy="${cy}" r="${rad * 0.6}" fill="${p.accent}" fill-opacity="0.12"/>
  <circle cx="${cx}" cy="${cy}" r="6" fill="${p.accent}"/>
</svg>`;
}

export function fallbackAlt(category: string | null): string {
  const name = (category ?? "technology").replace(/-/g, " ");
  return `CodePlay Insights ${name} category illustration`;
}
