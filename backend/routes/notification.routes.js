import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All notification routes are protected
router.use(protect);

router.get('/',                  getNotifications);
router.put('/read-all',          markAllAsRead);   // before /:id to avoid conflict
router.put('/:id/read',          markAsRead);
router.delete('/:id',            deleteNotification);

export default router;