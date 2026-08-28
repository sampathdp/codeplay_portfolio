/**
 * CodePlay Insights discovery engine — shared types.
 *
 * The engine runs outside the browser bundle (GitHub Actions cron via
 * `tsx`, or a Supabase Edge Function later). It only ever *discovers* and
 * *ranks* stories — it never generates or publishes articles.
 */

export type FactConfidence =
  | "verified"
  | "likely"
  | "community_rumor"
  | "unverified";

export type AdapterKind =
  | "hackernews"
  | "rss"
  | "github_releases"
  | "reddit"
  | "mock";

/** Raw item as returned by a source adapter — before normalization. */
export interface RawItem {
  /** Stable id from the source (HN id, reddit fullname, release tag, guid). */
  externalId: string;
  title: string;
  url: string;
  /** The source's own page for the item, if different from `url`. */
  commentsUrl?: string;
  source: string;
  sourceSlug: string;
  adapter: AdapterKind;
  publishedAt?: string; // ISO
  summary?: string;
  author?: string;
  /** Adapter-specific engagement payload (points, comments, score, …). */
  signals?: {
    points?: number;
    comments?: number;
    redditScore?: number;
    redditUpvoteRatio?: number;
    isOfficial?: boolean;
    isShowHN?: boolean;
    isRelease?: boolean;
  };
  raw?: Record<string, unknown>;
}

/** A `RawItem` after normalization + light classification. */
export interface NormalizedItem extends RawItem {
  normalizedTitle: string;
  normalizedUrl: string;
  dedupeHash: string;
  entities: string[];
  keywords: string[];
  themes: string[];
  primaryTheme: string | null;
  categorySlug: string | null;
  relevanceScore: number; // 0-100 (CodePlay relevance)
  factConfidence: FactConfidence;
}

/** A group of normalized items that describe the same event. */
export interface TopicCluster {
  key: string; // deterministic cluster key
  title: string;
  normalizedTitle: string;
  summary: string;
  items: NormalizedItem[];
  entities: string[];
  keywords: string[];
  themes: string[];
  primaryTheme: string | null;
  categorySlug: string | null;
  earliestPublishedAt: string | null;
  lastSeenAt: string;
  sourceCount: number;
  factConfidence: FactConfidence;
}

export interface ScoreBreakdown {
  freshness: number;
  engagement: number;
  sourceAuthority: number;
  crossSourceCoverage: number;
  codeplayRelevance: number;
  communityMomentum: number;
  novelty: number;
}

export interface ScoredCluster extends TopicCluster {
  scores: ScoreBreakdown;
  viralScore: number; // 0-100
  breaking: boolean;
}

export interface SourceConfig {
  id?: string;
  name: string;
  slug: string;
  adapter: AdapterKind;
  sourceType: string;
  baseUrl: string;
  feedUrl: string | null;
  category: string | null;
  enabled: boolean;
  trustScore: number; // 0-100
  priority: number;
  configuration: Record<string, unknown>;
}

export interface AdapterContext {
  now: Date;
  /** Bounded fetch with timeout + retry + backoff. */
  fetchText: (url: string, init?: RequestInit) => Promise<string>;
  fetchJson: <T = unknown>(url: string, init?: RequestInit) => Promise<T>;
  log: (msg: string, extra?: Record<string, unknown>) => void;
  env: Record<string, string | undefined>;
}

export interface SourceAdapter {
  readonly kind: AdapterKind;
  /** True when this adapter can run given the source config + environment. */
  canRun(source: SourceConfig, ctx: AdapterContext): boolean;
  /** Fetch raw items. MUST throw on hard failure so the pipeline can
   * isolate it; return [] for "nothing new". */
  discover(source: SourceConfig, ctx: AdapterContext): Promise<RawItem[]>;
}

export interface IngestionRunResult {
  adapter: AdapterKind;
  sourceSlug: string;
  status: "succeeded" | "failed" | "skipped";
  itemsFound: number;
  error?: string;
  durationMs: number;
}

export interface DiscoveryReport {
  startedAt: string;
  finishedAt: string;
  runs: IngestionRunResult[];
  itemsDiscovered: number;
  clusters: ScoredCluster[];
  errors: string[];
}
