const { z } = require('zod');

const familyHistorySchema = z
  .object({
    diabetes: z.boolean().default(false),
    hypertension: z.boolean().default(false),
    cardiovascular: z.boolean().default(false),
    obesity: z.boolean().default(false),
  })
  .default({});

const riskAssessmentSchema = z.object({
  age: z.number().int().min(1, 'Age is required').max(120),
  gender: z.enum(['male', 'female', 'other']),
  smoker: z.boolean().default(false),
  familyHistory: familyHistorySchema,
});

const bookAppointmentSchema = z.object({
  type: z.enum(['in_person', 'telemedicine', 'follow_up']).default('telemedicine'),
  scheduledAt: z.coerce.date().refine((d) => d.getTime() > Date.now(), 'Appointment must be scheduled in the future'),
  durationMinutes: z.number().int().min(10).max(120).default(30),
  doctorSpecialty: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

module.exports = { riskAssessmentSchema, bookAppointmentSchema };
