import express from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/post.controller.js';
import {
  addComment,
  getComments,
  editComment,
  deleteComment,
  commentValidator,
} from '../controllers/comment.controller.js';
import { toggleLike } from '../controllers/like.controller.js';
import { toggleSave } from '../controllers/save.controller.js';
import { createPostValidator, updatePostValidator } from '../validators/post.validator.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

// Posts 
router.get('/',    getPosts);
router.get('/:id', getPostById);

router.post(
  '/',
  protect,
  upload.single('catImage'),
  createPostValidator,
  createPost
);
router.put(
  '/:id',
  protect,
  upload.single('catImage'),
  updatePostValidator,
  updatePost
);
router.delete('/:id', protect, deletePost);

// Comments 
router.get('/:id/comments',                    getComments);
router.post('/:id/comments', protect, commentValidator, addComment);
router.put('/:id/comments/:commentId',  protect, commentValidator, editComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

// Likes 
router.post('/:id/like', protect, toggleLike);

// Save 
router.post('/:id/save', protect, toggleSave);

export default router;