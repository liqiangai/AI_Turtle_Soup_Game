/**
 * 对局页（占位）
 * - 后续将包含：汤面展示、聊天问答、自动板书、渐进解锁汤底入口
 * - 本页将成为核心交互页面（见 PRD 3.3）
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChatBox } from "../components/game/ChatBox";
import { stories } from "../data/stories";
import { askAI } from "../services/api";
import type { TChatMessage, TEndReason, TGameStatus } from "../types/domain";

export function GamePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<TChatMessage[]>([
    {
      role: "ai",
      content:
        "欢迎来到 AI 海龟汤。你可以从‘是/否/无关’角度提问。\n\n（提示：AI 回答基于你配置的 DeepSeek API Key）",
    },
  ]);
  const [isPending, setIsPending] = useState(false);

  const story = useMemo(() => {
    if (!id) return undefined;
    return stories.find((s) => s.id === id);
  }, [id]);

  const [confirm, setConfirm] = useState<null | "reveal" | "abandon">(null);

  useEffect(() => {
    if (!story) return;
    try {
      sessionStorage.setItem("gameStatus", "in_progress" satisfies TGameStatus);
      sessionStorage.removeItem("endReason");
      sessionStorage.removeItem("lastStoryId");
      sessionStorage.removeItem("lastMessages");
    } catch {
      void 0;
    }
  }, [story?.id]);

  function persistEndState(endReason: TEndReason, persistMessages: boolean) {
    if (!story) return;
    try {
      sessionStorage.setItem("gameStatus", "ended" satisfies TGameStatus);
      sessionStorage.setItem("endReason", endReason);
      if (persistMessages) {
        sessionStorage.setItem("lastStoryId", story.id);
        sessionStorage.setItem("lastMessages", JSON.stringify(messages));
      } else {
        sessionStorage.removeItem("lastStoryId");
        sessionStorage.removeItem("lastMessages");
      }
    } catch {
      void 0;
    }
  }

  function handleRevealBottom() {
    if (!story) return;
    persistEndState("reveal_bottom", true);
    const search = new URLSearchParams({ storyId: story.id });
    navigate(`/result?${search.toString()}`, {
      state: { storyId: story.id, messages, endReason: "reveal_bottom" },
    });
  }

  function handleAbandonGame() {
    persistEndState("abandoned_by_user", false);
    navigate("/");
  }

  async function handleSend(content: string) {
    if (!story) return;

    // 先把用户消息加上
    setMessages((prev) => [...prev, { role: "user", content }]);
    setIsPending(true);

    try {
      const reply = await askAI(content, story);
      setMessages((prev) => [...prev, { role: "ai", content: reply }]);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "AI 服务暂时不可用，请稍后重试";
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `（系统提示）${message}`,
        },
      ]);
    } finally {
      setIsPending(false);
    }
  }

  const difficultyLabel =
    story?.difficulty === "easy"
      ? "简单"
      : story?.difficulty === "medium"
        ? "中等"
        : story?.difficulty === "hard"
          ? "困难"
          : undefined;

  const difficultyClass =
    story?.difficulty === "easy"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
      : story?.difficulty === "medium"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
        : story?.difficulty === "hard"
          ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
          : "border-slate-700 bg-slate-800/50 text-slate-200";

  return (
    <div className="h-dvh overflow-hidden bg-slate-900 text-slate-100">
      <div className="mx-auto flex h-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        {!story ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 shadow-lg">
            <div className="text-base font-semibold text-amber-200">
              未找到该故事
            </div>
            <div className="mt-2 text-sm text-slate-200">
              请从大厅选择一个故事开始对局。
            </div>
            <div className="mt-4">
              <Link to="/" className="text-sm text-amber-300 hover:text-amber-200">
                返回大厅
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-4 lg:grid-cols-[420px_1fr] lg:grid-rows-1 lg:gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 shadow-lg">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <h1 className="truncate text-2xl font-semibold text-amber-400">
                      {story.title}
                    </h1>
                    {difficultyLabel ? (
                      <span
                        className={`shrink-0 rounded-md border px-2 py-1 text-xs ${difficultyClass}`}
                      >
                        {difficultyLabel}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    只回答：是 / 否 / 无关
                  </div>
                </div>
                <div className="mt-2 flex gap-2 sm:mt-0">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 shadow-lg transition hover:border-amber-400/30 hover:bg-slate-900"
                    onClick={() => setConfirm("reveal")}
                  >
                    查看汤底
                  </button>
                  <button
                    type="button"
                    className="rounded-xl bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-amber-300"
                    onClick={() => setConfirm("abandon")}
                  >
                    结束游戏
                  </button>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <div className="text-xs font-semibold tracking-wide text-slate-300">
                  汤面
                </div>
                <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-100">
                  {story.surface}
                </div>
              </div>
            </div>

            <div className="min-h-0">
              <ChatBox
                messages={messages}
                isPending={isPending}
                onSend={handleSend}
              />
            </div>
            </div>

            {confirm ? (
              <div className="fixed inset-0 z-50">
                <button
                  type="button"
                  className="absolute inset-0 bg-black/60"
                  onClick={() => setConfirm(null)}
                  aria-label="关闭"
                />
                <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-800 bg-slate-950/90 p-6 shadow-2xl backdrop-blur">
                  <div className="text-base font-semibold text-amber-200">
                    {confirm === "reveal" ? "查看汤底（剧透）？" : "结束本局？"}
                  </div>
                  <div className="mt-2 text-sm text-slate-200">
                    {confirm === "reveal"
                      ? "将结束本局并进入结果页揭晓完整汤底；该操作无法撤回。"
                      : "将返回大厅（可稍后再玩）。"}
                  </div>

                  <div className="mt-5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirm(null)}
                      className="flex-1 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-amber-400/30 hover:bg-slate-900"
                    >
                      {confirm === "reveal" ? "先不看" : "继续推理"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const action = confirm;
                        setConfirm(null);
                        if (action === "reveal") handleRevealBottom();
                        else handleAbandonGame();
                      }}
                      className="flex-1 rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
                    >
                      {confirm === "reveal" ? "确认查看" : "确认结束"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
