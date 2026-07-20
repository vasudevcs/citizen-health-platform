const Notification = require('../models/Notification');

/**
 * Create a single notification for a user. Fire-and-forget friendly —
 * callers can `await` it or not; failures are non-fatal to the primary
 * action (e.g. an appointment still gets booked even if the notification
 * insert fails), so this deliberately does not throw upward by default.
 */
async function notifyUser({ userId, title, message, type = 'system', link, metadata }) {
  try {
    return await Notification.create({ user: userId, title, message, type, link, metadata });
  } catch (err) {
    console.error('notifyUser failed:', err.message);
    return null;
  }
}

/**
 * Notify every user with a given role (e.g. all doctors about a new
 * pending telemedicine request). Small-scale fan-out — fine for the
 * current doctor pool size; would move to a queue at larger scale.
 */
async function notifyRole(User, role, { title, message, type = 'system', link, metadata }) {
  try {
    const users = await User.find({ role, isActive: true }).select('_id').lean();
    if (users.length === 0) return;
    await Notification.insertMany(
      users.map((u) => ({ user: u._id, title, message, type, link, metadata }))
    );
  } catch (err) {
    console.error('notifyRole failed:', err.message);
  }
}

module.exports = { notifyUser, notifyRole };
