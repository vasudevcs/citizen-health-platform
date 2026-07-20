const { z } = require('zod');

// Base64 file payloads, not multipart — see citizenController.createLabReport
// for why (no multer dependency available to add in this environment).
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB

const fileUploadSchema = z
  .object({
    fileName: z.string().trim().min(1).max(255),
    fileType: z.enum(ALLOWED_MIME_TYPES, {
      errorMap: () => ({ message: 'File must be a PDF, JPEG, PNG, or WebP' }),
    }),
    // Raw base64 (no "data:...;base64," prefix — stripped client-side).
    fileData: z.string().min(1),
  })
  .refine(
    (file) => {
      // Base64 expands ~4/3x — approximate decoded size without actually
      // decoding, to reject oversized payloads before doing any disk I/O.
      const approxBytes = Math.ceil((file.fileData.length * 3) / 4);
      return approxBytes <= MAX_FILE_BYTES;
    },
    { message: 'File must be 8MB or smaller' }
  );

const createLabReportSchema = z.object({
  title: z.string().trim().min(1).max(150),
  lab: z.string().trim().max(150).optional(),
  conductedAt: z.coerce.date(),
  notes: z.string().trim().max(1000).optional(),
  isSharedWithDoctor: z.boolean().default(false),
  file: fileUploadSchema.optional(),
});

module.exports = { createLabReportSchema, ALLOWED_MIME_TYPES, MAX_FILE_BYTES };
