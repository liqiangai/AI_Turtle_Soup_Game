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
const PORT = parsePort(process.env.PORT, 3001);
const FRONTEND_ORIGIN = normalizeOrigin(process.env.FRONTEND_ORIGIN ?? "http://localhost:5173");
const app = (0, express_1.default)();
app.disable("x-powered-by");
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
app.get("/api/test", (_req, res) => {
    res.status(200).json({ ok: true });
});
app.use((err, req, res, _next) => {
    const requestIdHeader = req.header("x-request-id");
    const requestId = requestIdHeader && requestIdHeader.length > 0 ? requestIdHeader : node_crypto_1.default.randomUUID();
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
});
app.listen(PORT, () => {
    console.info("[api] started", { port: PORT, frontendOrigin: FRONTEND_ORIGIN });
});
