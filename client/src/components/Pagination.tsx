import type { Pagination as PaginationInfo } from '../types';

interface Props {
  pagination: PaginationInfo;
  onChange: (page: number) => void;
}

export function Pagination({ pagination, onChange }: Props) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (item) =>
      item === 1 ||
      item === totalPages ||
      Math.abs(item - page) <= 1,
  );

  return (
    <nav className="mt-10 flex items-center justify-center gap-2">
      <button
        type="button"
        className="btn-ghost btn-sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        上一页
      </button>

      {pages.map((item, index) => {
        const prev = pages[index - 1];
        const showGap = prev !== undefined && item - prev > 1;
        return (
          <span key={item} className="flex items-center gap-2">
            {showGap && <span className="text-xs text-muted">…</span>}
            <button
              type="button"
              onClick={() => onChange(item)}
              className={`h-8 min-w-8 rounded-lg px-2 text-sm transition ${
                item === page
                  ? 'bg-accent text-white'
                  : 'border border-ink/10 bg-white/70 text-muted hover:border-ink/30 hover:text-ink'
              }`}
            >
              {item}
            </button>
          </span>
        );
      })}

      <button
        type="button"
        className="btn-ghost btn-sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        下一页
      </button>
    </nav>
  );
}
