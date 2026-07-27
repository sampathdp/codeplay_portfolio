"""Central tunable constants for the sprite-cleaning pipeline.

Mirrors the CLI tool's CONFIGURABLE PARAMETERS block - see the top-level
README for context on what each stage does. Values here are defaults; most
are also exposed as per-request overrides in the API schemas.
"""

# --- Alpha classification thresholds (0-255) --------------------------------
OPAQUE_ALPHA_THRESHOLD: int = 250
TRANSPARENT_ALPHA_THRESHOLD: int = 4

# --- Chroma-key background removal (fallback / fast path) -------------------
DEFAULT_BG_TOLERANCE: float = 30.0
BG_BORDER_SAMPLE_FRACTION: float = 0.02
BG_EDGE_FEATHER_PX: float = 2.0
AUTO_BG_OPAQUE_FRACTION: float = 0.999

# --- Halo detection / decontamination ---------------------------------------
DEFAULT_STRENGTH: float = 1.0
BASE_CONTAMINATION_THRESHOLD: float = 22.0
PROPAGATION_KERNEL_SIZES: tuple[int, ...] = (3, 5, 9, 15, 25)
MAX_INPAINT_RADIUS: int = 6
MAX_EDGE_BAND_PX: int = 8

# --- Alpha cleanup ------------------------------------------------------------
DEFAULT_ALPHA_ERODE: float = 0.5
MIN_NOISE_ISLAND_AREA: int = 3

# --- Edge smoothing -----------------------------------------------------------
ALPHA_SMOOTH_SIGMA: float = 0.6

# --- Selective sharpening -----------------------------------------------------
DEFAULT_SHARPEN_RADIUS: float = 0.8
DEFAULT_SHARPEN_AMOUNT: float = 0.8
SHARPEN_THRESHOLD: int = 2

# --- Manual spot-removal (paint-to-remove) inpainting ------------------------
DEFAULT_INPAINT_RADIUS: int = 8
MAX_INPAINT_MASK_RADIUS: int = 40  # hard cap so a runaway brush stroke can't
                                    # blow out inpaint quality/latency

# --- ML background removal ----------------------------------------------------
REMBG_MODEL_NAME: str = "isnet-general-use"  # good general-purpose quality/speed balance

# --- Watermark/artifact candidate detection (suggest-only, never auto-applies) ---
# Tuned deliberately conservative: it is far better to miss a real artifact
# (the user falls back to manual painting) than to flag legitimate artwork
# and risk it being accepted and damaged. Every candidate is a *suggestion*
# the frontend must render for user review - nothing is removed until the
# user explicitly approves it (see app/pipeline/detect_artifacts.py).
DETECT_VALUE_DELTA_THRESHOLD: float = 20.0   # min brightness rise over baseline
DETECT_SATURATION_DELTA_THRESHOLD: float = 18.0  # min saturation drop vs baseline
DETECT_EDGE_MARGIN_PX: int = 6               # keep candidates this far from any
                                              # strong structural edge, so ordinary
                                              # hard color transitions never qualify
DETECT_MIN_BLOB_AREA: int = 120              # px^2
DETECT_MAX_BLOB_AREA_FRACTION_OF_KERNEL: float = 5.0  # ignore anomalies bigger
                                              # than this multiple of the
                                              # top-hat kernel's own area (kept
                                              # relative to the kernel, not
                                              # total image/opaque area, so it
                                              # scales correctly on sprite
                                              # sheets with many small sprites).
                                              # There's a wide safety margin
                                              # here: real artifacts measured
                                              # ~3x kernel area, false-positive
                                              # whole-sprite blobs measured
                                              # ~75x kernel area - lots of room
                                              # between the two.
DETECT_MIN_SOLIDITY: float = 0.25            # area / bounding-box area - filters
                                              # out thin edge slivers, keeps blobs
DETECT_MAX_CANDIDATES: int = 20              # cap returned suggestions
DETECT_BOX_PADDING_PX: int = 6               # padding added around each blob's
                                              # bounding box in the returned region

# --- Output ---------------------------------------------------------------
PNG_COMPRESSION_LEVEL: int = 6
MAX_UPLOAD_DIMENSION: int = 6000  # px, safety cap on longest side

# --- Video watermark removal (ffmpeg-based) -----------------------------------
# Synchronous request/response (no job queue) - these caps keep a single
# ffmpeg encode within a request/response cycle a browser will actually wait
# out, rather than silently hanging on a multi-hundred-MB or hour-long upload.
MAX_VIDEO_UPLOAD_BYTES: int = 300 * 1024 * 1024  # 300 MB
MAX_VIDEO_DURATION_SECONDS: float = 600.0  # 10 minutes
VIDEO_ENCODE_PRESET: str = "veryfast"  # libx264 preset - speed/size tradeoff
VIDEO_ENCODE_CRF: int = 20  # lower = higher quality/bigger file; 20 is visually near-lossless
MIN_REGION_PX: int = 4  # smallest allowed watermark-region edge length
