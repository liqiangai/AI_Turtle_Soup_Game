import type { TStory } from "../data/stories";
import { toFriendlyErrorMessage } from "./userError";

type TBackendChatSuccessResponse = {
  ok: true;
  answer: string;
  fallback?: boolean;
  notice?: string;
  message?: string;
};

type TBackendChatErrorResponse = {
  ok: false;
  message?: string;
};

export type TAskAIResult = {
  answer: string;
  fallback?: boolean;
  notice?: string;
};

const BACKEND_CHAT_ENDPOINT = "/api/chat";
const ASK_AI_TIMEOUT_MS = 10_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isProbablyHtml(value: string): boolean {
  const s = value.trim().toLowerCase();
  if (!s) return false;
  return (
    s.startsWith("<!doctype") ||
    s.startsWith("<html") ||
    s.includes("<body") ||
    s.includes("<pre") ||
    s.includes("</html>")
  );
}

function pickBackendMessage(payload: unknown): string | null {
  if (!isRecord(payload)) return null;

  const message = payload.message;
  if (typeof message === "string" && message.trim()) {
    const friendly = toFriendlyErrorMessage(message, "");
    return friendly || null;
  }

  const error = payload.error;
  if (isRecord(error)) {
    const errorMessage = error.message;
    if (typeof errorMessage === "string" && errorMessage.trim()) {
      const friendly = toFriendlyErrorMessage(errorMessage, "");
      return friendly || null;
    }
  }

  return null;
}

function isBackendChatSuccess(
  payload: unknown,
): payload is TBackendChatSuccessResponse {
  return (
    isRecord(payload) &&
    payload.ok === true &&
    typeof payload.answer === "string"
  );
}

function isBackendChatError(
  payload: unknown,
): payload is TBackendChatErrorResponse {
  return isRecord(payload) && payload.ok === false;
}

export async function askAI(
  question: string,
  story: TStory,
): Promise<TAskAIResult> {
  const q = question.trim();
  if (!q) {
    throw new Error("请输入你的问题");
  }

  if (q.length > 200) {
    throw new Error("问题太长了（最多 200 字），请简化后重试");
  }

  const abortController = new AbortController();
  const timeoutId = window.setTimeout(() => {
    abortController.abort();
  }, ASK_AI_TIMEOUT_MS);

  try {
    const res = await fetch(BACKEND_CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: q,
        story: {
          id: story.id,
          title: story.title,
          surface: story.surface,
          bottom: story.bottom,
        },
      }),
      signal: abortController.signal,
    });

    const rawText = await res.text().catch(() => "");
    const trimmedText = rawText.trim();
    let json: unknown = null;
    let plainMessage: string | null = null;
    if (trimmedText.length > 0) {
      try {
        json = JSON.parse(trimmedText) as unknown;
      } catch {
        plainMessage =
          trimmedText.length <= 200 && !isProbablyHtml(trimmedText)
            ? trimmedText
            : null;
      }
    }

    if (!res.ok) {
      const backendMessage = pickBackendMessage(json);
      throw new Error(
        backendMessage ?? plainMessage ?? "服务暂时不可用，请稍后重试",
      );
    }

    if (isBackendChatError(json)) {
      const backendMessage = pickBackendMessage(json);
      throw new Error(backendMessage ?? plainMessage ?? "服务暂时不可用，请稍后重试");
    }

    if (!isBackendChatSuccess(json)) {
      const backendMessage = pickBackendMessage(json);
      throw new Error(backendMessage ?? plainMessage ?? "服务响应异常，请稍后重试");
    }

    const answer = json.answer.trim();
    const allowed = new Set(["是", "否", "无关"]);
    if (!allowed.has(answer)) {
      throw new Error("AI 回答格式异常，请重试");
    }

    const fallback = json.fallback === true;
    const notice =
      typeof json.notice === "string" && json.notice.trim() ? json.notice : undefined;

    return {
      answer,
      fallback: fallback || undefined,
      notice,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("未知错误");

    if (import.meta.env.DEV) {
      console.warn("askAI failed", { message: error.message });
    }

    throw new Error(toFriendlyErrorMessage(error, "服务暂时不可用，请稍后重试"));
  } finally {
    window.clearTimeout(timeoutId);
  }
}
