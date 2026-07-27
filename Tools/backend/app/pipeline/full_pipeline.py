"""Composes the individual stages into the one-click "auto enhance" pipeline:
background removal (optional) -> halo decontamination -> alpha cleanup ->
alpha-only smoothing -> selective RGB sharpening.

Individual stages are also exposed as standalone API endpoints for users
who want to apply them one at a time (the Canva-style editor UI calls
these directly so each tool can be previewed/undone independently).
"""

from __future__ import annotations

import numpy as np

from app.config import ALPHA_SMOOTH_SIGMA, DEFAULT_SHARPEN_RADIUS, TRANSPARENT_ALPHA_THRESHOLD
from app.pipeline.alpha_cleanup import clean_alpha_channel, smooth_alpha_edges
from app.pipeline.bg_removal import BgMode, pick_auto_strategy, remove_background, should_remove_background
from app.pipeline.decontaminate import (
    analyze_alpha,
    detect_and_decontaminate_edges,
    inpaint_residual_contamination,
)
from app.pipeline.sharpen import selective_unsharp_mask


def auto_enhance(
    bgra: np.ndarray,
    bg_mode: BgMode = "auto",
    bg_tolerance: float = 30.0,
    strength: float = 1.0,
    alpha_erode: float = 0.5,
    sharpen_amount: float = 0.8,
    sharpen_radius: float = DEFAULT_SHARPEN_RADIUS,
) -> np.ndarray:
    if should_remove_background(bgra[..., 3], bg_mode):
        strategy = pick_auto_strategy(bgra) if bg_mode == "auto" else bg_mode
        bgra = remove_background(bgra, strategy, bg_tolerance)

    bgr = bgra[..., :3]
    alpha = bgra[..., 3]

    masks = analyze_alpha(alpha)
    bgr, unresolved = detect_and_decontaminate_edges(bgr, masks, strength)
    bgr = inpaint_residual_contamination(bgr, unresolved)

    alpha = clean_alpha_channel(alpha, alpha_erode)
    alpha = smooth_alpha_edges(alpha, ALPHA_SMOOTH_SIGMA)

    visible_mask = alpha > TRANSPARENT_ALPHA_THRESHOLD
    bgr = selective_unsharp_mask(bgr, visible_mask, sharpen_radius, sharpen_amount)

    return np.dstack([bgr, alpha])
