# 部署文档（Web + API）

本仓库包含两部分：
- `web/`：前端（Vite 构建产物在 `web/dist/`）
- `api/`：后端（Express，运行入口 `api/server.js`）

## Vercel 部署（双项目：Web Root=web，API Root=api）

本仓库建议采用 Vercel 的“双项目部署”方式：同一个 Git 仓库在 Vercel 中创建两个 Project，分别部署 `web/` 与 `api/`。这样可以让前后端各自独立构建、独立配置环境变量与域名。

### 1) Web 项目（前端静态站点）

在 Vercel 控制台创建/导入 Project（指向本仓库）后，关键设置建议如下：

- Root Directory：`web`
- Install Command：`npm ci`
- Build Command：`npm run build`
- Output Directory：`dist`

补充要点：
- React Router（SPA）深链路（例如 `/game`）需要回落到 `index.html`。建议在 Vercel Web 项目配置 Rewrites（见下文）。
- Node.js 版本建议选择 18+（与 Vite/TS 生态一致）。

### 2) API 项目（Vercel Functions）

在 Vercel 控制台再创建一个 Project（同样指向本仓库），关键设置建议如下：

- Root Directory：`api`
- Install Command：`npm ci`
- Build Command：`npm run build`（可选但推荐：用于 TS 校验与产物准备）
- Output Directory：留空

补充要点：
- Vercel 不适合运行常驻 `app.listen(PORT)` 的 Node 服务器；推荐提供 Serverless Functions 入口文件。
- 当 Root Directory 为 `api` 时，Functions 目录应为 `api/api/*`（例如 `api/api/chat.ts`、`api/api/test.ts`），路径会映射为 `/api/chat`、`/api/test`。

### 3) Web 与 API 的联通策略（同域 `/api/*` 推荐）

前端当前默认请求相对路径：`/api/*`。在“双项目部署”下，为了保持同域体验（避免浏览器跨域与 CORS 复杂度），推荐在 Web 项目使用 Rewrites 反向代理到 API 项目：

- Rewrite 1（API 代理）：`/api/:path*` → `https://<你的 API Project 域名>/api/:path*`
- Rewrite 2（SPA 回落）：`/:path*` → `/index.html`

注意事项：
- Rewrites 的顺序很重要：必须先匹配 `/api/*`，再做 SPA 回落，否则会导致 `/api/*` 被错误地重写到 `index.html`。
- 若你选择使用独立的 API 域名（例如 `https://api.example.com`），则前端需要支持可配置 API Base URL（可通过 `VITE_API_BASE_URL`，见下文环境变量清单），同时 API 需要正确配置 `FRONTEND_ORIGIN` 以允许跨域请求。

### 4) Vercel 环境变量清单（Web / API 分开配置）

#### Web（Root=web）

| 变量名 | 必填 | 默认值 | 作用 | 建议范围 |
| --- | --- | --- | --- | --- |
| `VITE_API_BASE_URL` | 否 | 空（同域 `/api/*`） | 指定 API 基础地址（例如 `https://api.example.com`），用于跨域部署场景 | Preview/Production（按需） |

说明：
- 前端默认同域请求 `/api/*`；当配置 `VITE_API_BASE_URL` 时，将把请求改为 `{VITE_API_BASE_URL}/api/*`（用于跨域部署）。

#### API（Root=api）

| 变量名 | 必填 | 默认值 | 作用 | 风险/建议 |
| --- | --- | --- | --- | --- |
| `DEEPSEEK_API_KEY` | 是 | 无 | DeepSeek 上游鉴权 Key（仅后端持有） | 机密信息，严禁在前端或日志中泄露 |
| `DEEPSEEK_BASE_URL` | 否 | `https://api.deepseek.com/v1` | DeepSeek API 基础地址 | 通常无需改动 |
| `DEEPSEEK_MODEL` | 否 | `deepseek-chat` | DeepSeek 模型名 | 按需调整 |
| `FRONTEND_ORIGIN` | 否（强烈建议） | `http://localhost:5173` | 允许的前端 Origin（用于 CORS 校验） | 建议设置为 Web 项目的线上域名；Preview 环境如需联调需同步更新 |
| `ENABLE_DEEPSEEK_MOCK` | 否 | `0` | 启用 mock 上游（仅开发/测试） | 生产环境不要启用 |
| `ENABLE_DEBUG_ENDPOINTS` | 否 | `0` | 启用调试接口（仅开发/测试） | 生产环境不要启用 |

## 前端准备（web）

### 1) 安装依赖

在 `web/` 目录执行：

```bash
npm ci
```

### 2) 确保构建成功

在 `web/` 目录执行：

```bash
npm run build
```

成功标志：命令退出码为 `0`，并生成 `web/dist/`。

### 3) 检查 `dist` 文件夹

构建后确认以下内容存在：
- `web/dist/index.html`
- `web/dist/assets/`（包含 `*.js`、`*.css`）
- `web/dist/favicon.svg`、`web/dist/icons.svg`

说明：`dist/assets/` 文件名带 hash（例如 `index-xxxxx.js`），属于正常现象。

### 4) 产物发布方式

将 `web/dist/` 作为静态站点根目录发布（任意静态文件服务器/CDN 均可）。

注意：前端通过相对路径请求后端：`/api/*`。
因此生产环境通常需要：
- **同域部署**（推荐）：`https://your-domain.com/` 提供前端静态资源，同时将 `/api/*` 反向代理到后端；或
- **跨域部署**：需要在后端配置 `FRONTEND_ORIGIN` 为前端域名，并在前端侧配置 `VITE_API_BASE_URL` 为后端完整域名。

## 后端准备（api）

### 1) 安装依赖

在 `api/` 目录执行：

```bash
npm ci
```

### 2) 整理环境变量

后端支持从环境变量读取配置。示例文件：`api/.env.example`。

必需/常用变量：
- `DEEPSEEK_API_KEY`：DeepSeek API Key（生产必须配置）
- `FRONTEND_ORIGIN`：允许的前端 Origin（默认 `http://localhost:5173`）

本地/自建服务器部署常用变量：
- `PORT`：服务端口（默认 `3000`）

可选变量：
- `DEEPSEEK_BASE_URL`：DeepSeek API 基础地址（默认 `https://api.deepseek.com/v1`）
- `DEEPSEEK_MODEL`：模型名（默认 `deepseek-chat`）
- `ENABLE_DEEPSEEK_MOCK=1`：启用 mock 上游（仅开发/测试）
- `ENABLE_DEBUG_ENDPOINTS=1`：启用调试接口（仅开发/测试）

部署建议：
- 不要在前端暴露 `DEEPSEEK_API_KEY`；只在后端环境变量中配置。
- 生产环境不要启用 `ENABLE_DEBUG_ENDPOINTS`。

### 3) 确保能正常运行

#### 构建（可选）

在 `api/` 目录执行：

```bash
npm run build
```

#### 启动

在 `api/` 目录执行：

```bash
npm run start
```

启动成功后，检查：
- `GET /api/test` 返回 `{"ok":true}`
- `GET /api/docs` 返回 OpenAPI 地址信息

### 4) 反向代理（推荐）

生产环境建议把 `web` 与 `api` 放到同一域名下，通过反向代理把 `/api/*` 转发到后端。

最低要求：
- 代理 `/api/` 到 `http://127.0.0.1:<PORT>/api/`
- 保留响应头 `x-request-id`

## 发布前检查清单

- 前端：`web/` 下 `npm run build` 成功，且 `web/dist/` 完整
- 后端：`api/` 下 `npm run start` 可启动；`/api/test` 可访问
- 环境变量：生产已配置 `DEEPSEEK_API_KEY` 与正确的 `FRONTEND_ORIGIN`
- 联调：前端页面能正常请求 `/api/chat` 并拿到 `是/否/无关`
