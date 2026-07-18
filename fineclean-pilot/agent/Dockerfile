# Self-contained image for the FineClean voice agent — no private base image.
# (gig-grab split this into Dockerfile.base + a thin per-deploy layer for speed;
#  merged here so Render can build it straight from python:3.12-slim.)
# First build is ~5–6 min (torch); Render caches layers after that.

FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# CPU-only torch (Render instances are CPU) — skips ~3 GB of CUDA wheels.
RUN pip install --upgrade pip \
    && pip install --index-url https://download.pytorch.org/whl/cpu \
        "torch>=2.4,<2.12" "torchaudio>=2.4,<2.12"

# Runtime deps (mirrors pyproject.toml [project].dependencies minus the pkg).
RUN pip install \
    "pipecat-ai>=0.0.70,<1.0" \
    "loguru>=0.7" \
    "websockets>=13" \
    "soundfile>=0.12" \
    "numpy>=1.26" \
    "openai>=1.50" \
    "noisereduce>=3.0" \
    "av>=12.0" \
    "silero-vad>=5.1" \
    "fastapi>=0.115" \
    "uvicorn[standard]>=0.32" \
    "deepgram-sdk>=3.7" \
    "anthropic>=0.39" \
    "cartesia>=1.0" \
    "twilio>=9.0" \
    "asyncpg>=0.30" \
    "python-dotenv>=1.0" \
    "pydantic>=2.9"

WORKDIR /app
COPY pyproject.toml ./
COPY src ./src
RUN pip install -e . --no-deps

# Render injects $PORT; main.py honors it (defaults to 8080 locally).
ENV PORT=8080
EXPOSE 8080

CMD ["python", "-m", "src.gigrab.main"]
