"""Image byte <-> array conversion helpers shared by every pipeline stage
and API endpoint.

Internally the pipeline always works in BGRA uint8 (OpenCV convention) -
these helpers are the only place that cross the boundary to/from raw PNG
bytes, so channel-order and encoding concerns stay in one place.
"""

from __future__ import annotations

import io
from typing import Optional

import cv2
import numpy as np
from PIL import Image

from app.config import MAX_UPLOAD_DIMENSION, PNG_COMPRESSION_LEVEL


def decode_upload_to_bgra(data: bytes) -> tuple[np.ndarray, Optional[bytes]]:
    """Decode arbitrary uploaded image bytes (PNG/JPEG/WebP/etc.) into a
    straight-alpha BGRA uint8 array, plus the source ICC profile if present.

    Raises:
        ValueError: if the bytes cannot be decoded as an image, or the
            image exceeds the configured maximum dimension.
    """
    try:
        with Image.open(io.BytesIO(data)) as im:
            icc_profile = im.info.get("icc_profile")
            im = im.convert("RGBA")
            rgba = np.array(im, dtype=np.uint8)
    except Exception as exc:  # noqa: BLE001
        raise ValueError(f"Could not decode image: {exc}") from exc

    h, w = rgba.shape[:2]
    if max(h, w) > MAX_UPLOAD_DIMENSION:
        raise ValueError(
            f"Image too large ({w}x{h}); max supported dimension is {MAX_UPLOAD_DIMENSION}px"
        )

    bgra = cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGRA)
    return bgra, icc_profile


def decode_mask(data: bytes, target_shape: tuple[int, int]) -> np.ndarray:
    """Decode an uploaded mask image (any mode) into a single-channel uint8
    array matching target_shape (H, W), where >127 means "masked".

    Accepts masks drawn at a different resolution than the source image
    (e.g. a canvas scaled down for display) and resizes to match.
    """
    try:
        with Image.open(io.BytesIO(data)) as im:
            gray = np.array(im.convert("L"), dtype=np.uint8)
    except Exception as exc:  # noqa: BLE001
        raise ValueError(f"Could not decode mask: {exc}") from exc

    h, w = target_shape
    if gray.shape != (h, w):
        gray = cv2.resize(gray, (w, h), interpolation=cv2.INTER_NEAREST)
    return (gray > 127).astype(np.uint8) * 255


def encode_bgra_to_png(bgra: np.ndarray, icc_profile: Optional[bytes] = None) -> bytes:
    """Encode a BGRA uint8 array back to lossless PNG bytes, optionally
    re-attaching a source ICC profile.
    """
    rgba = cv2.cvtColor(bgra, cv2.COLOR_BGRA2RGBA)
    im = Image.fromarray(rgba, mode="RGBA")

    buf = io.BytesIO()
    save_kwargs: dict = {"optimize": False, "compress_level": PNG_COMPRESSION_LEVEL}
    if icc_profile:
        save_kwargs["icc_profile"] = icc_profile
    im.save(buf, format="PNG", **save_kwargs)
    return buf.getvalue()
