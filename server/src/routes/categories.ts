import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';
import { asyncHandler } from '../utils/http';

export const categoryRouter = Router();

categoryRouter.get('/', asyncHandler(categoryController.getCategories));
