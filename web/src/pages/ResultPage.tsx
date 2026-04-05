/**
 * 结算/复盘页（占位）
 * - 后续将展示：完整汤底（仅结算可见）、关键提问节点、提示使用次数等
 * - 注意：Level 4（完整汤底）仅在本页或结算流程可获取（见 AGENTS/TECH_DESIGN）
 */
import { useMemo, useState, type CSSProperties } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Message } from "../components/game/Message";
import { stories } from "../data/stories";
import type { TChatMessage } from "../types/domain";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseMessages(value: unknown): TChatMessage[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const parsed: TChatMessage[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const role = item.role;
    const content = item.content;
    if ((role !== "user" && role !== "ai") || typeof content !== "string") continue;
    parsed.push({ role, content });
    if (parsed.length >= 200) break;
  }

  return parsed.length ? parsed : undefined;
}

export function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const stateStoryId = useMemo(() => {
    if (!isRecord(location.state)) return undefined;
    return typeof location.state.storyId === "string"
      ? location.state.storyId
      : undefined;
  }, [location.state]);

  const stateMessages = useMemo(() => {
    if (!isRecord(location.state)) return undefined;
    return parseMessages(location.state.messages);
  }, [location.state]);

  const stateEndReason = useMemo(() => {
    if (!isRecord(location.state)) return undefined;
    const v = location.state.endReason;
    return v === "abandoned_by_user" ||
      v === "reveal_bottom" ||
      v === "solved_by_submit" ||
      v === "unknown"
      ? v
      : undefined;
  }, [location.state]);

  const sessionStoryId = useMemo(() => {
    try {
      return sessionStorage.getItem("lastStoryId") ?? undefined;
    } catch {
      return undefined;
    }
  }, []);

  const sessionMessages = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("lastMessages");
      if (!raw) return undefined;
      return parseMessages(JSON.parse(raw));
    } catch {
      return undefined;
    }
  }, []);

  const sessionEndReason = useMemo(() => {
    try {
      const v = sessionStorage.getItem("endReason");
      return v === "abandoned_by_user" ||
        v === "reveal_bottom" ||
        v === "solved_by_submit" ||
        v === "unknown"
        ? v
        : undefined;
    } catch {
      return undefined;
    }
  }, []);

  const storyId = stateStoryId ?? searchParams.get("storyId") ?? sessionStoryId;
  const messages = stateMessages ?? sessionMessages;
  const endReason = stateEndReason ?? sessionEndReason;

  const story = useMemo(() => {
    if (!storyId) return undefined;
    return stories.find((s) => s.id === storyId);
  }, [storyId]);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  function handleBackToLobby() {
    try {
      sessionStorage.removeItem("gameStatus");
      sessionStorage.removeItem("endReason");
      sessionStorage.removeItem("hintLevel");
    } catch {
      void 0;
    }
    navigate("/");
  }

  function handlePlayAgain() {
    try {
      sessionStorage.removeItem("gameStatus");
      sessionStorage.removeItem("endReason");
      sessionStorage.removeItem("hintLevel");
      sessionStorage.removeItem("lastStoryId");
      sessionStorage.removeItem("lastMessages");
    } catch {
      void 0;
    }
    navigate("/");
  }

  if (!storyId) {
    return (
      <div className="page-enter w-full bg-slate-900 text-slate-100">
        <div className="mx-auto max-w-md p-4">
          <h1 className="text-2xl font-semibold text-amber-400">结果</h1>
          <p className="mt-2 text-sm text-slate-200">未找到本局信息。</p>
          <div className="mt-4">
            <button
              type="button"
              onClick={handleBackToLobby}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-slate-100 shadow-lg transition hover:border-amber-400/30 hover:bg-slate-900"
            >
              返回大厅
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isSolved = endReason === "solved_by_submit";
  const confetti = [
    { left: "10%", bg: "bg-amber-300/80", dx: "-40px", dr: "120deg", d: "0ms" },
    { left: "18%", bg: "bg-cyan-300/70", dx: "30px", dr: "-140deg", d: "40ms" },
    { left: "26%", bg: "bg-indigo-300/70", dx: "-20px", dr: "90deg", d: "80ms" },
    { left: "34%", bg: "bg-amber-200/70", dx: "50px", dr: "-110deg", d: "120ms" },
    { left: "42%", bg: "bg-emerald-300/70", dx: "-55px", dr: "160deg", d: "160ms" },
    { left: "58%", bg: "bg-amber-300/80", dx: "45px", dr: "-160deg", d: "60ms" },
    { left: "66%", bg: "bg-cyan-200/70", dx: "-35px", dr: "130deg", d: "100ms" },
    { left: "74%", bg: "bg-indigo-200/70", dx: "20px", dr: "-90deg", d: "140ms" },
    { left: "82%", bg: "bg-rose-200/70", dx: "-50px", dr: "150deg", d: "180ms" },
    { left: "90%", bg: "bg-amber-200/70", dx: "35px", dr: "-120deg", d: "220ms" },
  ] as const;

  return (
    <div className="page-enter relative w-full min-h-screen overflow-hidden bg-slate-900 text-slate-100">
      {isSolved ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 solved-celebration">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.22),transparent_55%)]" />
          </div>
          <div className="absolute inset-0 overflow-hidden">
            {confetti.map((c, idx) => (
              <div
                key={idx}
                className={`absolute top-[-12px] h-2 w-2 rounded-sm ${c.bg} solved-confetti`}
                style={
                  {
                    left: c.left,
                    ["--dx"]: c.dx,
                    ["--dr"]: c.dr,
                    ["--d"]: c.d,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>
      ) : null}
      <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 shadow-lg">
          <div className="text-xs font-semibold tracking-wide text-slate-300">
            本局结果
          </div>
          <h1 className="mt-1 text-xl font-semibold text-amber-400 sm:text-2xl">
            {story?.title ?? "未找到该故事"}
          </h1>
          {endReason ? (
            <div className="mt-1 text-xs text-slate-400">
              {endReason === "reveal_bottom"
                ? "你选择查看汤底揭晓（已剧透）"
                : endReason === "abandoned_by_user"
                  ? "你选择中途结束本局"
                  : endReason === "solved_by_submit"
                    ? "你提交了还原并通关"
                  : "本局已结束"}
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handlePlayAgain}
            className="rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-amber-300"
          >
            再来一局
          </button>
          <button
            type="button"
            onClick={handleBackToLobby}
            className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-slate-100 shadow-lg transition hover:border-amber-400/30 hover:bg-slate-900"
          >
            返回大厅
          </button>
        </div>

        <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-b from-amber-400/10 to-slate-950/40 p-6 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div className="text-base font-semibold text-amber-200">汤底揭晓</div>
            <div className="text-xs text-slate-400">完整内容仅在结果页展示</div>
          </div>

          <div className="mt-4 relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="result-reveal-content">
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">
                {story?.bottom ?? "未找到该故事的汤底内容。"}
              </div>
            </div>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 result-reveal-mask"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 result-reveal-highlight"
            />
          </div>
        </div>

        {messages?.length ? (
          <div className="rounded-2xl border border-slate-700 bg-slate-850/40 p-6 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div className="text-base font-semibold text-slate-100">
                本局对话
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryOpen((v) => !v)}
                className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 shadow-lg transition hover:border-amber-400/30 hover:bg-slate-900"
              >
                {isHistoryOpen ? "收起" : `展开（${messages.length}）`}
              </button>
            </div>

            {isHistoryOpen ? (
              <div className="mt-4 max-h-[50vh] overflow-auto pr-1">
                <div className="flex flex-col gap-3">
                  {messages.map((m, idx) => (
                    <Message key={`${m.role}-${idx}`} message={m} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
