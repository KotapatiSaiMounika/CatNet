import express from 'express';
import {
  getUserProfile,
  getUserPosts,
  updateProfile,
  updateProfileImage,
  changePassword,
} from '../controllers/user.controller.js';
import { getSavedPosts } from '../controllers/save.controller.js';
import { updateProfileValidator } from '../validators/user.validator.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

// ── Protected routes (own profile) ──────────────────────
// ORDER MATTERS: specific paths before /:id
router.get('/saved',          protect, getSavedPosts);
router.put('/profile',        protect, updateProfileValidator, updateProfile);
router.put('/password',       protect, changePassword);
router.post(
  '/profile/image',
  protect,
  upload.single('profileImage'),
  updateProfileImage
);

//  Public routes 
router.get('/:id',       getUserProfile);
router.get('/:id/posts', getUserPosts);

export default router;