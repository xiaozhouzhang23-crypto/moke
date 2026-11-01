import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="container-page">
      <div className="card mx-auto max-w-xl p-12 text-center">
        <p className="font-serif text-5xl text-ink/20">404</p>
        <h1 className="mt-4 font-serif text-2xl font-semibold">页面走丢了</h1>
        <p className="mt-2 text-sm text-muted">你访问的页面不存在，或者已经被删除。</p>
        <Link to="/" className="btn-primary btn-sm mt-6">
          返回首页
        </Link>
      </div>
    </div>
  );
}
