import type { Request, Response } from 'express';
import * as userService from '../services/userService';
import { success } from '../utils/http';
import type { AuthRequest } from '../types';

export async function updateMe(req: Request, res: Response) {
  const { userId } = (req as AuthRequest).user;
  const user = await userService.updateProfile(userId, req.body);
  success(res, user);
}
