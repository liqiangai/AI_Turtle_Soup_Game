import { Link, Outlet } from "react-router-dom";

/**
 * 应用外壳（Layout）
 * - 负责全局导航与页面布局
 * - 具体业务页面通过 <Outlet /> 渲染
 */
export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-md items-center justify-between px-6 py-4">
          <Link to="/" className="text-base font-semibold text-amber-400">
            AI 海龟汤
          </Link>
          <nav className="flex gap-3 text-sm text-slate-200">
            <Link to="/game" className="hover:text-white">
              对局
            </Link>
            <Link to="/result" className="hover:text-white">
              结算
            </Link>
            <Link to="/auth" className="hover:text-white">
              登录
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
