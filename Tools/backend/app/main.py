"""FastAPI backend for the sprite/image cleanup editor.

Every endpoint follows the same shape: accept an uploaded image (and
optionally a mask), run one pipeline stage, return the resulting PNG. This
lets the frontend apply tools one at a time with its own undo history,
rather than committing to one fixed batch pipeline.

Run locally:
    uvicorn app.main:app --reload --port 8000

Environment variables:
    ALLOWED_ORIGINS   comma-separated list of allowed CORS origins
                      (default "*" - tighten this for production)
"""

from __future__ import annotations

import os
import tempfile
import traceback
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from app.config import (
    DEFAULT_ALPHA_ERODE,
    DEFAULT_BG_TOLERANCE,
    DEFAULT_INPAINT_RADIUS,
    DEFAULT_SHARPEN_AMOUNT,
    DEFAULT_SHARPEN_RADIUS,
    DEFAULT_STRENGTH,
    MAX_VIDEO_DURATION_SECONDS,
    MAX_VIDEO_UPLOAD_BYTES,
    MIN_REGION_PX,
)
from app.pipeline import alpha_cleanup, bg_removal, decontaminate, manual_inpaint, sharpen
from app.pipeline import video as video_pipeline
from app.pipeline.detect_artifacts import detect_artifact_candidates
from app.pipeline.full_pipeline import auto_enhance
from app.pipeline.io_utils import decode_mask, decode_upload_to_bgra, encode_bgra_to_png

app = FastAPI(title="Sprite Cleaner API", version="1.0.0")

_origins = os.environ.get("ALLOWED_ORIGINS", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if _origins == "*" else [o.strip() for o in _origins.split(",")],
    allow_methods=["*"],
    allow_headers=["*"],
    # Response headers aren't readable via fetch() cross-origin unless
    # explicitly exposed - browsers only allow the CORS-safelisted set by
    # default. The video probe endpoint returns metadata as custom headers
    # (X-Video-*) alongside the PNG body, so those need to be listed here.
    expose_headers=["X-Video-Width", "X-Video-Height", "X-Video-Duration", "X-Video-Fps"],
)


async def _read_image(file: UploadFile) -> tuple:
    data = await file.read()
    try:
        return decode_upload_to_bgra(data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


def _respond_png(bgra, icc_profile=None) -> Response:
    png_bytes = encode_bgra_to_png(bgra, icc_profile)
    return Response(content=png_bytes, media_type="image/png")


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/remove-background")
async def api_remove_background(
    file: UploadFile = File(...),
    mode: str = Form("auto"),  # "auto" | "ml" | "chroma"
    tolerance: float = Form(DEFAULT_BG_TOLERANCE),
):
    """"auto" picks chroma-key for uniform backdrops (the common sprite-
    sheet case, where it's both faster and more accurate than a general ML
    segmentation model) and falls back to ML for busy/photographic
    backgrounds. Pass "ml" or "chroma" explicitly to force one or the other.
    """
    bgra, icc = await _read_image(file)
    if mode not in ("auto", "ml", "chroma"):
        raise HTTPException(status_code=400, detail="mode must be 'auto', 'ml', or 'chroma'")
    strategy = bg_removal.pick_auto_strategy(bgra) if mode == "auto" else mode
    try:
        out = bg_removal.remove_background(bgra, strategy, tolerance)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Background removal failed: {exc}") from exc
    return _respond_png(out, icc)


@app.post("/api/clean-edges")
async def api_clean_edges(
    file: UploadFile = File(...),
    strength: float = Form(DEFAULT_STRENGTH),
    alpha_erode: float = Form(DEFAULT_ALPHA_ERODE),
):
    bgra, icc = await _read_image(file)
    out = decontaminate.decontaminate(bgra, strength)
    alpha = alpha_cleanup.clean_alpha_channel(out[..., 3], alpha_erode)
    alpha = alpha_cleanup.smooth_alpha_edges(alpha)
    out = out.copy()
    out[..., 3] = alpha
    return _respond_png(out, icc)


@app.post("/api/sharpen")
async def api_sharpen(
    file: UploadFile = File(...),
    amount: float = Form(DEFAULT_SHARPEN_AMOUNT),
    radius: float = Form(DEFAULT_SHARPEN_RADIUS),
):
    bgra, icc = await _read_image(file)
    out = sharpen.sharpen(bgra, radius, amount)
    return _respond_png(out, icc)


@app.post("/api/inpaint")
async def api_inpaint(
    file: UploadFile = File(...),
    mask: UploadFile = File(...),
    radius: int = Form(DEFAULT_INPAINT_RADIUS),
):
    """Manual paint-to-remove: mask is a same-size (or any-size, will be
    resized) image where painted/white pixels mark what to reconstruct.
    """
    bgra, icc = await _read_image(file)
    mask_data = await mask.read()
    try:
        mask_arr = decode_mask(mask_data, bgra.shape[:2])
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    out = manual_inpaint.paint_remove(bgra, mask_arr, radius)
    return _respond_png(out, icc)


@app.post("/api/detect-artifacts")
async def api_detect_artifacts(file: UploadFile = File(...)):
    """Suggests candidate watermark/glare/blemish regions for review - this
    endpoint only ever returns coordinates, it never modifies pixels. The
    frontend must render these as review boxes and let the user accept or
    reject each one before calling /api/inpaint on the approved region(s).
    Tuned conservative (may miss real artifacts) rather than aggressive
    (never flag legitimate artwork) - see detect_artifacts.py for why.
    """
    bgra, _icc = await _read_image(file)
    try:
        candidates = detect_artifact_candidates(bgra)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Detection failed: {exc}") from exc
    return {
        "candidates": [
            {"x": c.x, "y": c.y, "w": c.w, "h": c.h, "confidence": c.confidence} for c in candidates
        ]
    }


@app.post("/api/auto-enhance")
async def api_auto_enhance(
    file: UploadFile = File(...),
    bg_mode: str = Form("auto"),  # "auto" | "ml" | "chroma" | "off"
    bg_tolerance: float = Form(DEFAULT_BG_TOLERANCE),
    strength: float = Form(DEFAULT_STRENGTH),
    alpha_erode: float = Form(DEFAULT_ALPHA_ERODE),
    sharpen_amount: float = Form(DEFAULT_SHARPEN_AMOUNT),
    sharpen_radius: float = Form(DEFAULT_SHARPEN_RADIUS),
):
    """One-click pipeline: runs every stage in sequence. Prefer the
    individual endpoints above when the UI wants per-step undo.
    """
    bgra, icc = await _read_image(file)
    try:
        out = auto_enhance(
            bgra,
            bg_mode=bg_mode,  # type: ignore[arg-type]
            bg_tolerance=bg_tolerance,
            strength=strength,
            alpha_erode=alpha_erode,
            sharpen_amount=sharpen_amount,
            sharpen_radius=sharpen_radius,
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}") from exc
    return _respond_png(out, icc)


@app.post("/api/video/probe")
async def api_video_probe(file: UploadFile = File(...)):
    """Returns a representative preview frame (PNG) plus video metadata as
    response headers, so the frontend can let the user draw a watermark
    region against real pixel coordinates before committing to a full encode.
    """
    data = await file.read()
    if len(data) > MAX_VIDEO_UPLOAD_BYTES:
        raise HTTPException(
            status_code=400, detail=f"Video too large (max {MAX_VIDEO_UPLOAD_BYTES // (1024 * 1024)}MB)"
        )

    with tempfile.TemporaryDirectory() as tmp:
        in_path = os.path.join(tmp, f"input{Path(file.filename or '').suffix or '.mp4'}")
        with open(in_path, "wb") as f:
            f.write(data)
        try:
            info, frame_png = video_pipeline.probe_video(in_path)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    if info.duration > MAX_VIDEO_DURATION_SECONDS:
        raise HTTPException(
            status_code=400,
            detail=f"Video too long ({info.duration:.0f}s); max supported is {MAX_VIDEO_DURATION_SECONDS:.0f}s",
        )

    return Response(
        content=frame_png,
        media_type="image/png",
        headers={
            "X-Video-Width": str(info.width),
            "X-Video-Height": str(info.height),
            "X-Video-Duration": str(info.duration),
            "X-Video-Fps": str(info.fps),
        },
    )


@app.post("/api/video/process")
async def api_video_process(
    file: UploadFile = File(...),
    mode: str = Form(...),  # "remove" | "replace"
    x: int = Form(...),
    y: int = Form(...),
    w: int = Form(...),
    h: int = Form(...),
    logo: Optional[UploadFile] = File(None),
):
    """Removes (delogo) or replaces (overlay) a user-marked rectangular
    region for the full video duration. The region is always user-supplied -
    see app/pipeline/video.py for why there's no automatic watermark
    detector.
    """
    if mode not in ("remove", "replace"):
        raise HTTPException(status_code=400, detail="mode must be 'remove' or 'replace'")
    if w < MIN_REGION_PX or h < MIN_REGION_PX:
        raise HTTPException(status_code=400, detail=f"Region too small; minimum {MIN_REGION_PX}px per side")
    if mode == "replace" and logo is None:
        raise HTTPException(status_code=400, detail="A logo image is required for mode='replace'")

    data = await file.read()
    if len(data) > MAX_VIDEO_UPLOAD_BYTES:
        raise HTTPException(
            status_code=400, detail=f"Video too large (max {MAX_VIDEO_UPLOAD_BYTES // (1024 * 1024)}MB)"
        )

    with tempfile.TemporaryDirectory() as tmp:
        in_path = os.path.join(tmp, f"input{Path(file.filename or '').suffix or '.mp4'}")
        out_path = os.path.join(tmp, "output.mp4")
        with open(in_path, "wb") as f:
            f.write(data)

        try:
            info, _ = video_pipeline.probe_video(in_path)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

        if info.duration > MAX_VIDEO_DURATION_SECONDS:
            raise HTTPException(
                status_code=400,
                detail=f"Video too long ({info.duration:.0f}s); max supported is {MAX_VIDEO_DURATION_SECONDS:.0f}s",
            )
        if x < 0 or y < 0 or x + w > info.width or y + h > info.height:
            raise HTTPException(status_code=400, detail="Region is outside the video frame")

        try:
            if mode == "remove":
                await video_pipeline.remove_logo(in_path, out_path, x, y, w, h)
            else:
                assert logo is not None  # checked above
                logo_data = await logo.read()
                logo_path = os.path.join(tmp, "logo.png")
                with open(logo_path, "wb") as f:
                    f.write(logo_data)
                await video_pipeline.replace_logo(in_path, out_path, logo_path, x, y, w, h)
        except Exception as exc:  # noqa: BLE001
            # Broad on purpose (not just RuntimeError): ffmpeg failures are
            # RuntimeError, but subprocess-launch failures (e.g. a bad ffmpeg
            # path, or platform-specific asyncio subprocess issues) surface
            # as other exception types entirely - swallowing those behind a
            # narrow except left this endpoint returning a content-free 500
            # with no way to tell what actually broke.
            traceback.print_exc()
            raise HTTPException(
                status_code=500, detail=f"Video processing failed: {type(exc).__name__}: {exc}"
            ) from exc

        with open(out_path, "rb") as f:
            result = f.read()

    return Response(content=result, media_type="video/mp4")
