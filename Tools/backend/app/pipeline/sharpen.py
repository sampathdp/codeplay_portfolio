"""Selective RGB-only unsharp masking. Alpha is never sharpened."""

from __future__ import annotations

import cv2
import numpy as np

from app.config import SHARPEN_THRESHOLD, TRANSPARENT_ALPHA_THRESHOLD


def selective_unsharp_mask(
    bgr: np.ndarray, opaque_ish_mask: np.ndarray, radius: float, amount: float
) -> np.ndarray:
    if amount <= 0:
        return bgr

    blurred = cv2.GaussianBlur(bgr, ksize=(0, 0), sigmaX=radius)
    high_freq = bgr.astype(np.float32) - blurred.astype(np.float32)

    suppress = np.abs(high_freq) < SHARPEN_THRESHOLD
    high_freq[suppress] = 0.0

    sharpened = bgr.astype(np.float32) + amount * high_freq
    sharpened = np.clip(sharpened, 0, 255).astype(np.uint8)

    mask3 = opaque_ish_mask[..., None]
    return np.where(mask3, sharpened, bgr)


def sharpen(bgra: np.ndarray, radius: float, amount: float) -> np.ndarray:
    """Convenience wrapper: sharpen visible pixels of a BGRA image."""
    bgr = bgra[..., :3]
    alpha = bgra[..., 3]
    visible_mask = alpha > TRANSPARENT_ALPHA_THRESHOLD
    bgr = selective_unsharp_mask(bgr, visible_mask, radius, amount)
    return np.dstack([bgr, alpha])
