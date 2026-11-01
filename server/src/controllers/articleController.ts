import type { Request, Response } from 'express';
import * as articleService from '../services/articleService';
import { ApiError } from '../utils/errors';
import { success } from '../utils/http';
import type { AuthRequest } from '../types';

function parseId(value: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw ApiError.badRequest('文章 ID 不合法');
  }
  return id;
}

export async function list(req: Request, res: Response) {
  const query = req.validatedQuery as articleService.ArticleListQuery;
  const result = await articleService.listArticles(query);
  success(res, result);
}

export async function detail(req: Request, res: Response) {
  const incrementView = req.query.countView !== 'false';
  const article = await articleService.getArticleDetail(parseId(req.params.id), incrementView);
  success(res, article);
}

export async function create(req: Request, res: Response) {
  const { userId } = (req as AuthRequest).user;
  const article = await articleService.createArticle(userId, req.body);
  success(res, article, 201);
}

export async function update(req: Request, res: Response) {
  const { userId } = (req as AuthRequest).user;
  const article = await articleService.updateArticle(parseId(req.params.id), userId, req.body);
  success(res, article);
}

export async function remove(req: Request, res: Response) {
  const { userId } = (req as AuthRequest).user;
  await articleService.deleteArticle(parseId(req.params.id), userId);
  success(res, null);
}
