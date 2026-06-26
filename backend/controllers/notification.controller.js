import Notification from '../models/Notification.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

// GET /api/notifications
export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: req.user._id })
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .populate('sender', 'name profileImage')
        .populate('post', 'title catImage'),
      Notification.countDocuments({ recipient: req.user._id }),
      Notification.countDocuments({ recipient: req.user._id, read: false }),
    ]);

    res.status(200).json(
      new ApiResponse(200, 'Notifications fetched.', {
        notifications,
        unreadCount,
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

// PUT /api/notifications/:id/read  — mark one as read
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id }, // ensure ownership
      { read: true },
      { new: true }
    );

    if (!notification) return next(new ApiError(404, 'Notification not found.'));

    res.status(200).json(new ApiResponse(200, 'Notification marked as read.', { notification }));
  } catch (error) {
    next(error);
  }
};

// PUT /api/notifications/read-all  — mark all as read
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    res.status(200).json(new ApiResponse(200, 'All notifications marked as read.'));
  } catch (error) {
    next(error);
  }
};

// DELETE /api/notifications/:id
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id:       req.params.id,
      recipient: req.user._id,
    });

    if (!notification) return next(new ApiError(404, 'Notification not found.'));

    res.status(200).json(new ApiResponse(200, 'Notification deleted.'));
  } catch (error) {
    next(error);
  }
};