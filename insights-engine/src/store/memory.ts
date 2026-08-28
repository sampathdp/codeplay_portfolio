import type { IngestionRunResult, ScoredCluster } from "../types";
import type { PersistResult, Store } from "./types";

export class MemoryStore implements Store {
  settings: Record<string, unknown> = {};
  recentlyUsed = new Set<string>();
  forced = new Set<string>();
  ingestionRuns: Array<IngestionRunResult & { startedAt: string; finishedAt: string }> = [];
  clusters: ScoredCluster[] = [];

  async getSettings() {
    return this.settings;
  }
  async getRecentlyUsedClusterKeys() {
    return new Set(this.recentlyUsed);
  }
  async getForcedClusterKeys() {
    return new Set(this.forced);
  }
  async saveIngestionRun(run: IngestionRunResult & { startedAt: string; finishedAt: string }) {
    this.ingestionRuns.push(run);
  }
  async upsertClusters(clusters: ScoredCluster[]): Promise<PersistResult> {
    this.clusters = clusters;
    return {
      clustersUpserted: clusters.length,
      candidatesUpserted: clusters.reduce((n, c) => n + c.items.length, 0),
    };
  }
}
