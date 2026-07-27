FROM python:3.11-slim

# libgl1/libglib2.0-0 are required by opencv-python-headless's native deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Pre-download the rembg model at build time so cold starts don't pay for it
RUN python -c "from app.pipeline.bg_removal import _rembg_session; _rembg_session()"

ENV ALLOWED_ORIGINS="*"
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
