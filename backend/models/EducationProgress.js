const mongoose = require('mongoose');

/**
 * Tracks a citizen's interaction with a piece of health-education content.
 * Content itself is a static curated library (see educationController.js) —
 * same approach used for wellbeing resources — so this only stores the
 * per-user completion/bookmark state keyed by the content's string id.
 */
const educationProgressSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    contentId: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    bookmarked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

educationProgressSchema.index({ citizen: 1, contentId: 1 }, { unique: true });

module.exports = mongoose.model('EducationProgress', educationProgressSchema);
