const { z } = require('zod');

const prescriptionSchema = z.object({
  citizenId: z.string().min(1, 'Patient is required'),
  name: z.string().min(1, 'Medication name is required').max(200),
  dosage: z.string().min(1, 'Dosage is required').max(100),
  frequency: z.string().min(1, 'Frequency is required').max(100),
  times: z.array(z.string()).default([]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  instructions: z.string().max(1000).optional(),
});

const availabilitySlotSchema = z.object({
  day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:mm format'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:mm format'),
});

const availabilitySchema = z.object({
  specialty: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
  availability: z.array(availabilitySlotSchema).max(30).default([]),
});

module.exports = { prescriptionSchema, availabilitySchema };
