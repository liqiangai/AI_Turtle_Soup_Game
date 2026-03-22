import { GameCard } from "../components/lobby/GameCard";
import { stories } from "../data/stories";

/**
 * 首页 / 游戏大厅
 * - 展示项目标题、介绍文案与故事卡片列表
 * - 使用响应式网格布局适配移动端与桌面端
 */
export function HomePage() {
  return (
    <div className="relative">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:px-8 sm:py-7">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-28 left-4 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl sm:left-6" />
            <div className="absolute -bottom-28 right-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-200">
              深色神秘 · 简洁科技
              <span className="h-1 w-1 rounded-full bg-amber-300" />
              单人对 AI
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
              <span className="text-amber-300">AI海龟汤</span>
              <span className="text-slate-100">：用问题逼近真相</span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
              你只管问“是/否/无关”，AI主持人守住汤底。每一步都更接近真相，但在结算前不会
              透露完整汤底。
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href="#stories"
                className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
              >
                选择故事开始
              </a>
              <div className="text-xs text-slate-400">
                提示：点击任意卡片开始对局
              </div>
            </div>
          </div>
        </section>

        <div className="mt-7 flex items-end justify-between gap-4 sm:mt-8">
          <div>
            <div className="text-sm font-semibold text-slate-100">故事列表</div>
            <div className="mt-1 text-xs text-slate-400">
              选择难度，开始你的第一轮推理。
            </div>
          </div>
          <div className="hidden text-xs text-slate-500 sm:block">
            共 {stories.length} 个故事
          </div>
        </div>

        <div
          id="stories"
          className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4"
        >
          {stories.map((story) => (
            <GameCard key={story.id} story={story} />
          ))}
        </div>
      </div>
    </div>
  );
}
