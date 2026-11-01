import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initialOf } from '../utils/format';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/85 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-semibold tracking-wide">墨迹</span>
            <span className="hidden text-[10px] uppercase tracking-[0.22em] text-muted sm:inline">
              Personal Blog
            </span>
          </Link>

          <nav className="flex items-center gap-4 sm:gap-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'text-sm font-medium text-ink' : 'nav-link'
              }
            >
              首页
            </NavLink>
            {user && (
              <NavLink
                to="/write"
                className={({ isActive }) =>
                  isActive ? 'text-sm font-medium text-ink' : 'nav-link'
                }
              >
                写文章
              </NavLink>
            )}
            {user && (
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  isActive ? 'text-sm font-medium text-ink' : 'nav-link'
                }
              >
                个人中心
              </NavLink>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden items-center gap-2 sm:flex">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-xs font-medium text-accent">
                      {initialOf(user.username)}
                    </span>
                  )}
                  <span className="text-sm text-ink">{user.username}</span>
                </span>
                <button type="button" onClick={handleLogout} className="nav-link">
                  退出
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="nav-link">
                  登录
                </Link>
                <Link to="/register" className="btn-primary btn-sm">
                  注册
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-10">
        <Outlet />
      </main>

      <footer className="border-t border-ink/10 py-8">
        <div className="container-page flex flex-col items-center justify-between gap-2 text-xs text-muted sm:flex-row">
          <span>墨迹 · 记录代码与生活</span>
          <span>React · Express · SQLite</span>
        </div>
      </footer>
    </div>
  );
}
