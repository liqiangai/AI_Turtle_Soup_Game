"use strict";
/**
 * API 服务入口：启动 Express 服务并提供基础测试接口。
 * - 端口：PORT（默认 3001）
 * - CORS：默认允许 http://localhost:5173，支持 FRONTEND_ORIGIN 覆盖
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_crypto_1 = __importDefault(require("node:crypto"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
dotenv_1.default.config();
function parsePort(value, fallback) {
    const parsed = Number.parseInt(String(value ?? ""), 10);
    if (Number.isFinite(parsed) && parsed > 0 && parsed < 65536)
        return parsed;
    return fallback;
}
function normalizeOrigin(value) {
    return value.trim().replace(/\/$/, "");
}
function getRequestId(req) {
    const requestIdHeader = req.header("x-request-id");
    return requestIdHeader && requestIdHeader.length > 0 ? requestIdHeader : node_crypto_1.default.randomUUID();
}
function getResponseRequestId(res, fallback) {
    const candidate = res.locals.requestId;
    if (typeof candidate === "string" && candidate.trim().length > 0)
        return candidate.trim();
    const generated = fallback();
    res.locals.requestId = generated;
    res.setHeader("x-request-id", generated);
    return generated;
}
function sendError(res, status, message) {
    const requestId = getResponseRequestId(res, () => node_crypto_1.default.randomUUID());
    res.status(status).json({ ok: false, message, requestId });
}
function isPlainObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function readNonEmptyString(value) {
    if (typeof value !== "string")
        return null;
    const trimmed = value.trim();
    if (trimmed.length === 0)
        return null;
    return trimmed;
}
function buildDeepSeekChatUrl(baseUrl) {
    const normalizedBaseUrl = baseUrl.trim().replace(/\/$/, "");
    return `${normalizedBaseUrl}/chat/completions`;
}
function normalizeAnswer(value) {
    return value.trim().replace(/[。.!！？\s]+$/g, "");
}
const PORT = parsePort(process.env.PORT, 3001);
const FRONTEND_ORIGIN = normalizeOrigin(process.env.FRONTEND_ORIGIN ?? "http://localhost:5173");
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/v1";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
const ENABLE_DEEPSEEK_MOCK = process.env.ENABLE_DEEPSEEK_MOCK === "1";
const ENABLE_DEBUG_ENDPOINTS = process.env.ENABLE_DEBUG_ENDPOINTS === "1";
if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY.trim().length === 0) {
    console.error("[api] config_missing", { missing: ["DEEPSEEK_API_KEY"] });
}
const app = (0, express_1.default)();
app.disable("x-powered-by");
app.use((req, res, next) => {
    const incomingRequestId = req.header("x-request-id");
    const trimmed = typeof incomingRequestId === "string" ? incomingRequestId.trim() : "";
    const requestId = trimmed.length > 0 && trimmed.length <= 128 ? trimmed : node_crypto_1.default.randomUUID();
    res.locals.requestId = requestId;
    res.setHeader("x-request-id", requestId);
    const startAt = process.hrtime.bigint();
    res.on("finish", () => {
        const durationMs = Number(process.hrtime.bigint() - startAt) / 1000000;
        const path = req.originalUrl.split("?")[0] ?? req.originalUrl;
        console.info("[api] request", {
            method: req.method,
            path,
            status: res.statusCode,
            durationMs: Math.round(durationMs),
            requestId
        });
    });
    next();
});
app.use(express_1.default.json({ limit: "64kb" }));
app.use((0, cors_1.default)({
    origin(origin, callback) {
        if (!origin)
            return callback(null, true);
        if (normalizeOrigin(origin) === FRONTEND_ORIGIN)
            return callback(null, true);
        return callback(new Error("CORS_NOT_ALLOWED"));
    },
    credentials: true
}));
app.get("/api/docs", (_req, res) => {
    res.status(200).json({
        ok: true,
        openapiUrl: "/api/openapi.json"
    });
});
app.get("/api/openapi.json", (_req, res) => {
    res.status(200).json({
        openapi: "3.0.3",
        info: {
            title: "AI Turtle Soup API",
            version: "0.1.0"
        },
        paths: {
            "/api/test": {
                get: {
                    summary: "Health check",
                    responses: {
                        "200": {
                            description: "OK",
                            headers: {
                                "x-request-id": {
                                    description: "Request identifier",
                                    schema: { type: "string" }
                                }
                            },
                            content: {
                                "application/json": {
                                    example: { ok: true }
                                }
                            }
                        }
                    }
                }
            },
            "/api/chat": {
                post: {
                    summary: "Ask AI referee",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                example: {
                                    question: "他死了吗？",
                                    story: {
                                        id: "story-001",
                                        title: "示例汤面标题",
                                        surface: "一名男子走进酒吧，喝了一杯水后离开。",
                                        bottom: "男子其实想要毒药，酒吧老板给了水。"
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        "200": {
                            description: "OK",
                            headers: {
                                "x-request-id": {
                                    description: "Request identifier",
                                    schema: { type: "string" }
                                }
                            },
                            content: {
                                "application/json": {
                                    example: { ok: true, answer: "无关" }
                                }
                            }
                        },
                        "400": {
                            description: "Bad Request",
                            headers: {
                                "x-request-id": {
                                    description: "Request identifier",
                                    schema: { type: "string" }
                                }
                            },
                            content: {
                                "application/json": {
                                    example: { ok: false, message: "question is required", requestId: "req-xxx" }
                                }
                            }
                        },
                        "502": {
                            description: "AI upstream error",
                            headers: {
                                "x-request-id": {
                                    description: "Request identifier",
                                    schema: { type: "string" }
                                }
                            },
                            content: {
                                "application/json": {
                                    example: { ok: false, message: "AI upstream error", requestId: "req-xxx" }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
});
app.all("/api/test", (req, res, next) => {
    if (req.method === "GET")
        return next();
    res.setHeader("Allow", "GET");
    sendError(res, 405, "Method Not Allowed");
});
app.get("/api/test", (_req, res) => {
    if (ENABLE_DEBUG_ENDPOINTS && _req.query.force500 === "1") {
        throw new Error("FORCED_INTERNAL_ERROR");
    }
    res.status(200).json({ ok: true });
});
if (ENABLE_DEEPSEEK_MOCK) {
    app.post("/__mock__/v1/chat/completions", (_req, res) => {
        res.status(200).json({
            id: node_crypto_1.default.randomUUID(),
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
app.all("/api/chat", (req, res, next) => {
    if (req.method === "POST")
        return next();
    res.setHeader("Allow", "POST");
    sendError(res, 405, "Method Not Allowed");
});
app.post("/api/chat", async (req, res) => {
    const requestId = getResponseRequestId(res, () => getRequestId(req));
    const QUESTION_MAX_LENGTH = 200;
    const STORY_SURFACE_MAX_LENGTH = 2000;
    const STORY_BOTTOM_MAX_LENGTH = 8000;
    const UPSTREAM_TIMEOUT_MS = 12000;
    if (!isPlainObject(req.body)) {
        sendError(res, 400, "Invalid JSON body");
        return;
    }
    const question = readNonEmptyString(req.body.question);
    const story = req.body.story;
    if (!question) {
        sendError(res, 400, "question is required");
        return;
    }
    if (question.length > QUESTION_MAX_LENGTH) {
        sendError(res, 400, "question is too long");
        return;
    }
    if (!isPlainObject(story)) {
        sendError(res, 400, "story is required");
        return;
    }
    const surface = readNonEmptyString(story.surface);
    const bottom = readNonEmptyString(story.bottom);
    if (!surface || !bottom) {
        sendError(res, 400, "story.surface and story.bottom are required");
        return;
    }
    if (surface.length > STORY_SURFACE_MAX_LENGTH) {
        sendError(res, 400, "story.surface is too long");
        return;
    }
    if (bottom.length > STORY_BOTTOM_MAX_LENGTH) {
        sendError(res, 400, "story.bottom is too long");
        return;
    }
    if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY.trim().length === 0) {
        sendError(res, 500, "DEEPSEEK_API_KEY is not configured");
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
            sendError(res, 502, "AI upstream error");
            return;
        }
        const payload = await upstreamRes.json();
        if (!isPlainObject(payload)) {
            console.error("[api] ai_upstream_invalid_json", { requestId });
            sendError(res, 502, "AI upstream error");
            return;
        }
        const choices = payload.choices;
        if (!Array.isArray(choices) || choices.length === 0 || !isPlainObject(choices[0])) {
            console.error("[api] ai_upstream_invalid_choices", { requestId });
            sendError(res, 502, "AI upstream error");
            return;
        }
        const message = choices[0].message;
        if (!isPlainObject(message) || typeof message.content !== "string") {
            console.error("[api] ai_upstream_invalid_message", { requestId });
            sendError(res, 502, "AI upstream error");
            return;
        }
        const answer = normalizeAnswer(message.content);
        const allowed = new Set(["是", "否", "无关"]);
        if (!allowed.has(answer)) {
            console.error("[api] ai_upstream_invalid_answer", { requestId, answerLength: message.content.length });
            sendError(res, 502, "AI upstream error");
            return;
        }
        res.status(200).json({ ok: true, answer });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[api] ai_upstream_exception", { requestId, message });
        sendError(res, 502, "AI upstream error");
    }
    finally {
        clearTimeout(timeoutId);
    }
});
app.use("/api", (_req, res) => {
    sendError(res, 404, "Not Found");
});
app.use((err, req, res, _next) => {
    const requestId = getResponseRequestId(res, () => getRequestId(req));
    if (err instanceof Error && err.message === "CORS_NOT_ALLOWED") {
        sendError(res, 403, "Origin not allowed");
        return;
    }
    if (err instanceof SyntaxError) {
        const maybe = err;
        if (maybe && maybe.type === "entity.parse.failed") {
            sendError(res, 400, "Invalid JSON body");
            return;
        }
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[api] unhandled_error", { requestId, message });
    sendError(res, 500, "Internal Server Error");
});
app.listen(PORT, () => {
    console.info("[api] started", { port: PORT, frontendOrigin: FRONTEND_ORIGIN });
});
