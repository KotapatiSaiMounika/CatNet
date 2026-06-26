import Post from '../models/Post.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// POST /api/posts/:id/save  — toggle save/unsave
export const toggleSave = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(new ApiError(404, 'Post not found.'));

    const userId      = req.user._id.toString();
    const alreadySaved = post.savedBy.some((id) => id.toString() === userId);

    if (alreadySaved) {
      post.savedBy = post.savedBy.filter((id) => id.toString() !== userId);
    } else {
      post.savedBy.push(req.user._id);
    }

    await post.save();

    res.status(200).json(
      new ApiResponse(200, alreadySaved ? 'Post unsaved.' : 'Post saved.', {
        saved: !alreadySaved,
      })
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/users/saved  — get all posts saved by current user
export const getSavedPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [posts, total] = await Promise.all([
      Post.find({ savedBy: req.user._id })
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name profileImage location'),
      Post.countDocuments({ savedBy: req.user._id }),
    ]);

    res.status(200).json(
      new ApiResponse(200, 'Saved posts fetched.', {
        posts,
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