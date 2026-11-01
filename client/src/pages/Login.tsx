import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/auth';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface LoginValues {
  account: string;
  password: string;
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ defaultValues: { account: '', password: '' } });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.token, data.user);
      const redirect = searchParams.get('redirect');
      navigate(redirect && redirect.startsWith('/') ? redirect : '/');
    },
  });

  const onSubmit = handleSubmit((values) => {
    mutation.mutate({ account: values.account.trim(), password: values.password });
  });

  return (
    <div className="container-page max-w-md">
      <div className="card p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-muted">Welcome Back</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">登录</h1>
        <p className="mt-2 text-sm text-muted">继续记录你的代码与生活。</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="field-label" htmlFor="account">
              邮箱或用户名
            </label>
            <input
              id="account"
              className="input"
              autoComplete="username"
              placeholder="you@example.com"
              {...register('account', { required: '请输入邮箱或用户名' })}
            />
            {errors.account && <p className="field-error">{errors.account.message}</p>}
          </div>

          <div>
            <label className="field-label" htmlFor="password">
              密码
            </label>
            <input
              id="password"
              type="password"
              className="input"
              autoComplete="current-password"
              placeholder="请输入密码"
              {...register('password', { required: '请输入密码' })}
            />
            {errors.password && <p className="field-error">{errors.password.message}</p>}
          </div>

          {mutation.isError && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {getErrorMessage(mutation.error)}
            </p>
          )}

          <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">
            {mutation.isPending ? '登录中…' : '登录'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          还没有账号？
          <Link to="/register" className="ml-1 text-accent hover:underline">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}
