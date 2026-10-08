import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const host = document.getElementById("root")!;
const prerendered = host.dataset.prerendered;
const norm = (p: string) => p.replace(/\/+$/, "") || "/";

if (!prerendered) {
  createRoot(host).render(<App />);
} else if (norm(prerendered) !== norm(window.location.pathname)) {
  // The host served another route's snapshot (SPA fallback) — discard it.
  host.replaceChildren();
  delete host.dataset.prerendered;
  createRoot(host).render(<App />);
} else {
  // Static snapshot from scripts/prerender-pages.mjs. Keep it on screen
  // while the app (and its lazy route chunk) boots in an invisible but
  // laid-out container, then swap — no blank flash in between.
  try {
    sessionStorage.setItem("preloaderShown", "1");
  } catch {
    // storage unavailable — the preloader just shows once
  }
  const app = document.createElement("div");
  app.style.cssText = "position:absolute;top:0;left:0;width:100%;visibility:hidden;pointer-events:none";
  host.after(app);
  let swapped = false;
  const swap = () => {
    if (swapped) return;
    swapped = true;
    observer.disconnect();
    host.remove();
    app.id = "root";
    app.style.cssText = "";
  };
  const observer = new MutationObserver(() => {
    if (app.querySelector("h1, main")) swap();
  });
  observer.observe(app, { childList: true, subtree: true });
  setTimeout(swap, 4000);
  createRoot(app).render(<App />);
}
