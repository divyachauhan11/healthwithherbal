const { AppError } = require("../utils/appError");

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  if (error.name === "ZodError") {
    return res.status(400).json({
      error: "Please check the submitted fields.",
      details: error.flatten().fieldErrors,
    });
  }

  if (error.code === 11000) {
    if (
      error.keyPattern?.email ||
      error.keyValue?.email ||
      /\bemail(?:_1|_role_unique)\b/i.test(error.message || "")
    ) {
      return res.status(409).json({
        error: "An account already uses this email address and role.",
      });
    }
    return res.status(409).json({
      error: "A record with this name, code, slug, or SKU already exists.",
    });
  }

  const isClientError =
    error.name === "ValidationError" || error.name === "CastError";
  const status = error.status || (isClientError ? 400 : 500);
  const isAdminLogin =
    req.method === "POST" &&
    String(req.originalUrl || "").split("?")[0] === "/api/admin/auth/login";
  const canShowAdminLoginError =
    isAdminLogin && require("../config").nodeEnv !== "production" && status >= 500;
  const safeDiagnostic = String(error.message || "")
    .replace(/(mongodb(?:\+srv)?:\/\/)[^@\s]+@/gi, "$1[redacted]@");
  const message = status >= 500
    ? canShowAdminLoginError && safeDiagnostic
      ? `Admin sign-in failed (${error.name}): ${safeDiagnostic}`
      : "An unexpected server error occurred."
    : error.message;
  if (status >= 500) console.error(error);

  res.status(status).json({ error: message });
}

module.exports = { errorHandler };
