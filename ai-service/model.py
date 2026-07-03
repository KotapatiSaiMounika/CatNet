"""
CatNet AI Match — embedding model.

This is a *re-identification* model, not a classifier: we don't have (or need)
a labelled dataset of "which cat is which". Instead we use a CNN pretrained on
ImageNet (MobileNetV2) as a general-purpose visual feature extractor, strip its
classification head, and use the 1280-dim pooled feature vector as an
"embedding" (fingerprint) for a cat photo. Two photos of the same cat produce
embeddings that are close together in that 1280-dim space (measured with
cosine similarity); photos of different cats end up farther apart. This is the
same idea used in face re-identification and product visual-search systems,
and it needs zero training data or training time — which matters given the
same-day deadline. If a labelled dataset of matched cat photo pairs becomes
available later, this file is the place to swap in a fine-tuned / triplet-loss
model without changing anything else in the service.
"""

import io
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import (
    MobileNetV2,
    preprocess_input,
)

IMG_SIZE = (224, 224)

# Loaded once at process start — this is the expensive part (~10-20s on CPU).
_model = MobileNetV2(
    weights="imagenet",
    include_top=False,
    pooling="avg",  # global average pooling -> flat (1280,) feature vector
    input_shape=(*IMG_SIZE, 3),
)


def _load_image(image_bytes: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE)
    arr = np.array(img, dtype=np.float32)
    return arr


def get_embedding(image_bytes: bytes) -> list[float]:
    """Return a 1280-dim L2-normalized embedding for a single image."""
    arr = _load_image(image_bytes)
    batch = np.expand_dims(arr, axis=0)
    batch = preprocess_input(batch)
    features = _model.predict(batch, verbose=0)[0]  # (1280,)

    # L2-normalize so plain dot-product == cosine similarity downstream.
    norm = np.linalg.norm(features)
    if norm > 0:
        features = features / norm

    return features.astype(float).tolist()


def cosine_similarity(a: list[float], b: list[float]) -> float:
    va, vb = np.array(a), np.array(b)
    denom = np.linalg.norm(va) * np.linalg.norm(vb)
    if denom == 0:
        return 0.0
    return float(np.dot(va, vb) / denom)
