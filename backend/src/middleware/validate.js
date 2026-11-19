/**
 * Validates a request source with a Zod schema and stores the parsed value.
 * @param {import("zod").ZodType} schema Schema used to parse the request.
 * @param {{ source?: "body" | "query" | "params", onInvalid?: Function }} [options] Validation options.
 * @returns {Function} Express middleware.
 */
function validate(schema, { source = "body", onInvalid } = {}) {
  return function validateRequest(req, res, next) {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
      if (onInvalid) return onInvalid(res, parsed);
      return res.status(400).json({
        error: "Please check the submitted fields.",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    if (source === "body") {
      req.validatedBody = parsed.data;
    } else {
      req.validated = req.validated || {};
      req.validated[source] = parsed.data;
    }
    return next();
  };
}

module.exports = { validate };
