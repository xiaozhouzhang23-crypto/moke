import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { articleApi } from '../api/articles';
import { getErrorMessage } from '../api/client';
import { MarkdownView } from '../components/MarkdownView';
import { PageLoading } from '../components/PageLoading';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate, initialOf } from '../utils/format';

export function ArticleDetail() {
  const { id } = useParams();
  const articleId = Number(id);
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const articleQuery = useQuery({
    queryKey: ['article', articleId],
    queryFn: () => articleApi.detail(articleId),
    enabled: Number.isInteger(articleId) && articleId > 0,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: () => articleApi.remove(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['my-articles'] });
      showToast('文章已删除');
      navigate('/');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const handleDelete = () => {
    if (window.confirm('确定删除这篇文章吗？删除后无法恢复。')) {
      deleteMutation.mutate();
    }
  };

  if (articleQuery.isLoading) {
    return <PageLoading label="正在打开文章…" />;
  }

  if (articleQuery.isError || !articleQuery.data) {
    return (
      <div className="container-page">
        <div className="card mx-auto max-w-xl p-10 text-center">
          <p className="font-serif text-2xl">文章不存在</p>
          <p className="mt-2 text-sm text-muted">{getErrorMessage(articleQuery.error)}</p>
          <Link to="/" className="btn-ghost btn-sm mt-6">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const article = articleQuery.data;
  const isAuthor = user?.id === article.author.id;

  return (
    <article className="container-page max-w-3xl">
      <Link to="/" className="text-sm text-muted transition hover:text-ink">
        ← 返回列表
      </Link>

      <header className="mt-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="rounded-full bg-accent/10 px-2.5 py-1 text-accent">
            {article.category.name}
          </span>
          <span>{formatDate(article.createdAt)}</span>
          <span>·</span>
          <span>{article.viewCount} 次浏览</span>
        </div>

        <h1 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">
          {article.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-6">
          <div className="flex items-center gap-3">
            {article.author.avatarUrl ? (
              <img
                src={article.author.avatarUrl}
                alt={article.author.username}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-sm font-medium text-accent">
                {initialOf(article.author.username)}
              </span>
            )}
            <div>
              <p className="text-sm font-medium">{article.author.username}</p>
              <p className="text-xs text-muted">作者</p>
            </div>
          </div>

          {isAuthor && (
            <div className="flex items-center gap-2">
              <Link to={`/articles/${article.id}/edit`} className="btn-ghost btn-sm">
                编辑
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="btn-danger btn-sm"
              >
                {deleteMutation.isPending ? '删除中…' : '删除'}
              </button>
            </div>
          )}
        </div>
      </header>

      {article.coverUrl && (
        <img
          src={article.coverUrl}
          alt={article.title}
          className="mt-8 w-full rounded-2xl object-cover"
        />
      )}

      <div className="mt-8">
        <MarkdownView content={article.content} />
      </div>

      {article.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-ink/10 pt-6">
          {article.tags.map((tag) => (
            <span key={tag.id} className="tag-pill">
              #{tag.name}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
