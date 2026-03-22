## 1.Architecture design
```mermaid
graph TD
  A["用户浏览器（移动端优先）"] --> B["React 前端应用"]
  B --> C["Vercel Serverless API（Express）"]
  C --> D["Vercel Postgres（PostgreSQL）"]
  C --> E["DeepSeek API"]

  subgraph "Frontend Layer"
    B
  end

  subgraph "Backend Layer"
    C
  end

  subgraph "Data Layer"
    D
  end

  subgraph "External Services"
    E
  end
```

## 2.Technology Description
- Frontend: React + TypeScript + vite + tailwindcss + shadcn/ui + react-router
- State: React Query（服务端状态）+ Zustand（本地 UI 状态）
- Backend: Node.js + Express（Vercel Serverless Functions）
- Database: Vercel Postgres（PostgreSQL）
- Auth: JWT Access Token + Refresh Token（优先 HttpOnly Cookie）

## 3.Route definitions
| Route | Purpose |
|-------|---------|
| / | 首页/对局大厅（本次 UI 改版重点） |
| /game/:id | 对局进行页（视觉规范对齐） |
| /result | 结算/复盘页（视觉规范对齐） |
| /auth | 登录页（视觉规范对齐） |

## 4.API definitions (If it includes backend services)
本次为 UI 改版，不新增 API；仅要求前端样式与组件层抽象更清晰（例如 Header、容器、卡片、按钮状态）。

## 5.Server architecture diagram (If it includes backend services)
```mermaid
graph TD
  A["前端（React）"] --> B["API Router（Express）"]
  B --> C["Service Layer（业务）"]
  C --> D["Repository Layer（DB 查询）"]
  D --> E["Vercel Postgres"]
  C --> F["DeepSeek API"]

  subgraph "Serverless（Vercel）"
    B
    C
    D
  end
```
