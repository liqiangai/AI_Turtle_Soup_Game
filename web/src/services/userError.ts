function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function looksLikeHtml(value: string): boolean {
  const s = value.trim().toLowerCase();
  if (!s) return false;
  return (
    s.startsWith("<!doctype") ||
    s.startsWith("<html") ||
    s.includes("<body") ||
    s.includes("<pre") ||
    s.includes("</html>") ||
    (s.includes("<") && s.includes(">") && s.length > 80)
  );
}

function compactMessage(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}…`;
}

export function toFriendlyErrorMessage(
  err: unknown,
  fallback = "操作失败，请稍后重试",
): string {
  if (isRecord(err) && typeof err.name === "string" && err.name === "AbortError") {
    return "请求超时，请稍后重试";
  }

  if (err instanceof TypeError) {
    return "网络异常，请检查网络后重试";
  }

  const raw =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : null;

  if (!raw) return fallback;

  const msg = compactMessage(raw);
  if (!msg) return fallback;
  if (looksLikeHtml(msg)) return fallback;

  const lowered = msg.toLowerCase();
  if (lowered.startsWith("unexpected token <")) return fallback;

  return truncate(msg, 80);
}

