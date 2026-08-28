import { describe, it, expect } from "vitest";
import { adsenseActive } from "./AdSlot";

/**
 * Ads are dormant unless BOTH VITE_ADSENSE_CLIENT and
 * VITE_ADSENSE_ENABLED="true" are set at build time. Neither is set in
 * tests or by default, so the unit must be inert.
 */
describe("AdSlot", () => {
  it("is inactive unless explicitly configured and enabled", () => {
    expect(adsenseActive()).toBe(false);
  });
});
