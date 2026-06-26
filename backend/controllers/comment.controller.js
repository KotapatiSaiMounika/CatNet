import { body, validationResult } from 'express-validator';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { sendNotification } from '../services/notification.service.js';

// POST /api/posts/:id/comments
export const addComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, errors.array()[0].msg));
    }

    const post = await Post.findById(req.params.id);
    if (!post) return next(new ApiError(404, 'Post not found.'));

    const comment = await Comment.create({
      post:   req.params.id,
      author: req.user._id,
      text:   req.body.text,
    });

    await comment.populate('author', 'name profileImage');

    // Fire-and-forget notification
    sendNotification({
      recipientId:    post.createdBy,
      senderId:       req.user._id,
      type:           'comment',
      postId:         post._id,
      commentSnippet: req.body.text,
    });

    res.status(201).json(new ApiResponse(201, 'Comment added.', { comment }));
  } catch (error) {
    next(error);
  }
};

// GET /api/posts/:id/comments
export const getComments = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(new ApiError(404, 'Post not found.'));

    const { page = 1, limit = 20 } = req.query;
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [comments, total] = await Promise.all([
      Comment.find({ post: req.params.id })
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .populate('author', 'name profileImage'),
      Comment.countDocuments({ post: req.params.id }),
    ]);

    res.status(200).json(
      new ApiResponse(200, 'Comments fetched.', {
        comments,
        pagination: {
          total,
          page:       pageNum,
          limit:      limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

// PUT /api/posts/:id/comments/:commentId
export const editComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, errors.array()[0].msg));
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return next(new ApiError(404, 'Comment not found.'));

    if (comment.author.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'You can only edit your own comments.'));
    }

    comment.text = req.body.text;
    await comment.save();
    await comment.populate('author', 'name profileImage');

    res.status(200).json(new ApiResponse(200, 'Comment updated.', { comment }));
  } catch (error) {
    next(error);
  }
};

// DELETE /api/posts/:id/comments/:commentId
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return next(new ApiError(404, 'Comment not found.'));

    // Allow comment author OR post owner to delete
    const post = await Post.findById(req.params.id);
    const isCommentAuthor = comment.author.toString() === req.user._id.toString();
    const isPostOwner     = post?.createdBy.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isPostOwner) {
      return next(new ApiError(403, 'You are not authorized to delete this comment.'));
    }

    await comment.deleteOne();

    res.status(200).json(new ApiResponse(200, 'Comment deleted.'));
  } catch (error) {
    next(error);
  }
};

// Inline validator (used directly in route)
export const commentValidator = [
  body('text')
    .trim()
    .notEmpty().withMessage('Comment text is required')
    .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
];