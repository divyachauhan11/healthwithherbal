/**
 * Error carrying an HTTP status and an operational-error marker.
 */
class AppError extends Error {
  /**
   * @param {string} message Error message.
   * @param {number} [statusCode=500] HTTP status code for the error.
   * @param {{ isOperational?: boolean, cause?: Error }} [options] Error metadata.
   */
  constructor(message, statusCode = 500, options = {}) {
    super(message, options.cause ? { cause: options.cause } : undefined);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = options.isOperational ?? true;
  }
}

module.exports = { AppError };
