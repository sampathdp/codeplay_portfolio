import { describe, it, expect } from "vitest";
import { startOfDay, startOfWeek } from "./dashboard";

describe("startOfDay", () => {
  it("returns local midnight for the given timezone", () => {
    // 2026-08-28 06:00 UTC == 11:30 in Asia/Colombo (UTC+5:30)
    const now = new Date("2026-08-28T06:00:00Z");
    const s = startOfDay("Asia/Colombo", now);
    // local midnight of the 28th in Colombo == 18:30 UTC on the 27th
    expect(s).toBe("2026-08-27T18:30:00.000Z");
  });

  it("is <= now and within the last 24h", () => {
    const now = new Date();
    const s = Date.parse(startOfDay("Asia/Colombo", now));
    expect(s).toBeLessThanOrEqual(now.getTime());
    expect(now.getTime() - s).toBeLessThan(24 * 3600 * 1000 + 1000);
  });

  it("handles UTC", () => {
    const now = new Date("2026-08-28T13:45:12Z");
    expect(startOfDay("UTC", now)).toBe("2026-08-28T00:00:00.000Z");
  });
});

describe("startOfWeek", () => {
  it("is 6 days before start of day", () => {
    const now = new Date("2026-08-28T06:00:00Z");
    const d = Date.parse(startOfDay("Asia/Colombo", now));
    const w = Date.parse(startOfWeek("Asia/Colombo", now));
    expect(d - w).toBe(6 * 86_400_000);
  });
});
