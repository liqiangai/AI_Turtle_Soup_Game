# 前端改为调用后端 /api/chat Spec

## Why
当前前端 `askAI()` 通过 Vite Proxy 直接请求 DeepSeek（`/api/ask`），会让 API Key、上游错误与调用策略停留在前端侧，不符合“密钥仅后端持有”的目标。需要把前端改为请求后端 AI 对话接口。

## What Changes
- 修改前端 [api.ts](file:///d:/workspace_ai/AI_Turtle_Soup_Game/web/src/services/api.ts)：
  - 保持 `askAI(question: string, story: TStory): Promise<string>` 函数签名不变
  - 将请求从 `/api/ask` 改为调用后端 `http://localhost:3000/api/chat`
  - 请求体改为 `{ question, story }`（至少包含 story.surface 与 story.bottom）
  - 统一处理网络错误（连接失败、超时、非 2xx、无效响应）
- 不修改页面调用点（[GamePage.tsx](file:///d:/workspace_ai/AI_Turtle_Soup_Game/web/src/pages/GamePage.tsx) 保持使用 `askAI`）

## Impact
- Affected specs: 前后端分离、后端 AI 对话接口
- Affected code:
  - `web/src/services/api.ts`

## ADDED Requirements
### Requirement: Call Backend Chat API
系统 SHALL 在 `askAI()` 内调用后端接口 `POST http://localhost:3000/api/chat` 获取裁判回答。

#### Scenario: Success case
- **WHEN** `askAI(question, story)` 被调用且后端正常返回
- **THEN** 前端发起 `POST http://localhost:3000/api/chat`
- **THEN** 请求体为：
```json
{ "question": "string", "story": { "surface": "string", "bottom": "string" } }
```
- **THEN** 成功响应为 HTTP 200 且 JSON：
```json
{ "ok": true, "answer": "是|否|无关" }
```
- **THEN** `askAI()` resolve 为 `answer` 字符串

### Requirement: Network Error Handling
系统 SHALL 对网络错误提供用户可理解的错误信息（通过抛出 Error，让上层以“系统提示气泡”展示）。

#### Scenario: Connection refused / offline / timeout
- **WHEN** 请求失败（例如连接拒绝、断网、超时）
- **THEN** `askAI()` 抛出 `Error("网络异常，无法连接到后端服务")` 或等价文案

#### Scenario: Backend returns non-2xx
- **WHEN** 后端返回非 2xx
- **THEN** 若响应包含 `{ ok:false, message }` 则使用 message
- **THEN** 否则抛出 `Error("AI 服务异常（HTTP <status>）")`

#### Scenario: Backend returns invalid shape
- **WHEN** 响应不是预期 JSON 或缺失 `answer`
- **THEN** 抛出 `Error("AI 服务返回异常，请稍后重试")`

## MODIFIED Requirements
### Requirement: Keep Function Signature
系统 SHALL 保持 `askAI(question: string, story: TStory): Promise<string>` 不变，且继续对 question 做基础校验（空/过长）。

## REMOVED Requirements
### Requirement: Direct DeepSeek Call From Frontend
**Reason**: 密钥不应在前端持有或通过前端代理直连上游。
**Migration**: 前端改为调用 `http://localhost:3000/api/chat`。

