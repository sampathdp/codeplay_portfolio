/**
 * Engine configuration. Authoritative defaults live here; an admin can
 * override any block by writing the matching row in `insights_settings`
 * (keys: `scoring`, `selection`, `scheduler`, `breaking`, `community`).
 */

export interface ScoringConfig {
  weights: {
    freshness: number;
    engagement: number;
    sourceAuthority: number;
    crossSourceCoverage: number;
    codeplayRelevance: number;
    communityMomentum: number;
    novelty: number;
  };
  freshnessHalfLifeHours: number;
  freshnessMaxAgeHours: number;
  noveltyWindowHours: number;
  engagementCaps: {
    hnPoints: number;
    hnComments: number;
    redditScore: number;
    redditComments: number;
  };
}

export interface SelectionConfig {
  timezone: string;
  perDay: number;
  minPerDay: number;
  minViralScore: number;
  lookbackHours: number;
  maxPerTheme: number;
  maxPerCategory: number;
  requireDistinctPrimaryTheme: boolean;
  diversity: { slot: number; label: string }[];
}

export interface SchedulerConfig {
  timezone: string;
  discovery: { cronsUtc: string[]; note?: string };
  publishWindowsLocal: string[];
  maxArticlesPerDay: number;
}

export interface BreakingConfig {
  maxAgeHours: number;
  minSources: number;
  minAuthority: number;
  minCommunityScore: number;
}

export interface CommunityConfig {
  enabled: boolean;
  requiresCredentials: boolean;
}

export interface EngineConfig {
  scoring: ScoringConfig;
  selection: SelectionConfig;
  scheduler: SchedulerConfig;
  breaking: BreakingConfig;
  community: CommunityConfig;
  http: {
    timeoutMs: number;
    retries: number;
    backoffBaseMs: number;
    backoffMaxMs: number;
    minHostIntervalMs: number;
    userAgent: string;
  };
}

export const DEFAULT_CONFIG: EngineConfig = {
  scoring: {
    weights: {
      freshness: 0.2,
      engagement: 0.2,
      sourceAuthority: 0.15,
      crossSourceCoverage: 0.15,
      codeplayRelevance: 0.15,
      communityMomentum: 0.1,
      novelty: 0.05,
    },
    freshnessHalfLifeHours: 18,
    freshnessMaxAgeHours: 96,
    noveltyWindowHours: 72,
    engagementCaps: {
      hnPoints: 800,
      hnComments: 400,
      redditScore: 5000,
      redditComments: 1200,
    },
  },
  selection: {
    timezone: "Asia/Colombo",
    perDay: 3,
    minPerDay: 2,
    minViralScore: 45,
    lookbackHours: 36,
    maxPerTheme: 1,
    maxPerCategory: 2,
    requireDistinctPrimaryTheme: true,
    diversity: [
      { slot: 1, label: "Major AI / software / tech development" },
      { slot: 2, label: "Developer / business technology story" },
      { slot: 3, label: "Gaming / game development / community story" },
    ],
  },
  scheduler: {
    timezone: "Asia/Colombo",
    discovery: {
      cronsUtc: ["0 3,7,10,14,17,21 * * *"],
      note: "GitHub Actions cron is UTC.",
    },
    publishWindowsLocal: ["08:30", "15:30", "22:30"],
    maxArticlesPerDay: 3,
  },
  breaking: {
    maxAgeHours: 12,
    minSources: 2,
    minAuthority: 80,
    minCommunityScore: 60,
  },
  community: { enabled: false, requiresCredentials: true },
  http: {
    timeoutMs: 12_000,
    retries: 3,
    backoffBaseMs: 500,
    backoffMaxMs: 8_000,
    minHostIntervalMs: 900,
    userAgent:
      "CodePlayInsightsBot/0.3 (+https://codeplaystudios.com/insights; discovery only)",
  },
};

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function deepMerge<T>(base: T, override: DeepPartial<T> | undefined): T {
  if (!override) return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(override)) {
    if (v === undefined) continue;
    const cur = out[k];
    out[k] = isPlainObject(cur) && isPlainObject(v) ? deepMerge(cur, v) : v;
  }
  return out as T;
}

// ---------------------------------------------------------------------------
// Phase 4 — Gemini model config (env) — real default IDs, all overridable.
// ---------------------------------------------------------------------------

export interface GeminiModelConfig {
  textModel: string;
  fastModel: string;
  imageModel: string;
}

// Defaults are pinned to explicit *stable* model IDs, not a rolling
// `-latest` alias. The alias hot-swaps to whatever Gemini ships newest,
// and the newest model always launches with a tiny free-tier quota —
// `gemini-flash-latest` was resolving to `gemini-3.8-flash`, whose free
// tier is ~20 requests/day (RESOURCE_EXHAUSTED before a single article
// finishes). `gemini-3.6-flash` hit the same 20 RPD free-tier ceiling
// (RESOURCE_EXHAUSTED on the outline step), so textModel is pinned to
// `gemini-3.5-flash-lite` too — same generous free quota as fastModel
// (~1000 RPD), still on the current 3.x line. The 2.x line
// (`gemini-2.0-flash` … `gemini-2.5-*`) is retired / off the free tier —
// stay on 3.x.
//
// Overrides (env or `insights_settings`):
//   GEMINI_TEXT_MODEL=gemini-3.7-flash       # newer, still has a real free quota
//   GEMINI_TEXT_MODEL=gemini-3.1-pro-preview # best quality, needs billing
//   GEMINI_IMAGE_MODEL=gemini-3-pro-image    # studio-quality hero images, needs billing
export const DEFAULT_GEMINI_MODELS: GeminiModelConfig = {
  textModel: "gemini-3.5-flash-lite",
  fastModel: "gemini-3.5-flash-lite",
  imageModel: "gemini-3.1-flash-image",
};

export function resolveGeminiModels(
  env: Record<string, string | undefined>,
): GeminiModelConfig {
  return {
    textModel: env.GEMINI_TEXT_MODEL || DEFAULT_GEMINI_MODELS.textModel,
    fastModel:
      env.GEMINI_FAST_MODEL || env.GEMINI_TEXT_MODEL || DEFAULT_GEMINI_MODELS.fastModel,
    imageModel: env.GEMINI_IMAGE_MODEL || DEFAULT_GEMINI_MODELS.imageModel,
  };
}

/** Merge DB `insights_settings` rows over the defaults. */
export function resolveConfig(
  settings: Record<string, unknown> = {},
): EngineConfig {
  return {
    scoring: deepMerge(DEFAULT_CONFIG.scoring, settings.scoring as never),
    selection: deepMerge(DEFAULT_CONFIG.selection, settings.selection as never),
    scheduler: deepMerge(DEFAULT_CONFIG.scheduler, settings.scheduler as never),
    breaking: deepMerge(DEFAULT_CONFIG.breaking, settings.breaking as never),
    community: deepMerge(DEFAULT_CONFIG.community, settings.community as never),
    http: DEFAULT_CONFIG.http,
  };
}
