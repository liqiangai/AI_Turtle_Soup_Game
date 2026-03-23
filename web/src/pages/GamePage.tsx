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
import { toFriendlyErrorMessage } from "../services/userError";
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
  const [pendingAction, setPendingAction] = useState<
    null | "ask" | "unlock_hint" | "submit_solution"
  >(null);

  const story = useMemo(() => {
    if (!id) return undefined;
    return stories.find((s) => s.id === id);
  }, [id]);

  const storyId = story?.id;

  const [confirm, setConfirm] = useState<null | "reveal" | "abandon">(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submitText, setSubmitText] = useState("");
  const [isSurfaceOpen, setIsSurfaceOpen] = useState(false);
  const isBusy = pendingAction !== null;
  const isAskPending = pendingAction === "ask";
  const isUnlockPending = pendingAction === "unlock_hint";
  const isSubmitPending = pendingAction === "submit_solution";

  function pushSystemNotice(text: string) {
    const t = text.trim();
    if (!t) return;
    const content =
      t.startsWith("（系统提示）") || t.startsWith("(系统提示") || t.startsWith("系统提示")
        ? t
        : `（系统提示）${t}`;
    setMessages((prev) => [...prev, { role: "ai", content }]);
  }

  function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    if (!timeoutMs) return promise;
    return new Promise<T>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        const err = new Error("timeout");
        err.name = "AbortError";
        reject(err);
      }, timeoutMs);

      promise.then(
        (value) => {
          window.clearTimeout(timeoutId);
          resolve(value);
        },
        (err) => {
          window.clearTimeout(timeoutId);
          reject(err);
        },
      );
    });
  }

  useEffect(() => {
    if (!storyId) return;
    try {
      sessionStorage.setItem("gameStatus", "in_progress" satisfies TGameStatus);
      sessionStorage.removeItem("endReason");
      sessionStorage.setItem("hintLevel", "0");
      sessionStorage.removeItem("lastStoryId");
      sessionStorage.removeItem("lastMessages");
    } catch {
      void 0;
    }
    setHintLevel(0);
    setSubmitText("");
    setIsHintOpen(false);
    setIsSubmitOpen(false);
    setIsSurfaceOpen(false);
  }, [storyId]);

  function persistEndState(endReason: TEndReason, persistMessages: boolean) {
    if (!story) return;
    try {
      sessionStorage.setItem("gameStatus", "ended" satisfies TGameStatus);
      sessionStorage.setItem("endReason", endReason);
      sessionStorage.setItem("hintLevel", String(hintLevel));
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

  function handleUnlockHint() {
    void (async () => {
      if (!story || isBusy) return;
      setPendingAction("unlock_hint");
      const startAt = window.performance.now();
      try {
        await withTimeout(
          Promise.resolve().then(() => {
            if (hintLevel >= 3) {
              setIsHintOpen(true);
              pushSystemNotice("线索已全部解锁。");
              return;
            }
            const nextLevel = Math.min(3, hintLevel + 1);
            setHintLevel(nextLevel);
            try {
              sessionStorage.setItem("hintLevel", String(nextLevel));
            } catch {
              void 0;
            }
            setIsHintOpen(true);
          }),
          10_000,
        );
      } catch (err: unknown) {
        pushSystemNotice(toFriendlyErrorMessage(err, "解锁失败，请稍后重试"));
      } finally {
        const elapsed = window.performance.now() - startAt;
        const waitMs = Math.max(0, 250 - elapsed);
        if (waitMs) {
          await new Promise((r) => window.setTimeout(r, waitMs));
        }
        setPendingAction((cur) => (cur === "unlock_hint" ? null : cur));
      }
    })();
  }

  function handleSubmitSolution() {
    if (isBusy) return;
    setIsSubmitOpen(true);
  }

  function evaluateSolution(text: string) {
    if (!story) return { ok: false, hitCount: 0 };
    const t = text.trim();
    if (!t) return { ok: false, hitCount: 0 };
    const hitCount = story.solutionKeywords.filter((k) => t.includes(k)).length;
    const ok = hitCount >= 2 || (hintLevel >= 2 && hitCount >= 1);
    return { ok, hitCount };
  }

  function finalizeSolved() {
    if (!story) return;
    persistEndState("solved_by_submit", true);
    const search = new URLSearchParams({ storyId: story.id });
    navigate(`/result?${search.toString()}`, {
      state: { storyId: story.id, messages, endReason: "solved_by_submit" },
    });
  }

  async function handleConfirmSubmit() {
    if (!story || isBusy) return;
    const t = submitText.trim();
    if (!t) {
      pushSystemNotice("请先写下你的还原内容，再提交。");
      return;
    }

    setPendingAction("submit_solution");
    const startAt = window.performance.now();
    try {
      const result = await withTimeout(
        Promise.resolve().then(() => evaluateSolution(t)),
        10_000,
      );
      if (result.ok) {
        setIsSubmitOpen(false);
        finalizeSolved();
        return;
      }
      pushSystemNotice(
        "还原还不够完整：建议补上“人物/物品/关键动作/为什么会发生”的因果链，再试一次。",
      );
    } catch (err: unknown) {
      const message = toFriendlyErrorMessage(err, "提交失败，请稍后重试");
      pushSystemNotice(message);
    } finally {
      const elapsed = window.performance.now() - startAt;
      const waitMs = Math.max(0, 250 - elapsed);
      if (waitMs) {
        await new Promise((r) => window.setTimeout(r, waitMs));
      }
      setPendingAction((cur) => (cur === "submit_solution" ? null : cur));
    }
  }

  async function handleSend(content: string): Promise<boolean> {
    if (!story || isBusy) return false;

    // 先把用户消息加上
    setMessages((prev) => [...prev, { role: "user", content }]);
    setPendingAction("ask");

    try {
      const result = await askAI(content, story);
      setMessages((prev) => [...prev, { role: "ai", content: result.answer }]);
      if (result.fallback || result.notice) {
        pushSystemNotice(result.notice ?? "系统提示：请换一种问法再问一次");
      }
      return true;
    } catch (err: unknown) {
      const message = toFriendlyErrorMessage(
        err,
        "AI 服务暂时不可用，请稍后重试",
      );
      pushSystemNotice(message);
      return false;
    } finally {
      setPendingAction((cur) => (cur === "ask" ? null : cur));
    }
  }

  const questionCount = useMemo(
    () => messages.filter((m) => m.role === "user").length,
    [messages],
  );
  const targetQuestions = 15;
  const progressPct = Math.round((hintLevel / 3) * 100);

  const revealedKeyPoints = useMemo(() => {
    if (!story) return [];
    const total = story.keyPoints.length;
    const count =
      hintLevel <= 0 ? 0 : hintLevel === 1 ? 3 : hintLevel === 2 ? 5 : total;
    return story.keyPoints.slice(0, Math.min(total, count));
  }, [hintLevel, story]);

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
    <div className="page-enter min-h-0 flex-1 overflow-hidden bg-slate-900 text-slate-100">
      <div className="mx-auto flex h-full min-h-0 max-w-6xl flex-col px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-6">
        {!story ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 shadow-lg sm:p-6">
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
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 shadow-lg sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-start gap-3">
                    <h1 className="ui-title-clamp min-w-0 flex-1 text-2xl font-semibold leading-tight text-amber-400">
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
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>线索 Level {hintLevel}/3</span>
                    <span>
                      提问 {questionCount}/{targetQuestions}
                    </span>
                  </div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-[width] duration-200 ease-out"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
                <div className="mt-2 flex gap-2 sm:mt-0">
                  <button
                    type="button"
                    disabled={isBusy}
                    className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 shadow-lg transition hover:border-amber-400/30 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => setConfirm("reveal")}
                  >
                    查看汤底
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    className="rounded-xl bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => setConfirm("abandon")}
                  >
                    结束游戏
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold tracking-wide text-slate-300">
                    汤面
                  </div>
                  <button
                    type="button"
                    data-testid="surface-toggle"
                    onClick={() => setIsSurfaceOpen((v) => !v)}
                    className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1 text-xs text-slate-100 transition hover:border-amber-400/30 hover:bg-slate-900"
                  >
                    {isSurfaceOpen ? "收起" : "展开"}
                  </button>
                </div>

                {isSurfaceOpen ? (
                  <div
                    data-testid="story-surface"
                    className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-100"
                  >
                    {story.surface}
                  </div>
                ) : (
                  <div data-testid="story-surface" className="mt-2 min-w-0 text-sm text-slate-100">
                    <div className="min-w-0 line-clamp-2 text-wrap-anywhere">
                      {story.surface}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="min-h-0">
              <ChatBox
                messages={messages}
                isPending={isAskPending}
                isInputDisabled={isBusy}
                onSend={handleSend}
                footerActions={
                  story ? (
                    <>
                      <button
                        type="button"
                        onClick={handleUnlockHint}
                        disabled={isBusy}
                        className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-100 shadow-lg transition hover:border-amber-400/30 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isUnlockPending ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200/40 border-t-slate-200" />
                            解锁中
                          </span>
                        ) : (
                          "查看线索"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmitSolution}
                        disabled={isBusy}
                        className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-200 shadow-lg transition hover:border-amber-300/40 hover:bg-amber-400/15 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        提交还原
                      </button>
                    </>
                  ) : null
                }
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

            {isHintOpen ? (
              <div className="fixed inset-0 z-50">
                <button
                  type="button"
                  className="absolute inset-0 bg-black/60"
                  onClick={() => setIsHintOpen(false)}
                  aria-label="关闭"
                />
                <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-800 bg-slate-950/90 p-6 shadow-2xl backdrop-blur">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-base font-semibold text-amber-200">
                        线索（Level {hintLevel}/3）
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        仅展示关键点标题，不含解释。
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsHintOpen(false)}
                      className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-900"
                    >
                      关闭
                    </button>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                    {revealedKeyPoints.length ? (
                      <div className="space-y-2 text-sm text-slate-100">
                        {revealedKeyPoints.map((kp, idx) => (
                          <div key={idx} className="flex gap-2">
                            <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                            <div className="min-w-0">{kp}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-300">
                        暂无线索。点击“查看线索”解锁 Level 1。
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {isSubmitOpen ? (
              <div className="fixed inset-0 z-50">
                <button
                  type="button"
                  className="absolute inset-0 bg-black/60"
                  onClick={() => {
                    if (isSubmitPending) return;
                    setIsSubmitOpen(false);
                  }}
                  aria-label="关闭"
                />
                <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-800 bg-slate-950/90 p-6 shadow-2xl backdrop-blur">
                  <div className="text-base font-semibold text-amber-200">
                    提交还原
                  </div>
                  <div className="mt-2 text-sm text-slate-200">
                    写下你认为的真相（不需要太长，抓住关键因果即可）。
                  </div>

                  <div className="mt-4">
                    <textarea
                      value={submitText}
                      onChange={(e) => setSubmitText(e.target.value)}
                      disabled={isSubmitPending}
                      rows={5}
                      className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-amber-400/40 focus:ring-2 focus:ring-amber-400/20"
                      placeholder="例如：他打的不是雨伞，而是遮阳伞，所以挡不住雨…"
                    />
                  </div>

                  <div className="mt-5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (isSubmitPending) return;
                        setIsSubmitOpen(false);
                      }}
                      disabled={isSubmitPending}
                      className="flex-1 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-amber-400/30 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      继续推理
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleConfirmSubmit()}
                      disabled={isSubmitPending}
                      className="flex-1 rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isSubmitPending ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/40 border-t-slate-900" />
                          提交中
                        </span>
                      ) : (
                        "提交"
                      )}
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
