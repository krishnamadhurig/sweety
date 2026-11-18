const BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'sweety_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}


async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Is it running?');
  }

  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(data.error || 'Something went wrong.');
    err.errors = data.errors || {};
    err.status = response.status;
    throw err;
  }
  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  me: () => request('/auth/me'),
  listReadings: (date) => request(`/readings?date=${date}&limit=100`),
  addReading: (body) => request('/readings', { method: 'POST', body }),
  updateReading: (id, body) => request(`/readings/${id}`, { method: 'PUT', body }),
  deleteReading: (id) => request(`/readings/${id}`, { method: 'DELETE' }),
  report: (type, date) => request(`/reports/${type}?date=${date}`),
};