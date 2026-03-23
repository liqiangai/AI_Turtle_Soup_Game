# 部署到 Vercel（兼容性修复）Spec

## Why
当前仓库为 `web/`（Vite）+ `api/`（Express）双项目结构，仓库根目录没有可被 Vercel 自动识别的前端框架入口，且后端为常驻进程形态，容易触发 Vercel 的框架/构建/运行时兼容性问题。需要给出可落地的 Vercel 部署方案与必要的代码/配置调整。

## What Changes
- 提供 Vercel 部署策略（推荐双项目部署：Web 与 API 分开部署）
- Web：
  - 增加可配置的 API 基础地址（用于跨域部署时指向 API 的 Vercel 域名）
  - 保持默认同域 `/api/*` 仍可工作（便于本地开发 + 反向代理场景）
- API：
  - 提供 Vercel Serverless Functions 入口（替代 `app.listen` 常驻进程部署）
  - 保留现有本地/自建服务器运行方式不变
- 文档：
  - 在部署文档中补充 Vercel 部署步骤与环境变量清单（Web/API 各自）

## Impact
- Affected specs: 部署与运维
- Affected code:
  - `web/src/services/api.ts`（API Base URL）
  - `api/src/*` 或 `api/api/*`（Vercel Functions）
  - `DEPLOYMENT.md`（补充 Vercel 部署章节）

## ADDED Requirements
### Requirement: Vercel Web Deploy
系统 SHALL 支持将 `web/` 作为 Vercel 项目部署，且能在生产环境正确请求后端。

#### Scenario: Web talks to API on another domain
- **WHEN** 在 Vercel 为 Web 配置 `VITE_API_BASE_URL`
- **THEN** 前端请求 `/api/chat` 会改为请求 `${VITE_API_BASE_URL}/api/chat`

### Requirement: Vercel API Deploy
系统 SHALL 支持将后端以 Vercel Serverless Functions 形式部署（无常驻进程）。

#### Scenario: Chat endpoint
- **WHEN** 访问 `/api/chat`
- **THEN** 返回 `ok:true` 且 `answer` 为 `是/否/无关` 三选一（异常时返回 fallback）

### Requirement: Env Vars Documentation
系统 SHALL 明确列出 Vercel 部署所需的环境变量，并区分 Web 与 API。

## MODIFIED Requirements
无

## REMOVED Requirements
无

