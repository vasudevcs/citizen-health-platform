// Wraps a zod schema and validates req.body, attaching parsed+typed data
// back onto req.body. Returns 422 with field-level errors on failure.
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return res.status(422).json({ success: false, errors });
    }
    req.body = result.data;
    next();
  };
}

module.exports = validate;
