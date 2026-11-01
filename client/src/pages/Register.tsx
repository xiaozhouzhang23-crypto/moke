import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface RegisterValues {
  username: string;
  email: string;
  password: string;
}

export function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ defaultValues: { username: '', email: '', password: '' } });

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      login(data.token, data.user);
      navigate('/');
    },
  });

  const onSubmit = handleSubmit((values) => {
    mutation.mutate({
      username: values.username.trim(),
      email: values.email.trim(),
      password: values.password,
    });
  });

  return (
    <div className="container-page max-w-md">
      <div className="card p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-muted">Join Us</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">创建账号</h1>
        <p className="mt-2 text-sm text-muted">注册后即可开始发布文章。</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="field-label" htmlFor="username">
              用户名
            </label>
            <input
              id="username"
              className="input"
              placeholder="3-20 位字母、数字或下划线"
              {...register('username', {
                required: '请输入用户名',
                pattern: {
                  value: /^[A-Za-z0-9_]{3,20}$/,
                  message: '用户名需为 3-20 位字母、数字或下划线',
                },
              })}
            />
            {errors.username && <p className="field-error">{errors.username.message}</p>}
          </div>

          <div>
            <label className="field-label" htmlFor="email">
              邮箱
            </label>
            <input
              id="email"
              type="email"
              className="input"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email', {
                required: '请输入邮箱',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: '邮箱格式不正确',
                },
                maxLength: { value: 100, message: '邮箱不能超过 100 个字符' },
              })}
            />
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>

          <div>
            <label className="field-label" htmlFor="password">
              密码
            </label>
            <input
              id="password"
              type="password"
              className="input"
              autoComplete="new-password"
              placeholder="6-32 位，需包含字母和数字"
              {...register('password', {
                required: '请输入密码',
                pattern: {
                  value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_\-+=.]{6,32}$/,
                  message: '密码需 6-32 位且同时包含字母和数字',
                },
              })}
            />
            {errors.password && <p className="field-error">{errors.password.message}</p>}
          </div>

          {mutation.isError && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {getErrorMessage(mutation.error)}
            </p>
          )}

          <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">
            {mutation.isPending ? '注册中…' : '注册并登录'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          已有账号？
          <Link to="/login" className="ml-1 text-accent hover:underline">
            去登录
          </Link>
        </p>
      </div>
    </div>
  );
}
