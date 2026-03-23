import type { TStory } from "../data/stories";

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

const BACKEND_CHAT_ENDPOINT = (() => {
  const raw = (import.meta.env.VITE_API_BASE_URL ?? "") as unknown;
  const base = typeof raw === "string" ? raw.trim() : "";
  if (!base) return "/api/chat";
  return `${base.replace(/\/+$/, "")}/api/chat`;
})();
const ASK_AI_TIMEOUT_MS = 10_000;

export type TAskAIResult = {
  answer: string;
  fallback?: boolean;
  notice?: string;
};

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
  if (typeof message === "string" && message.trim()) return message.trim();

  const error = payload.error;
  if (isRecord(error)) {
    const errorMessage = error.message;
    if (typeof errorMessage === "string" && errorMessage.trim()) {
      return errorMessage.trim();
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

export async function askAI(question: string, story: TStory): Promise<TAskAIResult> {
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
        backendMessage ?? plainMessage ?? `后端服务异常（${res.status}）`,
      );
    }

    if (isBackendChatError(json)) {
      const backendMessage = pickBackendMessage(json);
      throw new Error(backendMessage ?? plainMessage ?? "后端服务异常，请稍后重试");
    }

    if (!isBackendChatSuccess(json)) {
      const backendMessage = pickBackendMessage(json);
      throw new Error(backendMessage ?? plainMessage ?? "后端响应异常，请稍后重试");
    }

    const answer = json.answer.trim();
    const allowed = new Set(["是", "否", "无关"]);
    if (!allowed.has(answer)) {
      throw new Error(
        "后端返回的答案不符合规范（只允许：是/否/无关）。请你换个方式重新提问，例如补充主体或动作。",
      );
    }

    const fallback = json.fallback === true;
    const notice = typeof json.notice === "string" && json.notice.trim() ? json.notice.trim() : undefined;

    return { answer, fallback: fallback ? true : undefined, notice };
  } catch (err: unknown) {
    const error =
      err instanceof Error ? err : new Error("未知错误");

    if (import.meta.env.DEV) {
      console.warn("askAI failed", { message: error.message });
    }

    if (error.name === "AbortError") {
      throw new Error("请求超时，请稍后重试");
    }

    if (error instanceof TypeError) {
      throw new Error("网络异常，无法连接到后端服务");
    }

    const trimmedMessage = error.message.trim();
    if (trimmedMessage) throw new Error(trimmedMessage);

    throw new Error("网络异常，无法连接到后端服务");
  } finally {
    window.clearTimeout(timeoutId);
  }
}
