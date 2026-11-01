import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { env } from './env';

fs.mkdirSync(path.dirname(env.dbFile), { recursive: true });

export const db = new DatabaseSync(env.dbFile);

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA busy_timeout = 5000;');

const schemaPath = path.join(__dirname, '../../sql/schema.sql');
db.exec(fs.readFileSync(schemaPath, 'utf8'));
