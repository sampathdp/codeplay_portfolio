import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

/**
 * Inline the built stylesheet into <head> as a <style> block and drop the
 * render-blocking <link>. The app is a single HTML document, so the extra
 * inline bytes (gzip-equivalent to the file) are paid once, and FCP no
 * longer waits on a separate CSS request on the critical path.
 */
function inlineCss(): Plugin {
  return {
    name: "inline-css",
    enforce: "post",
    apply: "build",
    transformIndexHtml(html, ctx) {
      const bundle = ctx.bundle;
      if (!bundle) return html;
      const cssFile = Object.keys(bundle).find((f) => f.endsWith(".css"));
      if (!cssFile) return html;
      const asset = bundle[cssFile] as { source?: string | Uint8Array };
      const css =
        typeof asset.source === "string"
          ? asset.source
          : Buffer.from(asset.source ?? "").toString("utf8");
      const base = cssFile.split("/").pop() ?? cssFile;
      // Nothing references the file once it is inlined — drop it.
      delete bundle[cssFile];
      return html
        .replace(new RegExp(`<link[^>]+href="[^"]*${base}"[^>]*>\\s*`), "")
        .replace("</head>", `<style>${css}</style></head>`);
    },
  };
}

/**
 * AdSense site ownership. When VITE_ADSENSE_CLIENT ("ca-pub-…") is set at
 * build time this emits /ads.txt and adds the `google-adsense-account`
 * meta tag Google uses to verify the site during review — independent of
 * VITE_ADSENSE_ENABLED, which only switches ad units on after approval.
 * Without it the host's SPA fallback serves index.html at /ads.txt, which
 * AdSense reports as "ads.txt not found".
 */
function adsense(): Plugin {
  const client = (process.env.VITE_ADSENSE_CLIENT ?? "").trim();
  const pub = client.replace(/^ca-/, "");
  const valid = /^pub-\d{10,20}$/.test(pub);
  return {
    name: "adsense-ownership",
    apply: "build",
    transformIndexHtml(html) {
      if (!valid) return html;
      return html.replace(
        "</head>",
        `<meta name="google-adsense-account" content="ca-${pub}" /></head>`,
      );
    },
    generateBundle() {
      if (!valid) return;
      this.emitFile({
        type: "asset",
        fileName: "ads.txt",
        source: `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`,
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), inlineCss(), adsense()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  // `root` is client/, but the single .env lives at the repo root (shared
  // with the engine scripts). Without this, VITE_* vars are not picked up.
  envDir: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "wouter"],
          "motion-vendor": ["framer-motion"],
        },
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
