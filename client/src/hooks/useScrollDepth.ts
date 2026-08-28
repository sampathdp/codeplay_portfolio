import { useEffect, useRef } from "react";

/**
 * Fires `onDepth(percent)` once per threshold (25/50/75/100) as the reader
 * scrolls through the page. Passive listener, cleaned up on unmount. Safe
 * when the callback is a no-op (analytics disabled).
 */
export function useScrollDepth(
  onDepth: (percent: number) => void,
  thresholds: number[] = [25, 50, 75, 100],
): void {
  const firedRef = useRef<Set<number>>(new Set());
  const cbRef = useRef(onDepth);
  cbRef.current = onDepth;

  useEffect(() => {
    firedRef.current = new Set();
    let ticking = false;

    const measure = () => {
      ticking = false;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const pct = Math.min(
        100,
        Math.round(((window.scrollY || doc.scrollTop) / scrollable) * 100),
      );
      for (const t of thresholds) {
        if (pct >= t && !firedRef.current.has(t)) {
          firedRef.current.add(t);
          cbRef.current(t);
        }
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(measure);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    measure();
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thresholds.join(",")]);
}
