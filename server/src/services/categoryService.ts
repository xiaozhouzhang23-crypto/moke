import { db } from '../config/db';

interface CategoryRow {
  id: number;
  name: string;
  article_count: number;
}

export async function listCategories() {
  const rows = db
    .prepare(
      `SELECT c.id, c.name,
              (SELECT COUNT(*) FROM articles a WHERE a.category_id = c.id) AS article_count
         FROM categories c
        ORDER BY c.id ASC`,
    )
    .all() as unknown as CategoryRow[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    articleCount: Number(row.article_count),
  }));
}
