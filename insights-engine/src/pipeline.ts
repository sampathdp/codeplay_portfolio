/**
 * Discovery pipeline orchestrator.
 *
 *   sources → (adapter.discover, isolated) → raw items
 *           → normalize + classify
 *           → cross-source dedupe → topic clusters
 *           → score + breaking classification
 *           → persist (clusters + candidates + ingestion runs)
 *
 * One failed source is logged and skipped; it never aborts the run.
 * No article generation happens here.
 */

import type {
  AdapterContext,
  DiscoveryReport,
  IngestionRunResult,
  NormalizedItem,
  RawItem,
  ScoredCluster,
  SourceAdapter,
  SourceConfig,
} from "./types";
import type { EngineConfig } from "./config";
import { resolveConfig } from "./config";
import { getAdapter as defaultGetAdapter } from "./adapters/registry";
import { normalizeItem } from "./normalize";
import { classifyItem } from "./classify";
import { clusterItems, type DedupeOptions } from "./dedupe";
import { scoreCluster } from "./scoring";
import { isBreaking } from "./breaking";
import type { Store } from "./store/types";

export interface RunPipelineOptions {
  sources: SourceConfig[];
  ctx: AdapterContext;
  store: Store;
  configOverride?: Partial<EngineConfig>;
  dedupe?: DedupeOptions;
  persist?: boolean;
  /** Override adapter resolution (tests). */
  getAdapter?: (kind: string) => SourceAdapter | undefined;
}

function toNormalized(item: RawItem, source: SourceConfig): NormalizedItem {
  const n = normalizeItem(item);
  const c = classifyItem(item, source);
  return { ...item, ...n, ...c };
}

async function runAdapter(
  source: SourceConfig,
  ctx: AdapterContext,
  resolve: (kind: string) => SourceAdapter | undefined,
): Promise<{ run: IngestionRunResult; items: RawItem[]; startedAt: string; finishedAt: string }> {
  const startedAt = new Date().toISOString();
  const t0 = Date.now();
  const adapter = resolve(source.adapter);

  if (!adapter) {
    return {
      run: { adapter: source.adapter, sourceSlug: source.slug, status: "skipped", itemsFound: 0, error: `no adapter '${source.adapter}'`, durationMs: 0 },
      items: [],
      startedAt,
      finishedAt: new Date().toISOString(),
    };
  }
  if (!source.enabled) {
    return {
      run: { adapter: adapter.kind, sourceSlug: source.slug, status: "skipped", itemsFound: 0, error: "disabled", durationMs: 0 },
      items: [],
      startedAt,
      finishedAt: new Date().toISOString(),
    };
  }
  if (!adapter.canRun(source, ctx)) {
    return {
      run: { adapter: adapter.kind, sourceSlug: source.slug, status: "skipped", itemsFound: 0, error: "canRun=false (missing config/credentials)", durationMs: 0 },
      items: [],
      startedAt,
      finishedAt: new Date().toISOString(),
    };
  }

  try {
    const items = await adapter.discover(source, ctx);
    return {
      run: { adapter: adapter.kind, sourceSlug: source.slug, status: "succeeded", itemsFound: items.length, durationMs: Date.now() - t0 },
      items,
      startedAt,
      finishedAt: new Date().toISOString(),
    };
  } catch (err) {
    ctx.log("adapter.failed", { source: source.slug, error: String(err) });
    return {
      run: { adapter: adapter.kind, sourceSlug: source.slug, status: "failed", itemsFound: 0, error: err instanceof Error ? err.message : String(err), durationMs: Date.now() - t0 },
      items: [],
      startedAt,
      finishedAt: new Date().toISOString(),
    };
  }
}

export async function runDiscoveryPipeline(
  opts: RunPipelineOptions,
): Promise<DiscoveryReport> {
  const startedAt = new Date().toISOString();
  const settings = await opts.store.getSettings();
  const cfg: EngineConfig = {
    ...resolveConfig(settings),
    ...(opts.configOverride ?? {}),
  };

  const resolve = opts.getAdapter ?? defaultGetAdapter;
  const runs: IngestionRunResult[] = [];
  const errors: string[] = [];
  const allItems: NormalizedItem[] = [];

  for (const source of opts.sources) {
    const result = await runAdapter(source, opts.ctx, resolve);
    runs.push(result.run);
    if (result.run.status === "failed" && result.run.error) {
      errors.push(`${source.slug}: ${result.run.error}`);
    }
    if (opts.persist !== false) {
      await opts.store.saveIngestionRun({
        ...result.run,
        startedAt: result.startedAt,
        finishedAt: result.finishedAt,
      });
    }
    for (const item of result.items) allItems.push(toNormalized(item, source));
  }

  const trustBySlug = new Map(opts.sources.map((s) => [s.slug, s.trustScore]));
  const bareClusters = clusterItems(allItems, opts.dedupe);

  const scored: ScoredCluster[] = bareClusters.map((cluster) => {
    const trustScores = cluster.items
      .map((i) => trustBySlug.get(i.sourceSlug) ?? 40)
      .sort((a, b) => b - a);
    const distinctAdapters = new Set(cluster.items.map((i) => i.adapter)).size;

    const { scores, viralScore } = scoreCluster(
      { cluster, now: opts.ctx.now, trustScores, distinctAdapters },
      cfg.scoring,
    );
    const breaking = isBreaking(
      { cluster, scores, factConfidence: cluster.factConfidence, now: opts.ctx.now },
      cfg.breaking,
    );
    return { ...cluster, scores, viralScore, breaking };
  });

  scored.sort((a, b) => b.viralScore - a.viralScore);

  if (opts.persist !== false) {
    await opts.store.upsertClusters(scored);
  }

  return {
    startedAt,
    finishedAt: new Date().toISOString(),
    runs,
    itemsDiscovered: allItems.length,
    clusters: scored,
    errors,
  };
}
