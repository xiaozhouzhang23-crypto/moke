import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { articleApi } from '../api/articles';
import { categoryApi } from '../api/auth';
import { ArticleCard } from '../components/ArticleCard';
import { Pagination } from '../components/Pagination';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { getErrorMessage } from '../api/client';

const PAGE_SIZE = 9;

export function Home() {
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [searchInput, setSearchInput] = useState('');
  const keyword = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    setPage(1);
  }, [keyword, categoryId]);

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.list,
  });

  const articlesQuery = useQuery({
    queryKey: ['articles', { page, categoryId, keyword }],
    queryFn: () =>
      articleApi.list({
        page,
        pageSize: PAGE_SIZE,
        categoryId,
        keyword: keyword.trim() || undefined,
      }),
  });

  return (
    <div className="container-page">
      <section className="mb-10">
        <p className="mb-3 text-xs uppercase tracking-[0.28em] text-muted">Writing &amp; Coding</p>
        <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">
          写点值得
          <span className="text-accent">留下</span>
          的东西。
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
          这里记录开发过程中的思考、踩过的坑和生活中的片刻。文章支持 Markdown，边写边看效果。
        </p>
      </section>

      <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCategoryId(undefined)}
            className={`rounded-lg px-4 py-1.5 text-sm transition ${
              categoryId === undefined
                ? 'bg-accent text-white'
                : 'border border-ink/10 bg-white/70 text-muted hover:text-ink'
            }`}
          >
            全部
          </button>
          {(categoriesQuery.data ?? []).map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategoryId(category.id)}
              className={`rounded-lg px-4 py-1.5 text-sm transition ${
                categoryId === category.id
                  ? 'bg-accent text-white'
                  : 'border border-ink/10 bg-white/70 text-muted hover:text-ink'
              }`}
            >
              {category.name}
              <span className="ml-1.5 text-[11px] opacity-60">{category.articleCount}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="搜索标题或内容…"
            className="input pr-10"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-ink"
            >
              清除
            </button>
          )}
        </div>
      </section>

      {articlesQuery.isError && (
        <div className="card mb-8 p-6 text-sm text-red-600">
          加载失败：{getErrorMessage(articlesQuery.error)}
        </div>
      )}

      {articlesQuery.isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="card h-80 animate-pulse bg-white/50" />
          ))}
        </div>
      ) : articlesQuery.data && articlesQuery.data.list.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articlesQuery.data.list.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <Pagination pagination={articlesQuery.data.pagination} onChange={setPage} />
        </>
      ) : (
        <div className="card flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
          <p className="font-serif text-xl text-ink">还没有匹配的文章</p>
          <p className="text-sm text-muted">
            {keyword || categoryId ? '试试更换关键词或分类' : '成为第一个写下故事的人'}
          </p>
        </div>
      )}
    </div>
  );
}
