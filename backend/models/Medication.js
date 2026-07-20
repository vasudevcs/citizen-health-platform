const mongoose = require('mongoose');

/**
 * Medication — a prescription/reminder entry for a citizen.
 */
const medicationSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    dosage: { type: String, required: true },     // e.g. '500mg'
    frequency: { type: String, required: true },  // e.g. 'Twice daily'
    times: [{ type: String }],                    // e.g. ['08:00', '20:00']
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    instructions: { type: String },
    isActive: { type: Boolean, default: true },
    prescribedBy: { type: String },               // Doctor name (free text for now)

    // Adherence tracking
    takenDates: [{ type: Date }],
  },
  { timestamps: true }
);

medicationSchema.index({ citizen: 1, isActive: 1 });

module.exports = mongoose.model('Medication', medicationSchema);
