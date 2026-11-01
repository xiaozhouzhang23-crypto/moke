import { Router } from 'express';
import * as userController from '../controllers/userController';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { updateProfileSchema } from '../schemas';
import { asyncHandler } from '../utils/http';

export const userRouter = Router();

userRouter.put('/me', requireAuth, validateBody(updateProfileSchema), asyncHandler(userController.updateMe));
