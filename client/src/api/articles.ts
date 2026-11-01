import { http, request } from './client';
import type { ArticleDetail, ArticleListParams, ArticleListResult, ArticlePayload } from '../types';

export const articleApi = {
  list: (params: ArticleListParams) =>
    request<ArticleListResult>(http.get('/articles', { params })),
  detail: (id: number | string, countView = true) =>
    request<ArticleDetail>(
      http.get(`/articles/${id}`, countView ? undefined : { params: { countView: 'false' } }),
    ),
  create: (payload: ArticlePayload) => request<ArticleDetail>(http.post('/articles', payload)),
  update: (id: number | string, payload: ArticlePayload) =>
    request<ArticleDetail>(http.put(`/articles/${id}`, payload)),
  remove: (id: number | string) => request<null>(http.delete(`/articles/${id}`)),
};
