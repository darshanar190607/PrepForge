const TOKEN_KEY = 'prepforge_auth_token';

export const getAuthToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token: string | null): void => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

async function handleResponse(response: Response, isAuthRequest = false) {
  if (response.status === 401 && !isAuthRequest) {
    setAuthToken(null);
    window.location.reload();
    throw new Error('Session expired. Please log in again.');
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export const api = {
  get: async (path: string) => {
    const res = await fetch(path, { method: 'GET', headers: authHeaders() });
    return handleResponse(res);
  },
  post: async (path: string, body: any) => {
    const res = await fetch(path, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
    const isAuth = path.includes('/auth/');
    return handleResponse(res, isAuth);
  },
  patch: async (path: string, body?: any) => {
    const res = await fetch(path, { method: 'PATCH', headers: authHeaders(), body: body ? JSON.stringify(body) : undefined });
    return handleResponse(res);
  },
  delete: async (path: string) => {
    const res = await fetch(path, { method: 'DELETE', headers: authHeaders() });
    return handleResponse(res);
  },
};
