import { useEffect, useRef, useState } from "react";

/**
 * Google AdSense placement — dormant by default.
 *
 * Renders NOTHING unless BOTH are set at build time:
 *   VITE_ADSENSE_CLIENT   e.g. "ca-pub-XXXXXXXXXXXXXXXX"
 *   VITE_ADSENSE_ENABLED  "true"   (flip on only after AdSense approval)
 *
 * When active:
 *  - the container reserves its height up-front (no layout shift / CLS),
 *  - the adsbygoogle script is injected once, lazily, the first time any
 *    slot scrolls near the viewport,
 *  - the unit is clearly labelled and never overlays content.
 */

const CLIENT = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;
const ENABLED = import.meta.env.VITE_ADSENSE_ENABLED as string | undefined;

export function adsenseActive(): boolean {
  return Boolean(CLIENT) && ENABLED === "true";
}

interface AdWindow extends Window {
  adsbygoogle?: unknown[];
  __adsenseLoaded?: boolean;
}

function loadAdsenseScript(): void {
  const win = window as AdWindow;
  if (win.__adsenseLoaded || !CLIENT) return;
  win.__adsenseLoaded = true;
  const s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(CLIENT)}`;
  document.head.appendChild(s);
}

export type AdPlacement =
  | "in-article-top"
  | "in-article-mid"
  | "after-article"
  | "sidebar";

interface AdSlotProps {
  placement: AdPlacement;
  /** AdSense ad unit slot id (numeric string). */
  slot?: string;
  className?: string;
}

const MIN_HEIGHT: Record<AdPlacement, number> = {
  "in-article-top": 280,
  "in-article-mid": 280,
  "after-article": 280,
  sidebar: 600,
};

export default function AdSlot({ placement, slot, className = "" }: AdSlotProps) {
  const ref = useRef<HTMLModElement>(null);
  const [visible, setVisible] = useState(false);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!adsenseActive()) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || pushedRef.current) return;
    pushedRef.current = true;
    loadAdsenseScript();
    try {
      const win = window as AdWindow;
      win.adsbygoogle = win.adsbygoogle || [];
      win.adsbygoogle.push({});
    } catch {
      /* AdSense not ready yet — it retries its own queue */
    }
  }, [visible]);

  if (!adsenseActive()) return null;

  const isSidebar = placement === "sidebar";

  return (
    <div
      className={`my-8 flex flex-col items-center ${className}`}
      style={{ minHeight: MIN_HEIGHT[placement] }}
      aria-hidden="true"
    >
      <span className="mb-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
        Advertisement
      </span>
      <ins
        ref={ref}
        className="adsbygoogle block w-full"
        style={{
          display: "block",
          minHeight: MIN_HEIGHT[placement] - 16,
          width: "100%",
        }}
        data-ad-client={CLIENT}
        data-ad-slot={slot}
        data-ad-format={isSidebar ? "vertical" : "fluid"}
        data-ad-layout={isSidebar ? undefined : "in-article"}
        data-full-width-responsive="true"
      />
    </div>
  );
}
