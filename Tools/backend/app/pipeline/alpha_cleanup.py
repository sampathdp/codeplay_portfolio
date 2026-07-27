"""Alpha channel cleanup: sub-pixel erosion, isolated-noise removal, and
alpha-only edge smoothing. RGB is never touched by anything in this module.
"""

from __future__ import annotations

import cv2
import numpy as np

from app.config import ALPHA_SMOOTH_SIGMA, MIN_NOISE_ISLAND_AREA, TRANSPARENT_ALPHA_THRESHOLD


def remove_isolated_alpha_noise(alpha: np.ndarray) -> np.ndarray:
    if MIN_NOISE_ISLAND_AREA <= 0:
        return alpha

    cleaned = alpha.copy()

    solid_mask = (alpha > TRANSPARENT_ALPHA_THRESHOLD).astype(np.uint8)
    n_labels, labels, stats, _ = cv2.connectedComponentsWithStats(solid_mask, connectivity=8)
    for label in range(1, n_labels):
        if stats[label, cv2.CC_STAT_AREA] <= MIN_NOISE_ISLAND_AREA:
            cleaned[labels == label] = 0

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


def clean_alpha_channel(alpha: np.ndarray, erode_amount: float) -> np.ndarray:
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


def smooth_alpha_edges(alpha: np.ndarray, sigma: float = ALPHA_SMOOTH_SIGMA) -> np.ndarray:
    if sigma <= 0:
        return alpha
    return cv2.GaussianBlur(alpha, ksize=(0, 0), sigmaX=sigma)
