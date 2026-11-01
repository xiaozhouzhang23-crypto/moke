import bcrypt from 'bcryptjs';
import { db } from '../config/db';
import { ApiError } from '../utils/errors';
import { signToken } from '../utils/jwt';
import type { PublicUser } from '../types';
import { nowIso, toIso } from '../utils/format';

interface UserRow {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    createdAt: toIso(row.created_at),
  };
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Error && /UNIQUE constraint failed/i.test(error.message);
}

export async function registerUser(input: {
  username: string;
  email: string;
  password: string;
}): Promise<{ token: string; user: PublicUser }> {
  const usernameTaken = db
    .prepare('SELECT id FROM users WHERE username = ? LIMIT 1')
    .get(input.username);
  if (usernameTaken) {
    throw ApiError.conflict('用户名已被占用');
  }

  const email = input.email.toLowerCase();
  const emailTaken = db
    .prepare('SELECT id FROM users WHERE email = ? LIMIT 1')
    .get(email);
  if (emailTaken) {
    throw ApiError.conflict('邮箱已被注册');
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const now = nowIso();

  try {
    const result = db
      .prepare(
        `INSERT INTO users (username, email, password_hash, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(input.username, email, passwordHash, now, now);

    const user: PublicUser = {
      id: Number(result.lastInsertRowid),
      username: input.username,
      email,
      avatarUrl: null,
      bio: null,
      createdAt: now,
    };

    return { token: signToken({ userId: user.id, username: user.username }), user };
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw ApiError.conflict('用户名或邮箱已被使用');
    }
    throw error;
  }
}

export async function loginUser(input: {
  account: string;
  password: string;
}): Promise<{ token: string; user: PublicUser }> {
  const row = db
    .prepare('SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1')
    .get(input.account.toLowerCase(), input.account) as UserRow | undefined;

  if (!row) {
    throw ApiError.unauthorized('邮箱或密码错误');
  }

  const matches = await bcrypt.compare(input.password, row.password_hash);
  if (!matches) {
    throw ApiError.unauthorized('邮箱或密码错误');
  }

  return { token: signToken({ userId: row.id, username: row.username }), user: toPublicUser(row) };
}
