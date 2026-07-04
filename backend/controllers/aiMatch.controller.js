import Post from '../models/Post.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { matchesSignature } from '../middleware/upload.middleware.js';
import { getEmbeddingFromBuffer, cosineSimilarity } from '../services/aiMatch.service.js';

// A hackathon/demo-scale safety cap. For a real production dataset this
// in-memory scan would move to a vector index (e.g. Mongo Atlas Vector
// Search, or a dedicated store like pgvector/FAISS) — noted in the README.
const MAX_CANDIDATES = 500;
const MAX_RESULTS = 5;

// ─── POST /api/posts/ai-match ────────────────────────────────────────────
// Upload a photo of a cat; get back the closest Lost/Found posts by visual
// similarity. The uploaded photo itself is never stored — only its
// embedding is computed (in-memory) and compared against embeddings already
// saved on existing posts.
export const searchByPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, 'Please upload a photo to search with.'));
    }

    if (!matchesSignature(req.file.buffer)) {
      return next(new ApiError(400, 'File content does not match an allowed image type.'));
    }

    let queryEmbedding;
    try {
      queryEmbedding = await getEmbeddingFromBuffer(req.file.buffer, req.file.mimetype);
    } catch (err) {
      // The AI microservice being down/cold-starting shouldn't look like a
      // generic 500 — tell the client specifically what failed.
      return next(new ApiError(503, 'AI match service is unavailable right now. Please try again shortly.'));
    }

    const { category } = req.query; // optional: narrow to 'Lost' or 'Found'
    const filter = { embedding: { $exists: true } };
    if (category === 'Lost' || category === 'Found') {
      filter.category = category;
    } else {
      filter.category = { $in: ['Lost', 'Found'] };
    }

    const candidates = await Post.find(filter)
      .select('+embedding title description category catImage location contactInfo createdBy createdAt')
      .populate('createdBy', 'name profileImage location')
      .limit(MAX_CANDIDATES);

    const matches = candidates
      .map((post) => ({
        post,
        similarity: cosineSimilarity(queryEmbedding, post.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, MAX_RESULTS)
      .map(({ post, similarity }) => {
        const plain = post.toObject();
        delete plain.embedding; // never leak raw embeddings to the client
        return { ...plain, matchScore: Math.round(similarity * 100) };
      });

    res.status(200).json(
      new ApiResponse(200, 'Matches found.', {
        matches,
        candidatesScanned: candidates.length,
      })
    );
  } catch (error) {
    next(error);
  }
};