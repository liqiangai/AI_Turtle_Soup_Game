# 初始化 Node.js + Express 后端 Spec

## Why
当前项目只有前端（React/Vite）与本地数据/前端直连 AI 的实现方式；为了实现“密钥不下发、可持久化、可统一错误码/限流/审计”的后续能力，需要一个可独立运行的后端服务。

## What Changes
- 新增一个独立的后端项目目录 `api/`（与 `web/` 并列），包含自己的 `package.json`
- 使用 Express 创建基础 HTTP Server，并通过 CORS 允许前端访问
- 提供测试接口 `GET /api/test`，用于确认前后端连通与部署基础可用
- 提供本地启动脚本（dev/start）与最小配置（端口、允许的前端 Origin）

## Impact
- Affected specs: 前后端分离、后端技术方案（Express）、部署形态（Vercel Serverless / Railway）
- Affected code (to be added):
  - `api/package.json`
  - `api/src/server.ts`（或 `server.js`，由实现阶段确定）
  - `api/.env.example`

## ADDED Requirements
### Requirement: Backend Project Bootstrap
系统 SHALL 在仓库根目录下新增 `api/` 后端项目，并可通过命令安装依赖与启动服务。

#### Scenario: 初始化与安装依赖
- **WHEN** 开发者在 `api/` 目录执行依赖安装
- **THEN** 项目包含 `express`、`cors`（以及必要的 TypeScript/开发依赖，若采用 TS）

#### Scenario: 正常启动
- **WHEN** 开发者执行启动命令（dev/start）
- **THEN** 服务监听在 `PORT`（默认 3001），启动无报错

### Requirement: CORS Allow Frontend Access
系统 SHALL 配置 CORS，允许前端在本地开发环境访问后端 API。

#### Scenario: 默认允许的 Origin
- **WHEN** 未配置 `FRONTEND_ORIGIN`
- **THEN** 默认允许 `http://localhost:5173` 访问

#### Scenario: 自定义 Origin
- **WHEN** 设置 `FRONTEND_ORIGIN`
- **THEN** CORS 仅允许该 origin 访问

### Requirement: Test Endpoint
系统 SHALL 提供 `GET /api/test` 测试接口。

#### Scenario: 请求成功
- **WHEN** 客户端请求 `GET /api/test`
- **THEN** 返回 HTTP 200
- **THEN** 返回 JSON（至少包含 `ok: true` 或等价字段）
- **THEN** 响应包含正确的 CORS Header（在允许 Origin 下）

## MODIFIED Requirements
无

## REMOVED Requirements
无

