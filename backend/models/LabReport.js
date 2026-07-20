const mongoose = require('mongoose');

/**
 * LabReport — stores uploaded or entered lab investigation results.
 */
const labReportSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true }, // e.g. 'CBC Report'
    lab: { type: String },                               // lab name
    conductedAt: { type: Date, required: true },
    results: [
      {
        parameter: { type: String, required: true }, // e.g. 'Hemoglobin'
        value: { type: String, required: true },     // e.g. '13.5'
        unit: { type: String },                      // e.g. 'g/dL'
        referenceRange: { type: String },            // e.g. '12-17'
        status: {
          type: String,
          enum: ['normal', 'low', 'high', 'critical'],
          default: 'normal',
        },
      },
    ],
    fileUrl: { type: String },     // Cloudinary URL for scanned report
    filePublicId: { type: String }, // Cloudinary public_id for deletion
    notes: { type: String },
    isSharedWithDoctor: { type: Boolean, default: false },
  },
  { timestamps: true }
);

labReportSchema.index({ citizen: 1, conductedAt: -1 });

module.exports = mongoose.model('LabReport', labReportSchema);
