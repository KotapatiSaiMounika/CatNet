import { validationResult } from 'express-validator';
import Post from '../models/Post.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.js';
import Comment from '../models/Comment.js';
import { getEmbeddingFromUrl } from '../services/aiMatch.service.js';

// Compute an AI Match embedding for a freshly-uploaded photo. This is
// best-effort: if the AI microservice is down or slow, post creation must
// still succeed — the post will just be missing from AI Match search
// results until it's edited again (or the embedding backfilled).
const tryGetEmbedding = async (imageUrl) => {
  if (!imageUrl) return undefined;
  try {
    return await getEmbeddingFromUrl(imageUrl);
  } catch (err) {
    console.error('AI Match: failed to compute embedding —', err.message);
    return undefined;
  }
};


// ─── GET /api/posts ──────────────────────────────────────────────────────────
export const getPosts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      location,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    const filter = {};

    // Full-text search on title + description
    if (search) {
      filter.$text = { $search: search };
    }

    if (category) {
      filter.category = category;
    }

    // Partial, case-insensitive location match
    if (location) {
      filter['location.address'] = { $regex: location, $options: 'i' };
    }

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name profileImage location'),
      Post.countDocuments(filter),
    ]);

    res.status(200).json(
      new ApiResponse(200, 'Posts fetched successfully.', {
        posts,
        pagination: {
          total,
          page:       pageNum,
          limit:      limitNum,
          totalPages: Math.ceil(total / limitNum),
          hasMore:    pageNum < Math.ceil(total / limitNum),
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/posts/:id ──────────────────────────────────────────────────────
export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('createdBy', 'name profileImage location bio');

    if (!post) return next(new ApiError(404, 'Post not found.'));

    res.status(200).json(new ApiResponse(200, 'Post fetched successfully.', { post }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/posts ─────────────────────────────────────────────────────────
export const createPost = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, errors.array()[0].msg, errors.array().map(e => e.msg)));
    }

    const { title, description, category, contactInfo } = req.body;

    // Parse location (sent as JSON string from multipart form)
    let location = {};
    if (req.body.location) {
      try {
        location = JSON.parse(req.body.location);
      } catch {
        location = { address: req.body.location };
      }
    }

    // Upload image if provided
    // Upload image if provided
    let catImage = '';
    if (req.file) {
      catImage = await uploadToCloudinary(req.file.path, 'catnet/posts');
    }

    // Only Lost/Found posts are searchable via AI Match — no point paying
    // for an embedding on an Adoption listing.
    const embedding =
      catImage && category !== 'Adoption' ? await tryGetEmbedding(catImage) : undefined;

    const post = await Post.create({
      title,
      description,
      category,
      catImage,
      location,
      contactInfo,
      createdBy: req.user._id,
      embedding,
    });

    await post.populate('createdBy', 'name profileImage location');

    res.status(201).json(new ApiResponse(201, 'Post created successfully.', { post }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/posts/:id ──────────────────────────────────────────────────────
export const updatePost = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, errors.array()[0].msg));
    }

    const post = await Post.findById(req.params.id);
    if (!post) return next(new ApiError(404, 'Post not found.'));

    // Only the owner can edit
    if (post.createdBy.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'You are not authorized to edit this post.'));
    }

    const { title, description, category, contactInfo } = req.body;

    let location = post.location;
    if (req.body.location) {
      try {
        location = JSON.parse(req.body.location);
      } catch {
        location = { address: req.body.location };
      }
    }

    // Replace image if a new one is uploaded
    // Replace image if a new one is uploaded
    let catImage = post.catImage;
    let newEmbedding;
    let photoChanged = false;
    if (req.file) {
      await deleteFromCloudinary(post.catImage);
      catImage = await uploadToCloudinary(req.file.path, 'catnet/posts');
      photoChanged = true;
      // Recompute the embedding for the new photo (Lost/Found only).
      newEmbedding = category !== 'Adoption' ? await tryGetEmbedding(catImage) : undefined;
    }

    const setFields = { title, description, category, contactInfo, location, catImage };
    if (photoChanged && newEmbedding) setFields.embedding = newEmbedding;

    const updateOp = { $set: setFields };
    // Clear a stale embedding if the photo changed but re-embedding failed,
    // or the post was switched to Adoption (no longer AI-Match searchable).
    if ((photoChanged && !newEmbedding) || category === 'Adoption') {
      updateOp.$unset = { embedding: 1 };
    }

    const updated = await Post.findByIdAndUpdate(req.params.id, updateOp, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name profileImage location');

    res.status(200).json(new ApiResponse(200, 'Post updated successfully.', { post: updated }));
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/posts/:id ───────────────────────────────────────────────────
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(new ApiError(404, 'Post not found.'));

    if (post.createdBy.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'You are not authorized to delete this post.'));
    }

    // Delete image from Cloudinary
    await deleteFromCloudinary(post.catImage);

    await post.deleteOne();

    await Comment.deleteMany({ post: post._id });

    res.status(200).json(new ApiResponse(200, 'Post deleted successfully.'));
  } catch (error) {
    next(error);
  }
};