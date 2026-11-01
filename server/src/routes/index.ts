import { Router } from 'express';
import { articleRouter } from './articles';
import { authRouter } from './auth';
import { categoryRouter } from './categories';
import { userRouter } from './users';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ code: 0, message: 'ok', data: { status: 'up' } });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/articles', articleRouter);
