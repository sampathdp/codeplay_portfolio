#!/usr/bin/env python3
"""
Sprite Cleaner Pipeline
========================

A production-quality batch image restoration pipeline for game sprite assets.

Given a folder of RGBA PNG sprites (typically produced by automated background
removal tools), this tool repairs contaminated transparency edges - halos,
color fringes, matte spill - while preserving every fine ornamental detail of
the original artwork, and writes clean, Unity-Asset-Store-ready PNGs.

Pipeline (see README.md for the full write-up of each stage):

    0. (auto) Remove a uniform background via border-seeded chroma-key, for
       source images that arrive fully opaque (no alpha channel to speak of)
    1. Load RGBA image
    2. Analyze the alpha channel (transparent / semi-transparent / opaque)
    3. Adaptively detect halo / matte contamination at the edges
    4. Decontaminate edge RGB via local nearest-opaque-color propagation
    5. Reconstruct any residual contamination with restricted Telea inpainting
    6. Smart alpha cleanup (sub-pixel erosion + isolated-noise removal)
    7. Alpha-only edge smoothing (RGB is never blurred)
    8. Selective RGB unsharp masking (alpha is never sharpened)
    9. Save as lossless 32-bit RGBA PNG

Only OpenCV, NumPy, Pillow and tqdm are required - no ML frameworks, no
network access. All heavy lifting is vectorized NumPy/OpenCV; there are no
per-pixel Python loops on the hot path, so the tool scales to folders
containing thousands of sprites.

Usage:
    python main.py                      # process ./input -> ./output
    python main.py -i assets -o clean   # custom folders
    python main.py --strength 1.4 --sharpen 0.5 --preview

Run `python main.py --help` for the full list of options.
"""

from __future__ import annotations

import argparse
import dataclasses
import sys
import time
import traceback
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
from PIL import Image
from tqdm import tqdm

# =============================================================================
# CONFIGURABLE PARAMETERS
# =============================================================================
# These are the defaults used when the corresponding CLI flag is not given.
# They were tuned for typical "remove.bg" / auto-matting style contamination
# on illustrated / ornamental game sprites. Feel free to tweak them for your
# own art style.

# --- Alpha classification thresholds (0-255) -------------------------------
OPAQUE_ALPHA_THRESHOLD: int = 250       # alpha >= this is treated as "solid"
TRANSPARENT_ALPHA_THRESHOLD: int = 4    # alpha <= this is treated as "empty"

# --- Background removal (Step 0, for sources with no existing alpha) --------
DEFAULT_BG_TOLERANCE: float = 30.0      # Euclidean BGR distance (0-441) treated
                                         # as "matches the sampled background"
BG_BORDER_SAMPLE_FRACTION: float = 0.02 # fraction of min(h, w) used as the
                                         # border ring thickness to sample the
                                         # background color from
BG_EDGE_FEATHER_PX: float = 2.0         # antialiasing ramp width, in pixels,
                                         # applied across the carved boundary
AUTO_BG_OPAQUE_FRACTION: float = 0.999  # "auto" mode triggers background
                                         # removal only when at least this
                                         # fraction of pixels are fully opaque
                                         # (i.e. the source has no real alpha)

# --- Halo detection / decontamination ---------------------------------------
DEFAULT_STRENGTH: float = 1.0           # multiplier on contamination sensitivity
BASE_CONTAMINATION_THRESHOLD: float = 22.0   # base Euclidean RGB distance (0-441)
PROPAGATION_KERNEL_SIZES: tuple[int, ...] = (3, 5, 9, 15, 25)  # multi-scale radii
MAX_INPAINT_RADIUS: int = 6             # px, Telea fallback search radius
MAX_EDGE_BAND_PX: int = 8               # never touch pixels farther than this
                                         # from the alpha transition (protects
                                         # interior artwork from inpainting)

# --- Alpha cleanup ------------------------------------------------------------
DEFAULT_ALPHA_ERODE: float = 0.5        # sub-pixel erosion amount, in pixels
MIN_NOISE_ISLAND_AREA: int = 3          # px^2, isolated alpha specks <= this
                                         # are removed (holes and blobs alike)

# --- Edge smoothing -----------------------------------------------------------
ALPHA_SMOOTH_SIGMA: float = 0.6         # Gaussian sigma applied to alpha only

# --- Selective sharpening -----------------------------------------------------
DEFAULT_SHARPEN_RADIUS: float = 0.8     # px, unsharp-mask Gaussian radius
DEFAULT_SHARPEN_AMOUNT: float = 0.8     # 0 = off, ~0.3-0.5 = mild, 0.8 = crisp ornament detail
SHARPEN_THRESHOLD: int = 2              # min brightness delta to sharpen (anti-noise)

# --- Batch / IO -----------------------------------------------------------
DEFAULT_INPUT_DIR: str = "input"
DEFAULT_OUTPUT_DIR: str = "output"
PNG_COMPRESSION_LEVEL: int = 6          # 0 (fast/large) - 9 (slow/small), lossless either way


# =============================================================================
# DATA STRUCTURES
# =============================================================================

@dataclasses.dataclass
class ProcessingConfig:
    """All tunable knobs for a single run, gathered in one place."""

    strength: float = DEFAULT_STRENGTH
    alpha_erode: float = DEFAULT_ALPHA_ERODE
    sharpen_amount: float = DEFAULT_SHARPEN_AMOUNT
    sharpen_radius: float = DEFAULT_SHARPEN_RADIUS
    preview: bool = False
    overwrite: bool = False
    remove_bg_mode: str = "auto"        # "auto" | "on" | "off"
    bg_tolerance: float = DEFAULT_BG_TOLERANCE


@dataclasses.dataclass
class ImageResult:
    """Outcome of processing a single file, used for the end-of-run summary."""

    name: str
    success: bool
    elapsed_seconds: float
    error: Optional[str] = None
    size: Optional[tuple[int, int]] = None


# =============================================================================
# STEP 0 - BACKGROUND REMOVAL (for sources with no existing alpha)
# =============================================================================
# The core pipeline (steps 1-9) assumes its input already has a meaningful
# alpha channel - i.e. it repairs a sprite that has already been cut out. A
# lot of real-world source art (AI-generated renders, photographed props,
# flattened exports) instead arrives fully opaque with a solid/near-uniform
# background baked into the RGB. This step turns that into a first-pass
# alpha channel via a border-seeded chroma-key, so the rest of the pipeline
# has something to clean up. It never runs on images that already carry real
# transparency (see `should_remove_background`), so it cannot damage sprites
# that were already correctly cut out.

def sample_border_color(bgr: np.ndarray) -> np.ndarray:
    """Estimate the background color as the median color of a thin ring
    around the image border.

    Using the median (rather than the mean) makes the estimate robust to a
    minority of border pixels that belong to foreground content touching the
    edge of the frame.
    """
    h, w = bgr.shape[:2]
    thickness = max(2, int(round(min(h, w) * BG_BORDER_SAMPLE_FRACTION)))

    top = bgr[:thickness, :, :].reshape(-1, 3)
    bottom = bgr[-thickness:, :, :].reshape(-1, 3)
    left = bgr[:, :thickness, :].reshape(-1, 3)
    right = bgr[:, -thickness:, :].reshape(-1, 3)
    border_pixels = np.concatenate([top, bottom, left, right], axis=0)

    return np.median(border_pixels.astype(np.float32), axis=0)


def should_remove_background(alpha: np.ndarray, mode: str) -> bool:
    """Decide whether Step 0 should run for this image.

    "off" never runs it, "on" always runs it (re-keying even sprites that
    already have alpha), and "auto" (the default) only runs it when the
    source is essentially fully opaque - i.e. it has no meaningful existing
    transparency to preserve, so there is nothing to lose and a flat "black
    box" render can actually be turned into a usable sprite.
    """
    if mode == "off":
        return False
    if mode == "on":
        return True
    opaque_fraction = float(np.mean(alpha >= OPAQUE_ALPHA_THRESHOLD))
    return opaque_fraction >= AUTO_BG_OPAQUE_FRACTION


def remove_uniform_background(bgra: np.ndarray, tolerance: float) -> np.ndarray:
    """Carve an initial alpha channel out of a flat/opaque image by
    chroma-keying a background color sampled from the border.

    Only background-colored pixels that are 8-connected to the image border
    are removed - a same-colored region fully enclosed by foreground (e.g. a
    black suit symbol printed on a card) is never connected to the border
    and is therefore correctly left opaque. This is a plain flood-fill /
    connected-components chroma-key, not a general matting model, so it
    works best on solid or near-uniform backdrops.

    The resulting hard background/foreground boundary is then feathered by
    BG_EDGE_FEATHER_PX using a signed distance transform, giving a smooth
    antialiased alpha ramp for the rest of the pipeline (which will further
    decontaminate any background color bleeding into that ramp) to refine.
    """
    bgr = bgra[..., :3]
    bg_color = sample_border_color(bgr)

    diff = bgr.astype(np.float32) - bg_color
    dist = np.sqrt(np.sum(diff * diff, axis=-1))
    candidate_bg = (dist < tolerance).astype(np.uint8)

    n_labels, labels, stats, _ = cv2.connectedComponentsWithStats(candidate_bg, connectivity=8)
    h, w = candidate_bg.shape
    border_labels = set(np.unique(labels[0, :])) | set(np.unique(labels[-1, :]))
    border_labels |= set(np.unique(labels[:, 0])) | set(np.unique(labels[:, -1]))
    border_labels.discard(0)  # label 0 is the "not background-colored" background of the label map

    background_mask = np.isin(labels, list(border_labels)) if border_labels else np.zeros((h, w), dtype=bool)

    # Signed distance to the foreground/background boundary: positive inside
    # foreground, negative inside background, ~0 right at the edge.
    bg_u8 = background_mask.astype(np.uint8)
    dist_into_fg = cv2.distanceTransform((1 - bg_u8), cv2.DIST_L2, 5)
    dist_into_bg = cv2.distanceTransform(bg_u8, cv2.DIST_L2, 5)
    signed_dist = dist_into_fg - dist_into_bg

    ramp = np.clip((signed_dist + BG_EDGE_FEATHER_PX / 2.0) / BG_EDGE_FEATHER_PX, 0.0, 1.0)
    new_alpha = (ramp * 255.0).astype(np.uint8)

    out = bgra.copy()
    out[..., 3] = new_alpha
    return out


# =============================================================================
# STEP 1 - LOADING
# =============================================================================

def load_rgba_image(path: Path) -> tuple[np.ndarray, Optional[bytes]]:
    """Load a PNG as a straight (non-premultiplied) RGBA uint8 array.

    Uses Pillow for the actual decode so that ICC color profiles and other
    metadata can be preserved and re-attached on save. Returns the pixel
    data as an OpenCV-friendly BGRA array (channel order swapped from
    Pillow's RGBA) plus the raw ICC profile bytes (if any) so the caller can
    round-trip color management untouched.

    Raises:
        ValueError: if the file cannot be decoded as an image.
    """
    try:
        with Image.open(path) as im:
            icc_profile = im.info.get("icc_profile")
            im = im.convert("RGBA")
            rgba = np.array(im, dtype=np.uint8)
    except Exception as exc:  # noqa: BLE001 - we re-raise as a clean ValueError
        raise ValueError(f"Could not decode image: {exc}") from exc

    # Work internally in BGRA (OpenCV convention) to keep all cv2 calls
    # channel-order-correct; RGB vs BGR is irrelevant to the math below
    # since we never compare against fixed color constants, but keeping a
    # single consistent convention avoids subtle bugs.
    bgra = cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGRA)
    return bgra, icc_profile


# =============================================================================
# STEP 2 - ALPHA CHANNEL ANALYSIS
# =============================================================================

@dataclasses.dataclass
class AlphaMasks:
    """Boolean masks classifying every pixel by its alpha value."""

    transparent: np.ndarray  # alpha <= TRANSPARENT_ALPHA_THRESHOLD
    opaque: np.ndarray       # alpha >= OPAQUE_ALPHA_THRESHOLD
    semi: np.ndarray         # everything in between
    edge_band: np.ndarray    # narrow band around the alpha transition


def analyze_alpha(alpha: np.ndarray) -> AlphaMasks:
    """Classify pixels and build a narrow "edge band" mask around the
    transparency transition.

    The edge band is the region where decontamination and inpainting are
    allowed to operate. It is deliberately kept thin (MAX_EDGE_BAND_PX) so
    that interior artwork - fully opaque brushwork, engraved ornament lines,
    etc. - is mathematically impossible to touch, regardless of how strong
    the contamination correction is.
    """
    transparent = alpha <= TRANSPARENT_ALPHA_THRESHOLD
    opaque = alpha >= OPAQUE_ALPHA_THRESHOLD
    semi = ~transparent & ~opaque

    # Distance (in pixels) from every pixel to the nearest fully-transparent
    # pixel. Pixels within MAX_EDGE_BAND_PX of the transparent region, that
    # are *not themselves* fully transparent, form the edge band.
    not_transparent_u8 = (~transparent).astype(np.uint8)
    dist_to_transparent = cv2.distanceTransform(not_transparent_u8, cv2.DIST_L2, 5)

    edge_band = (~transparent) & (dist_to_transparent <= MAX_EDGE_BAND_PX)
    # Semi-transparent pixels are always part of the edge band, even in the
    # (rare) case they sit further than MAX_EDGE_BAND_PX from a transparent
    # pixel (e.g. a soft glow interior to the sprite).
    edge_band = edge_band | semi

    return AlphaMasks(transparent=transparent, opaque=opaque, semi=semi, edge_band=edge_band)


# =============================================================================
# STEP 3 & 4 - ADAPTIVE HALO DETECTION + EDGE COLOR DECONTAMINATION
# =============================================================================

def _local_opaque_mean(
    bgr: np.ndarray, opaque_mask: np.ndarray, ksize: int
) -> tuple[np.ndarray, np.ndarray]:
    """Vectorized local average color of *opaque* pixels within a ksize x
    ksize window around every pixel, computed with box filters (no Python
    pixel loops).

    Returns (local_mean, local_count) where local_count is the number of
    opaque pixels that contributed to each window (used both as a
    reliability weight and to detect windows with no opaque data at all).
    """
    opaque_f = opaque_mask.astype(np.float32)
    bgr_f = bgr.astype(np.float32)
    masked_bgr = bgr_f * opaque_f[..., None]

    # normalize=False -> raw sums, so we can divide sum(color)/count(pixels)
    # ourselves and correctly ignore non-opaque contributions.
    sum_color = cv2.boxFilter(masked_bgr, ddepth=-1, ksize=(ksize, ksize), normalize=False)
    count = cv2.boxFilter(opaque_f, ddepth=-1, ksize=(ksize, ksize), normalize=False)

    safe_count = np.maximum(count, 1e-6)
    mean_color = sum_color / safe_count[..., None]
    return mean_color, count


def detect_and_decontaminate_edges(
    bgr: np.ndarray, masks: AlphaMasks, strength: float
) -> tuple[np.ndarray, np.ndarray]:
    """Adaptively detect and repair halo / matte contamination in the edge
    band.

    Detection: for every edge-band pixel we compare its color to the local
    average color of *nearby opaque* pixels (computed with an expanding
    multi-scale box-filter search, i.e. an approximate nearest-neighbor
    color propagation). If the pixel's color deviates from that local
    opaque average by more than an adaptive threshold, it is considered
    contaminated - no fixed RGB values (white/beige/gray/etc.) are ever
    referenced, so this generalizes to any background/matte color.

    Repair: contaminated pixels have their RGB replaced by the local opaque
    average (i.e. "pulled" toward the color of the nearby solid artwork).
    The multi-scale search means thin fringes are repaired from their
    immediate neighbors while thicker halos fall back to a wider search
    radius, which naturally reconstructs (rather than erases) the color.

    Returns:
        (decontaminated_bgr, unresolved_mask) - unresolved_mask marks edge
        pixels for which *no* opaque color could be found even at the
        largest search radius (e.g. a sprite fragment entirely surrounded
        by other semi-transparent pixels); these are handed off to the
        Telea inpainting fallback.
    """
    out = bgr.copy()
    opaque_mask = masks.opaque
    edge_band = masks.edge_band

    threshold = BASE_CONTAMINATION_THRESHOLD / max(strength, 1e-3)

    still_unresolved = edge_band.copy()
    resolved_color = np.zeros_like(bgr, dtype=np.float32)
    have_estimate = np.zeros(bgr.shape[:2], dtype=bool)

    for ksize in PROPAGATION_KERNEL_SIZES:
        if not np.any(still_unresolved):
            break
        local_mean, local_count = _local_opaque_mean(bgr, opaque_mask, ksize)
        newly_covered = still_unresolved & (local_count > 0)
        resolved_color[newly_covered] = local_mean[newly_covered]
        have_estimate |= newly_covered
        still_unresolved &= ~newly_covered

    # Contamination = large color distance between the pixel and the local
    # opaque estimate. Only pixels with a valid estimate can be judged.
    diff = out.astype(np.float32) - resolved_color
    dist = np.sqrt(np.sum(diff * diff, axis=-1))
    contaminated = edge_band & have_estimate & (dist > threshold)

    # Blend factor: fully replace strongly-contaminated pixels, gently pull
    # mildly-contaminated pixels toward the estimate. This avoids a hard
    # cutoff that could itself look like a fringe.
    blend = np.clip((dist - threshold * 0.4) / max(threshold, 1e-3), 0.0, 1.0)
    blend = np.where(contaminated, blend, 0.0)[..., None]
    out = out.astype(np.float32) * (1.0 - blend) + resolved_color * blend
    out = np.clip(out, 0, 255).astype(np.uint8)

    unresolved_mask = edge_band & ~have_estimate
    return out, unresolved_mask


def inpaint_residual_contamination(bgr: np.ndarray, unresolved_mask: np.ndarray) -> np.ndarray:
    """Fallback repair for edge pixels that had no nearby opaque color to
    borrow from (STEP 4/6: "Prefer OpenCV Telea inpainting only where
    appropriate... do not inpaint internal artwork").

    Restricted strictly to `unresolved_mask`, which by construction is a
    subset of the thin edge band - interior artwork is never touched.
    """
    if not np.any(unresolved_mask):
        return bgr
    mask_u8 = (unresolved_mask.astype(np.uint8)) * 255
    inpainted = cv2.inpaint(bgr, mask_u8, MAX_INPAINT_RADIUS, cv2.INPAINT_TELEA)
    return inpainted


# =============================================================================
# STEP 5 & 9 - SMART ALPHA CLEANUP (sub-pixel erosion + noise removal)
# =============================================================================

def clean_alpha_channel(alpha: np.ndarray, erode_amount: float) -> np.ndarray:
    """Erode the alpha channel by a fractional pixel amount and remove
    isolated noise specks, without noticeably shrinking artwork or losing
    fine ornamental detail.

    A "true" morphological erosion only works in whole-pixel steps, so a
    sub-pixel erosion is approximated by blending the original alpha with a
    1px-eroded version: erode_amount=0.5 yields a 50/50 blend, which softens
    the outermost half-pixel of the boundary exactly as a 0.5px erosion
    would, while erode_amount=1.0 reproduces a full 1px erosion.
    """
    erode_amount = float(np.clip(erode_amount, 0.0, 1.0))
    if erode_amount <= 0.0:
        eroded_blend = alpha.copy()
    else:
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        eroded_1px = cv2.erode(alpha, kernel, iterations=1)
        eroded_blend = cv2.addWeighted(
            alpha.astype(np.float32), 1.0 - erode_amount,
            eroded_1px.astype(np.float32), erode_amount,
            0.0,
        ).astype(np.uint8)

    return remove_isolated_alpha_noise(eroded_blend)


def remove_isolated_alpha_noise(alpha: np.ndarray) -> np.ndarray:
    """STEP 9 - Noise Protection.

    Removes tiny isolated transparent "pinholes" inside solid artwork and
    tiny isolated opaque "specks" floating in transparent areas, both
    smaller than MIN_NOISE_ISLAND_AREA px^2. Genuine small ornaments are
    virtually always larger than this threshold and/or connected to the
    main silhouette, so they are left untouched.
    """
    if MIN_NOISE_ISLAND_AREA <= 0:
        return alpha

    cleaned = alpha.copy()

    # Remove tiny opaque/semi-opaque specks sitting in transparent regions.
    solid_mask = (alpha > TRANSPARENT_ALPHA_THRESHOLD).astype(np.uint8)
    n_labels, labels, stats, _ = cv2.connectedComponentsWithStats(solid_mask, connectivity=8)
    for label in range(1, n_labels):
        if stats[label, cv2.CC_STAT_AREA] <= MIN_NOISE_ISLAND_AREA:
            cleaned[labels == label] = 0

    # Remove tiny transparent "pinholes" inside solid artwork.
    hole_mask = (cleaned <= TRANSPARENT_ALPHA_THRESHOLD).astype(np.uint8)
    n_labels, labels, stats, _ = cv2.connectedComponentsWithStats(hole_mask, connectivity=8)
    h, w = alpha.shape
    for label in range(1, n_labels):
        area = stats[label, cv2.CC_STAT_AREA]
        x, y, bw, bh = stats[label, cv2.CC_STAT_LEFT:cv2.CC_STAT_LEFT + 4]
        touches_border = x == 0 or y == 0 or (x + bw) == w or (y + bh) == h
        if area <= MIN_NOISE_ISLAND_AREA and not touches_border:
            cleaned[labels == label] = 255

    return cleaned


# =============================================================================
# STEP 7 - ALPHA-ONLY EDGE SMOOTHING
# =============================================================================

def smooth_alpha_edges(alpha: np.ndarray, sigma: float) -> np.ndarray:
    """Anti-alias the alpha transition with a very small Gaussian blur.

    Only the alpha channel is touched here - RGB is never blurred, so line
    art stays perfectly crisp; only the *shape* of the transparency edge is
    softened, removing jagged/staircase artifacts left over from erosion or
    from the original matting mask.
    """
    if sigma <= 0:
        return alpha
    blurred = cv2.GaussianBlur(alpha, ksize=(0, 0), sigmaX=sigma)
    return blurred


# =============================================================================
# STEP 8 - SELECTIVE RGB SHARPENING (unsharp mask, RGB only)
# =============================================================================

def selective_unsharp_mask(
    bgr: np.ndarray, opaque_ish_mask: np.ndarray, radius: float, amount: float
) -> np.ndarray:
    """Mild unsharp mask applied only to RGB, restricted to pixels that are
    at least partially visible (alpha > 0), so contamination-adjacent
    pixels that were just decontaminated are not re-blurred or re-noised by
    sharpening bleeding in from transparent zero-color pixels.

    A small `SHARPEN_THRESHOLD` on the sharpening delta suppresses
    amplification of sensor/compression noise while still restoring
    engraved ornament and fine line-art contrast.
    """
    if amount <= 0:
        return bgr

    blurred = cv2.GaussianBlur(bgr, ksize=(0, 0), sigmaX=radius)
    high_freq = bgr.astype(np.float32) - blurred.astype(np.float32)

    # Suppress near-zero (noise-level) detail so flat regions aren't grained.
    suppress = np.abs(high_freq) < SHARPEN_THRESHOLD
    high_freq[suppress] = 0.0

    sharpened = bgr.astype(np.float32) + amount * high_freq
    sharpened = np.clip(sharpened, 0, 255).astype(np.uint8)

    mask3 = opaque_ish_mask[..., None]
    return np.where(mask3, sharpened, bgr)


# =============================================================================
# FULL PIXEL PIPELINE (steps 2-8, pure function, no I/O)
# =============================================================================

def process_pixels(bgra: np.ndarray, config: ProcessingConfig) -> np.ndarray:
    """Run the full restoration pipeline (steps 0-8) on a loaded BGRA array
    and return the cleaned BGRA array.
    """
    # STEP 0 - border-seeded chroma-key background removal, only when the
    # source has no meaningful existing alpha (or the caller forces it).
    if should_remove_background(bgra[..., 3], config.remove_bg_mode):
        bgra = remove_uniform_background(bgra, config.bg_tolerance)

    bgr = bgra[..., :3]
    alpha = bgra[..., 3]

    # STEP 2 - classify alpha, build edge band.
    masks = analyze_alpha(alpha)

    # STEP 3 + 4 + 6 - adaptive halo detection, decontamination, and
    # reconstruction (rather than erasure) of contaminated edge colors.
    bgr, unresolved = detect_and_decontaminate_edges(bgr, masks, config.strength)
    bgr = inpaint_residual_contamination(bgr, unresolved)

    # STEP 5 + 9 - sub-pixel alpha erosion and isolated noise removal.
    alpha = clean_alpha_channel(alpha, config.alpha_erode)

    # STEP 7 - alpha-only smoothing.
    alpha = smooth_alpha_edges(alpha, ALPHA_SMOOTH_SIGMA)

    # STEP 8 - selective RGB sharpening, skipped entirely for fully
    # transparent pixels (their color is invisible and irrelevant).
    visible_mask = alpha > TRANSPARENT_ALPHA_THRESHOLD
    bgr = selective_unsharp_mask(bgr, visible_mask, config.sharpen_radius, config.sharpen_amount)

    out = np.dstack([bgr, alpha])
    return out


# =============================================================================
# STEP 10 - SAVING
# =============================================================================

def save_rgba_png(bgra: np.ndarray, path: Path, icc_profile: Optional[bytes]) -> None:
    """Write a BGRA array out as a lossless 32-bit RGBA PNG, preserving the
    source ICC color profile (if any) and without stripping other metadata.
    """
    rgba = cv2.cvtColor(bgra, cv2.COLOR_BGRA2RGBA)
    im = Image.fromarray(rgba, mode="RGBA")

    save_kwargs: dict = {
        "optimize": False,          # lossless regardless; avoids extra recompression passes
        "compress_level": PNG_COMPRESSION_LEVEL,
    }
    if icc_profile:
        save_kwargs["icc_profile"] = icc_profile

    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, format="PNG", **save_kwargs)


def save_preview(bgra: np.ndarray, preview_path: Path) -> None:
    """Compose the sprite over black, white, red, blue and a checkerboard
    background side-by-side, so edge quality can be sanity-checked at a
    glance without opening every sprite in an editor.
    """
    h, w = bgra.shape[:2]
    bgr = bgra[..., :3].astype(np.float32)
    alpha = (bgra[..., 3].astype(np.float32) / 255.0)[..., None]

    def composite(bg_color: tuple[int, int, int]) -> np.ndarray:
        bg = np.full((h, w, 3), bg_color, dtype=np.float32)
        return (bgr * alpha + bg * (1.0 - alpha)).astype(np.uint8)

    checker = np.indices((h, w)).sum(axis=0) % 16 < 8
    checker_bg = np.where(checker[..., None], 235, 200).astype(np.float32)
    checker_bg = np.repeat(checker_bg, 3, axis=2)
    checker_composite = (bgr * alpha + checker_bg * (1.0 - alpha)).astype(np.uint8)

    tiles = [
        composite((0, 0, 0)),
        composite((255, 255, 255)),
        composite((0, 0, 255)),    # red in BGR
        composite((255, 0, 0)),    # blue in BGR
        checker_composite,
    ]
    strip = np.concatenate(tiles, axis=1)
    preview_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(preview_path), strip)


# =============================================================================
# BATCH ORCHESTRATION
# =============================================================================

def find_png_files(input_dir: Path, recursive: bool) -> list[Path]:
    """Collect every .png file under input_dir (optionally recursively),
    sorted for deterministic, reproducible batch ordering.
    """
    pattern = "**/*.png" if recursive else "*.png"
    return sorted(p for p in input_dir.glob(pattern) if p.is_file())


def process_one_file(
    src_path: Path, input_dir: Path, output_dir: Path, config: ProcessingConfig
) -> ImageResult:
    """Process a single PNG end-to-end and report the outcome. Exceptions
    are caught here so one bad file never aborts the whole batch.
    """
    rel_path = src_path.relative_to(input_dir)
    dst_path = output_dir / rel_path
    start = time.perf_counter()

    try:
        if dst_path.exists() and not config.overwrite:
            raise FileExistsError(
                f"'{dst_path}' already exists (use --overwrite to replace it)"
            )

        bgra, icc_profile = load_rgba_image(src_path)
        cleaned = process_pixels(bgra, config)
        save_rgba_png(cleaned, dst_path, icc_profile)

        if config.preview:
            preview_path = output_dir / "_previews" / rel_path.with_suffix(".preview.png")
            save_preview(cleaned, preview_path)

        elapsed = time.perf_counter() - start
        return ImageResult(
            name=str(rel_path), success=True, elapsed_seconds=elapsed,
            size=(cleaned.shape[1], cleaned.shape[0]),
        )
    except Exception as exc:  # noqa: BLE001 - deliberately broad: batch must continue
        elapsed = time.perf_counter() - start
        return ImageResult(
            name=str(rel_path), success=False, elapsed_seconds=elapsed,
            error=f"{type(exc).__name__}: {exc}",
        )


def run_batch(
    input_dir: Path, output_dir: Path, config: ProcessingConfig, workers: int, recursive: bool
) -> list[ImageResult]:
    """Discover PNGs under input_dir and process them concurrently with a
    thread pool, showing a live tqdm progress bar.
    """
    files = find_png_files(input_dir, recursive)
    if not files:
        print(f"No PNG files found in '{input_dir}' (recursive={recursive}).")
        return []

    output_dir.mkdir(parents=True, exist_ok=True)
    results: list[ImageResult] = []

    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {
            pool.submit(process_one_file, f, input_dir, output_dir, config): f for f in files
        }
        with tqdm(total=len(files), unit="img", desc="Processing sprites") as bar:
            for future in as_completed(futures):
                result = future.result()
                results.append(result)
                status = "OK" if result.success else "FAIL"
                bar.set_postfix_str(f"{status}: {result.name}")
                bar.update(1)

    return results


def print_summary(results: list[ImageResult], total_elapsed: float) -> None:
    """Print a human-readable end-of-run report: per-image timing already
    streamed via the progress bar, so the summary focuses on aggregates and
    failures.
    """
    succeeded = [r for r in results if r.success]
    failed = [r for r in results if not r.success]

    print("\n" + "=" * 70)
    print("BATCH SUMMARY")
    print("=" * 70)
    print(f"Total images:      {len(results)}")
    print(f"Succeeded:         {len(succeeded)}")
    print(f"Failed:            {len(failed)}")
    print(f"Total wall time:   {total_elapsed:.2f}s")
    if succeeded:
        avg = sum(r.elapsed_seconds for r in succeeded) / len(succeeded)
        print(f"Avg time/image:    {avg:.3f}s")

    if failed:
        print("\nFAILED FILES:")
        for r in failed:
            print(f"  - {r.name}: {r.error}")
    print("=" * 70)


# =============================================================================
# CLI
# =============================================================================

def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="sprite-cleaner",
        description=(
            "Batch-repair transparent-PNG game sprites: removes background "
            "removal halos/fringes and produces clean, Unity-Asset-Store "
            "quality 32-bit RGBA PNGs while preserving every fine detail."
        ),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "-i", "--input", type=Path, default=Path(DEFAULT_INPUT_DIR),
        help="Folder containing source PNG sprites.",
    )
    parser.add_argument(
        "-o", "--output", type=Path, default=Path(DEFAULT_OUTPUT_DIR),
        help="Folder to write cleaned PNG sprites into (created if missing).",
    )
    parser.add_argument(
        "--strength", type=float, default=DEFAULT_STRENGTH,
        help="Halo-decontamination sensitivity multiplier. Higher = more "
             "aggressive contamination detection/repair.",
    )
    parser.add_argument(
        "--alpha-erode", type=float, default=DEFAULT_ALPHA_ERODE,
        help="Sub-pixel alpha erosion amount, 0.0-1.0 (in pixels). "
             "0.5 = half-pixel trim, 1.0 = full 1px erosion.",
    )
    parser.add_argument(
        "--sharpen", type=float, default=DEFAULT_SHARPEN_AMOUNT,
        help="RGB unsharp-mask amount. 0 disables sharpening.",
    )
    parser.add_argument(
        "--remove-bg", choices=["auto", "on", "off"], default="auto",
        help="Background removal (Step 0) via border-seeded chroma-key, for "
             "sources with no real alpha channel. 'auto' only removes the "
             "background when the source is essentially fully opaque; 'on' "
             "always re-keys the background (even for sprites that already "
             "have alpha); 'off' disables it, restoring the original "
             "cut-out-repair-only behavior.",
    )
    parser.add_argument(
        "--bg-tolerance", type=float, default=DEFAULT_BG_TOLERANCE,
        help="Color-distance tolerance (0-441) for matching the sampled "
             "border background color during Step 0. Higher removes more "
             "(risk of eating into similarly-colored foreground).",
    )
    parser.add_argument(
        "--preview", action="store_true",
        help="Also write a side-by-side QA preview (black/white/red/blue/"
             "checkerboard composites) for every processed sprite into "
             "<output>/_previews/.",
    )
    parser.add_argument(
        "--overwrite", action="store_true",
        help="Overwrite files that already exist in the output folder.",
    )
    parser.add_argument(
        "--recursive", action="store_true",
        help="Recurse into subfolders of the input directory, mirroring "
             "the folder structure in the output directory.",
    )
    parser.add_argument(
        "--workers", type=int, default=8,
        help="Number of worker threads for concurrent batch processing.",
    )
    return parser


def main(argv: Optional[list[str]] = None) -> int:
    parser = build_arg_parser()
    args = parser.parse_args(argv)

    if not args.input.is_dir():
        print(f"Error: input folder '{args.input}' does not exist or is not a directory.")
        return 1
    if args.workers < 1:
        print("Error: --workers must be >= 1.")
        return 1

    config = ProcessingConfig(
        strength=args.strength,
        alpha_erode=args.alpha_erode,
        sharpen_amount=args.sharpen,
        sharpen_radius=DEFAULT_SHARPEN_RADIUS,
        preview=args.preview,
        overwrite=args.overwrite,
        remove_bg_mode=args.remove_bg,
        bg_tolerance=args.bg_tolerance,
    )

    print(f"Input:    {args.input.resolve()}")
    print(f"Output:   {args.output.resolve()}")
    print(f"Workers:  {args.workers}   Recursive: {args.recursive}")
    print(f"Remove-bg: {config.remove_bg_mode}   BG tolerance: {config.bg_tolerance}")
    print(f"Strength: {config.strength}   Alpha erode: {config.alpha_erode}   "
          f"Sharpen: {config.sharpen_amount}")
    print()

    start = time.perf_counter()
    try:
        results = run_batch(args.input, args.output, config, args.workers, args.recursive)
    except KeyboardInterrupt:
        print("\nInterrupted by user.")
        return 130
    except Exception:  # noqa: BLE001 - top-level guard, print full traceback
        traceback.print_exc()
        return 1
    elapsed = time.perf_counter() - start

    if results:
        print_summary(results, elapsed)

    any_failed = any(not r.success for r in results)
    return 1 if any_failed else 0


if __name__ == "__main__":
    sys.exit(main())
