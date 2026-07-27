"""Video watermark removal/replacement via ffmpeg.

Unlike the image pipeline (which works on decoded pixel arrays), video is
kept out-of-process: OpenCV reads a probe frame + metadata, and ffmpeg does
the actual re-encode. Frame-by-frame decode/process/encode in Python is far
too slow for anything but very short clips; ffmpeg's `delogo` filter and
`overlay` filter do the equivalent work as a single native encode pass,
which is what makes handling minutes-long video practical here.

The watermark region is always user-supplied (a rectangle drawn on the probe
frame) - there's no automatic "Gemini icon" detector. Google doesn't publish
a reference asset for it, and its position/scale isn't guaranteed constant
across resolutions, so a heuristic detector would be more likely to mislead
than help. Letting the user mark it once is both simpler and reliable for
*any* corner watermark, not just Gemini's.
"""

from __future__ import annotations

import asyncio
import shutil
import subprocess
from dataclasses import dataclass

import cv2
import imageio_ffmpeg

from app.config import VIDEO_ENCODE_CRF, VIDEO_ENCODE_PRESET


def get_ffmpeg_path() -> str:
    """Prefer a system-installed ffmpeg (if the deployment environment has
    one on PATH) and fall back to the static binary bundled by
    imageio-ffmpeg, so this works out of the box with no OS-level install.
    """
    system_ffmpeg = shutil.which("ffmpeg")
    if system_ffmpeg:
        return system_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


@dataclass
class VideoInfo:
    width: int
    height: int
    duration: float
    fps: float


def probe_video(path: str) -> tuple[VideoInfo, bytes]:
    """Reads basic metadata and a representative preview frame (PNG bytes)
    from the video at `path`, via OpenCV rather than ffprobe (which isn't
    bundled by imageio-ffmpeg) - cv2.VideoCapture already covers everything
    needed here.

    Raises:
        ValueError: if the file can't be opened as a video, or has no
            readable frames.
    """
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        cap.release()
        raise ValueError("Could not open this file as a video")

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = float(cap.get(cv2.CAP_PROP_FPS)) or 0.0
    frame_count = float(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = frame_count / fps if fps > 0 else 0.0

    # A frame a second or so in tends to be more representative than frame 0
    # (which is sometimes a black/fade-in frame), while staying cheap to seek to.
    if fps > 0 and duration > 1:
        cap.set(cv2.CAP_PROP_POS_FRAMES, min(fps, frame_count - 1))
    ok, frame = cap.read()
    if not ok:
        # Fall back to the very first frame if seeking failed for any reason.
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        ok, frame = cap.read()
    cap.release()

    if not ok or frame is None:
        raise ValueError("Could not read any frames from this video")

    ok, png = cv2.imencode(".png", frame)
    if not ok:
        raise ValueError("Could not encode preview frame")

    if width <= 0 or height <= 0:
        height, width = frame.shape[:2]

    return VideoInfo(width=width, height=height, duration=duration, fps=fps), png.tobytes()


async def _run_ffmpeg(args: list[str]) -> None:
    # Deliberately NOT asyncio.create_subprocess_exec: on Windows that
    # requires the ProactorEventLoop, and uvicorn's --reload supervisor
    # ends up running the worker under SelectorEventLoop instead (its own
    # event loop is already created, via multiprocessing.spawn, before our
    # app module - and therefore any event-loop-policy fix we could set at
    # import time - ever runs). create_subprocess_exec then raises a bare
    # NotImplementedError, which is a RuntimeError subclass with an empty
    # message, so it silently read as a content-free 500. A plain blocking
    # subprocess.run() off the event loop thread (via asyncio.to_thread)
    # doesn't touch asyncio's subprocess transport at all, so it works
    # identically regardless of which loop implementation is active.
    ffmpeg = get_ffmpeg_path()

    def _run() -> subprocess.CompletedProcess:
        return subprocess.run([ffmpeg, *args], capture_output=True)

    proc = await asyncio.to_thread(_run)
    if proc.returncode != 0:
        # ffmpeg's stderr is verbose; keep the tail, which is where the
        # actual error message almost always ends up.
        tail = proc.stderr.decode(errors="replace")[-2000:]
        raise RuntimeError(f"ffmpeg failed (exit {proc.returncode}): {tail}")


async def remove_logo(input_path: str, output_path: str, x: int, y: int, w: int, h: int) -> None:
    """Blends the given region from surrounding pixels/motion via ffmpeg's
    `delogo` filter - a fast, video-wide single pass. Good for a small
    corner watermark over a busy background; not pixel-perfect content-aware
    reconstruction (that's the image editor's inpaint tool, which isn't
    practical to run per-frame on anything but very short clips).
    """
    await _run_ffmpeg(
        [
            "-y",
            "-i",
            input_path,
            "-vf",
            f"delogo=x={x}:y={y}:w={w}:h={h}:show=0",
            "-c:v",
            "libx264",
            "-preset",
            VIDEO_ENCODE_PRESET,
            "-crf",
            str(VIDEO_ENCODE_CRF),
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "copy",
            output_path,
        ]
    )


async def replace_logo(
    input_path: str, output_path: str, logo_path: str, x: int, y: int, w: int, h: int
) -> None:
    """Overlays `logo_path` into the given region for the full video
    duration, scaled to fit inside (w, h) preserving its aspect ratio and
    centered (never stretched/distorted).

    Deliberately avoids the `pad` filter: padding the scaled logo out to an
    exact (w, h) canvas before overlaying is the "obvious" way to center it,
    but `scale ... force_original_aspect_ratio=decrease` can round its
    output a pixel larger than the requested box for some aspect ratios
    (most reliably reproduced with a square target), which makes a
    fixed-size `pad` immediately downstream fail with "Padded dimensions
    cannot be smaller than input dimensions". Centering via overlay's own
    `overlay_w`/`overlay_h` expressions sidesteps the whole class of bug -
    there's no second fixed-size target for the scaled output to mismatch.
    """
    filter_complex = (
        f"[1:v]format=rgba,scale=w={w}:h={h}:force_original_aspect_ratio=decrease[logo];"
        f"[0:v][logo]overlay=x={x}+({w}-overlay_w)/2:y={y}+({h}-overlay_h)/2[outv]"
    )
    await _run_ffmpeg(
        [
            "-y",
            "-i",
            input_path,
            "-i",
            logo_path,
            "-filter_complex",
            filter_complex,
            "-map",
            "[outv]",
            "-map",
            "0:a?",
            "-c:v",
            "libx264",
            "-preset",
            VIDEO_ENCODE_PRESET,
            "-crf",
            str(VIDEO_ENCODE_CRF),
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "copy",
            output_path,
        ]
    )
