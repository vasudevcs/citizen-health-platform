const Notification = require('../models/Notification');

// GET /api/notifications/me
exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();
    // lean() docs only carry Mongo's _id — the frontend NotificationItem
    // type expects `id`, so without this every notification rendered with
    // an undefined React key.
    const mapped = notifications.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }));
    const unreadCount = mapped.filter((n) => !n.isRead).length;
    res.json({ success: true, notifications: mapped, unreadCount });
  } catch (err) {
    next(err);
  }
};

// PUT /api/notifications/mark-all-read
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/:id/read
exports.markOneRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: { isRead: true } }
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
