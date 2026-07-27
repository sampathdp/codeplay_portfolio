"""Background removal: two interchangeable strategies behind one interface.

- "chroma": border-seeded flood-fill chroma-key. Fast, no model download,
  works well on solid/near-uniform backdrops. Cannot separate a subject
  from a busy or photographic background.
- "ml": general-purpose ML segmentation (rembg / isnet-general-use, runs
  locally via ONNX Runtime - no network calls after the model is cached).
  Works on arbitrary backgrounds; this is what "remove background" tools
  normally mean.

Both return a BGRA array with a first-pass alpha channel - callers should
run it through the decontamination pipeline afterward, since both
strategies leave some edge noise (chroma-key leaves a hard boundary,
ML segmentation leaves soft mask fringing) that the halo-decontamination
stage is specifically designed to clean up.
"""

from __future__ import annotations

import io
from functools import lru_cache
from typing import Literal

import cv2
import numpy as np
from PIL import Image

from app.config import (
    AUTO_BG_OPAQUE_FRACTION,
    BG_BORDER_SAMPLE_FRACTION,
    BG_EDGE_FEATHER_PX,
    OPAQUE_ALPHA_THRESHOLD,
    REMBG_MODEL_NAME,
)

BgMode = Literal["auto", "chroma", "ml", "off"]


def should_remove_background(alpha: np.ndarray, mode: BgMode) -> bool:
    """"auto" only removes the background when the source is essentially
    fully opaque (no real transparency to lose); "chroma"/"ml" always run;
    "off" never runs.
    """
    if mode == "off":
        return False
    if mode in ("chroma", "ml"):
        return True
    opaque_fraction = float(np.mean(alpha >= OPAQUE_ALPHA_THRESHOLD))
    return opaque_fraction >= AUTO_BG_OPAQUE_FRACTION


def sample_border_color(bgr: np.ndarray) -> np.ndarray:
    h, w = bgr.shape[:2]
    thickness = max(2, int(round(min(h, w) * BG_BORDER_SAMPLE_FRACTION)))
    top = bgr[:thickness, :, :].reshape(-1, 3)
    bottom = bgr[-thickness:, :, :].reshape(-1, 3)
    left = bgr[:, :thickness, :].reshape(-1, 3)
    right = bgr[:, -thickness:, :].reshape(-1, 3)
    border_pixels = np.concatenate([top, bottom, left, right], axis=0)
    return np.median(border_pixels.astype(np.float32), axis=0)


# A general-purpose ML segmentation model looks for "the one salient
# subject" and performs badly on sprite sheets - many repeated icons on a
# flat backdrop confuse it into a muddy, semi-transparent mess (verified:
# it's measurably worse than chroma-key on exactly this case). Chroma-key
# is not just faster but *more correct* whenever the backdrop is actually
# uniform - which is the overwhelmingly common sprite-sheet case - so
# "auto" picks between them based on how uniform the border actually is,
# rather than always reaching for the fancier model.
BORDER_UNIFORMITY_COLOR_TOLERANCE: float = 30.0  # Euclidean BGR distance
BORDER_UNIFORMITY_MIN_FRACTION: float = 0.7        # majority-vote, not mean/std -
                                                     # a tightly-packed sprite sheet
                                                     # can have a minority of
                                                     # decorative pixels touching
                                                     # the image edge without the
                                                     # backdrop itself being busy


def is_background_uniform(bgr: np.ndarray) -> bool:
    """True if most of the border region is close to a single flat color.

    Uses a majority-vote fraction (not raw standard deviation) specifically
    because plain std is skewed by a minority of edge-touching decorative
    pixels in tightly-packed sprite sheets (e.g. ornamental card borders
    reaching the image edge) even when the true backdrop is flat - which
    would otherwise wrongly route a perfect chroma-key case to the weaker
    general-purpose ML model.
    """
    h, w = bgr.shape[:2]
    thickness = max(2, int(round(min(h, w) * BG_BORDER_SAMPLE_FRACTION)))
    top = bgr[:thickness, :, :].reshape(-1, 3)
    bottom = bgr[-thickness:, :, :].reshape(-1, 3)
    left = bgr[:, :thickness, :].reshape(-1, 3)
    right = bgr[:, -thickness:, :].reshape(-1, 3)
    border_pixels = np.concatenate([top, bottom, left, right], axis=0).astype(np.float32)

    median_color = np.median(border_pixels, axis=0)
    dist = np.sqrt(np.sum((border_pixels - median_color) ** 2, axis=1))
    fraction_uniform = float(np.mean(dist < BORDER_UNIFORMITY_COLOR_TOLERANCE))
    return fraction_uniform >= BORDER_UNIFORMITY_MIN_FRACTION


def pick_auto_strategy(bgra: np.ndarray) -> Literal["chroma", "ml"]:
    """"auto" mode's decision: uniform backdrop -> chroma-key (faster and
    more accurate for sprite sheets); anything else -> ML segmentation.
    """
    return "chroma" if is_background_uniform(bgra[..., :3]) else "ml"


def remove_background_chroma(bgra: np.ndarray, tolerance: float) -> np.ndarray:
    """Border-seeded flood-fill chroma-key (see module docstring)."""
    bgr = bgra[..., :3]
    bg_color = sample_border_color(bgr)

    diff = bgr.astype(np.float32) - bg_color
    dist = np.sqrt(np.sum(diff * diff, axis=-1))
    candidate_bg = (dist < tolerance).astype(np.uint8)

    n_labels, labels, _stats, _ = cv2.connectedComponentsWithStats(candidate_bg, connectivity=8)
    border_labels = set(np.unique(labels[0, :])) | set(np.unique(labels[-1, :]))
    border_labels |= set(np.unique(labels[:, 0])) | set(np.unique(labels[:, -1]))
    border_labels.discard(0)

    h, w = candidate_bg.shape
    background_mask = np.isin(labels, list(border_labels)) if border_labels else np.zeros((h, w), dtype=bool)

    bg_u8 = background_mask.astype(np.uint8)
    dist_into_fg = cv2.distanceTransform((1 - bg_u8), cv2.DIST_L2, 5)
    dist_into_bg = cv2.distanceTransform(bg_u8, cv2.DIST_L2, 5)
    signed_dist = dist_into_fg - dist_into_bg

    ramp = np.clip((signed_dist + BG_EDGE_FEATHER_PX / 2.0) / BG_EDGE_FEATHER_PX, 0.0, 1.0)
    new_alpha = (ramp * 255.0).astype(np.uint8)

    out = bgra.copy()
    out[..., 3] = new_alpha
    return out


@lru_cache(maxsize=1)
def _rembg_session():
    """Lazily create (and cache) the rembg ONNX session. The model weights
    are downloaded to ~/.u2net on first use and cached on disk after that -
    no network call on subsequent runs.
    """
    from rembg import new_session

    return new_session(REMBG_MODEL_NAME)


def remove_background_ml(bgra: np.ndarray) -> np.ndarray:
    """General-purpose ML background removal via rembg. Works on arbitrary
    backgrounds (busy, photographic, gradients) unlike the chroma-key path.
    """
    from rembg import remove

    rgba_in = cv2.cvtColor(bgra, cv2.COLOR_BGRA2RGBA)
    im = Image.fromarray(rgba_in, mode="RGBA")
    buf = io.BytesIO()
    im.save(buf, format="PNG")

    session = _rembg_session()
    out_bytes = remove(buf.getvalue(), session=session)

    out_im = Image.open(io.BytesIO(out_bytes)).convert("RGBA")
    out_rgba = np.array(out_im, dtype=np.uint8)
    return cv2.cvtColor(out_rgba, cv2.COLOR_RGBA2BGRA)


def remove_background(bgra: np.ndarray, mode: BgMode, tolerance: float) -> np.ndarray:
    """Dispatch to the requested strategy. Callers should already have
    checked should_remove_background() - this always runs when called
    directly (used by the explicit /remove-background endpoint).
    """
    if mode == "ml":
        return remove_background_ml(bgra)
    return remove_background_chroma(bgra, tolerance)
