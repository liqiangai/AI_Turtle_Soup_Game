import { useNavigate } from "react-router-dom";
import type { TStory } from "../../data/stories";

/**
 * 游戏卡片组件（大厅列表项）
 * - 展示：标题、难度标签
 * - 交互：hover 高亮，点击跳转到 /game/:id
 */
export function GameCard(props: { story: TStory }) {
  const { story } = props;
  const navigate = useNavigate();

  const difficultyLabel =
    story.difficulty === "easy"
      ? "简单"
      : story.difficulty === "medium"
        ? "中等"
        : "困难";

  const difficultyClass =
    story.difficulty === "easy"
      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
      : story.difficulty === "medium"
        ? "border-amber-400/25 bg-amber-400/10 text-amber-200"
        : "border-rose-400/25 bg-rose-400/10 text-rose-200";

  const targetPath = `/game/${encodeURIComponent(story.id)}`;
  const goToGame = () => {
    navigate(targetPath);
  };

  return (
    <div
      className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition duration-150 hover:-translate-y-0.5 hover:border-amber-300/30 hover:bg-white/[0.06] hover:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)] focus:outline-none focus:ring-2 focus:ring-amber-400/25"
      role="link"
      tabIndex={0}
      onClick={goToGame}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          goToGame();
          return;
        }
        if (e.key === " " || e.code === "Space") {
          e.preventDefault();
          goToGame();
        }
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-150 group-hover:opacity-100">
        <div className="absolute -top-20 left-1/2 h-48 w-[28rem] -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute -bottom-24 right-[-8rem] h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="ui-title-clamp text-base font-semibold text-slate-100 transition group-hover:text-amber-100">
            {story.title}
          </div>
          <div className="mt-1 line-clamp-2 text-wrap-anywhere text-sm text-slate-300">
            {story.surface}
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs tracking-wide ${difficultyClass}`}
        >
          {difficultyLabel}
        </span>
      </div>
    </div>
  );
}
