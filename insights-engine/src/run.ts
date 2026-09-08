/**
 * CLI entrypoint for the discovery engine.
 *
 *   tsx insights-engine/src/run.ts discover            # gather + score + persist
 *   tsx insights-engine/src/run.ts discover --dry-run  # no DB writes
 *   tsx insights-engine/src/run.ts discover --select   # also print daily picks
 *   tsx insights-engine/src/run.ts schedule            # print schedule config
 *
 * Designed to be invoked by GitHub Actions cron. It NEVER generates or
 * publishes articles.
 */

import { DEFAULT_CONFIG, resolveConfig } from "./config";
import { createContext, createLogger } from "./context";
import { runDiscoveryPipeline } from "./pipeline";
import { selectDailyArticleCandidates, type SelectionPick } from "./selection";
import { planAutoQueue } from "./generation/autoQueue";
import { describeSchedule, publishWindowInfo } from "./scheduler";
import { MemoryStore } from "./store/memory";
import { SupabaseStore, createServiceClient } from "./store/supabase";
import { FALLBACK_SOURCES, loadSources } from "./sources";
import type { Store } from "./store/types";
import type { SourceConfig } from "./types";

const env = process.env as Record<string, string | undefined>;

function has(flag: string): boolean {
  return process.argv.includes(flag);
}

function startOfUtcDayIso(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Autopilot: queue a `full_article` job for each daily pick, respecting
 *  the daily quota and skipping clusters already spoken for. */
async function autoQueueDailyPicks(
  store: SupabaseStore,
  picks: SelectionPick[],
  maxArticlesPerDay: number,
  log: (msg: string, extra?: Record<string, unknown>) => void,
): Promise<void> {
  if (picks.length === 0) {
    log("autoqueue.skip", { reason: "no picks" });
    return;
  }

  const load = await store.countFullArticleJobsSince(startOfUtcDayIso());
  const quotaRemaining = Math.max(0, maxArticlesPerDay - load);

  const rows = await store.getClustersByKey(picks.map((p) => p.cluster.key));
  const clusterIdByKey = new Map(rows.map((r) => [r.key, r.id]));
  const liveJobIds = await store.getClusterIdsWithLiveJob(rows.map((r) => r.id));

  const blockedClusterIds = new Set<string>();
  for (const r of rows) {
    if (r.status === "converted" || r.articleId || liveJobIds.has(r.id)) {
      blockedClusterIds.add(r.id);
    }
  }

  const plan = planAutoQueue({ picks, quotaRemaining, blockedClusterIds, clusterIdByKey });
  for (const item of plan.queue) {
    await store.queueAutoGeneration(item.clusterId, item.reason);
  }

  log("autoqueue.done", {
    queued: plan.queue.length,
    skipped: plan.skipped.length,
    quotaRemaining,
    dailyLoad: load,
    skippedReasons: plan.skipped,
  });
  console.log(
    `\n(autopilot) queued ${plan.queue.length} generation job(s), skipped ${plan.skipped.length} (quota left ${quotaRemaining}).`,
  );
}

async function main() {
  const cmd = process.argv[2] ?? "discover";
  const dryRun = has("--dry-run");
  const log = createLogger("insights.run");

  const httpCfg = DEFAULT_CONFIG.http;

  if (cmd === "schedule") {
    let settings: Record<string, unknown> = {};
    if (!dryRun && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      settings = await new SupabaseStore(createServiceClient(env)).getSettings();
    }
    const cfg = resolveConfig(settings);
    console.log(describeSchedule(cfg.scheduler));
    console.log(JSON.stringify(publishWindowInfo(cfg.scheduler), null, 2));
    return;
  }

  if (cmd !== "discover") {
    console.error(`unknown command: ${cmd}`);
    process.exit(2);
  }

  let store: Store;
  let sources: SourceConfig[];

  if (dryRun || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    if (!dryRun) log("no Supabase env — running dry", {});
    store = new MemoryStore();
    sources = FALLBACK_SOURCES;
  } else {
    const sb = createServiceClient(env);
    store = new SupabaseStore(sb);
    sources = await loadSources(sb);
  }

  const ctx = createContext({ http: httpCfg, env, log });
  const report = await runDiscoveryPipeline({
    sources,
    ctx,
    store,
    persist: !dryRun,
  });

  const ok = report.runs.filter((r) => r.status === "succeeded").length;
  const failed = report.runs.filter((r) => r.status === "failed");
  log("discovery.done", {
    sources: report.runs.length,
    succeeded: ok,
    failed: failed.length,
    itemsDiscovered: report.itemsDiscovered,
    clusters: report.clusters.length,
  });
  for (const f of failed) log("discovery.source.failed", { source: f.sourceSlug, error: f.error });

  console.log("\nTop clusters:");
  for (const c of report.clusters.slice(0, 12)) {
    console.log(
      `  ${c.viralScore.toFixed(0).padStart(3)} | ${c.factConfidence.padEnd(15)} | ${c.sourceCount} src | ${c.breaking ? "BREAKING " : ""}${c.title.slice(0, 90)}`,
    );
  }

  if (has("--select")) {
    const settings = await store.getSettings();
    const cfg = resolveConfig(settings);
    const recentlyUsedKeys = await store.getRecentlyUsedClusterKeys(cfg.selection.lookbackHours * 2);
    const forcedKeys = await store.getForcedClusterKeys();
    const selection = selectDailyArticleCandidates(
      { clusters: report.clusters, now: ctx.now, recentlyUsedKeys, forcedKeys },
      cfg.selection,
    );
    console.log("\nDaily article candidates:");
    for (const p of selection.picks) {
      console.log(`  [slot ${p.slot}] ${p.cluster.title.slice(0, 90)}\n      ${p.reason}`);
    }
    if (selection.note) console.log(`  note: ${selection.note}`);

    // Autopilot — when publishing.autoPublish is on, queue a generation job
    // for each daily pick. Off = print-only, exactly as before.
    const autopilot = Boolean(
      (settings.publishing as { autoPublish?: boolean } | undefined)?.autoPublish,
    );
    if (autopilot && dryRun) {
      console.log(
        `\n(autopilot) dry run — would queue: ${selection.picks.map((p) => p.cluster.key).join(", ") || "nothing"}`,
      );
    } else if (autopilot && store instanceof SupabaseStore) {
      await autoQueueDailyPicks(store, selection.picks, cfg.scheduler.maxArticlesPerDay, log);
    }
  }

  if (failed.length === report.runs.length && report.runs.length > 0) {
    process.exit(1); // every source failed — signal the cron
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
