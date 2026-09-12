import sharp from "sharp";
import path from "path";

async function processImage(inputPath, outPngPath, outWebpPath, previewDarkPath, tolerance = 238) {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;
  
  function isWhite(idx) {
    const r = data[idx * channels];
    const g = data[idx * channels + 1];
    const b = data[idx * channels + 2];
    return r >= tolerance && g >= tolerance && b >= tolerance;
  }

  // Seed borders
  for (let x = 0; x < width; x++) {
    const top = x;
    if (isWhite(top) && !visited[top]) { visited[top] = 1; queue[tail++] = top; }
    const btm = (height - 1) * width + x;
    if (isWhite(btm) && !visited[btm]) { visited[btm] = 1; queue[tail++] = btm; }
  }
  for (let y = 0; y < height; y++) {
    const lft = y * width;
    if (isWhite(lft) && !visited[lft]) { visited[lft] = 1; queue[tail++] = lft; }
    const rgt = y * width + (width - 1);
    if (isWhite(rgt) && !visited[rgt]) { visited[rgt] = 1; queue[tail++] = rgt; }
  }

  // BFS
  while (head < tail) {
    const curr = queue[head++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    const neighbors = [
      cx > 0 ? curr - 1 : -1,
      cx < width - 1 ? curr + 1 : -1,
      cy > 0 ? curr - width : -1,
      cy < height - 1 ? curr + width : -1
    ];

    for (const n of neighbors) {
      if (n !== -1 && !visited[n] && isWhite(n)) {
        visited[n] = 1;
        queue[tail++] = n;
      }
    }
  }

  // Feather / anti-alias boundary
  for (let i = 0; i < width * height; i++) {
    if (visited[i]) {
      data[i * channels + 3] = 0;
    } else {
      const cx = i % width;
      const cy = Math.floor(i / width);
      const isBoundary = (cx > 0 && visited[i - 1]) ||
                         (cx < width - 1 && visited[i + 1]) ||
                         (cy > 0 && visited[i - width]) ||
                         (cy < height - 1 && visited[i + width]);
      if (isBoundary) {
        const r = data[i * channels];
        const g = data[i * channels + 1];
        const b = data[i * channels + 2];
        const brightness = (r + g + b) / 3;
        if (brightness > 220) {
          const factor = Math.max(0, Math.min(1, (255 - brightness) / 35));
          data[i * channels + 3] = Math.round(factor * 255);
        }
      }
    }
  }

  // Save transparent PNG
  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(outPngPath);

  // Save optimized WebP for web (width 800 or 1024)
  await sharp(data, { raw: { width, height, channels } })
    .webp({ quality: 95, effort: 6 })
    .toFile(outWebpPath);

  // Preview on dark website background
  const darkBg = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 10, g: 10, b: 18, alpha: 1 }
    }
  }).png().toBuffer();

  await sharp(darkBg)
    .composite([{ input: outPngPath }])
    .toFile(previewDarkPath);

  console.log("Finished:", outPngPath, "WebP:", outWebpPath);
}

const dir = "C:/Users/sampa/.gemini/antigravity-ide/brain/e0cc974e-d402-4b79-9bf6-61afda1077bd";

await processImage(
  path.join(dir, "web_dev_white_bg_1789234293637.jpg"),
  path.join(dir, "web_dev_transparent.png"),
  path.join(dir, "web_dev_transparent.webp"),
  path.join(dir, "web_dev_dark_preview.png"),
  238
);

await processImage(
  path.join(dir, "creative_design_white_bg_1789234309935.jpg"),
  path.join(dir, "creative_design_transparent.png"),
  path.join(dir, "creative_design_transparent.webp"),
  path.join(dir, "creative_design_dark_preview.png"),
  238
);

await processImage(
  path.join(dir, "mobile_app_white_bg_1789234226390.jpg"),
  path.join(dir, "mobile_app_transparent.png"),
  path.join(dir, "mobile_app_transparent.webp"),
  path.join(dir, "mobile_app_dark_preview.png"),
  238
);
