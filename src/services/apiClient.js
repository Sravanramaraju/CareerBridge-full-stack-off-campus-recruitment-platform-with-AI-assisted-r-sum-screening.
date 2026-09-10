const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
const CSRF_COOKIE_NAME = import.meta.env.VITE_CSRF_COOKIE_NAME || 'careerbridge_csrf';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'API_ERROR', fields, requestId, cause } = {}) {
    super(message, { cause });
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
    this.requestId = requestId;
  }
}

function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const prefix = `${encodeURIComponent(name)}=`;
  const cookie = document.cookie.split('; ').find((entry) => entry.startsWith(prefix));
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

function requestBody(body, headers) {
  if (body === undefined || body === null || body instanceof FormData) return body;
  headers.set('content-type', 'application/json');
  return JSON.stringify(body);
}

async function parseResponse(response) {
  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (!response.ok) throw new ApiError('The server returned an unexpected response.', {
      status: response.status,
      code: 'INVALID_RESPONSE',
    });
    return null;
  }
  const payload = await response.json();
  if (!response.ok) {
    const error = payload?.error || {};
    throw new ApiError(error.message || 'The request could not be completed.', {
      status: response.status,
      code: error.code,
      fields: error.fields,
      requestId: error.requestId,
    });
  }
  return payload?.data;
}

export async function apiRequest(path, {
  method = 'GET',
  body,
  headers: customHeaders,
  signal,
} = {}) {
  const normalizedMethod = method.toUpperCase();
  const headers = new Headers(customHeaders);
  headers.set('accept', 'application/json');
  if (!SAFE_METHODS.has(normalizedMethod)) {
    const csrfToken = readCookie(CSRF_COOKIE_NAME);
    if (csrfToken) headers.set('x-csrf-token', csrfToken);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
      method: normalizedMethod,
      credentials: 'include',
      headers,
      body: requestBody(body, headers),
      signal,
    });
    return await parseResponse(response);
  } catch (error) {
    if (error instanceof ApiError || error?.name === 'AbortError') throw error;
    throw new ApiError('Unable to reach CareerBridge. Check your connection and try again.', {
      code: 'NETWORK_ERROR',
      cause: error,
    });
  }
}

export const apiClient = Object.freeze({
  get: (path, options) => apiRequest(path, { ...options, method: 'GET' }),
  post: (path, body, options) => apiRequest(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => apiRequest(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => apiRequest(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => apiRequest(path, { ...options, method: 'DELETE' }),
});
