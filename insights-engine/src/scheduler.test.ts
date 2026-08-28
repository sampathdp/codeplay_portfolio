import { describe, it, expect } from "vitest";
import { publishWindowInfo, describeSchedule } from "./scheduler";
import { DEFAULT_CONFIG } from "./config";

const cfg = DEFAULT_CONFIG.scheduler;

describe("publishWindowInfo", () => {
  it("reports local time in the configured timezone (Asia/Colombo, UTC+5:30)", () => {
    // 03:00 UTC == 08:30 in Asia/Colombo
    const info = publishWindowInfo(cfg, new Date("2026-08-28T03:00:00Z"));
    expect(info.timezone).toBe("Asia/Colombo");
    expect(info.localNow).toBe("08:30");
    expect(info.atWindow).toBe(true);
    expect(info.nextWindow).toBe("08:30");
  });

  it("computes minutes to the next window and wraps past midnight", () => {
    // 18:00 UTC == 23:30 local — just after the 22:30 window; next is 08:30
    const info = publishWindowInfo(cfg, new Date("2026-08-28T18:00:00Z"));
    expect(info.localNow).toBe("23:30");
    expect(info.nextWindow).toBe("08:30");
    expect(info.minutesToNext).toBe(9 * 60); // 23:30 -> 08:30 = 9h
    expect(info.atWindow).toBe(false);
  });

  it("lists the configured windows", () => {
    const info = publishWindowInfo(cfg, new Date("2026-08-28T00:00:00Z"));
    expect(info.windows).toEqual(["08:30", "15:30", "22:30"]);
  });
});

describe("describeSchedule", () => {
  it("summarizes timezone, crons and windows", () => {
    const text = describeSchedule(cfg);
    expect(text).toContain("Asia/Colombo");
    expect(text).toContain("08:30, 15:30, 22:30");
    expect(text).toContain("0 3,7,10,14,17,21 * * *");
  });
});
