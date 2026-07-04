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
import { searchByPhoto } from '../controllers/aiMatch.controller.js';
import { createPostValidator, updatePostValidator } from '../validators/post.validator.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload, uploadMemory, verifyImageSignature } from '../middleware/upload.middleware.js';

const router = express.Router();

// AI Match — upload a photo, get back the closest Lost/Found posts by
// visual similarity. Public (no login required): someone who just found a
// cat on the street should be able to search before creating an account.
// Placed above '/:id' only for readability; Express routes by method+path
// so there's no actual conflict.
router.post('/ai-match', uploadMemory.single('photo'), searchByPhoto);

// Posts 
router.get('/',    getPosts);
router.get('/:id', getPostById);

router.post(
  '/',
  protect,
  upload.single('catImage'),
  verifyImageSignature,
  createPostValidator,
  createPost
);
router.put(
  '/:id',
  protect,
  upload.single('catImage'),
  verifyImageSignature,
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