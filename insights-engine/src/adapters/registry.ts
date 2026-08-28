/**
 * Adapter registry. Adapters are looked up by `source.adapter`; each can
 * be enabled/disabled per-source (`source.enabled`) and may additionally
 * refuse to run (`canRun`) when required credentials are missing.
 */

import type { AdapterKind, SourceAdapter } from "../types";
import { hackerNewsAdapter } from "./hackernews";
import { rssAdapter } from "./rss";
import { githubReleasesAdapter } from "./githubReleases";
import { redditAdapter } from "./reddit";

const REGISTRY = new Map<AdapterKind, SourceAdapter>();

export function registerAdapter(adapter: SourceAdapter): void {
  REGISTRY.set(adapter.kind, adapter);
}

export function getAdapter(kind: string): SourceAdapter | undefined {
  return REGISTRY.get(kind as AdapterKind);
}

export function listAdapters(): SourceAdapter[] {
  return [...REGISTRY.values()];
}

registerAdapter(hackerNewsAdapter);
registerAdapter(rssAdapter);
registerAdapter(githubReleasesAdapter);
registerAdapter(redditAdapter);
