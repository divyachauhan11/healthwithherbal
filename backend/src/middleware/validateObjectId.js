const mongoose = require("mongoose");

/**
 * Validates one or more route parameters as MongoDB ObjectIds.
 * @param {string|string[]} params Route parameter name(s).
 * @param {{ statusCode?: number, message: string }} options Existing invalid-ID response.
 * @returns {Function} Express middleware.
 */
function validateObjectId(params, { statusCode = 400, message }) {
  const names = Array.isArray(params) ? params : [params];
  return function validateObjectIdParams(req, res, next) {
    if (names.some((name) => !mongoose.isValidObjectId(req.params[name]))) {
      return res.status(statusCode).json({ error: message });
    }
    return next();
  };
}

module.exports = { validateObjectId };
