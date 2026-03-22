import { Link, NavLink, Outlet } from "react-router-dom";

/**
 * 应用外壳（Layout）
 * - 负责全局导航与页面布局
 * - 具体业务页面通过 <Outlet /> 渲染
 */
export default function App() {
  return (
    <div className="relative min-h-screen bg-[#0B1220] text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -top-10 right-[-10rem] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-[-14rem] left-[-12rem] h-[28rem] w-[28rem] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0B1220]/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-base font-semibold tracking-wide text-amber-300 hover:text-amber-200"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-b from-amber-400/25 to-amber-400/5 ring-1 ring-amber-300/25">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4 text-amber-200"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M7.5 12.2c0-2.1 1.9-3.8 4.5-3.8s4.5 1.7 4.5 3.8c0 2-1.6 3.6-3.8 3.8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M12 16.8h.01"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <path
                  d="M12 21a9 9 0 1 0-9-9"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity="0.6"
                />
              </svg>
            </span>
            AI 海龟汤
          </Link>

          <nav className="flex items-center gap-1 text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                [
                  "rounded-md px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-amber-400/30",
                  isActive
                    ? "text-amber-200"
                    : "text-slate-200 hover:text-white",
                ].join(" ")
              }
              end
            >
              对局
            </NavLink>
            <NavLink
              to="/result"
              className={({ isActive }) =>
                [
                  "rounded-md px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-amber-400/30",
                  isActive
                    ? "text-amber-200"
                    : "text-slate-200 hover:text-white",
                ].join(" ")
              }
            >
              结果
            </NavLink>
            <NavLink
              to="/auth"
              className={({ isActive }) =>
                [
                  "rounded-md px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-amber-400/30",
                  isActive
                    ? "text-amber-200"
                    : "text-slate-200 hover:text-white",
                ].join(" ")
              }
            >
              登录
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="relative">
        <Outlet />
      </main>
    </div>
  );
}
