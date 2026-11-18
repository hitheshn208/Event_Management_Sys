export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

/**
 * Small fetch wrapper for the Express API.
 * - Sends cookies (auth token is an httpOnly cookie).
 * - Plain objects are sent as JSON; FormData is sent as-is (multipart).
 * - Throws ApiError with the server's `message` on non-2xx responses.
 */
export async function api(path, { method = "GET", body, signal } = {}) {
  const options = { method, credentials: "include", signal, headers: {} };

  if (body instanceof FormData) {
    options.body = body;
  } else if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`/api${path}`, options);
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError("Network error. Please check your connection and try again.", 0);
  }

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new ApiError(data.message || `Request failed (${response.status})`, response.status, data);
  }

  return data;
}
