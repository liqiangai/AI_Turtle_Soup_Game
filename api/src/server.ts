/**
 * API 服务入口：启动 Express 服务并提供基础测试接口。
 * - 端口：PORT（默认 3001）
 * - CORS：默认允许 http://localhost:5173，支持 FRONTEND_ORIGIN 覆盖
 */

import crypto from "node:crypto";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

type TChatRequestBody = {
  question: string;
  story: {
    surface: string;
    bottom: string;
    title?: string;
    id?: string;
  };
};

function parsePort(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (Number.isFinite(parsed) && parsed > 0 && parsed < 65536) return parsed;
  return fallback;
}

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/$/, "");
}

function getRequestId(req: express.Request): string {
  const requestIdHeader = req.header("x-request-id");
  return requestIdHeader && requestIdHeader.length > 0 ? requestIdHeader : crypto.randomUUID();
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return trimmed;
}

function buildDeepSeekChatUrl(baseUrl: string): string {
  const normalizedBaseUrl = baseUrl.trim().replace(/\/$/, "");
  return `${normalizedBaseUrl}/chat/completions`;
}

function normalizeAnswer(value: string): string {
  return value.trim().replace(/[。.!！？\s]+$/g, "");
}

const PORT = parsePort(process.env.PORT, 3001);
const FRONTEND_ORIGIN = normalizeOrigin(process.env.FRONTEND_ORIGIN ?? "http://localhost:5173");
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/v1";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
const ENABLE_DEEPSEEK_MOCK = process.env.ENABLE_DEEPSEEK_MOCK === "1";

if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY.trim().length === 0) {
  console.error("[api] config_missing", { missing: ["DEEPSEEK_API_KEY"] });
}

const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "64kb" }));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (normalizeOrigin(origin) === FRONTEND_ORIGIN) return callback(null, true);
      return callback(new Error("CORS_NOT_ALLOWED"));
    },
    credentials: true
  })
);

app.get("/api/test", (_req, res) => {
  res.status(200).json({ ok: true });
});

if (ENABLE_DEEPSEEK_MOCK) {
  app.post("/__mock__/v1/chat/completions", (_req, res) => {
    res.status(200).json({
      id: crypto.randomUUID(),
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "mock-deepseek-chat",
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: "无关" },
          finish_reason: "stop"
        }
      ]
    });
  });
}

app.post("/api/chat", async (req, res) => {
  const requestId = getRequestId(req);

  const QUESTION_MAX_LENGTH = 200;
  const STORY_SURFACE_MAX_LENGTH = 2000;
  const STORY_BOTTOM_MAX_LENGTH = 8000;
  const UPSTREAM_TIMEOUT_MS = 12_000;

  if (!isPlainObject(req.body)) {
    res.status(400).json({ ok: false, code: "BAD_REQUEST", message: "Invalid JSON body", requestId });
    return;
  }

  const question = readNonEmptyString(req.body.question);
  const story = req.body.story;

  if (!question) {
    res.status(400).json({ ok: false, code: "BAD_REQUEST", message: "question is required", requestId });
    return;
  }
  if (question.length > QUESTION_MAX_LENGTH) {
    res.status(400).json({ ok: false, code: "BAD_REQUEST", message: "question is too long", requestId });
    return;
  }
  if (!isPlainObject(story)) {
    res.status(400).json({ ok: false, code: "BAD_REQUEST", message: "story is required", requestId });
    return;
  }

  const surface = readNonEmptyString(story.surface);
  const bottom = readNonEmptyString(story.bottom);
  if (!surface || !bottom) {
    res.status(400).json({
      ok: false,
      code: "BAD_REQUEST",
      message: "story.surface and story.bottom are required",
      requestId
    });
    return;
  }
  if (surface.length > STORY_SURFACE_MAX_LENGTH) {
    res.status(400).json({ ok: false, code: "BAD_REQUEST", message: "story.surface is too long", requestId });
    return;
  }
  if (bottom.length > STORY_BOTTOM_MAX_LENGTH) {
    res.status(400).json({ ok: false, code: "BAD_REQUEST", message: "story.bottom is too long", requestId });
    return;
  }

  if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY.trim().length === 0) {
    res.status(500).json({
      ok: false,
      code: "AI_KEY_MISSING",
      message: "DEEPSEEK_API_KEY is not configured",
      requestId
    });
    return;
  }

  const safeStoryId = typeof story.id === "string" ? story.id.trim() : undefined;
  console.info("[api] chat_request", {
    requestId,
    questionLength: question.length,
    storyId: safeStoryId && safeStoryId.length > 0 ? safeStoryId : undefined,
    storySurfaceLength: surface.length,
    storyBottomLength: bottom.length
  });

  const systemPrompt = [
    "你是海龟汤游戏的裁判。",
    "你只能输出以下三个词之一：是 / 否 / 无关。",
    "禁止输出任何解释、标点、引号、换行或额外文字。",
    "禁止泄露或复述汤底内容。",
    "",
    "【汤面】",
    surface,
    "",
    "【汤底（仅供裁判判定，不得透露）】",
    bottom
  ].join("\n");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstreamRes = await fetch(buildDeepSeekChatUrl(DEEPSEEK_BASE_URL), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        temperature: 0,
        max_tokens: 16,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ]
      }),
      signal: controller.signal
    });

    if (!upstreamRes.ok) {
      console.error("[api] ai_upstream_http_error", { requestId, status: upstreamRes.status });
      res.status(502).json({
        ok: false,
        code: "AI_UPSTREAM_ERROR",
        message: "AI upstream error",
        requestId
      });
      return;
    }

    const payload: unknown = await upstreamRes.json();
    if (!isPlainObject(payload)) {
      console.error("[api] ai_upstream_invalid_json", { requestId });
      res.status(502).json({ ok: false, code: "AI_UPSTREAM_ERROR", message: "AI upstream error", requestId });
      return;
    }

    const choices = payload.choices;
    if (!Array.isArray(choices) || choices.length === 0 || !isPlainObject(choices[0])) {
      console.error("[api] ai_upstream_invalid_choices", { requestId });
      res.status(502).json({ ok: false, code: "AI_UPSTREAM_ERROR", message: "AI upstream error", requestId });
      return;
    }

    const message = (choices[0] as Record<string, unknown>).message;
    if (!isPlainObject(message) || typeof message.content !== "string") {
      console.error("[api] ai_upstream_invalid_message", { requestId });
      res.status(502).json({ ok: false, code: "AI_UPSTREAM_ERROR", message: "AI upstream error", requestId });
      return;
    }

    const answer = normalizeAnswer(message.content);
    const allowed = new Set(["是", "否", "无关"]);
    if (!allowed.has(answer)) {
      console.error("[api] ai_upstream_invalid_answer", { requestId, answerLength: message.content.length });
      res.status(502).json({ ok: false, code: "AI_UPSTREAM_ERROR", message: "AI upstream error", requestId });
      return;
    }

    res.status(200).json({ ok: true, answer });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[api] ai_upstream_exception", { requestId, message });
    res.status(502).json({ ok: false, code: "AI_UPSTREAM_ERROR", message: "AI upstream error", requestId });
  } finally {
    clearTimeout(timeoutId);
  }
});

app.use(
  (err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const requestId = getRequestId(req);

    if (err instanceof Error && err.message === "CORS_NOT_ALLOWED") {
      res.status(403).json({
        ok: false,
        code: "CORS_FORBIDDEN",
        message: "Origin not allowed",
        requestId
      });
      return;
    }

    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[api] unhandled_error", { requestId, message });

    res.status(500).json({
      ok: false,
      code: "INTERNAL_ERROR",
      message: "Internal Server Error",
      requestId
    });
  }
);

app.listen(PORT, () => {
  console.info("[api] started", { port: PORT, frontendOrigin: FRONTEND_ORIGIN });
});
