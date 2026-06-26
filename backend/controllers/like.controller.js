import Post from '../models/Post.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { sendNotification } from '../services/notification.service.js';

export const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(new ApiError(404, 'Post not found.'));

    const userId     = req.user._id.toString();
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(req.user._id);

      // Notify post owner (fire-and-forget)
      sendNotification({
        recipientId: post.createdBy,
        senderId:    req.user._id,
        type:        'like',
        postId:      post._id,
      });
    }

    await post.save();

    res.status(200).json(
      new ApiResponse(200, alreadyLiked ? 'Post unliked.' : 'Post liked.', {
        liked:      !alreadyLiked,
        likesCount: post.likes.length,
      })
    );
  } catch (error) {
    next(error);
  }
};