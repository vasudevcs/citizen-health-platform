const mongoose = require('mongoose');

/**
 * HealthVital — stores any type of biometric reading for a citizen.
 * Each document is a single timestamped measurement.
 */
const healthVitalSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'blood_pressure',
        'blood_sugar',
        'bmi',
        'heart_rate',
        'weight',
        'oxygen_saturation',
        'sleep',
        'activity',
        'temperature',
      ],
      index: true,
    },
    // Flexible value storage — different vitals have different shapes
    value: {
      // Numeric vitals
      primary: { type: Number },   // e.g. systolic, blood_sugar, bmi, heart_rate, weight, spo2, sleep_hours, steps
      secondary: { type: Number }, // e.g. diastolic for BP
      // Categorical
      label: { type: String },     // e.g. 'Normal', 'Fasting'
    },
    unit: { type: String },        // e.g. 'mmHg', 'mg/dL', 'bpm', 'kg', '%', 'hours', 'steps'
    notes: { type: String, maxlength: 500 },
    recordedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

// Compound index for fast "latest N readings per type per citizen"
healthVitalSchema.index({ citizen: 1, type: 1, recordedAt: -1 });

module.exports = mongoose.model('HealthVital', healthVitalSchema);
