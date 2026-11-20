/**
 * The one HTTP client for the Healthwithherbal API.
 *
 * Every frontend request goes through {@link apiRequest}. It owns:
 * - base URL composition (`NEXT_PUBLIC_API_URL`, defaulting to the `/api` proxy)
 * - query-string building (`query` option) and safe path building ({@link apiPath})
 * - JSON / FormData request bodies
 * - bearer-token injection (`auth: "customer" | "admin"` or an explicit `token`)
 * - request timeouts (`timeout`; reads default to {@link DEFAULT_TIMEOUT_MS})
 * - response parsing that reports malformed JSON instead of hiding it
 * - normalising every failure into an {@link ApiError}
 *
 * Domain modules (`lib/api.js` for the storefront, `lib/admin-api.js` for the
 * admin portal) are thin wrappers over this client; components never call
 * `fetch` or this module directly.
 */
import { getAdminSessionToken, getCustomerSessionToken } from "@/lib/session";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(
  /\/$/,
  "",
);

/**
 * Default time (ms) a read (GET/HEAD) may take before failing with `TIMEOUT`.
 * Writes (POST/PUT/PATCH/DELETE), including uploads, have no client timeout
 * by default: the server may still complete them, and aborting would invite a
 * retry that duplicates the write (e.g. a second order).
 */
export const DEFAULT_TIMEOUT_MS = 30000;

/** Machine-readable `ApiError#code` values. */
export const API_ERROR_CODES = Object.freeze({
  /** The server answered with a non-2xx status. */
  HTTP_ERROR: "HTTP_ERROR",
  /** The server answered, but the body was not valid JSON. */
  INVALID_JSON: "INVALID_JSON",
  /** The request never reached the server (offline, DNS, CORS, ...). */
  NETWORK_ERROR: "NETWORK_ERROR",
  /** The server did not answer within the timeout. */
  TIMEOUT: "TIMEOUT",
});

const NETWORK_ERROR_MESSAGE =
  "Unable to reach the server. Check your internet connection and try again.";
const TIMEOUT_ERROR_MESSAGE =
  "The server is taking too long to respond. Please try again.";

/**
 * Error thrown for every failed API call.
 * - `status`: HTTP status (undefined when the server was not reached)
 * - `data`: parsed error body, or diagnostic details for invalid JSON
 * - `code`: one of {@link API_ERROR_CODES}
 * - `notRegistered`: true when the auth API reports an unknown account
 */
export class ApiError extends Error {
  /**
   * @param {string} message Human-readable message, safe to show in the UI.
   * @param {{status?: number, data?: *, cause?: unknown, code?: string}} [details]
   */
  constructor(message, { status, data, cause, code } = {}) {
    super(message, { cause });
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.code =
      code || (cause ? API_ERROR_CODES.INVALID_JSON : API_ERROR_CODES.HTTP_ERROR);
    this.notRegistered = Boolean(data?.notRegistered);
  }
}

/**
 * @param {unknown} error
 * @returns {boolean} Whether `error` came from the API client.
 */
export function isApiError(error) {
  return error instanceof ApiError;
}

/**
 * Returns the message to show for a failed operation.
 * @param {unknown} error Error thrown by an API call (or anything else).
 * @param {string} fallback Message used when the error carries none.
 * @returns {string}
 */
export function getErrorMessage(error, fallback) {
  return (error && typeof error.message === "string" && error.message) || fallback;
}

/**
 * Builds a URL path whose interpolated values are URI-encoded, e.g.
 * apiPath`/blogs/${slug}/comments`.
 * @param {TemplateStringsArray} strings
 * @param {...unknown} values Path segments to encode.
 * @returns {string}
 */
export function apiPath(strings, ...values) {
  return strings.reduce(
    (path, part, index) =>
      path +
      part +
      (index < values.length ? encodeURIComponent(String(values[index])) : ""),
    "",
  );
}

/**
 * Serialises query parameters. `undefined`, `null` and empty-string values are
 * skipped; arrays become repeated keys; insertion order is preserved.
 * @param {Record<string, unknown>|URLSearchParams|string|undefined} query
 * @returns {string} The query string including the leading `?`, or "".
 */
export function buildQueryString(query) {
  if (!query) return "";
  let params;
  if (typeof query === "string" || query instanceof URLSearchParams) {
    params = new URLSearchParams(query);
  } else {
    params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      (Array.isArray(value) ? value : [value]).forEach((item) =>
        params.append(key, String(item)),
      );
    });
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

/**
 * @param {string} path API path relative to the base URL, e.g. "/products".
 * @param {Record<string, unknown>|URLSearchParams|string} [query]
 * @returns {string} Absolute (or proxy-relative) URL for the endpoint.
 */
export function buildApiUrl(path, query) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}${buildQueryString(query)}`;
}

function readStoredToken(auth) {
  if (typeof window === "undefined") return "";
  try {
    if (auth === "admin") return getAdminSessionToken() || "";
    if (auth === "customer") return getCustomerSessionToken() || "";
  } catch {
    // Storage can be unavailable (private mode, blocked cookies); the request
    // is sent without a token and the server answers 401 where required.
  }
  return "";
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

function toHttpError(response, data) {
  const message =
    [data?.error || data?.message, formatErrorDetails(data?.details)]
      .filter(Boolean)
      .join(" ") || `Request failed (HTTP ${response.status}).`;
  return new ApiError(message, { status: response.status, data });
}

function serializeBody(body, headers) {
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  if (body === undefined || body === null || isFormData || typeof body === "string") {
    return body;
  }
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return JSON.stringify(body);
}

/**
 * Sends a request to the API and resolves with the parsed JSON body.
 *
 * @param {string} path Endpoint path, e.g. "/products" (see {@link apiPath}).
 * @param {object} [options] Any `fetch` option plus:
 * @param {*} [options.body] Plain objects are sent as JSON; FormData and strings as-is.
 * @param {Record<string, unknown>|URLSearchParams|string} [options.query] Query parameters.
 * @param {"customer"|"admin"} [options.auth] Attach the stored session token.
 * @param {string} [options.token] Explicit bearer token (takes precedence over `auth`).
 * @param {number} [options.timeout] Milliseconds before failing with `TIMEOUT`; 0 disables.
 *   Defaults to {@link DEFAULT_TIMEOUT_MS} for GET/HEAD and to no timeout for writes.
 * @returns {Promise<*>} Parsed response body (`null` for empty responses).
 * @throws {ApiError} For HTTP errors, invalid JSON, network failures and timeouts.
 *   A request aborted through the caller's own `signal` rejects with the native AbortError.
 */
export async function apiRequest(path, options = {}) {
  const {
    body,
    headers = {},
    query,
    auth,
    token,
    timeout: requestedTimeout,
    signal,
    ...fetchOptions
  } = options;
  const method = String(fetchOptions.method || "GET").toUpperCase();
  const timeout =
    requestedTimeout ?? (method === "GET" || method === "HEAD" ? DEFAULT_TIMEOUT_MS : 0);

  const requestHeaders = new Headers(headers);
  const bearerToken = token || readStoredToken(auth);
  if (bearerToken && !requestHeaders.has("Authorization")) {
    requestHeaders.set("Authorization", `Bearer ${bearerToken}`);
  }
  const requestBody = serializeBody(body, requestHeaders);

  const controller = new AbortController();
  let timedOut = false;
  const timer =
    timeout > 0
      ? setTimeout(() => {
          timedOut = true;
          controller.abort();
        }, timeout)
      : null;
  const abortFromCaller = () => controller.abort(signal.reason);
  if (signal) {
    if (signal.aborted) controller.abort(signal.reason);
    else signal.addEventListener("abort", abortFromCaller, { once: true });
  }

  try {
    const response = await fetch(buildApiUrl(path, query), {
      ...fetchOptions,
      headers: requestHeaders,
      body: requestBody,
      signal: controller.signal,
    });
    const data = await parseResponse(response);
    if (!response.ok) throw toHttpError(response, data);
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (timedOut) {
      throw new ApiError(TIMEOUT_ERROR_MESSAGE, {
        code: API_ERROR_CODES.TIMEOUT,
        cause: error,
      });
    }
    if (signal?.aborted) throw error;
    throw new ApiError(NETWORK_ERROR_MESSAGE, {
      code: API_ERROR_CODES.NETWORK_ERROR,
      cause: error,
    });
  } finally {
    if (timer) clearTimeout(timer);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}

export const apiGet = (path, options) =>
  apiRequest(path, { ...options, method: "GET" });
export const apiPost = (path, body, options) =>
  apiRequest(path, { ...options, method: "POST", body });
export const apiPut = (path, body, options) =>
  apiRequest(path, { ...options, method: "PUT", body });
export const apiPatch = (path, body, options) =>
  apiRequest(path, { ...options, method: "PATCH", body });
export const apiDelete = (path, options) =>
  apiRequest(path, { ...options, method: "DELETE" });
