import type { ReactNode } from "react";

/**
 * "Tools" now lives as a standalone app at wipeclip.co. In a production
 * build the marketing site links straight there and the in-repo /tools
 * pages redirect out. Locally (`vite dev`) the internal pages still load
 * so they can be worked on.
 */
export const TOOLS_EXTERNAL_URL = "https://wipeclip.co";

/** Where the nav / footer "Tools" link should point. */
export const TOOLS_HREF = import.meta.env.PROD ? TOOLS_EXTERNAL_URL : "/tools";

/** True when /tools* routes should bounce to the external app. */
export const REDIRECT_TOOLS = import.meta.env.PROD;

/**
 * Wraps a /tools route element: in production it replaces the location
 * with the external app (same tab); in dev it renders the real page.
 */
export function ToolsGate({ children }: { children: ReactNode }) {
  if (REDIRECT_TOOLS) {
    if (typeof window !== "undefined") {
      window.location.replace(TOOLS_EXTERNAL_URL);
    }
    return null;
  }
  return <>{children}</>;
}
