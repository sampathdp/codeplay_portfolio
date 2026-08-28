/**
 * Persistence boundary for the discovery engine. `MemoryStore` backs
 * tests and `--dry-run`; `SupabaseStore` is the real service-role writer.
 */

import type { IngestionRunResult, ScoredCluster } from "../types";

export interface PersistResult {
  clustersUpserted: number;
  candidatesUpserted: number;
}

export interface Store {
  /** Engine config overrides from `insights_settings`. */
  getSettings(): Promise<Record<string, unknown>>;

  /** Cluster keys already turned into (or reserved for) articles recently,
   * so selection avoids repeating them. */
  getRecentlyUsedClusterKeys(sinceHours: number): Promise<Set<string>>;

  /** Cluster keys an admin force-flagged for research. */
  getForcedClusterKeys(): Promise<Set<string>>;

  saveIngestionRun(run: IngestionRunResult & { startedAt: string; finishedAt: string }): Promise<void>;

  upsertClusters(clusters: ScoredCluster[]): Promise<PersistResult>;
}
