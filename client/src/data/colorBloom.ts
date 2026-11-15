/**
 * ColorBloom — CodePlay Studio's mindful coloring app for Android.
 * Shared by the /colorbloom landing page and the launch popup.
 */

export const COLORBLOOM_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.codeplaystudio.colorbloom";

export const COLORBLOOM_PAGE = "/colorbloom";
export const COLORBLOOM_PRIVACY = "/colorbloom/privacy-policy";

const base = "/assets/colorbloom";

export const COLORBLOOM_IMAGES = {
  icon: `${base}/icon-256.webp`,
  feature: `${base}/feature-1024.webp`,
  og: `${base}/og.jpg`,
};

export interface ColorBloomScreen {
  src: string;
  title: string;
  caption: string;
}

export const COLORBLOOM_SCREENS: ColorBloomScreen[] = [
  { src: `${base}/home.webp`, title: "Endless Inspiration", caption: "Curated designs and a new design of the day." },
  { src: `${base}/coloring.webp`, title: "Tap to Color", caption: "Smooth fills with undo, redo and zoom." },
  { src: `${base}/symmetry.webp`, title: "Symmetry Studio", caption: "Draw live mandalas with 8x, 12x or 16x symmetry." },
  { src: `${base}/mandala-studio.webp`, title: "Mandala Studio", caption: "Build and color your own mandala designs." },
  { src: `${base}/timelapse.webp`, title: "Timelapse & Wallpapers", caption: "Replay your work and export it as an HD wallpaper." },
  { src: `${base}/streaks.webp`, title: "Streaks & Gallery", caption: "Keep a daily streak and revisit every finished piece." },
  { src: `${base}/calendar.webp`, title: "Coloring Calendar", caption: "See your mindful moments day by day." },
  { src: `${base}/completion.webp`, title: "Masterpiece Moments", caption: "Celebrate every artwork you complete." },
];
