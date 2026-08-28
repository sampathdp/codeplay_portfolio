/**
 * Mock adapters for tests: emit a fixed item list, or fail on demand so
 * failure-isolation can be exercised.
 */

import type { AdapterKind, RawItem, SourceAdapter } from "../types";

export interface MockAdapterOptions {
  kind?: AdapterKind;
  items?: RawItem[];
  failWith?: string;
  canRun?: boolean;
}

export function makeMockAdapter(opts: MockAdapterOptions = {}): SourceAdapter {
  const kind = opts.kind ?? "mock";
  return {
    kind,
    canRun() {
      return opts.canRun ?? true;
    },
    async discover() {
      if (opts.failWith) throw new Error(opts.failWith);
      return opts.items ?? [];
    },
  };
}

export function mockRawItem(partial: Partial<RawItem> = {}): RawItem {
  return {
    externalId: partial.externalId ?? `mock:${Math.random().toString(36).slice(2)}`,
    title: partial.title ?? "Untitled",
    url: partial.url ?? "https://example.com/story",
    source: partial.source ?? "Mock Source",
    sourceSlug: partial.sourceSlug ?? "mock-source",
    adapter: partial.adapter ?? "mock",
    publishedAt: partial.publishedAt ?? new Date().toISOString(),
    summary: partial.summary,
    author: partial.author,
    signals: partial.signals ?? {},
    raw: partial.raw ?? {},
    commentsUrl: partial.commentsUrl,
  };
}
