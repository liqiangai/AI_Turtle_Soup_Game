---
name: fix-env-and-api
overview: 修复前后端配置不一致和环境变量命名问题，并测试后端接口返回内容
todos:
  - id: fix-env-var
    content: 修改 api/src/server.ts 中 FRONTEND_ORIGINS 为 FRONTEND_ORIGIN（兼容复数形式）
    status: completed
  - id: build-deploy
    content: 构建后端并通过 lighthouse 部署到服务器，使用正确环境变量重启
    status: completed
    dependencies:
      - fix-env-var
  - id: test-api
    content: 通过 curl 测试 /api/test 和 /api/chat 接口，验证返回内容正确
    status: completed
    dependencies:
      - build-deploy
---

## 用户需求

### 1. 环境变量名不统一

- `api/.env` 和 `api/.env.example` 中定义的是 `FRONTEND_ORIGIN`（单数）
- `api/src/server.ts` 第95行读取的是 `process.env.FRONTEND_ORIGINS`（复数）
- 需要统一为 `FRONTEND_ORIGIN`（以 `.env` 文件为准）

### 2. 前端访问后端接口总是返回"无关"

- 之前部署时通过环境变量 `FRONTEND_ORIGINS` 设置了正确的 CORS 来源，现在统一后需要确保生产环境也能正常工作
- 需要在修改代码后通过 lighthouse 部署并测试后端接口返回内容是否正确（是/否/无关，而非总是"无关"）

## 技术方案

### Bug 1：环境变量 FRONTEND_ORIGINS vs FRONTEND_ORIGIN

- **修改文件**：`api/src/server.ts` 第95行
- **当前代码**：`process.env.FRONTEND_ORIGINS ?? "http://localhost:5173"` 按逗号分隔多 origin
- **修改为**：读取 `process.env.FRONTEND_ORIGIN`（单个 origin），保留逗号分隔能力以兼容旧配置
- **策略**：优先读 `FRONTEND_ORIGIN`（单数），若为空则 fallback 读 `FRONTEND_ORIGINS`（复数），最终 fallback 默认值 `http://localhost:5173`

### Bug 2：CORS 导致前端无法访问后端

- 修复环境变量名后，`.env` 中的 `FRONTEND_ORIGIN` 可被正确读取
- 部署时需通过环境变量设置生产环境 origin `http://101.43.98.2`

### 测试验证

- 修改代码后本地构建，通过 lighthouse 上传并重启后端服务
- 使用 curl 测试 `/api/test` 和 `/api/chat` 接口，验证：
- 健康检查正常
- 不同问题返回正确的是/否/无关（非总是"无关"）

## 关键代码修改

**api/src/server.ts 第94-98行**：

```typescript
// 修改前
const FRONTEND_ORIGINS: string[] = (process.env.FRONTEND_ORIGINS ?? "http://localhost:5173")
  .split(",")
  .map(normalizeOrigin)
  .filter((o) => o.length > 0);

// 修改后
const FRONTEND_ORIGINS: string[] = (
  process.env.FRONTEND_ORIGIN ?? process.env.FRONTEND_ORIGINS ?? "http://localhost:5173"
)
  .split(",")
  .map(normalizeOrigin)
  .filter((o) => o.length > 0);
```

**api/.env.example 第2行**：已经是 `FRONTEND_ORIGIN`，无需修改。

## 实施笔记

- 环境变量兼容处理：同时支持单数和复数形式，但日志输出应标注统一使用 `FRONTEND_ORIGIN`
- 部署重启后端时使用 `FRONTEND_ORIGIN=http://101.43.98.2` 环境变量
- 测试至少 3 个不同类型的问题（应回答"是"、"否"、"无关"），确认 DeepSeek 判定正常

## Agent Extensions

### Integration

- **lighthouse**
- Purpose: 上传修改后的后端代码到轻量服务器并重启服务
- Expected outcome: 后端服务在新环境下正常运行，CORS 配置正确