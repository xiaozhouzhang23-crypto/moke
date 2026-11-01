export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  articleCount?: number;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  articleCount: number;
}

export interface ArticleListItem {
  id: number;
  title: string;
  summary: string;
  coverUrl: string | null;
  category: { id: number; name: string };
  tags: Tag[];
  author: { id: number; username: string; avatarUrl: string | null };
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleDetail extends ArticleListItem {
  content: string;
}

export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ArticleListResult {
  list: ArticleListItem[];
  pagination: Pagination;
}

export interface AuthResult {
  token: string;
  user: User;
}

export interface ArticlePayload {
  title: string;
  content: string;
  categoryId: number;
  tags: string[];
  coverUrl: string | null;
}

export interface ArticleListParams {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  authorId?: number;
  keyword?: string;
}
