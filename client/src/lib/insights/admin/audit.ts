/**
 * Read access to the admin audit log (`insights_admin_action_logs`).
 * Writes happen only inside the security-definer workflow RPCs.
 */

import { getInsightsSupabase } from "../supabase";
import type { AdminActionLogRow } from "../records";
import { T } from "./tables";

export interface ListAuditOptions {
  entityType?: string;
  entityId?: string;
  actor?: string;
  limit?: number;
  offset?: number;
}

export async function listAuditLogs(
  opts: ListAuditOptions = {},
): Promise<AdminActionLogRow[]> {
  let filter = getInsightsSupabase().from(T.auditLogs).select("*");

  if (opts.entityType) filter = filter.eq("entity_type", opts.entityType);
  if (opts.entityId) filter = filter.eq("entity_id", opts.entityId);
  if (opts.actor) filter = filter.eq("actor", opts.actor);

  let query = filter.order("created_at", { ascending: false });
  const from = opts.offset ?? 0;
  query = query.range(from, from + (opts.limit ?? 100) - 1);

  const res = await query;
  if (res.error) throw new Error(res.error.message);
  return (res.data as AdminActionLogRow[]) ?? [];
}
