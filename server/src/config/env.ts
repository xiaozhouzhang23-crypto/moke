import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const defaultDbFile = path.join(__dirname, '../../data/blog.db');

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-secret-please-change-in-production',
  jwtExpiresIn: '7d',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  dbFile: process.env.DB_FILE ? path.resolve(process.env.DB_FILE) : defaultDbFile,
};
