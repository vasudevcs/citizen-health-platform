const mongoose = require('mongoose');

/**
 * A field note logged by an ambassador while assisting a citizen
 * (outreach visit, enrollment help, follow-up call, etc.).
 */
const ambassadorNoteSchema = new mongoose.Schema(
  {
    ambassador: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: {
      type: String,
      enum: ['visit', 'enrollment', 'follow_up', 'referral', 'other'],
      default: 'other',
    },
    note: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true }
);

ambassadorNoteSchema.index({ citizen: 1, createdAt: -1 });

module.exports = mongoose.model('AmbassadorNote', ambassadorNoteSchema);
