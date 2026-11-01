import { db } from '../config/db';
import { ApiError } from '../utils/errors';
import { nowIso, toIso } from '../utils/format';
import type { PublicUser } from '../types';

interface UserWithCountRow {
  id: number;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  article_count: number;
}

export async function getMe(userId: number): Promise<PublicUser> {
  const row = db
    .prepare(
      `SELECT u.id, u.username, u.email, u.avatar_url, u.bio, u.created_at,
              (SELECT COUNT(*) FROM articles a WHERE a.user_id = u.id) AS article_count
         FROM users u
        WHERE u.id = ?`,
    )
    .get(userId) as UserWithCountRow | undefined;

  if (!row) {
    throw ApiError.unauthorized('用户不存在或登录已失效');
  }

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    createdAt: toIso(row.created_at),
    articleCount: Number(row.article_count),
  };
}

export async function updateProfile(
  userId: number,
  input: { avatarUrl: string | null; bio: string | null },
): Promise<PublicUser> {
  db.prepare('UPDATE users SET avatar_url = ?, bio = ?, updated_at = ? WHERE id = ?').run(
    input.avatarUrl,
    input.bio,
    nowIso(),
    userId,
  );

  return getMe(userId);
}
