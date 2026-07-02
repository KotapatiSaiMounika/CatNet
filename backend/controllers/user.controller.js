import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Post from '../models/Post.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.js';

// ─── GET /api/users/:id ───────────────────────────────────────────────────────
// Public — anyone can view a profile
export const getUserProfile = async (req, res, next) => {
  try {
    // Exclude email — this is a public endpoint, viewable by anyone,
    // and email is not needed for a public profile view.
    const user = await User.findById(req.params.id).select('-email');
    if (!user) return next(new ApiError(404, 'User not found.'));

    // Return post count alongside profile
    const postCount = await Post.countDocuments({ createdBy: req.params.id });

    res.status(200).json(
      new ApiResponse(200, 'Profile fetched successfully.', {
        user,
        postCount,
      })
    );
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/users/:id/posts ─────────────────────────────────────────────────
// Public — paginated posts by a specific user
export const getUserPosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ApiError(404, 'User not found.'));

    const { page = 1, limit = 10, category } = req.query;
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const filter = { createdBy: req.params.id };
    if (category) filter.category = category;

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name profileImage location'),
      Post.countDocuments(filter),
    ]);

    res.status(200).json(
      new ApiResponse(200, 'User posts fetched successfully.', {
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

// ─── PUT /api/users/profile ───────────────────────────────────────────────────
// Protected — edit own profile text fields
export const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, errors.array()[0].msg));
    }

    const { name, bio, location } = req.body;

    // Build update object with only provided fields
    const updates = {};
    if (name     !== undefined) updates.name     = name;
    if (bio      !== undefined) updates.bio      = bio;
    if (location !== undefined) updates.location = location;

    if (Object.keys(updates).length === 0) {
      return next(new ApiError(400, 'No fields provided to update.'));
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json(new ApiResponse(200, 'Profile updated successfully.', { user }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/users/profile/image ───────────────────────────────────────────
// Protected — upload or replace profile avatar
export const updateProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, 'No image file provided.'));
    }

    const user = await User.findById(req.user._id);

    // Delete old avatar from Cloudinary if it exists
    if (user.profileImage) {
      await deleteFromCloudinary(user.profileImage);
    }

    // Upload new avatar
    const profileImage = await uploadToCloudinary(req.file.path, 'catnet/avatars');

    user.profileImage = profileImage;
    await user.save();

    res.status(200).json(
      new ApiResponse(200, 'Profile image updated successfully.', { profileImage })
    );
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/users/password ──────────────────────────────────────────────────
// Protected — change own password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new ApiError(400, 'Current password and new password are required.'));
    }

    if (newPassword.length < 6) {
      return next(new ApiError(400, 'New password must be at least 6 characters.'));
    }

    // Need password field explicitly (it's select:false)
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new ApiError(401, 'Current password is incorrect.'));
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    res.status(200).json(new ApiResponse(200, 'Password changed successfully.'));
  } catch (error) {
    next(error);
  }
};