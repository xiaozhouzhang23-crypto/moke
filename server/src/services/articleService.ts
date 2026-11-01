import { db } from '../config/db';
import { ApiError } from '../utils/errors';
import { buildSummary } from '../utils/summary';
import { nowIso, toIso } from '../utils/format';
import type { ArticleDetail, ArticleListResult, TagItem } from '../types';

interface ArticleRow {
  id: number;
  title: string;
  summary: string;
  content: string;
  cover_url: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  author_id: number;
  author_username: string;
  author_avatar_url: string | null;
  category_id: number;
  category_name: string;
}

interface TagRow {
  article_id: number;
  id: number;
  name: string;
}

interface OwnerRow {
  user_id: number;
}

const ARTICLE_SELECT = `
  SELECT a.id, a.title, a.summary, a.content, a.cover_url, a.view_count, a.created_at, a.updated_at,
         u.id AS author_id, u.username AS author_username, u.avatar_url AS author_avatar_url,
         c.id AS category_id, c.name AS category_name
    FROM articles a
    JOIN users u ON u.id = a.user_id
    JOIN categories c ON c.id = a.category_id
`;

function mapArticle(row: ArticleRow, tags: TagItem[], withContent: boolean) {
  const base = {
    id: row.id,
    title: row.title,
    summary: row.summary,
    coverUrl: row.cover_url,
    category: { id: row.category_id, name: row.category_name },
    tags,
    author: {
      id: row.author_id,
      username: row.author_username,
      avatarUrl: row.author_avatar_url,
    },
    viewCount: Number(row.view_count),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };

  return withContent ? { ...base, content: row.content } : base;
}

function fetchTagsByArticleIds(ids: number[]): Map<number, TagItem[]> {
  const map = new Map<number, TagItem[]>();
  if (ids.length === 0) return map;

  const rows = db
    .prepare(
      `SELECT at.article_id, t.id, t.name
         FROM article_tags at
         JOIN tags t ON t.id = at.tag_id
        WHERE at.article_id IN (${ids.map(() => '?').join(',')})
        ORDER BY t.id ASC`,
    )
    .all(...ids) as unknown as TagRow[];

  for (const row of rows) {
    const list = map.get(row.article_id) ?? [];
    list.push({ id: row.id, name: row.name });
    map.set(row.article_id, list);
  }
  return map;
}

export interface ArticleListQuery {
  page: number;
  pageSize: number;
  categoryId?: number;
  authorId?: number;
  keyword?: string;
}

export async function listArticles(query: ArticleListQuery): Promise<ArticleListResult> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (query.categoryId) {
    conditions.push('a.category_id = ?');
    params.push(query.categoryId);
  }
  if (query.authorId) {
    conditions.push('a.user_id = ?');
    params.push(query.authorId);
  }
  if (query.keyword) {
    conditions.push('(a.title LIKE ? OR a.content LIKE ?)');
    const like = `%${query.keyword}%`;
    params.push(like, like);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const { page, pageSize } = query;
  const offset = (page - 1) * pageSize;

  const countRow = db
    .prepare(`SELECT COUNT(*) AS total FROM articles a ${where}`)
    .get(...params) as { total: number } | undefined;
  const total = Number(countRow?.total ?? 0);

  const rows = db
    .prepare(
      `${ARTICLE_SELECT} ${where}
        ORDER BY a.created_at DESC, a.id DESC
        LIMIT ${pageSize} OFFSET ${offset}`,
    )
    .all(...params) as unknown as ArticleRow[];

  const tagMap = fetchTagsByArticleIds(rows.map((row) => row.id));

  return {
    list: rows.map((row) => mapArticle(row, tagMap.get(row.id) ?? [], false)),
    pagination: {
      total,
      page,
      pageSize,
      totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
    },
  };
}

export async function getArticleDetail(id: number, incrementView = true): Promise<ArticleDetail> {
  if (incrementView) {
    db.prepare('UPDATE articles SET view_count = view_count + 1 WHERE id = ?').run(id);
  }

  const row = db.prepare(`${ARTICLE_SELECT} WHERE a.id = ?`).get(id) as ArticleRow | undefined;
  if (!row) {
    throw ApiError.notFound('文章不存在');
  }

  const tagMap = fetchTagsByArticleIds([row.id]);
  return mapArticle(row, tagMap.get(row.id) ?? [], true) as ArticleDetail;
}

function assertCategoryExists(categoryId: number) {
  const row = db.prepare('SELECT id FROM categories WHERE id = ? LIMIT 1').get(categoryId);
  if (!row) {
    throw ApiError.badRequest('分类不存在');
  }
}

function resolveTagId(name: string, now: string): number {
  db.prepare('INSERT OR IGNORE INTO tags (name, created_at) VALUES (?, ?)').run(name, now);
  const row = db.prepare('SELECT id FROM tags WHERE name = ? LIMIT 1').get(name) as
    | { id: number }
    | undefined;
  return Number(row?.id);
}

function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of tags) {
    const name = raw.trim();
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }
  return result;
}

function replaceArticleTags(articleId: number, tags: string[]) {
  db.prepare('DELETE FROM article_tags WHERE article_id = ?').run(articleId);

  const now = nowIso();
  for (const name of normalizeTags(tags)) {
    const tagId = resolveTagId(name, now);
    db.prepare('INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)').run(
      articleId,
      tagId,
    );
  }
}

function inTransaction<T>(fn: () => T): T {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export interface ArticleInput {
  title: string;
  content: string;
  categoryId: number;
  tags: string[];
  coverUrl: string | null;
}

export async function createArticle(userId: number, input: ArticleInput): Promise<ArticleDetail> {
  assertCategoryExists(input.categoryId);

  const now = nowIso();
  const articleId = inTransaction(() => {
    const result = db
      .prepare(
        `INSERT INTO articles (user_id, category_id, title, content, summary, cover_url, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        userId,
        input.categoryId,
        input.title,
        input.content,
        buildSummary(input.content),
        input.coverUrl,
        now,
        now,
      );

    const id = Number(result.lastInsertRowid);
    replaceArticleTags(id, input.tags);
    return id;
  });

  return getArticleDetail(articleId, false);
}

function assertArticleOwner(articleId: number, userId: number): void {
  const row = db
    .prepare('SELECT user_id FROM articles WHERE id = ? LIMIT 1')
    .get(articleId) as OwnerRow | undefined;

  if (!row) {
    throw ApiError.notFound('文章不存在');
  }
  if (row.user_id !== userId) {
    throw ApiError.forbidden('只能操作自己的文章');
  }
}

export async function updateArticle(
  articleId: number,
  userId: number,
  input: ArticleInput,
): Promise<ArticleDetail> {
  assertArticleOwner(articleId, userId);
  assertCategoryExists(input.categoryId);

  inTransaction(() => {
    db.prepare(
      `UPDATE articles
          SET title = ?, content = ?, summary = ?, category_id = ?, cover_url = ?, updated_at = ?
        WHERE id = ?`,
    ).run(
      input.title,
      input.content,
      buildSummary(input.content),
      input.categoryId,
      input.coverUrl,
      nowIso(),
      articleId,
    );

    replaceArticleTags(articleId, input.tags);
  });

  return getArticleDetail(articleId, false);
}

export async function deleteArticle(articleId: number, userId: number): Promise<void> {
  assertArticleOwner(articleId, userId);
  db.prepare('DELETE FROM articles WHERE id = ?').run(articleId);
}
