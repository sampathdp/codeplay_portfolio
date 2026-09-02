import { useEffect, useSyncExternalStore } from "react";
import {
  subscribeFeed,
  getFeedVersion,
  getFeedStatus,
  type FeedStatus,
} from "@/lib/insights/feed";
import { hydrateInsightsFeed } from "@/lib/insights/liveFeed";

/**
 * Subscribes a public Insights page to the shared feed store and kicks off
 * the one-time live hydration from Supabase. Every reader in
 * `lib/insights/feed` (getFeatured, byCategory, searchArticles, …) picks
 * up the live data automatically once it lands; this hook just makes the
 * component re-render when it does.
 *
 * Returns the current status so pages can show a "loading" state instead
 * of an empty / not-found flash while the first fetch is in flight.
 */
export function useInsightsFeed(): FeedStatus {
  useSyncExternalStore(subscribeFeed, getFeedVersion, getFeedVersion);

  useEffect(() => {
    void hydrateInsightsFeed();
  }, []);

  return getFeedStatus();
}
