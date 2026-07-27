"""Manual "paint-to-remove" spot healing.

Unlike the automatic halo decontamination (which is mathematically confined
to a thin edge band), this operates wherever the user paints - so it must
never run without an explicit user-supplied mask. There is no auto-detection
here by design: earlier attempts at automatically detecting arbitrary
interior artifacts (glare, watermarks, blemishes) produced false positives
that damaged legitimate artwork. A user-drawn mask is unambiguous and safe.

RGB is reconstructed via Telea inpainting; alpha is left untouched so
painting over a blemish inside opaque artwork doesn't accidentally punch a
hole in the sprite.
"""

from __future__ import annotations

import cv2
import numpy as np

from app.config import DEFAULT_INPAINT_RADIUS, MAX_INPAINT_MASK_RADIUS


def paint_remove(bgra: np.ndarray, mask: np.ndarray, radius: int = DEFAULT_INPAINT_RADIUS) -> np.ndarray:
    """mask: uint8 array (H, W), same size as bgra, where >0 marks pixels
    the user wants reconstructed.
    """
    radius = int(np.clip(radius, 1, MAX_INPAINT_MASK_RADIUS))
    bgr = bgra[..., :3]
    alpha = bgra[..., 3]

    mask_u8 = (mask > 0).astype(np.uint8) * 255
    if not np.any(mask_u8):
        return bgra

    repaired_bgr = cv2.inpaint(bgr, mask_u8, radius, cv2.INPAINT_TELEA)
    return np.dstack([repaired_bgr, alpha])
