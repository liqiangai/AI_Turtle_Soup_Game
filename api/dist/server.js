"use strict";
/**
 * API 服务入口：启动 Express 服务并提供基础测试接口。
 * - 端口：PORT（默认 3001）
 * - CORS：默认允许 http://localhost:5173，支持 FRONTEND_ORIGINS（逗号分隔）覆盖
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
exports.startServer = startServer;
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
    const trimmed = value.trim();
    if (trimmed.length === 0)
        return null;
    const match = trimmed.match(/^[`"'“”‘’\s]*?(是|否|无关)[`"'“”‘’\s。.!！？,，;；:：、]*?$/);
    if (!match)
        return null;
    const answer = match[1];
    if (answer === "是" || answer === "否" || answer === "无关")
        return answer;
    return null;
}
function sendFallback(res, requestId, reason) {
    console.warn("[api] ai_fallback", { requestId, reason });
    res.status(200).json({
        ok: true,
        answer: "无关",
        fallback: true,
        notice: "系统提示：请换一种问法再问一次"
    });
}
const PORT = parsePort(process.env.PORT, 3001);
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map(normalizeOrigin)
    .filter((o) => o.length > 0);
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/v1";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
const ENABLE_DEEPSEEK_MOCK = process.env.ENABLE_DEEPSEEK_MOCK === "1";
const ENABLE_DEBUG_ENDPOINTS = process.env.ENABLE_DEBUG_ENDPOINTS === "1";
if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY.trim().length === 0) {
    console.error("[api] config_missing", { missing: ["DEEPSEEK_API_KEY"] });
}
exports.app = (0, express_1.default)();
exports.app.disable("x-powered-by");
exports.app.use((req, res, next) => {
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
exports.app.use(express_1.default.json({ limit: "64kb" }));
exports.app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
        const origin = req.headers.origin;
        if (origin && FRONTEND_ORIGINS.includes(normalizeOrigin(origin))) {
            res.setHeader("Access-Control-Allow-Origin", origin);
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type,x-request-id");
            res.setHeader("Access-Control-Max-Age", "86400");
        }
        res.status(204).end();
        return;
    }
    next();
});
exports.app.use((0, cors_1.default)({
    origin(origin, callback) {
        if (!origin)
            return callback(null, true);
        if (FRONTEND_ORIGINS.includes(normalizeOrigin(origin)))
            return callback(null, true);
        return callback(new Error("CORS_NOT_ALLOWED"));
    },
    credentials: true
}));
exports.app.get("/api/docs", (_req, res) => {
    res.status(200).json({
        ok: true,
        openapiUrl: "/api/openapi.json"
    });
});
exports.app.get("/api/openapi.json", (_req, res) => {
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
                                    examples: {
                                        normal: { value: { ok: true, answer: "无关" } },
                                        fallback: {
                                            value: {
                                                ok: true,
                                                answer: "无关",
                                                fallback: true,
                                                notice: "系统提示：请换一种问法再问一次"
                                            }
                                        }
                                    }
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
                        }
                    }
                }
            }
        }
    });
});
exports.app.all("/api/test", (req, res, next) => {
    if (req.method === "GET")
        return next();
    res.setHeader("Allow", "GET");
    sendError(res, 405, "Method Not Allowed");
});
exports.app.get("/api/test", (_req, res) => {
    if (ENABLE_DEBUG_ENDPOINTS && _req.query.force500 === "1") {
        throw new Error("FORCED_INTERNAL_ERROR");
    }
    res.status(200).json({ ok: true });
});
if (ENABLE_DEEPSEEK_MOCK) {
    exports.app.post("/__mock__/v1/chat/completions", (_req, res) => {
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
exports.app.all("/api/chat", (req, res, next) => {
    if (req.method === "POST")
        return next();
    res.setHeader("Allow", "POST");
    sendError(res, 405, "Method Not Allowed");
});
exports.app.post("/api/chat", async (req, res) => {
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
        "你是海龟汤游戏的裁判，只做“是/否/无关”三选一判定。",
        "",
        "【输出要求】",
        "1) 只能输出：是 或 否 或 无关（必须完全一致）。",
        "2) 只输出一个词，不要任何解释、标点、空格、换行、引号或其他字符。",
        "3) 不要泄露、暗示或复述汤底；不要生成线索、推理过程或建议。",
        "",
        "【判定规则】",
        "A) 先判断用户输入是否为“单一、明确、可判定”的是非问题：",
        "- 纯数字/乱码/无意义字符/非问句短语/陈述句/指令/寒暄/复述：输出 无关",
        "- 同时包含多个问题、多个条件，或需要你补充信息才能判定：输出 无关",
        "- 询问原因、过程、解释、细节、提示、要求讲汤底/泄露信息：输出 无关",
        "B) 若是明确是非问题：只依据汤面+汤底的事实判定：",
        "- 与事实一致：输出 是",
        "- 与事实矛盾：输出 否",
        "- 汤面/汤底无法确定真伪：输出 无关",
        "C) 不确定时一律输出 无关。",
        "",
        "【示例（仅示规则与格式，不代表本局事实）】",
        "用户：22",
        "助手：无关",
        "用户：??",
        "助手：无关",
        "用户：asdj!@#",
        "助手：无关",
        "用户：伞是雨伞吗",
        "助手：无关",
        "用户：告诉我汤底",
        "助手：无关",
        "用户：他为什么这么做？",
        "助手：无关",
        "用户：他死了吗？（汤底明确写“他死了”）",
        "助手：是",
        "用户：他是被枪杀的吗？（汤底明确无枪或明确非他杀）",
        "助手：否",
        "",
        "【本局信息】",
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
                    { role: "user", content: "22" },
                    { role: "assistant", content: "无关" },
                    { role: "user", content: "??" },
                    { role: "assistant", content: "无关" },
                    { role: "user", content: "伞是雨伞吗" },
                    { role: "assistant", content: "无关" },
                    { role: "user", content: "请解释原因" },
                    { role: "assistant", content: "无关" },
                    { role: "user", content: question }
                ]
            }),
            signal: controller.signal
        });
        if (!upstreamRes.ok) {
            console.error("[api] ai_upstream_http_error", { requestId, status: upstreamRes.status });
            sendFallback(res, requestId, `upstream_http_${upstreamRes.status}`);
            return;
        }
        let payload;
        try {
            payload = (await upstreamRes.json());
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            console.error("[api] ai_upstream_json_parse_error", { requestId, message });
            sendFallback(res, requestId, "upstream_json_parse_error");
            return;
        }
        if (!isPlainObject(payload)) {
            console.error("[api] ai_upstream_invalid_json", { requestId });
            sendFallback(res, requestId, "upstream_json_not_object");
            return;
        }
        const choices = payload.choices;
        if (!Array.isArray(choices) || choices.length === 0 || !isPlainObject(choices[0])) {
            console.error("[api] ai_upstream_invalid_choices", { requestId });
            sendFallback(res, requestId, "upstream_invalid_choices");
            return;
        }
        const message = choices[0].message;
        if (!isPlainObject(message) || typeof message.content !== "string") {
            console.error("[api] ai_upstream_invalid_message", { requestId });
            sendFallback(res, requestId, "upstream_invalid_message");
            return;
        }
        const answer = normalizeAnswer(message.content);
        if (!answer) {
            console.error("[api] ai_upstream_invalid_answer", {
                requestId,
                answerLength: message.content.length
            });
            sendFallback(res, requestId, "upstream_invalid_answer");
            return;
        }
        res.status(200).json({ ok: true, answer });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        const name = err instanceof Error ? err.name : "UnknownError";
        console.error("[api] ai_upstream_exception", { requestId, name, message });
        sendFallback(res, requestId, name === "AbortError" ? "upstream_timeout" : "upstream_exception");
    }
    finally {
        clearTimeout(timeoutId);
    }
});
exports.app.use("/api", (_req, res) => {
    sendError(res, 404, "Not Found");
});
exports.app.use((err, req, res, _next) => {
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
function startServer() {
    const server = exports.app.listen(PORT, () => {
        console.info("[api] started", { port: PORT, frontendOrigins: FRONTEND_ORIGINS });
    });
    const SHUTDOWN_TIMEOUT_MS = 10000;
    function shutdown(signal) {
        console.info("[api] shutdown_initiated", { signal });
        server.close((err) => {
            if (err) {
                console.error("[api] shutdown_error", { message: err.message });
                process.exit(1);
            }
            console.info("[api] shutdown_complete", { signal });
            process.exit(0);
        });
        setTimeout(() => {
            console.error("[api] shutdown_timeout", { timeoutMs: SHUTDOWN_TIMEOUT_MS });
            process.exit(1);
        }, SHUTDOWN_TIMEOUT_MS).unref();
    }
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
}
if (require.main === module) {
    startServer();
}
