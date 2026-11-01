import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { apiRouter } from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export const app = express();

app.use(cors({ origin: env.clientOrigin }));
app.use(express.json({ limit: '2mb' }));

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
