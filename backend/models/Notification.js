const mongoose = require('mongoose');

/**
 * Notification — in-app alert for a citizen (and other roles).
 * Created by backend events (medication reminders, appointment alerts, etc.)
 */
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'appointment',
        'medication',
        'lab_report',
        'health_alert',
        'system',
        'telemedicine',
        'community',
        'wellbeing',
      ],
      default: 'system',
    },
    isRead: { type: Boolean, default: false, index: true },
    link: { type: String }, // frontend route to navigate on click
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
