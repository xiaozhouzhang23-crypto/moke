import axios, { type AxiosResponse } from 'axios';

const TOKEN_KEY = 'blog_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && tokenStore.get()) {
      tokenStore.clear();
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  },
);

interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

export class ApiClientError extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

export async function request<T>(promise: Promise<AxiosResponse<ApiEnvelope<T>>>): Promise<T> {
  const response = await promise;
  const body = response.data;
  if (body.code !== 0) {
    throw new ApiClientError(body.message, body.code);
  }
  return body.data;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (!error.response) return '网络异常，请稍后重试';
    return `请求失败（${error.response.status}）`;
  }
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error) return error.message;
  return '操作失败，请稍后重试';
}
