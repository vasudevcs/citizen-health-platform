const mongoose = require('mongoose');

/**
 * MoodEntry — a single daily mood/journal check-in for a citizen.
 * Mirrors the HealthVital pattern: one document per timestamped entry.
 */
const moodEntrySchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mood: {
      type: String,
      required: true,
      enum: ['great', 'good', 'okay', 'low', 'struggling'],
    },
    // 1-10 self-reported scale, kept alongside the categorical mood so
    // charts can plot a continuous trend line.
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    stressLevel: {
      type: Number,
      min: 1,
      max: 10,
    },
    sleepHours: {
      type: Number,
      min: 0,
      max: 24,
    },
    triggers: {
      type: [String],
      default: [],
    },
    note: { type: String, maxlength: 1000 },
    recordedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

// One entry per citizen per calendar day is the common case, but we allow
// multiple check-ins/day — fast lookup for "trend over last N days".
moodEntrySchema.index({ citizen: 1, recordedAt: -1 });

module.exports = mongoose.model('MoodEntry', moodEntrySchema);
