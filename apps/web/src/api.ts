import axios from 'axios';

export const API_BASE = (import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:8080' : '')) as string;

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
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
