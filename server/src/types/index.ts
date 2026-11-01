import type { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: number; username: string };
      validatedQuery?: unknown;
    }
  }
}

export interface PublicUser {
  id: number;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  articleCount?: number;
}

export interface TagItem {
  id: number;
  name: string;
}

export interface ArticleListItem {
  id: number;
  title: string;
  summary: string;
  coverUrl: string | null;
  category: { id: number; name: string };
  tags: TagItem[];
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

export type AuthRequest = Request & { user: { userId: number; username: string } };
