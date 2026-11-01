import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { categoryApi } from '../api/auth';
import { articleApi } from '../api/articles';
import { getErrorMessage } from '../api/client';
import { MarkdownView } from '../components/MarkdownView';
import { PageLoading } from '../components/PageLoading';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { ArticlePayload } from '../types';

interface FormValues {
  title: string;
  content: string;
  categoryId: string;
  tags: string;
  coverUrl: string;
}

function splitTags(value: string): string[] {
  return value
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function Editor({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams();
  const articleId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showPreview, setShowPreview] = useState(false);

  const { register, handleSubmit, reset, watch, formState } = useForm<FormValues>({
    defaultValues: {
      title: '',
      content: '',
      categoryId: '',
      tags: '',
      coverUrl: '',
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.list,
  });

  const articleQuery = useQuery({
    queryKey: ['article-edit', articleId],
    queryFn: () => articleApi.detail(articleId, false),
    enabled: mode === 'edit' && Number.isInteger(articleId) && articleId > 0,
    retry: false,
  });

  useEffect(() => {
    if (!articleQuery.data) return;
    reset({
      title: articleQuery.data.title,
      content: articleQuery.data.content,
      categoryId: String(articleQuery.data.category.id),
      tags: articleQuery.data.tags.map((tag) => tag.name).join(', '),
      coverUrl: articleQuery.data.coverUrl ?? '',
    });
  }, [articleQuery.data, reset]);

  const saveMutation = useMutation({
    mutationFn: (payload: ArticlePayload) =>
      mode === 'edit' ? articleApi.update(articleId, payload) : articleApi.create(payload),
    onSuccess: (article) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['my-articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', article.id] });
      showToast(mode === 'edit' ? '文章已更新' : '文章已发布');
      navigate(`/articles/${article.id}`);
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const content = watch('content');

  const onSubmit = handleSubmit((values) => {
    const tags = splitTags(values.tags);
    if (tags.length > 5) {
      showToast('标签最多 5 个', 'error');
      return;
    }

    saveMutation.mutate({
      title: values.title.trim(),
      content: values.content,
      categoryId: Number(values.categoryId),
      tags,
      coverUrl: values.coverUrl.trim() || null,
    });
  });

  if (mode === 'edit' && articleQuery.isLoading) {
    return <PageLoading label="正在载入文章…" />;
  }

  if (mode === 'edit' && articleQuery.isError) {
    return (
      <div className="container-page max-w-xl">
        <div className="card p-10 text-center">
          <p className="font-serif text-xl">无法编辑这篇文章</p>
          <p className="mt-2 text-sm text-muted">{getErrorMessage(articleQuery.error)}</p>
          <Link to="/" className="btn-ghost btn-sm mt-6">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (mode === 'edit' && articleQuery.data && articleQuery.data.author.id !== user?.id) {
    return (
      <div className="container-page max-w-xl">
        <div className="card p-10 text-center">
          <p className="font-serif text-xl">只能编辑自己的文章</p>
          <Link to={`/articles/${articleId}`} className="btn-ghost btn-sm mt-6">
            返回文章
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page max-w-4xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            {mode === 'edit' ? 'Edit Article' : 'New Article'}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold">
            {mode === 'edit' ? '编辑文章' : '写一篇文章'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview((value) => !value)}
            className="btn-ghost btn-sm"
          >
            {showPreview ? '继续写作' : '预览效果'}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={saveMutation.isPending}
            className="btn-primary btn-sm"
          >
            {saveMutation.isPending ? '保存中…' : mode === 'edit' ? '保存修改' : '发布文章'}
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="card p-6 sm:p-8">
        <div className="mb-5">
          <label className="field-label" htmlFor="title">
            标题
          </label>
          <input
            id="title"
            className="input font-serif text-lg"
            placeholder="给文章起一个名字"
            {...register('title', {
              required: '请输入标题',
              maxLength: { value: 100, message: '标题不能超过 100 个字符' },
            })}
          />
          {formState.errors.title && (
            <p className="field-error">{formState.errors.title.message}</p>
          )}
        </div>

        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="categoryId">
              分类
            </label>
            <select
              id="categoryId"
              className="input"
              {...register('categoryId', { required: '请选择分类' })}
            >
              <option value="">请选择分类</option>
              {(categoriesQuery.data ?? []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {formState.errors.categoryId && (
              <p className="field-error">{formState.errors.categoryId.message}</p>
            )}
          </div>

          <div>
            <label className="field-label" htmlFor="tags">
              标签（逗号分隔，最多 5 个）
            </label>
            <input
              id="tags"
              className="input"
              placeholder="React, TypeScript"
              {...register('tags')}
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="field-label" htmlFor="coverUrl">
            封面图片 URL（可选）
          </label>
          <input
            id="coverUrl"
            className="input"
            placeholder="https://example.com/cover.jpg"
            {...register('coverUrl')}
          />
        </div>

        {showPreview ? (
          <div className="min-h-[420px] rounded-xl border border-ink/10 bg-white p-6">
            <MarkdownView content={content || '还没有内容。'} />
          </div>
        ) : (
          <>
            <label className="field-label" htmlFor="content">
              正文（Markdown）
            </label>
            <textarea
              id="content"
              className="input min-h-[420px] resize-y font-mono text-[13px] leading-7"
              placeholder={'# 标题\n\n正文支持 Markdown：**加粗**、`代码`、列表、表格……'}
              {...register('content', { required: '请输入正文' })}
            />
            {formState.errors.content && (
              <p className="field-error">{formState.errors.content.message}</p>
            )}
          </>
        )}
      </form>
    </div>
  );
}
