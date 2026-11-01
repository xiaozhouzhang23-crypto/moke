import { http, request } from './client';
import type { AuthResult, Category, User } from '../types';

export const authApi = {
  register: (payload: { username: string; email: string; password: string }) =>
    request<AuthResult>(http.post('/auth/register', payload)),
  login: (payload: { account: string; password: string }) =>
    request<AuthResult>(http.post('/auth/login', payload)),
  me: () => request<User>(http.get('/auth/me')),
  updateProfile: (payload: { avatarUrl: string | null; bio: string | null }) =>
    request<User>(http.put('/users/me', payload)),
};

export const categoryApi = {
  list: () => request<Category[]>(http.get('/categories')),
};
