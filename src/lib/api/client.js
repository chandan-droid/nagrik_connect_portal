import { getAuthToken } from "@/lib/api/session";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://nagrik-server-j91r.onrender.com") + "/api/v1";

function buildHeaders(extraHeaders = {}, isMultipart = false) {
  const token = getAuthToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  return {
    ...(isMultipart ? {} : { "Content-Type": "application/json" }),
    ...authHeader,
    ...extraHeaders,
  };
}

async function parseResponse(response) {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const isOk = response.ok && payload?.success !== false;
  if (!isOk) {
    const message = payload?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = payload?.data;
    throw error;
  }

  return payload;
}

export async function apiRequest(path, options = {}) {
  const method = options.method || "GET";
  const isMultipart = options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(options.headers, isMultipart),
    body: options.body,
  });

  return parseResponse(response);
}

export function withQuery(path, query = {}) {
  const search = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, String(value));
    }
  });

  const queryString = search.toString();
  return queryString ? `${path}?${queryString}` : path;
}
