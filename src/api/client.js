const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

function buildUrl(path) {
  if (!API_BASE_URL) {
    throw new Error('Missing EXPO_PUBLIC_API_BASE_URL in .env');
  }

  const cleanBaseUrl = API_BASE_URL.replace(/\/+$/, '');
  let cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (cleanBaseUrl.endsWith('/api') && cleanPath.startsWith('/api/')) {
    cleanPath = cleanPath.replace(/^\/api/, '');
  }

  return `${cleanBaseUrl}${cleanPath}`;
}

async function parseResponse(response) {
  const rawText = await response.text();
  const data = rawText ? JSON.parse(rawText) : null;

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

async function apiRequest(path, options = {}) {
  try {
    const response = await fetch(buildUrl(path), {
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
      ...options,
    });

    return await parseResponse(response);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Backend returned an invalid JSON response');
    }

    throw new Error(error.message || 'Unable to reach backend');
  }
}

export function apiGet(path) {
  return apiRequest(path, { method: 'GET' });
}

export function apiPost(path, body) {
  return apiRequest(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
