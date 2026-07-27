"""Adaptive halo/edge-color decontamination.

Ported from the original CLI tool: classify alpha into transparent / semi /
opaque bands, build a thin "edge band" around the transparency transition,
then repair contaminated edge colors by propagating nearby opaque colors
inward (multi-scale box-filter search), falling back to restricted Telea
inpainting for any pixel with no nearby opaque color to borrow from.

Everything here is confined to the edge band by construction - interior
artwork is mathematically unreachable, regardless of contamination strength.
"""

from __future__ import annotations

import dataclasses

import cv2
import numpy as np

from app.config import (
    BASE_CONTAMINATION_THRESHOLD,
    MAX_EDGE_BAND_PX,
    MAX_INPAINT_RADIUS,
    OPAQUE_ALPHA_THRESHOLD,
    PROPAGATION_KERNEL_SIZES,
    TRANSPARENT_ALPHA_THRESHOLD,
)


@dataclasses.dataclass
class AlphaMasks:
    transparent: np.ndarray
    opaque: np.ndarray
    semi: np.ndarray
    edge_band: np.ndarray


def analyze_alpha(alpha: np.ndarray) -> AlphaMasks:
    transparent = alpha <= TRANSPARENT_ALPHA_THRESHOLD
    opaque = alpha >= OPAQUE_ALPHA_THRESHOLD
    semi = ~transparent & ~opaque

    not_transparent_u8 = (~transparent).astype(np.uint8)
    dist_to_transparent = cv2.distanceTransform(not_transparent_u8, cv2.DIST_L2, 5)

    edge_band = (~transparent) & (dist_to_transparent <= MAX_EDGE_BAND_PX)
    edge_band = edge_band | semi

    return AlphaMasks(transparent=transparent, opaque=opaque, semi=semi, edge_band=edge_band)


def _local_opaque_mean(bgr: np.ndarray, opaque_mask: np.ndarray, ksize: int) -> tuple[np.ndarray, np.ndarray]:
    opaque_f = opaque_mask.astype(np.float32)
    bgr_f = bgr.astype(np.float32)
    masked_bgr = bgr_f * opaque_f[..., None]

    sum_color = cv2.boxFilter(masked_bgr, ddepth=-1, ksize=(ksize, ksize), normalize=False)
    count = cv2.boxFilter(opaque_f, ddepth=-1, ksize=(ksize, ksize), normalize=False)

    safe_count = np.maximum(count, 1e-6)
    mean_color = sum_color / safe_count[..., None]
    return mean_color, count


def detect_and_decontaminate_edges(
    bgr: np.ndarray, masks: AlphaMasks, strength: float
) -> tuple[np.ndarray, np.ndarray]:
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

    diff = out.astype(np.float32) - resolved_color
    dist = np.sqrt(np.sum(diff * diff, axis=-1))
    contaminated = edge_band & have_estimate & (dist > threshold)

    blend = np.clip((dist - threshold * 0.4) / max(threshold, 1e-3), 0.0, 1.0)
    blend = np.where(contaminated, blend, 0.0)[..., None]
    out = out.astype(np.float32) * (1.0 - blend) + resolved_color * blend
    out = np.clip(out, 0, 255).astype(np.uint8)

    unresolved_mask = edge_band & ~have_estimate
    return out, unresolved_mask


def inpaint_residual_contamination(bgr: np.ndarray, unresolved_mask: np.ndarray) -> np.ndarray:
    if not np.any(unresolved_mask):
        return bgr
    mask_u8 = unresolved_mask.astype(np.uint8) * 255
    return cv2.inpaint(bgr, mask_u8, MAX_INPAINT_RADIUS, cv2.INPAINT_TELEA)


def decontaminate(bgra: np.ndarray, strength: float) -> np.ndarray:
    """Convenience wrapper: full decontamination pass over a BGRA image,
    returning the corrected BGRA (alpha channel unchanged).
    """
    bgr = bgra[..., :3]
    alpha = bgra[..., 3]
    masks = analyze_alpha(alpha)
    bgr, unresolved = detect_and_decontaminate_edges(bgr, masks, strength)
    bgr = inpaint_residual_contamination(bgr, unresolved)
    return np.dstack([bgr, alpha])
