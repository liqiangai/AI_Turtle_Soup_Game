import { Link } from "react-router-dom";
import { GameCard } from "../components/lobby/GameCard";
import { stories } from "../data/stories";

/**
 * 首页 / 游戏大厅
 * - 展示项目标题、介绍文案与故事卡片列表
 * - 使用响应式网格布局适配移动端与桌面端
 */
export function HomePage() {
  return (
    <div className="page-enter relative w-full">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:px-8 sm:py-7">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-28 left-4 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl sm:left-6" />
            <div className="absolute -bottom-28 right-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          </div>

          <div className="relative grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-start">
            <div className="min-w-0">
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-200">
                <span className="text-amber-200">单人对 AI</span>
                <span className="h-1 w-1 rounded-full bg-amber-300/80" />
                <span>是 / 否 / 无关</span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span>推理到结算揭底</span>
              </div>

              <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-slate-100 sm:text-4xl">
                <span className="text-amber-300">AI 海龟汤：</span>
                <span className="whitespace-nowrap text-slate-100">用问题逼近真相</span>
              </h1>

              <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-slate-200">
                选择一个故事，连续提问。AI 只回答“是 / 否 / 无关”，你要在有限提问次数里还原真相。
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href="#stories"
                  className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                >
                  开始选故事
                </a>
                <Link
                  to="/result"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-amber-300/25 hover:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-amber-400/25"
                >
                  查看上局结果
                </Link>
                <div className="text-xs text-slate-400">
                  提示：点任意卡片进入对局
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
              <div className="text-xs font-semibold tracking-wide text-slate-300">
                快速玩法
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-200">
                <div className="flex gap-2">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300/80" />
                  <div className="min-w-0">
                    只问能回答为“是 / 否 / 无关”的问题
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/70" />
                  <div className="min-w-0">
                    线索分级解锁，别急着看汤底
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-300/70" />
                  <div className="min-w-0">
                    最后提交还原，系统统一结算
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="rounded-full border border-white/10 bg-white/[0.02] px-2.5 py-1">
                  共 {stories.length} 个故事
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.02] px-2.5 py-1">
                  移动端已适配
                </span>
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
