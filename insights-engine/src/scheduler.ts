/**
 * Scheduler helpers.
 *
 * The actual trigger is an external cron (GitHub Actions `schedule:` — see
 * `.github/workflows/insights-discover.yml`), because the site has no
 * long-running server. This module only reads the stored schedule config
 * to reason about discovery cadence and the local publish windows
 * (default timezone Asia/Colombo).
 */

import type { SchedulerConfig } from "./config";

function localHm(date: Date, timeZone: string): { h: number; m: number; ymd: string } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(date).map((p) => [p.type, p.value]),
  );
  return {
    h: Number(parts.hour === "24" ? "0" : parts.hour),
    m: Number(parts.minute),
    ymd: `${parts.year}-${parts.month}-${parts.day}`,
  };
}

function parseHm(hm: string): { h: number; m: number } {
  const [h, m] = hm.split(":").map(Number);
  return { h: h || 0, m: m || 0 };
}

export interface PublishWindowInfo {
  timezone: string;
  windows: string[];
  localNow: string;
  /** minutes until the next window opens (today or tomorrow). */
  minutesToNext: number;
  nextWindow: string;
  /** true when within `toleranceMin` minutes of a window. */
  atWindow: boolean;
}

export function publishWindowInfo(
  cfg: SchedulerConfig,
  now: Date = new Date(),
  toleranceMin = 20,
): PublishWindowInfo {
  const tz = cfg.timezone || "Asia/Colombo";
  const { h, m } = localHm(now, tz);
  const nowMin = h * 60 + m;

  const windowMins = (cfg.publishWindowsLocal ?? [])
    .map(parseHm)
    .map((w) => w.h * 60 + w.m)
    .sort((a, b) => a - b);

  let minutesToNext = Infinity;
  let nextWindow = windowMins.length ? "" : "n/a";
  for (const w of windowMins) {
    const delta = w - nowMin;
    const wrapped = delta >= 0 ? delta : delta + 1440;
    if (wrapped < minutesToNext) {
      minutesToNext = wrapped;
      nextWindow = `${String(Math.floor(w / 60)).padStart(2, "0")}:${String(w % 60).padStart(2, "0")}`;
    }
  }
  if (!Number.isFinite(minutesToNext)) minutesToNext = -1;

  const atWindow = windowMins.some((w) => Math.abs(w - nowMin) <= toleranceMin);

  return {
    timezone: tz,
    windows: cfg.publishWindowsLocal ?? [],
    localNow: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
    minutesToNext,
    nextWindow,
    atWindow,
  };
}

export function describeSchedule(cfg: SchedulerConfig): string {
  return [
    `timezone=${cfg.timezone}`,
    `discovery crons (UTC)=${(cfg.discovery?.cronsUtc ?? []).join(" ; ")}`,
    `publish windows (${cfg.timezone})=${(cfg.publishWindowsLocal ?? []).join(", ")}`,
    `max articles/day=${cfg.maxArticlesPerDay}`,
  ].join("\n");
}
