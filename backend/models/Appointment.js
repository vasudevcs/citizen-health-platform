const mongoose = require('mongoose');

/**
 * Appointment — a scheduled or completed visit (telemedicine or physical).
 * For telemedicine appointments, the socket.io room id is simply the
 * appointment's own _id — no separate room/consultation model needed.
 */
const chatMessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['citizen', 'doctor'], required: true },
    text: { type: String, required: true, maxlength: 2000 },
    sentAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const appointmentSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    doctorName: { type: String },         // denormalized for quick display
    doctorSpecialty: { type: String },
    scheduledAt: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, default: 30 },
    type: {
      type: String,
      enum: ['in_person', 'telemedicine', 'follow_up'],
      default: 'in_person',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
      default: 'pending',
    },
    notes: { type: String },
    meetingLink: { type: String },        // for telemedicine
    chatMessages: { type: [chatMessageSchema], default: [] },
  },
  { timestamps: true }
);

appointmentSchema.index({ citizen: 1, scheduledAt: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
