"""
CatNet AI Match microservice.

Small FastAPI wrapper around model.py. The Node backend calls this service
over HTTP — it's kept separate from the main API because TensorFlow doesn't
belong in a Node process, and this way it can be scaled / redeployed
independently.

Run locally:
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000

Endpoints:
    GET  /health              -> liveness check
    POST /embed                (multipart file upload)      -> {"embedding": [...]}
    POST /embed-url             {"url": "https://..."}       -> {"embedding": [...]}
    POST /similarity             {"a": [...], "b": [...]}    -> {"similarity": 0.87}
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
import requests

from model import get_embedding, cosine_similarity

app = FastAPI(title="CatNet AI Match Service")

MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10MB, matches frontend copy ("up to 10MB")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/embed")
async def embed(file: UploadFile = File(...)):
    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(400, "Unsupported image type.")

    data = await file.read()
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(400, "Image too large.")

    try:
        embedding = get_embedding(data)
    except Exception as e:
        raise HTTPException(422, f"Could not process image: {e}")

    return {"embedding": embedding}


class EmbedUrlRequest(BaseModel):
    url: str


@app.post("/embed-url")
def embed_url(body: EmbedUrlRequest):
    try:
        resp = requests.get(body.url, timeout=10)
        resp.raise_for_status()
    except requests.RequestException as e:
        raise HTTPException(400, f"Could not fetch image URL: {e}")

    if len(resp.content) > MAX_IMAGE_BYTES:
        raise HTTPException(400, "Image too large.")

    try:
        embedding = get_embedding(resp.content)
    except Exception as e:
        raise HTTPException(422, f"Could not process image: {e}")

    return {"embedding": embedding}


class SimilarityRequest(BaseModel):
    a: list[float]
    b: list[float]


@app.post("/similarity")
def similarity(body: SimilarityRequest):
    return {"similarity": cosine_similarity(body.a, body.b)}
