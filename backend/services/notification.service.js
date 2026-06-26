import Notification from '../models/Notification.js';
import { getIO } from '../socket/socket.js';

/**
 * Create a notification in DB and emit it via Socket.io.
 *
 * @param {Object} options
 * @param {string} options.recipientId  - who receives the notification
 * @param {string} options.senderId     - who triggered it
 * @param {string} options.type         - 'like' | 'comment'
 * @param {string} options.postId       - which post
 * @param {string} [options.commentSnippet] - first 80 chars of comment text
 */
export const sendNotification = async ({
  recipientId,
  senderId,
  type,
  postId,
  commentSnippet = '',
}) => {
  try {
    // Don't notify yourself
    if (recipientId.toString() === senderId.toString()) return;

    // Avoid duplicate like notifications (one per user per post)
    if (type === 'like') {
      const exists = await Notification.findOne({
        recipient: recipientId,
        sender:    senderId,
        type:      'like',
        post:      postId,
      });
      if (exists) return;
    }

    const notification = await Notification.create({
      recipient:      recipientId,
      sender:         senderId,
      type,
      post:           postId,
      commentSnippet: commentSnippet.slice(0, 80),
    });

    // Populate sender info for the real-time payload
    await notification.populate('sender', 'name profileImage');
    await notification.populate('post', 'title');

    // Emit to the recipient's private room
    try {
      const io = getIO();
      io.to(recipientId.toString()).emit('notification', {
        _id:            notification._id,
        type:           notification.type,
        sender:         notification.sender,
        post:           notification.post,
        commentSnippet: notification.commentSnippet,
        read:           false,
        createdAt:      notification.createdAt,
      });
    } catch {
      // Socket.io not initialized (e.g. in tests) — fail silently
    }

    return notification;
  } catch (error) {
    // Never let notification failure break the main action
    console.error('Notification error:', error.message);
  }
};