import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The client admin gate is UX only, but it must never mistake a
 * non-admin for an admin. RLS (`insights_admins_self_read`) is what makes
 * this safe: a signed-in user can only see their own row.
 */

const state = vi.hoisted(() => ({
  user: null as { id: string } | null,
  adminRow: null as unknown,
}));

vi.mock("./supabase", () => ({
  getInsightsSupabase: () => ({
    auth: {
      getUser: async () => ({ data: { user: state.user }, error: null }),
      getSession: async () => ({
        data: { session: state.user ? { user: state.user } : null },
        error: null,
      }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: state.adminRow, error: null }),
        }),
      }),
    }),
  }),
}));

import { getAdminProfile, isCurrentUserAdmin, getSession } from "./auth";

beforeEach(() => {
  state.user = null;
  state.adminRow = null;
});

describe("getAdminProfile", () => {
  it("is null when signed out", async () => {
    expect(await getAdminProfile()).toBeNull();
    expect(await isCurrentUserAdmin()).toBe(false);
  });

  it("is null when signed in but not in insights_admins", async () => {
    state.user = { id: "u1" };
    state.adminRow = null;
    expect(await getAdminProfile()).toBeNull();
    expect(await isCurrentUserAdmin()).toBe(false);
  });

  it("returns the row for a real admin", async () => {
    state.user = { id: "u1" };
    state.adminRow = { user_id: "u1", role: "admin", email: "a@b.c" };
    expect(await getAdminProfile()).toEqual({
      user_id: "u1",
      role: "admin",
      email: "a@b.c",
    });
    expect(await isCurrentUserAdmin()).toBe(true);
  });
});

describe("getSession", () => {
  it("reflects sign-in state", async () => {
    expect(await getSession()).toBeNull();
    state.user = { id: "u1" };
    expect(await getSession()).not.toBeNull();
  });
});
