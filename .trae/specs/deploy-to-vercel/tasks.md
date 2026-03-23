# Tasks

- [x] Task 1: 梳理 Vercel 部署方案与目录策略
  - [x] 明确采用“双项目部署”：Web（Root=web）与 API（Root=api）
  - [x] 给出在 Vercel 控制台中需要设置的 Build/Output/Install 关键项

- [x] Task 2: Web 支持可配置 API Base URL
  - [x] 在 `web` 中增加 `VITE_API_BASE_URL`（可选）并用于拼接 `/api/*`
  - [x] 保持默认行为不变（未配置时仍请求同域 `/api/*`）

- [x] Task 3: API 提供 Vercel Functions 入口
  - [x] 增加 `api/api/test` 与 `api/api/chat` serverless handler（复用现有逻辑/校验/Prompt/Fallback）
  - [x] 避免常驻 `listen` 依赖（Vercel 环境不需要 PORT）

- [x] Task 4: 更新部署文档（Vercel）
  - [x] 在 `DEPLOYMENT.md` 增加 Vercel 部署章节（Web/API 分别说明）
  - [x] 整理 Vercel 环境变量清单（Web/API 分别列出）

- [x] Task 5: 验证与回归
  - [x] `web`：`npm run build` 通过
  - [x] `api`：`npm run build` 通过
  - [x] 本地模拟：Web 指向 API base URL 时请求正确（最小验证）

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1
- Task 5 depends on Task 2-4
