const { z } = require('zod');

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().min(6).max(20).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

const updatePreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

module.exports = { updateProfileSchema, changePasswordSchema, updatePreferencesSchema };
