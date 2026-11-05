function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error.code === 11000) return res.status(409).json({ error: "A record with this name, code, slug, or SKU already exists." });

  const status = error.status || (error.name === "ValidationError" || error.name === "CastError" ? 400 : 500);
  const message = status >= 500 ? "An unexpected server error occurred." : error.message;
  if (status >= 500) console.error(error);

  res.status(status).json({ error: message });
}

module.exports = { errorHandler };
