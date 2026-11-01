import type { Request, Response } from 'express';
import { listCategories } from '../services/categoryService';
import { success } from '../utils/http';

export async function getCategories(_req: Request, res: Response) {
  const categories = await listCategories();
  success(res, categories);
}
