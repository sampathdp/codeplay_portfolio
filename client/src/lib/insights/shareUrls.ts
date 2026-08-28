/**
 * Social share links — plain URLs, no third-party scripts. `copy` uses the
 * Clipboard API at call time.
 */

export interface ShareTargets {
  linkedin: string;
  facebook: string;
  x: string;
}

export function shareUrls(url: string, title: string): ShareTargets {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    x: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
  };
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  return false;
}
