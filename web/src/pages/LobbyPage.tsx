/**
 * 大厅页（占位）
 * - 后续将展示题目列表/筛选/随机开始入口
 * - 设计基调：深蓝背景 + 金色强调（见 PRD/AGENTS）
 */
import { GameCard } from "../components/lobby/GameCard";
import { stories } from "../data/stories";

export function LobbyPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-amber-400">
      <div className="mx-auto max-w-md p-6">
        <h1 className="text-2xl font-semibold">AI 海龟汤</h1>
        <p className="mt-2 text-sm text-slate-200">选择一个故事开始推理</p>
        <div className="mt-4 space-y-3">
          {stories.map((story) => (
            <GameCard key={story.id} story={story} />
          ))}
        </div>
      </div>
    </div>
  );
}
