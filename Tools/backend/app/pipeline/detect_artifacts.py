"""Conservative watermark/glare/blemish *candidate* detection.

This module NEVER removes anything. It returns a list of suggested regions
for the frontend to render as review boxes - the user must explicitly
accept a suggestion before any pixel is touched (via the existing
manual_inpaint pipeline, reusing the same paint-to-remove path).

Why suggest-only: an earlier version of this tool tried fully-automatic
detect-and-repair. Tested against real art, it produced both false
positives (flagged ordinary hard edges between saturated and pale colors as
"contamination" and blurred/damaged them) and false negatives (missed part
of the actual artifact). Neither failure mode is acceptable when the
correctness bar is "must not damage the image" - so the detector here is
tuned hard toward precision over recall (miss real artifacts rather than
flag real artwork), and its output is structurally never auto-applied.

Detection signature: a region that is both brighter (higher V) and less
saturated (lower S) than its local surroundings, well clear of any strong
structural edge (which is where the earlier heuristic falsely fired), of a
plausible size and a compact/blob-like shape (not a thin sliver, which is
what a normal edge produces).

Known limitation, found by testing on dense ornamental art (engraved card
borders, numerals): this heuristic still can't perfectly separate "real
artifact" from "legitimate small bright/desaturated detail" - filigree
borders and numeral glyphs occasionally get suggested too, and a real
artifact sitting on dense detail can rank below those false positives or be
missed entirely. This is a fundamental limit of a classical (non-ML)
per-pixel color heuristic, not a tuning oversight - a training-based
watermark detector would do meaningfully better, but that's out of scope
here. Given that, treat this purely as "things worth a look," not "the
watermark". The false positives are harmless (a human takes one glance and
skips them) precisely because nothing is removed without review - that
review step is doing the real correctness work, not the detector.

Baseline estimation uses a morphological white top-hat (image minus its
opening with a structuring element sized larger than the biggest artifact
we're willing to flag) rather than a median blur. A median-blur baseline
silently breaks once the artifact is *larger* than roughly half the filter
window - at that point the window's own majority pixel is the artifact
itself, so "local median" just reflects the contamination back and the
delta collapses to ~0 (confirmed by testing: it missed an artifact that
should have been an easy catch). A top-hat's opening step erodes-then-
dilates with an explicit structuring element, which strips out *any* bright
blob smaller than that element regardless of how much of a smaller sampling
window it would have dominated - robust to blob size by construction.
"""

from __future__ import annotations

import dataclasses

import cv2
import numpy as np

from app.config import (
    DETECT_BOX_PADDING_PX,
    DETECT_EDGE_MARGIN_PX,
    DETECT_MAX_BLOB_AREA_FRACTION_OF_KERNEL,
    DETECT_MAX_CANDIDATES,
    DETECT_MIN_BLOB_AREA,
    DETECT_MIN_SOLIDITY,
    DETECT_SATURATION_DELTA_THRESHOLD,
    DETECT_VALUE_DELTA_THRESHOLD,
    OPAQUE_ALPHA_THRESHOLD,
)


@dataclasses.dataclass
class ArtifactCandidate:
    x: int
    y: int
    w: int
    h: int
    confidence: float  # 0..1, relative to the other candidates in this image


def detect_artifact_candidates(bgra: np.ndarray) -> list[ArtifactCandidate]:
    bgr = bgra[..., :3]
    alpha = bgra[..., 3]
    h, w = bgr.shape[:2]

    opaque = alpha >= OPAQUE_ALPHA_THRESHOLD
    if not np.any(opaque):
        return []

    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV).astype(np.float32)

    # Structuring element sized off local image scale (min dimension), NOT
    # total opaque area. A sprite *sheet* has many small sprites, so total
    # opaque area is the sum across all of them - sizing the kernel from
    # that produced a kernel comparable to (or larger than) a single
    # sprite's own width, and the opening blended across each sprite's
    # entire interior, flagging almost the whole sprite as "anomalous"
    # (confirmed: it happened, ~65% of the image was flagged). A kernel
    # sized off min(h, w) instead stays comfortably smaller than any
    # individual sprite while still exceeding typical watermark/glare size.
    kernel_radius = int(np.clip(min(h, w) * 0.025, 12, 45))
    kernel_size = kernel_radius * 2 + 1
    tophat_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))

    v_channel = hsv[..., 2]
    s_channel = hsv[..., 1]
    v_opened = cv2.morphologyEx(v_channel, cv2.MORPH_OPEN, tophat_kernel)
    # "Black-hat" on saturation (closing minus image) highlights small dips
    # in saturation the same way top-hat highlights small rises in value.
    s_closed = cv2.morphologyEx(s_channel, cv2.MORPH_CLOSE, tophat_kernel)

    delta_v = v_channel - v_opened
    delta_s = s_closed - s_channel
    candidate = (delta_v > DETECT_VALUE_DELTA_THRESHOLD) & (delta_s > DETECT_SATURATION_DELTA_THRESHOLD) & opaque

    # Stay well clear of strong structural edges - this is what keeps the
    # detector from firing on ordinary hard color transitions (the failure
    # mode that damaged legitimate artwork in earlier testing).
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    grad_x = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
    grad_y = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
    grad_mag = cv2.magnitude(grad_x, grad_y)
    strong_edge = (grad_mag > 60).astype(np.uint8)
    edge_zone = cv2.dilate(strong_edge, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (DETECT_EDGE_MARGIN_PX * 2 + 1,) * 2))
    candidate &= edge_zone == 0

    # Cap relative to the kernel's own area (not total opaque area, for the
    # same multi-sprite-sheet reason as the kernel sizing above) - the
    # top-hat structurally can't detect anything larger than the kernel
    # anyway, this just adds a safety margin against boundary artifacts.
    max_area = DETECT_MAX_BLOB_AREA_FRACTION_OF_KERNEL * np.pi * (kernel_radius**2)
    n_labels, labels, stats, _ = cv2.connectedComponentsWithStats(candidate.astype(np.uint8), connectivity=8)

    scored: list[tuple[float, ArtifactCandidate]] = []
    for label in range(1, n_labels):
        area = stats[label, cv2.CC_STAT_AREA]
        if area < DETECT_MIN_BLOB_AREA or area > max_area:
            continue
        bx = stats[label, cv2.CC_STAT_LEFT]
        by = stats[label, cv2.CC_STAT_TOP]
        bw = stats[label, cv2.CC_STAT_WIDTH]
        bh = stats[label, cv2.CC_STAT_HEIGHT]
        solidity = area / float(bw * bh)
        if solidity < DETECT_MIN_SOLIDITY:
            continue

        blob_mask = labels == label
        mean_delta_v = float(delta_v[blob_mask].mean())
        mean_delta_s = float(delta_s[blob_mask].mean())
        raw_score = mean_delta_v + mean_delta_s

        # stats[] entries are numpy.int32 - cast to native int so the
        # response is actually JSON-serializable (numpy scalars aren't).
        px0 = int(max(0, bx - DETECT_BOX_PADDING_PX))
        py0 = int(max(0, by - DETECT_BOX_PADDING_PX))
        px1 = int(min(w, bx + bw + DETECT_BOX_PADDING_PX))
        py1 = int(min(h, by + bh + DETECT_BOX_PADDING_PX))

        scored.append((raw_score, ArtifactCandidate(x=px0, y=py0, w=px1 - px0, h=py1 - py0, confidence=0.0)))

    if not scored:
        return []

    max_score = max(s for s, _ in scored) or 1.0
    results = []
    for raw_score, cand in sorted(scored, key=lambda t: -t[0])[:DETECT_MAX_CANDIDATES]:
        cand.confidence = round(min(1.0, raw_score / max_score), 3)
        results.append(cand)
    return results
