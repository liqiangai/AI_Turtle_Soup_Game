# 创建 AI 对话接口 POST /api/chat Spec

## Why
当前前端在开发环境通过 Vite Proxy 直连 DeepSeek（`/api/ask`），会导致：生产环境不可用、密钥管理不清晰、错误码/限流/审计难以统一。需要在 Express 后端提供一个稳定的 AI 对话接口，由后端持有 API Key 并统一处理错误。

## What Changes
- 在 `api/` 后端新增接口：`POST /api/chat`
- 请求体接收：`question`（问题字符串）、`story`（故事对象）
- 后端使用环境变量读取 DeepSeek API Key，调用 DeepSeek Chat Completions
- 返回 AI 的回答（字符串），并在失败时返回统一错误格式
- 更新 `api/.env.example` 增加 AI 相关环境变量示例（至少包含 API Key）

## Impact
- Affected specs: 后端技术方案（Express）、安全（密钥仅后端持有）、前后端分离
- Affected code:
  - api/src/server.ts
  - api/.env.example

## ADDED Requirements
### Requirement: POST /api/chat
系统 SHALL 提供 `POST /api/chat` 接口用于 AI 对话（海龟汤裁判式回答）。

#### Request Body
```json
{
  "question": "string",
  "story": {
    "surface": "string",
    "bottom": "string",
    "title": "string (optional)",
    "id": "string (optional)"
  }
}
```

#### Response (Success)
- **THEN** 返回 HTTP 200
- **THEN** 返回 JSON：
```json
{ "ok": true, "answer": "是|否|无关" }
```

#### Scenario: 参数校验失败
- **WHEN** `question` 为空或过长，或 `story.surface/story.bottom` 缺失
- **THEN** 返回 HTTP 400
- **THEN** 返回 JSON（与后端统一错误格式一致）：
```json
{ "ok": false, "code": "BAD_REQUEST", "message": "..." , "requestId": "..." }
```

### Requirement: DeepSeek API Call
系统 SHALL 使用环境变量读取 DeepSeek API Key 并调用 DeepSeek API 获取回答。

#### Env
- `DEEPSEEK_API_KEY`：必填
- `DEEPSEEK_BASE_URL`：可选，默认 `https://api.deepseek.com/v1`
- `DEEPSEEK_MODEL`：可选，默认 `deepseek-chat`

#### Scenario: 缺少 API Key
- **WHEN** 未设置 `DEEPSEEK_API_KEY`
- **THEN** 返回 HTTP 500
- **THEN** 返回 JSON：`code = "AI_KEY_MISSING"`

### Requirement: Error Handling
系统 SHALL 处理以下错误并返回可读的错误信息：
- DeepSeek 返回非 2xx
- DeepSeek 返回内容不符合预期（无法解析 answer）
- 网络/超时异常

#### Scenario: DeepSeek 异常
- **WHEN** 调用 DeepSeek 失败
- **THEN** 返回 HTTP 502（推荐）或 500（若当前框架统一为 500）
- **THEN** 返回 JSON（统一错误格式）：`code = "AI_UPSTREAM_ERROR"` 或等价值

## MODIFIED Requirements
无

## REMOVED Requirements
无

