import { describe, it, expect } from "vitest";
import { planAutoQueue } from "./autoQueue";
import type { SelectionPick } from "../selection";
import type { ScoredCluster } from "../types";

function pick(key: string, reason = "slot pick"): SelectionPick {
  return {
    cluster: { key } as ScoredCluster,
    slot: 1,
    reason,
  };
}

const idMap = (keys: string[]) => new Map(keys.map((k) => [k, `id-${k}`]));

describe("planAutoQueue", () => {
  it("queues every pick when quota and cluster rows allow", () => {
    const picks = [pick("a"), pick("b")];
    const plan = planAutoQueue({
      picks,
      quotaRemaining: 3,
      blockedClusterIds: new Set(),
      clusterIdByKey: idMap(["a", "b"]),
    });
    expect(plan.queue.map((q) => q.clusterId)).toEqual(["id-a", "id-b"]);
    expect(plan.skipped).toHaveLength(0);
  });

  it("caps the queue at the remaining daily quota", () => {
    const picks = [pick("a"), pick("b"), pick("c")];
    const plan = planAutoQueue({
      picks,
      quotaRemaining: 1,
      blockedClusterIds: new Set(),
      clusterIdByKey: idMap(["a", "b", "c"]),
    });
    expect(plan.queue).toHaveLength(1);
    expect(plan.skipped.map((s) => s.reason)).toEqual([
      "daily quota reached",
      "daily quota reached",
    ]);
  });

  it("queues nothing when the quota is already spent", () => {
    const plan = planAutoQueue({
      picks: [pick("a")],
      quotaRemaining: 0,
      blockedClusterIds: new Set(),
      clusterIdByKey: idMap(["a"]),
    });
    expect(plan.queue).toHaveLength(0);
  });

  it("skips clusters already converted or holding a live job", () => {
    const plan = planAutoQueue({
      picks: [pick("a"), pick("b")],
      quotaRemaining: 5,
      blockedClusterIds: new Set(["id-a"]),
      clusterIdByKey: idMap(["a", "b"]),
    });
    expect(plan.queue.map((q) => q.clusterKey)).toEqual(["b"]);
    expect(plan.skipped[0]).toEqual({
      clusterKey: "a",
      reason: "already queued or converted",
    });
  });

  it("skips picks whose cluster was not persisted", () => {
    const plan = planAutoQueue({
      picks: [pick("ghost")],
      quotaRemaining: 5,
      blockedClusterIds: new Set(),
      clusterIdByKey: new Map(),
    });
    expect(plan.queue).toHaveLength(0);
    expect(plan.skipped[0].reason).toBe("cluster row not found");
  });

  it("carries the selection reason onto the job", () => {
    const plan = planAutoQueue({
      picks: [pick("a", "gaming slot: viral 71/100")],
      quotaRemaining: 5,
      blockedClusterIds: new Set(),
      clusterIdByKey: idMap(["a"]),
    });
    expect(plan.queue[0].reason).toBe("gaming slot: viral 71/100");
  });
});
