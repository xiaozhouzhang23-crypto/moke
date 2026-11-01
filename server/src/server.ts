import { app } from './app';
import { env } from './config/env';
import { db } from './config/db';

db.prepare('SELECT 1').get();
console.log(`SQLite ready: ${env.dbFile}`);

const server = app.listen(env.port, () => {
  console.log(`API server listening on http://localhost:${env.port}`);
});

const shutdown = () => {
  server.close();
  db.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
