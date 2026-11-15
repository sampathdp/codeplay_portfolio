import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight } from "lucide-react";
import { SiGoogleplay } from "react-icons/si";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  COLORBLOOM_IMAGES,
  COLORBLOOM_PAGE,
  COLORBLOOM_PLAY_URL,
} from "@/data/colorBloom";

const STORAGE_KEY = "colorbloomPromoSeen";
// Wait for the preloader and first paint before interrupting.
const SHOW_DELAY_MS = 2500;

function alreadySeen(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // storage blocked (private mode) — popup may show again, harmless
  }
}

/**
 * One-time-per-session announcement for the ColorBloom launch.
 * Skipped on the ColorBloom page itself, admin/tools routes, and for
 * headless browsers (the prerender script) so it never lands in the
 * static HTML crawlers see.
 */
export default function ColorBloomPopup() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (navigator.webdriver) return;
    if (alreadySeen()) return;
    if (
      location.startsWith(COLORBLOOM_PAGE) ||
      location.startsWith("/admin") ||
      location.startsWith("/tools")
    ) {
      return;
    }
    const t = window.setTimeout(() => {
      if (alreadySeen()) return;
      markSeen();
      setOpen(true);
    }, SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, [location]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md overflow-hidden border-white/10 bg-[#141233] p-0 text-white sm:rounded-2xl [&>button]:text-white/80 [&>button]:hover:text-white">
        <div className="relative">
          <img
            src={COLORBLOOM_IMAGES.feature}
            alt="ColorBloom — Mindful Coloring & Art"
            width={1024}
            height={572}
            className="block aspect-[1024/572] w-full object-cover"
          />
          <span className="absolute left-3 top-3 rounded-full bg-pink-500/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-lg">
            New app
          </span>
        </div>

        <div className="space-y-4 px-6 pb-6 pt-2">
          <div className="flex items-center gap-3">
            <img
              src={COLORBLOOM_IMAGES.icon}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 rounded-xl"
            />
            <div className="text-left">
              <DialogTitle className="text-xl font-bold">
                ColorBloom is live!
              </DialogTitle>
              <p className="text-sm text-white/60">by CodePlay Studio</p>
            </div>
          </div>

          <DialogDescription className="text-left text-white/75">
            Our new mindful coloring app for Android. Color mandalas, create
            symmetry art and turn your work into HD wallpapers. Works offline,
            no ads.
          </DialogDescription>

          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href={COLORBLOOM_PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:brightness-110"
            >
              <SiGoogleplay className="h-4 w-4" /> Get it on Google Play
            </a>
            <Link
              href={COLORBLOOM_PAGE}
              onClick={() => setOpen(false)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/5"
            >
              Learn more <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
