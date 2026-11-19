const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(
  /\/$/,
  "",
);

export class ApiError extends Error {
  constructor(message, { status, data, cause } = {}) {
    super(message, { cause });
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.code = cause ? "INVALID_JSON" : "HTTP_ERROR";
    this.notRegistered = Boolean(data?.notRegistered);
  }
}

async function parseResponse(response) {
  if (response.status === 204) return null;

  const responseText = await response.text();
  try {
    return responseText ? JSON.parse(responseText) : null;
  } catch (cause) {
    const contentType =
      response.headers.get("content-type") || "unknown content type";
    const preview = responseText.replace(/\s+/g, " ").trim().slice(0, 180);
    throw new ApiError(
      `The server returned an invalid JSON response (HTTP ${response.status}, ${contentType}).`,
      {
        status: response.status,
        data: {
          contentType,
          responsePreview: preview,
        },
        cause,
      },
    );
  }
}

function formatErrorDetails(details) {
  if (!details || typeof details !== "object") return "";
  return Object.entries(details)
    .flatMap(([field, messages]) =>
      (Array.isArray(messages) ? messages : [messages]).map(
        (message) => `${field}: ${message}`,
      ),
    )
    .join("; ");
}

export function buildApiUrl(path) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiRequest(path, options = {}) {
  const { body, headers = {}, ...fetchOptions } = options;
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  const requestHeaders = new Headers(headers);
  let requestBody = body;

  if (
    body !== undefined &&
    body !== null &&
    !isFormData &&
    typeof body !== "string"
  ) {
    if (!requestHeaders.has("Content-Type"))
      requestHeaders.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(buildApiUrl(path), {
    ...fetchOptions,
    headers: requestHeaders,
    body: requestBody,
  });
  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
      [data?.error || data?.message, formatErrorDetails(data?.details)]
        .filter(Boolean)
        .join(" ") || `Request failed (HTTP ${response.status}).`;
    throw new ApiError(message, { status: response.status, data });
  }
  return data;
}

export const apiGet = (path, options) =>
  apiRequest(path, { ...options, method: "GET" });
export const apiPost = (path, body, options) =>
  apiRequest(path, { ...options, method: "POST", body });
export const apiPut = (path, body, options) =>
  apiRequest(path, { ...options, method: "PUT", body });
export const apiDelete = (path, options) =>
  apiRequest(path, { ...options, method: "DELETE" });
