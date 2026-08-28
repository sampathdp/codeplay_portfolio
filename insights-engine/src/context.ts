/**
 * Builds the `AdapterContext` handed to every adapter: a bounded HTTP
 * client (timeout / retry / backoff / per-host throttle), a logger, the
 * current time, and a read-only view of the environment.
 */

import type { AdapterContext } from "./types";
import type { EngineConfig } from "./config";
import { createHttpClient, type Logger } from "./http";

export function createLogger(prefix = "insights"): Logger {
  return (msg, extra) => {
    const line = JSON.stringify({ t: new Date().toISOString(), scope: prefix, msg, ...extra });
    // eslint-disable-next-line no-console
    console.log(line);
  };
}

export interface CreateContextOptions {
  http: EngineConfig["http"];
  now?: Date;
  env?: Record<string, string | undefined>;
  log?: Logger;
  fetchImpl?: typeof fetch;
}

export function createContext(opts: CreateContextOptions): AdapterContext {
  const log = opts.log ?? createLogger();
  const client = createHttpClient(opts.http, log, opts.fetchImpl);
  return {
    now: opts.now ?? new Date(),
    env: opts.env ?? {},
    log,
    fetchText: (url, init) => client.text(url, init),
    fetchJson: <T>(url: string, init?: RequestInit) => client.json<T>(url, init),
  };
}
