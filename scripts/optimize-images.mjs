/**
 * One-shot image optimizer.
 *
 * Converts the oversized PNGs that ship with the marketing site into
 * right-sized WebP (and shrinks the couple of PNGs that must stay PNG for
 * crawler/OG compatibility).
 *
 * The hero entries now read their own .webp as source (the PNG originals
 * were removed). They are already at target width, so re-runs only
 * re-encode — harmless once or twice, but don't loop it needlessly.
 *
 *   node scripts/optimize-images.mjs
 */
import sharp from "sharp";
import { readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KiB = (n) => `${(n / 1024).toFixed(1)} KiB`;

/** @type {{src: string, out: string, width: number, format: "webp"|"png"}[]} */
const jobs = [
  // --- client/public/assets: served verbatim, referenced by string path ---
  // Visible logo: displayed at ~48px, square. 128px covers retina.
  // Filename carries the size so a content change gets a fresh URL (the
  // files in public/ are NOT content-hashed by Vite — bump the suffix
  // when regenerating at a new size).
  { src: "client/public/assets/logo_trans.png", out: "client/public/assets/logo_trans-128.webp", width: 128, format: "webp" },
  // Same source file, shrunk in place: still used as og:image / JSON-LD
  // logo where PNG is the safe bet. 2048 -> 512.
  { src: "client/public/assets/logo_trans.png", out: "client/public/assets/logo_trans.png", width: 512, format: "png" },

  // Hero carousel cartoons: displayed up to ~550px on desktop.
  // Master transparent PNGs re-encoded to crisp 800px WebP.
  { src: "client/public/assets/hero_web_dev_cartoon.png", out: "client/public/assets/hero_web_dev_cartoon-640.webp", width: 800, format: "webp" },
  { src: "client/public/assets/hero_mobile_dev_cartoon.png", out: "client/public/assets/hero_mobile_dev_cartoon-640.webp", width: 800, format: "webp" },
  { src: "client/public/assets/hero_creative_dev_cartoon.png", out: "client/public/assets/hero_creative_dev_cartoon-640.webp", width: 800, format: "webp" },

  // --- attached_assets: pulled in via `@assets` import, Vite hashes them ---
  { src: "attached_assets/futuristic_web_dev.png", out: "attached_assets/futuristic_web_dev.webp", width: 1100, format: "webp" },
  { src: "attached_assets/futuristic_erp_system.png", out: "attached_assets/futuristic_erp_system.webp", width: 1100, format: "webp" },
  { src: "attached_assets/generated_images/futuristic_ai_concept.png", out: "attached_assets/generated_images/futuristic_ai_concept.webp", width: 1100, format: "webp" },
  { src: "attached_assets/generated_images/futuristic_mobile_dev.png", out: "attached_assets/generated_images/futuristic_mobile_dev.webp", width: 1100, format: "webp" },
  { src: "attached_assets/generated_images/futuristic_unity_game_dev.png", out: "attached_assets/generated_images/futuristic_unity_game_dev.webp", width: 1100, format: "webp" },
];

let before = 0;
let after = 0;

for (const job of jobs) {
  const srcPath = path.join(root, job.src);
  const outPath = path.join(root, job.out);

  const input = await readFile(srcPath);
  before += input.length;

  const pipeline = sharp(input).resize({
    width: job.width,
    withoutEnlargement: true,
  });

  const output =
    job.format === "webp"
      ? await pipeline.webp({ quality: 80, effort: 6 }).toBuffer()
      : await pipeline.png({ compressionLevel: 9, palette: true }).toBuffer();

  await writeFile(outPath, output);
  after += output.length;

  console.log(
    `${job.src}\n  -> ${job.out}  ${KiB(input.length)} -> ${KiB(output.length)}`,
  );
}

console.log(`\nTotal: ${KiB(before)} -> ${KiB(after)}  (saved ${KiB(before - after)})`);
