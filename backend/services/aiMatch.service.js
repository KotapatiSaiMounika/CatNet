/**
 * Bridge between the Node backend and the Python AI microservice
 * (ai-service/) that computes MobileNetV2 photo embeddings.
 *
 * Two call sites use this:
 *  1. post.controller.js -> getEmbeddingFromUrl, right after a Lost/Found
 *     photo lands on Cloudinary, so every post gets an embedding stored
 *     against it as soon as it's created.
 *  2. aiMatch.controller.js -> getEmbeddingFromBuffer, when a user uploads
 *     a fresh photo to search with. That photo is never persisted — only
 *     its embedding is computed, used for one comparison, then discarded.
 *
 * Cosine similarity is computed here in Node (not via the AI service's
 * /similarity endpoint) so that comparing one query photo against many
 * candidate posts costs one HTTP round trip, not N of them.
 */

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const getEmbeddingFromUrl = async (imageUrl) => {
  const response = await fetch(`${AI_SERVICE_URL}/embed-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: imageUrl }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`AI service /embed-url failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  return data.embedding;
};

export const getEmbeddingFromBuffer = async (buffer, mimetype = 'image/jpeg') => {
  const form = new FormData();
  form.append('file', new Blob([buffer], { type: mimetype }), 'query-photo.jpg');

  const response = await fetch(`${AI_SERVICE_URL}/embed`, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`AI service /embed failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  return data.embedding;
};

/**
 * Both embeddings coming out of the AI service are already L2-normalized,
 * so this reduces to a dot product — but it's computed properly here in
 * case that ever changes upstream.
 */
export const cosineSimilarity = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length === 0) {
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
};