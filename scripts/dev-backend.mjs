#!/usr/bin/env node
// Launches the Tools image-editor FastAPI backend for local dev, so
// `npm run dev` brings up both the site and the tool API together.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backendDir = path.join(rootDir, "Tools", "backend");
const isWin = process.platform === "win32";
const venvPython = path.join(backendDir, ".venv", isWin ? "Scripts" : "bin", isWin ? "python.exe" : "python");

if (!existsSync(venvPython)) {
  console.error(
    `\n[tools-backend] No virtualenv found at ${venvPython}.\n` +
      `Set it up once with:\n` +
      `  cd Tools/backend\n` +
      `  python -m venv .venv\n` +
      (isWin
        ? `  .venv\\Scripts\\python -m pip install -r requirements.txt\n`
        : `  .venv/bin/python -m pip install -r requirements.txt\n`) +
      `Then re-run npm run dev.\n`,
  );
  process.exit(1);
}

// 8001 rather than the more obvious 8000: that port is commonly already
// claimed by other local dev stacks (e.g. WAMP's PHP built-in server),
// which silently steals every request instead of failing loudly.
const port = process.env.TOOLS_API_PORT || "8001";

const child = spawn(venvPython, ["-m", "uvicorn", "app.main:app", "--reload", "--port", port], {
  cwd: backendDir,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 0));
