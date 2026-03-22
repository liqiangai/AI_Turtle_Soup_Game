import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { TChatMessage } from "../../types/domain";
import { Message } from "./Message";

export function ChatBox(props: {
  messages: TChatMessage[];
  isPending?: boolean;
  onSend?: (content: string) => void;
  footerActions?: ReactNode;
}) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  const trimmedInput = useMemo(() => input.trim(), [input]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [props.messages.length, props.isPending]);

  function send() {
    if (!trimmedInput || props.isPending) return;

    const content = trimmedInput;
    props.onSend?.(content);
    setInput("");
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-800 bg-slate-950/40 shadow-lg">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        <div className="space-y-3">
          {props.messages.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4 text-sm text-slate-200">
              <div className="text-xs font-semibold tracking-wide text-slate-300">
                还没有消息
              </div>
              <div className="mt-2 whitespace-pre-wrap leading-relaxed text-slate-200">
                你可以从“是 / 否 / 无关”的角度提问。\n\n示例：\n- 他是在室内吗？\n- 伞是坏的吗？\n- 和天气有关吗？
              </div>
            </div>
          ) : (
            props.messages.map((m, idx) => <Message key={idx} message={m} />)
          )}
          {props.isPending && (
            <div className="flex justify-start">
              <div className="flex max-w-[85%] items-end gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-800/60 text-slate-200">
                  <span className="h-2 w-2 animate-ping rounded-full bg-amber-400/80" />
                </div>
                <div className="rounded-2xl rounded-bl-md border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-400 shadow-lg">
                  AI 主持人思考中...
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t border-slate-800 px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        {props.footerActions ? (
          <div className="mb-2 flex justify-end gap-2">{props.footerActions}</div>
        ) : null}
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={props.isPending}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={2}
            placeholder={
              props.isPending ? "AI 思考中…（请稍候）" : "输入问题…（Enter 发送，Shift+Enter 换行）"
            }
            className="min-h-[44px] flex-1 resize-none rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-base text-slate-100 outline-none transition focus:border-amber-400/40 focus:ring-2 focus:ring-amber-400/20 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
          />
          <button
            type="button"
            onClick={send}
            disabled={!trimmedInput || props.isPending}
            className="h-[44px] shrink-0 rounded-xl bg-amber-400 px-4 text-base font-semibold text-slate-900 shadow-lg transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
          >
            {props.isPending ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/40 border-t-slate-900" />
                发送中
              </span>
            ) : (
              "发送"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
