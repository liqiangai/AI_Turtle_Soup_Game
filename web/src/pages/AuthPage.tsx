/**
 * 认证页（占位）
 * - MVP 需要：注册/登录/刷新/退出（详见 PRD/TECH_DESIGN）
 * - Refresh Token 建议使用 HttpOnly Cookie 存储（安全要求见 AGENTS）
 */
export function AuthPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-md p-6">
        <h1 className="text-2xl font-semibold text-amber-400">登录</h1>
        <p className="mt-2 text-sm text-slate-200">认证页面（占位）</p>
      </div>
    </div>
  );
}
