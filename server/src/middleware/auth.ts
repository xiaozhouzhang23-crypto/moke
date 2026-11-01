import type { RequestHandler } from 'express';
import { ApiError } from '../utils/errors';
import { verifyToken } from '../utils/jwt';

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    next(ApiError.unauthorized());
    return;
  }

  try {
    const payload = verifyToken(header.slice('Bearer '.length));
    req.user = { userId: payload.userId, username: payload.username };
    next();
  } catch {
    next(ApiError.unauthorized());
  }
};
