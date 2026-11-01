import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/errors';

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ code: 1004, message: '资源不存在', data: null });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    res.status(err.status).json({ code: err.code, message: err.message, data: null });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({ code: 1001, message: '参数校验失败', data: null });
    return;
  }

  console.error('[error]', err);
  res.status(500).json({ code: 5000, message: '服务器内部错误', data: null });
};
