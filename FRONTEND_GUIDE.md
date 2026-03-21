# 前端框架手册（React + TypeScript + Vite + Tailwind）

本手册面向新加入项目的同事，帮助快速理解本项目的前端技术栈、目录结构与开发规范。

## 1. 技术栈与定位

- React + TypeScript：组件化 UI + 类型安全
- Vite：开发/构建工具（dev 快、配置轻）
- Tailwind CSS：原子化样式体系（快速实现深色悬疑风格）
- Shadcn UI：后续可按需引入组件（当前未强依赖具体组件）
- React Router：页面路由
- React Query / Zustand：分别管理服务端状态与本地 UI 状态（当前为骨架，后续逐步落地）

产品定位与约束来自：
- [AGENTS.md](file:///d:/workspace_ai/AI_Turtle_Soup_Game/AGENTS.md)
- [PRD.md](file:///d:/workspace_ai/AI_Turtle_Soup_Game/PRD.md)
- [TECH_DESIGN.md](file:///d:/workspace_ai/AI_Turtle_Soup_Game/TECH_DESIGN.md)

## 2. 目录结构（web/src）

当前前端工程位于 `web/`：

- `src/main.tsx`：应用入口（挂载 Providers 与 Router）
- `src/App.tsx`：应用外壳 Layout（导航 + Outlet）
- `src/app/router.tsx`：路由配置（/、/game、/result、/auth）
- `src/app/providers.tsx`：全局 Provider 聚合（未来放 React Query Provider 等）
- `src/pages/*`：页面级组件（当前占位）
- `src/components/common/*`：通用 UI 组件（Loading/ErrorState）
- `src/services/*`：HTTP 与业务 API 封装（当前提供 getJson）
- `src/stores/*`：本地 UI 状态（Zustand 规划占位）
- `src/types/*`：领域类型与 API 类型定义

## 3. 本地运行与常用命令

在 Windows PowerShell 下：

```powershell
cd d:\workspace_ai\AI_Turtle_Soup_Game\web
npm install
npm run dev
```

其他常用命令：

```powershell
npm run build
npm run preview
```

## 4. 路由（React Router）

路由集中在：
- [router.tsx](file:///d:/workspace_ai/AI_Turtle_Soup_Game/web/src/app/router.tsx)

当前页面路径：
- `/`：大厅（LobbyPage）
- `/game`：对局（GamePage）
- `/result`：结算（ResultPage）
- `/auth`：登录/注册（AuthPage）

扩展新页面建议流程：
1. 在 `src/pages` 新建 `XxxPage.tsx`
2. 在 `src/app/router.tsx` 增加路由项
3. 如需导航入口，在 `src/App.tsx` 增加 `Link`

## 5. 样式（Tailwind CSS）

Tailwind 配置文件：
- [tailwind.config.js](file:///d:/workspace_ai/AI_Turtle_Soup_Game/web/tailwind.config.js)
- [postcss.config.js](file:///d:/workspace_ai/AI_Turtle_Soup_Game/web/postcss.config.js)

全局样式入口：
- [index.css](file:///d:/workspace_ai/AI_Turtle_Soup_Game/web/src/index.css)

设计基调（来自 AGENTS/PRD）：
- 深蓝背景：`bg-slate-900`
- 金色强调：`text-amber-400`
- 圆角：`rounded-lg`
- 阴影：`shadow-lg`

## 6. 状态管理（规划）

### 6.1 React Query（服务端状态）

适合管理：
- 题目列表/随机题目请求
- session 创建、问答、解锁、提交还原、结算等请求

建议实践：
- queryKey 统一命名（如 `["session", sessionId]`）
- mutation 统一处理错误码（code != 0）

### 6.2 Zustand（本地 UI 状态）

适合管理：
- UI 展开/收起、弹窗、toast、主题等纯前端状态

当前占位文件：
- [uiStore.ts](file:///d:/workspace_ai/AI_Turtle_Soup_Game/web/src/stores/uiStore.ts)

## 7. 与后端 API 的约定

统一响应结构（前后端一致）：

```ts
type TApiResponse<T> = {
  code: number;
  message: string;
  data: T;
  requestId: string;
};
```

相关类型：
- [types/api.ts](file:///d:/workspace_ai/AI_Turtle_Soup_Game/web/src/types/api.ts)
- [services/httpClient.ts](file:///d:/workspace_ai/AI_Turtle_Soup_Game/web/src/services/httpClient.ts)

## 8. 安全要点（必须遵守）

- DeepSeek API Key 只能放在服务端环境变量，前端严禁出现密钥
- 汤底属于敏感数据：Level 4 之前前端不得获取完整汤底
- 日志/报错信息不得包含完整汤底或可反推出汤底的文本
- 对外分享内容不包含剧透信息

## 9. 新手任务清单（建议按这个顺序）

1. 跑起来：`npm run dev`，确认 `/`、`/game`、`/result`、`/auth` 可打开
2. 看一遍三份文档：AGENTS/PRD/TECH_DESIGN
3. 学会改一页：改 LobbyPage 的 UI 并保持 Tailwind 风格一致
4. 学会加路由：新增一个页面并加入导航
5. 学会调接口：用 `services/httpClient.ts` 写一个简单 GET 请求并渲染结果

