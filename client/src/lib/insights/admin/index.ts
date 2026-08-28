/**
 * CodePlay Insights admin API.
 *
 * A thin, typed layer over the anon-key Supabase client. Authorization is
 * entirely database-side: RLS policies requiring `insights_is_admin()`
 * plus security-definer RPCs for workflow transitions. No privileged key
 * is ever present in the browser.
 *
 * Coverage:
 *   articles   — create / update / delete / archive / publish / unpublish
 *                / schedule / list drafts / list published / tags / sources
 *   candidates — list / approve / reject (per-source items)
 *   clusters   — list / review queue / detail / select / reject / ignore /
 *                force research / mark duplicate / ingestion runs
 *   sources    — list / create / update / enable / delete
 *   taxonomy   — categories + tags CRUD
 *   settings   — engine configuration get / set
 *   generation — queue Gemini jobs, apply proposals, approve, AI spend
 *   images     — generate / regenerate / edit-prompt / manual upload / remove
 *   audit      — read the admin action log
 */

export * from "./articles";
export * from "./candidates";
export * from "./clusters";
export * from "./sources";
export * from "./taxonomy";
export * from "./settings";
export * from "./generation";
export * from "./images";
export * from "./audit";
export * from "./dashboard";
export * from "./history";
export { T as INSIGHTS_TABLES, RPC as INSIGHTS_RPC } from "./tables";
