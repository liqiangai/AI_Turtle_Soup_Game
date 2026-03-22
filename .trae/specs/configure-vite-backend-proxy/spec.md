# 配置 Vite 代理到后端 Spec

## Why
当前开发环境前端（Vite）与后端（Express）分别运行在不同端口，浏览器会产生跨域限制与预检请求；通过 Vite Dev Server 代理 `/api/*` 到后端，可以让前端以同源方式调用后端，避免开发环境跨域问题。

## What Changes
- 修改 `web/vite.config.ts`：
  - 配置 `/api` 代理到后端服务（默认 `http://localhost:3000`）
  - 代理保持路径不变（例如 `/api/chat` → 后端 `/api/chat`）
  - （可选）移除开发环境直连上游 AI 的 `/api/ask` 代理（避免前端持有上游 Key）
- 修改 `web/src/services/api.ts`：
  - 将 `askAI()` 的请求地址改为相对路径 `/api/chat`，通过 Vite 代理转发到后端
  - 保持函数签名不变，保留现有输入校验与错误处理

## Impact
- Affected specs: 前后端分离、后端 AI 对话接口
- Affected code:
  - `web/vite.config.ts`
  - `web/src/services/api.ts`

## ADDED Requirements
### Requirement: Vite API Proxy
系统 SHALL 在开发环境下把前端对 `/api/*` 的请求代理到后端服务。

#### Scenario: Proxy chat endpoint
- **WHEN** 前端请求 `POST /api/chat`
- **THEN** Vite 将请求代理到 `http://localhost:3000/api/chat`

### Requirement: Frontend Uses Relative API Path
系统 SHALL 在 `askAI()` 中使用相对路径调用后端（`/api/chat`），以便由 Vite 代理解决跨域。

#### Scenario: Success
- **WHEN** `askAI()` 调用成功
- **THEN** 浏览器发起同源请求到 `http://localhost:<vite-port>/api/chat`
- **THEN** Vite 将其转发到后端并返回结果

## MODIFIED Requirements
无

## REMOVED Requirements
无

