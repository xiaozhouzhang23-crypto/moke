import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { articleApi } from '../api/articles';
import { getErrorMessage } from '../api/client';
import { Pagination } from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDay, initialOf } from '../utils/format';

interface ProfileValues {
  avatarUrl: string;
  bio: string;
}

const MY_PAGE_SIZE = 8;

export function Profile() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { register, handleSubmit, reset, watch, formState } = useForm<ProfileValues>({
    defaultValues: { avatarUrl: '', bio: '' },
  });

  useEffect(() => {
    if (!user) return;
    reset({ avatarUrl: user.avatarUrl ?? '', bio: user.bio ?? '' });
  }, [user, reset]);

  const myArticlesQuery = useQuery({
    queryKey: ['my-articles', user?.id, page],
    queryFn: () =>
      articleApi.list({ page, pageSize: MY_PAGE_SIZE, authorId: user?.id }),
    enabled: Boolean(user),
  });

  const profileMutation = useMutation({
    mutationFn: (values: ProfileValues) =>
      authApi.updateProfile({
        avatarUrl: values.avatarUrl.trim() || null,
        bio: values.bio.trim() || null,
      }),
    onSuccess: (updated) => {
      setUser(updated);
      showToast('个人资料已更新');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (articleId: number) => articleApi.remove(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-articles'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      showToast('文章已删除');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  if (!user) return null;

  const avatarUrl = watch('avatarUrl');
  const totalFromList = myArticlesQuery.data?.pagination.total;
  const articleCount = totalFromList ?? user.articleCount ?? 0;

  const onSubmit = handleSubmit((values) => {
    if (values.bio.length > 200) {
      showToast('个人简介不能超过 200 个字符', 'error');
      return;
    }
    profileMutation.mutate(values);
  });

  const handleDelete = (articleId: number) => {
    if (window.confirm('确定删除这篇文章吗？删除后无法恢复。')) {
      deleteMutation.mutate(articleId);
    }
  };

  return (
    <div className="container-page max-w-4xl">
      <section className="card mb-8 overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-[#d9edf9] via-[#e9f5fc] to-[#cfe6f5]" />
        <div className="-mt-10 px-6 pb-6 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="h-20 w-20 rounded-2xl border-4 border-paper object-cover"
                />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-paper bg-accent/15 text-2xl font-medium text-accent">
                  {initialOf(user.username)}
                </span>
              )}
              <div className="pb-1">
                <h1 className="font-serif text-2xl font-semibold">{user.username}</h1>
                <p className="text-sm text-muted">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-6 pb-1 text-center">
              <div>
                <p className="font-serif text-xl">{articleCount}</p>
                <p className="text-xs text-muted">文章</p>
              </div>
              <div>
                <p className="font-serif text-xl">{formatDay(user.createdAt)}</p>
                <p className="text-xs text-muted">加入</p>
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            {user.bio || '还没有填写个人简介。'}
          </p>
        </div>
      </section>

      <section className="card mb-8 p-6 sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold">编辑资料</h2>
          <span className="text-xs text-muted">用户名与邮箱暂不支持修改</span>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="field-label" htmlFor="avatarUrl">
                头像 URL
              </label>
              <input
                id="avatarUrl"
                className="input"
                placeholder="https://example.com/avatar.jpg"
                {...register('avatarUrl')}
              />
            </div>
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt="头像预览"
                className="h-11 w-11 rounded-full border border-ink/10 object-cover"
                onError={(event) => {
                  event.currentTarget.style.visibility = 'hidden';
                }}
                onLoad={(event) => {
                  event.currentTarget.style.visibility = 'visible';
                }}
              />
            )}
          </div>

          <div>
            <label className="field-label" htmlFor="bio">
              个人简介（最多 200 字）
            </label>
            <textarea
              id="bio"
              className="input min-h-[96px] resize-y"
              placeholder="用一句话介绍自己"
              {...register('bio', {
                maxLength: { value: 200, message: '个人简介不能超过 200 个字符' },
              })}
            />
            {formState.errors.bio && (
              <p className="field-error">{formState.errors.bio.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={profileMutation.isPending}
              className="btn-primary"
            >
              {profileMutation.isPending ? '保存中…' : '保存资料'}
            </button>
          </div>
        </form>
      </section>

      <section className="card p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold">我的文章</h2>
          <Link to="/write" className="btn-primary btn-sm">
            写新文章
          </Link>
        </div>

        {myArticlesQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-xl bg-ink/5" />
            ))}
          </div>
        ) : myArticlesQuery.data && myArticlesQuery.data.list.length > 0 ? (
          <>
            <ul className="divide-y divide-ink/10">
              {myArticlesQuery.data.list.map((article) => (
                <li
                  key={article.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/articles/${article.id}`}
                      className="block truncate font-medium transition hover:text-accent"
                    >
                      {article.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                       {formatDay(article.createdAt)} · {article.category.name} ·{' '}
                      {article.viewCount} 次浏览
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/articles/${article.id}/edit`} className="btn-ghost btn-sm">
                      编辑
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(article.id)}
                      disabled={deleteMutation.isPending}
                      className="btn-danger btn-sm"
                    >
                      删除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {myArticlesQuery.data.pagination.totalPages > 1 && (
              <Pagination
                pagination={myArticlesQuery.data.pagination}
                onChange={setPage}
              />
            )}
          </>
        ) : (
          <div className="py-12 text-center text-sm text-muted">
            还没有发布文章，去写下第一篇吧。
          </div>
        )}
      </section>
    </div>
  );
}
