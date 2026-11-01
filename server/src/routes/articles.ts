import { Router } from 'express';
import * as articleController from '../controllers/articleController';
import { requireAuth } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import { articleListQuerySchema, articlePayloadSchema } from '../schemas';
import { asyncHandler } from '../utils/http';

export const articleRouter = Router();

articleRouter.get('/', validateQuery(articleListQuerySchema), asyncHandler(articleController.list));
articleRouter.get('/:id', asyncHandler(articleController.detail));

articleRouter.post(
  '/',
  requireAuth,
  validateBody(articlePayloadSchema),
  asyncHandler(articleController.create),
);
articleRouter.put(
  '/:id',
  requireAuth,
  validateBody(articlePayloadSchema),
  asyncHandler(articleController.update),
);
articleRouter.delete('/:id', requireAuth, asyncHandler(articleController.remove));
