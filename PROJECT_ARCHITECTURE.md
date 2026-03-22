# 项目架构图（前后端分离）

本文件用于打卡：画出项目架构图，并帮助理解“为什么需要后端”。

## 架构图（Mermaid）

```mermaid
flowchart TB
  subgraph Browser["浏览器（Web App）"]
    UI["React + TypeScript + Vite + Tailwind\n路由：/  /game/:id  /result  /auth"]
  end

  subgraph Backend["后端 API（Express / Node.js）"]
    API["REST API：/api/auth /api/puzzles /api/sessions"]
    MW["中间件：requestId / rateLimit / errorHandler"]
    AIGW["AI Gateway：DeepSeek 调用 + 重试/降级"]
    API --> MW
    API --> AIGW
  end

  subgraph Deploy["部署形态"]
    Vercel["Vercel（Serverless Functions）"]
    Railway["Railway（常驻 Service）"]
  end

  subgraph Data["数据层"]
    DB["PostgreSQL（Vercel Postgres 等）"]
  end

  subgraph ThirdParty["第三方服务"]
    DeepSeek["DeepSeek API"]
  end

  UI -->|"HTTPS 请求 /api/..."| API
  Backend -.->|"部署到"| Vercel
  Backend -.->|"或部署到"| Railway
  API -->|"读写"| DB
  AIGW -->|"仅后端持有密钥"| DeepSeek
```

## 架构图（纯文本）

```text
[浏览器 Web App]
  React + TypeScript + Vite + Tailwind
  路由：/  /game/:id  /result  /auth
          |
          | HTTPS 请求（/api/...）
          v
[后端 API（Express）]
  部署：Vercel Serverless Functions 或 Railway
  模块：auth / puzzle / session / ai gateway
  中间件：requestId / rateLimit / errorHandler
          |
          | 数据读写
          v
[数据库：PostgreSQL]
          |
          | 第三方调用（密钥仅在后端）
          v
[DeepSeek API]
```

## 核心流程图（游戏流程）

```mermaid
flowchart TD
  A[进入首页 /] --> B[选择故事]
  B --> C[进入对局 /game/:id]

  C --> D[提问（是/否/无关）]
  D --> E[调用 AI /api/ask]
  E --> F[追加 AI 回复到消息流]
  F --> D

  C --> G[查看线索（Level +1，最多 3）]
  G --> H[展示关键点标题列表]
  H --> C

  C --> I[提交还原]
  I --> J{判定通关？}
  J -- 否 --> K[提示缺失方向\n继续推理]
  K --> C
  J -- 是 --> R[进入结果页 /result\n展示汤底 + 庆祝动画]

  C --> L[查看汤底（剧透）]
  L --> R

  C --> M[结束游戏（放弃）]
  M --> A
```

## 核心流程图（前后端请求链路）

```mermaid
sequenceDiagram
  autonumber
  participant U as 用户
  participant W as Web 前端（React）
  participant S as 后端 API（Express）
  participant D as DB（PostgreSQL）
  participant AI as DeepSeek

  U->>W: 输入问题并发送
  W->>S: POST /api/sessions/:id/messages（或 /api/ask）
  S->>D: 读取 session & 汤底结构 / 解锁进度
  S->>AI: 调用 DeepSeek（仅后端持有密钥）
  AI-->>S: 返回裁判答案（是/否/无关等）
  S->>D: 写入消息记录 / 更新板书 / 更新计数
  S-->>W: 返回标准响应 code/message/data/requestId
  W-->>U: 渲染 AI 回复、更新进度条
```

## 为什么需要后端（简要）

- 保护密钥：DeepSeek API Key 只能放服务端，不能暴露给前端
- 规则一致性：同局同问同答、解锁层级、结算原因等需要服务端统一口径
- 防剧透：完整汤底 Level 4 只能在结算页展示，应由后端控制下发
- 持久化：用户、对局、收藏、复盘、统计等需要数据库与 API
- 稳定与风控：统一错误码、限流、审计日志、内容预警更适合在后端实现
