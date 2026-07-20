const mongoose = require('mongoose');

const conditionResultSchema = new mongoose.Schema(
  {
    score: { type: Number, required: true, min: 0, max: 100 },
    level: { type: String, enum: ['low', 'moderate', 'high', 'critical'], required: true },
    factors: [{ type: String }],
    recommendations: [{ type: String }],
  },
  { _id: false }
);

const riskAssessmentSchema = new mongoose.Schema(
  {
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // engine identity, so historical assessments remain interpretable even
    // after the scoring logic changes (e.g. rule-based-v1 -> ml-v1)
    engineVersion: { type: String, required: true },

    // profile answers submitted with this assessment
    profile: {
      age: { type: Number },
      gender: { type: String, enum: ['male', 'female', 'other'] },
      smoker: { type: Boolean, default: false },
      familyHistory: {
        diabetes: { type: Boolean, default: false },
        hypertension: { type: Boolean, default: false },
        cardiovascular: { type: Boolean, default: false },
        obesity: { type: Boolean, default: false },
      },
    },

    // snapshot of the vitals used, for traceability/auditing
    vitalsSnapshot: { type: mongoose.Schema.Types.Mixed },

    conditions: {
      diabetes: { type: conditionResultSchema, required: true },
      hypertension: { type: conditionResultSchema, required: true },
      cardiovascular: { type: conditionResultSchema, required: true },
      obesity: { type: conditionResultSchema, required: true },
    },
  },
  { timestamps: true }
);

riskAssessmentSchema.index({ citizen: 1, createdAt: -1 });

module.exports = mongoose.model('RiskAssessment', riskAssessmentSchema);
