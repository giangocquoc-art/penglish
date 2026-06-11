import axios from 'axios';

export const API_BASE = (import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:8080' : '')) as string;

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing = false;
let queue: Array<(token: string | null) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return Promise.reject(error);
      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push((token) => {
            if (!token) {
              reject(error);
              return;
            }
            original.headers = original.headers ?? {};
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }
      refreshing = true;
      try {
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
        const token = data?.data?.accessToken ?? data?.accessToken;
        if (token) {
          localStorage.setItem('accessToken', token);
          queue.forEach((fn) => fn(token));
          queue = [];
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }
      } catch {
        queue.forEach((fn) => fn(null));
        queue = [];
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        console.warn('[PooEnglish auth] Token refresh failed; continuing in guest mode.');
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export async function get<T>(path: string) {
  return api.get<T>(path).then((r) => r.data as T);
}

export async function post<T>(path: string, body?: unknown) {
  return api.post<T>(path, body).then((r) => r.data as T);
}

export async function patch<T>(path: string, body?: unknown) {
  return api.patch<T>(path, body).then((r) => r.data as T);
}

export async function put<T>(path: string, body?: unknown) {
  return api.put<T>(path, body).then((r) => r.data as T);
}

export async function del<T>(path: string, body?: unknown) {
  return api.delete<T>(path, { data: body }).then((r) => r.data as T);
}
