# Sprite Cleaner

This repo has two things in it:

- **`backend/` - Tools API**, a FastAPI service for image background
  removal/edge cleanup/sharpening/watermark removal and video watermark
  removal/replacement (ffmpeg-based). The interactive UIs for this API live
  in the main site's frontend, not here - see
  [`client/src/pages/ImageEditorTool.tsx`](../client/src/pages/ImageEditorTool.tsx)
  (`/tools/image-editor`) and
  [`client/src/pages/VideoWatermarkTool.tsx`](../client/src/pages/VideoWatermarkTool.tsx)
  (`/tools/video-watermark`). `npm run dev` at the repo root starts this
  backend automatically (see `scripts/dev-backend.mjs`); to run it standalone
  use `uvicorn app.main:app --reload --port 8001` and point the main site's
  `VITE_TOOLS_API_URL` at it (see `client/.env.example`). Port 8001, not the
  more obvious 8000: that port is commonly already claimed by other local
  dev stacks (e.g. WAMP's PHP built-in server) which silently swallow
  requests instead of failing to bind - override with `TOOLS_API_PORT` if
  8001 also collides on your machine.
- **`main.py` (this README)** - the original command-line batch tool that
  started this project: point it at a folder of sprites and it cleans all of
  them in one pass, no UI. Both the API and the web editor reuse this same
  pipeline logic under the hood.

The rest of this file documents the CLI tool.

---

# Sprite Cleaner Pipeline (CLI)

A batch tool that repairs transparency edges on RGBA PNG game sprites -
removing halos, color fringes, and matte contamination left over from
background-removal tools - while preserving every fine ornamental detail of
the original artwork. Output is lossless 32-bit RGBA PNG, ready for Unity /
Unreal / any engine that expects clean transparent sprites.

## Why

Automated background removal (remove.bg-style tools, matting models, etc.)
almost always leaves a thin ring of contaminated pixels around the cut-out
subject: the original background color gets blended into the edge RGB in
proportion to how "cut off" that pixel's alpha is. The result is a visible
halo/fringe - beige, white, gray, whatever the original background was - that
looks fine on the background it was cut from and ugly on every other
background.

This tool fixes that automatically, adaptively (no hardcoded halo colors),
and in bulk.

## What it does

For every PNG in the input folder:

0. **Remove a flat background (auto)** - if a source image has no real alpha
   channel at all (i.e. it's fully opaque - a flattened render, an AI
   generated image, a photographed prop on a solid backdrop), the background
   color is sampled from a thin ring around the image border and removed via
   a border-seeded flood-fill/connected-components chroma-key: only
   background-colored regions connected to the border are carved out, so a
   same-colored patch fully enclosed by foreground (e.g. a black icon printed
   on a light card) is correctly left alone. The resulting edge is feathered
   and then polished by the rest of the pipeline below. This step is skipped
   automatically for sprites that already carry real transparency - see
   `--remove-bg` to control it explicitly.
1. **Load** - decode RGBA, preserve ICC color profile.
2. **Analyze alpha** - classify every pixel as transparent / semi-transparent
   / opaque, and build a thin "edge band" mask around the transparency
   transition. All later repair steps are mathematically confined to this
   band, so interior artwork can never be touched.
3. **Detect halos adaptively** - for each edge pixel, compare its color to
   the local average color of nearby *opaque* pixels (computed with a
   multi-scale box-filter search - effectively an approximate nearest-
   neighbor color lookup). No fixed RGB values are ever referenced, so it
   generalizes to any contamination color.
4. **Decontaminate edges** - contaminated pixels are pulled toward the local
   opaque color estimate (blended, not replaced outright, so there's no
   abrupt seam).
5. **Reconstruct residual contamination** - any edge pixel with no nearby
   opaque data at all falls back to OpenCV's Telea inpainting, restricted
   strictly to that residual mask so internal artwork is never inpainted.
6. **Smart alpha cleanup** - a sub-pixel (default 0.5px) alpha erosion trims
   the outermost contaminated sliver without visibly shrinking the sprite,
   and isolated 1-3px alpha noise (pinholes / specks) is removed without
   touching legitimate small ornaments.
7. **Alpha-only edge smoothing** - a very small Gaussian blur softens
   jagged transitions in the alpha channel only; RGB is never blurred, so
   line art stays crisp.
8. **Selective RGB sharpening** - a mild unsharp mask (radius ~0.8px, small
   amount) restores/enhances fine engraved detail without ringing or halos;
   alpha is never sharpened.
9. **Save** - lossless 32-bit RGBA PNG, original size, ICC profile
   preserved.

Every step operates on the whole image as vectorized NumPy/OpenCV array
operations - there are no per-pixel Python loops on the hot path - so the
pipeline scales to folders with thousands of sprites.

## Install

Requires Python 3.11+.

```bash
pip install -r requirements.txt
```

## Usage

```bash
# Process every PNG in ./input, write cleaned sprites to ./output
python main.py

# Custom folders
python main.py -i assets/raw -o assets/clean

# More aggressive halo correction + slightly stronger sharpening
python main.py --strength 1.5 --sharpen 0.5

# Fully opaque source renders (e.g. AI-generated art) on a solid backdrop:
# background removal kicks in automatically (--remove-bg auto is the default)
python main.py -i renders -o sprites

# Force background re-keying even on images that already have some alpha,
# with a looser color-match tolerance for a noisier/gradient backdrop
python main.py --remove-bg on --bg-tolerance 45

# Disable background removal entirely - only repair existing transparency
python main.py --remove-bg off

# Recurse into subfolders (mirrors folder structure in output)
python main.py --recursive

# Also emit QA preview strips (sprite over black/white/red/blue/checkerboard)
python main.py --preview

# Overwrite existing output files, use 16 worker threads
python main.py --overwrite --workers 16
```

Run `python main.py --help` for the full flag reference.

### CLI flags

| Flag | Default | Description |
|---|---|---|
| `-i, --input` | `input` | Folder of source PNG sprites |
| `-o, --output` | `output` | Folder to write cleaned PNGs |
| `--strength` | `1.0` | Halo-detection sensitivity multiplier |
| `--alpha-erode` | `0.5` | Sub-pixel alpha erosion, 0.0-1.0 px |
| `--sharpen` | `0.8` | RGB unsharp-mask amount (0 disables) |
| `--remove-bg` | `auto` | Background removal mode: `auto` (only when source is fully opaque), `on` (always re-key), `off` (never) |
| `--bg-tolerance` | `30.0` | Color-distance tolerance (0-441) for the Step 0 chroma-key |
| `--preview` | off | Write side-by-side QA composites |
| `--overwrite` | off | Overwrite existing output files |
| `--recursive` | off | Recurse into input subfolders |
| `--workers` | `8` | Worker threads for batch processing |

All numeric defaults are also editable at the top of `main.py` under
`CONFIGURABLE PARAMETERS` if you want different permanent defaults for your
art pipeline.

## Output

- Console progress bar (via `tqdm`) with live per-file status.
- End-of-run summary: total images, succeeded/failed counts, total wall
  time, average time per image, and a list of any failed files with their
  error messages.
- Exit code `0` on full success, `1` if any file failed, `130` on Ctrl-C.

## Notes

- The tool never resizes, warps, or blurs RGB content - output dimensions
  always match input dimensions exactly.
- Files that already exist in the output folder are skipped (reported as
  failed with a clear message) unless `--overwrite` is passed - this
  protects you from silently clobbering a previous run.
- Only OpenCV, NumPy, Pillow, and tqdm are used - no ML frameworks, no
  network calls, works fully offline.
- Step 0's background removal is a chroma-key (color-match + border
  connectivity), not a general-purpose matting model - it works well for
  solid or near-uniform backdrops but will not cleanly separate a subject
  from a busy/photographic/gradient background. For those, cut the subject
  out with a dedicated matting tool first and run this pipeline afterward
  purely for edge cleanup (`--remove-bg off`).
