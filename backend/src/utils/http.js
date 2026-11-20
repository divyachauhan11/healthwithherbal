/** Default time allowed for calls to third-party services (Brevo, Google, PayU). */
const DEFAULT_EXTERNAL_TIMEOUT_MS = 15000;

/**
 * Call a third-party HTTP API with a timeout, so a slow provider cannot hang
 * the request that depends on it. Network failures and timeouts are rethrown
 * as errors that name the service; HTTP error statuses are returned to the
 * caller unchanged (check `response.ok`).
 * @param {string|URL} url Request URL.
 * @param {RequestInit} [options] Fetch options.
 * @param {{serviceName?: string, timeoutMs?: number}} [settings]
 * @returns {Promise<Response>}
 */
async function fetchExternal(
  url,
  options = {},
  { serviceName = "External service", timeoutMs = DEFAULT_EXTERNAL_TIMEOUT_MS } = {},
) {
  try {
    return await fetch(url, { ...options, signal: options.signal || AbortSignal.timeout(timeoutMs) });
  } catch (cause) {
    const timedOut = cause?.name === "TimeoutError";
    const seconds = Math.max(1, Math.round(timeoutMs / 1000));
    const error = new Error(
      timedOut
        ? `${serviceName} did not respond within ${seconds} second${seconds === 1 ? "" : "s"}.`
        : `${serviceName} could not be reached.`,
      { cause },
    );
    error.status = timedOut ? 504 : 502;
    throw error;
  }
}

/**
 * Read a fetch response as JSON and preserve useful context when a provider
 * returns malformed content. A body that cannot be read (for example because
 * the {@link fetchExternal} timeout fires mid-response) is reported with the
 * service name instead of a bare abort error.
 * @param {Response} response Fetch response.
 * @param {string} serviceName Name used in the resulting error message.
 * @returns {Promise<unknown|null>} Parsed JSON, or null for an empty body.
 */
async function readJsonResponse(response, serviceName = "External service") {
  let responseText;
  try {
    responseText = await response.text();
  } catch (cause) {
    const timedOut = cause?.name === "TimeoutError" || cause?.name === "AbortError";
    const error = new Error(
      timedOut
        ? `${serviceName} took too long to send its response.`
        : `${serviceName} response could not be read.`,
      { cause },
    );
    error.status = timedOut ? 504 : 502;
    throw error;
  }
  if (!responseText) return null;

  try {
    return JSON.parse(responseText);
  } catch (cause) {
    const error = new Error(
      `${serviceName} returned invalid JSON (HTTP ${response.status}).`,
      { cause },
    );
    error.status = response.status;
    error.responsePreview = responseText.replace(/\s+/g, " ").trim().slice(0, 180);
    error.contentType = response.headers.get("content-type") || "unknown";
    throw error;
  }
}

module.exports = { DEFAULT_EXTERNAL_TIMEOUT_MS, fetchExternal, readJsonResponse };
