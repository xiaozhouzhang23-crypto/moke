import { Link } from 'react-router-dom';
import type { ArticleListItem } from '../types';
import { formatDay } from '../utils/format';

export function ArticleCard({ article }: { article: ArticleListItem }) {
  return (
    <Link
      to={`/articles/${article.id}`}
      className="card group flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:border-accent/30"
    >
      {article.coverUrl ? (
        <img
          src={article.coverUrl}
          alt={article.title}
          loading="lazy"
          className="h-44 w-full object-cover"
        />
      ) : (
        <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-[#e3f2fb] via-[#f0f7fd] to-[#d7ebf8]">
          <span className="font-serif text-2xl text-ink/30">{article.category.name}</span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted">
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-accent">
            {article.category.name}
          </span>
          <span>{formatDay(article.createdAt)}</span>
        </div>

        <h3 className="mb-2 font-serif text-lg font-semibold leading-snug text-ink transition group-hover:text-accent">
          {article.title}
        </h3>
        <p className="line-clamp-2 flex-1 text-sm leading-6 text-muted">{article.summary}</p>

        <div className="mt-4 flex items-center justify-between text-xs text-muted">
          <span>{article.author.username}</span>
          <span>{article.viewCount} 次浏览</span>
        </div>
      </div>
    </Link>
  );
}
