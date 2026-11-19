/**
 * Read a fetch response as JSON and preserve useful context when a provider
 * returns malformed content.
 * @param {Response} response Fetch response.
 * @param {string} serviceName Name used in the resulting error message.
 * @returns {Promise<unknown|null>} Parsed JSON, or null for an empty body.
 */
async function readJsonResponse(response, serviceName = "External service") {
  const responseText = await response.text();
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

module.exports = { readJsonResponse };
