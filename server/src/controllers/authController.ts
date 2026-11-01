import type { Request, Response } from 'express';
import * as authService from '../services/authService';
import { getMe } from '../services/userService';
import { success } from '../utils/http';
import type { AuthRequest } from '../types';

export async function register(req: Request, res: Response) {
  const result = await authService.registerUser(req.body);
  success(res, result, 201);
}

export async function login(req: Request, res: Response) {
  const result = await authService.loginUser(req.body);
  success(res, result);
}

export async function me(req: Request, res: Response) {
  const { userId } = (req as AuthRequest).user;
  const user = await getMe(userId);
  success(res, user);
}
