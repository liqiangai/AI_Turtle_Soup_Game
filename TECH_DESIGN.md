# AI海龟汤游戏技术设计

## 1. 文档目标与范围

### 1.1 目标

本设计文档用于指导 AI 海龟汤游戏 MVP 的工程实现，确保开发、联调、测试、上线过程口径一致。

### 1.2 范围

- 覆盖范围：前端、后端 API、数据库、AI 调用、鉴权、风控、观测、部署
- 版本范围：MVP（对应 PRD 的 P0 + 必要工程保障）
- 对局形态：单人对 AI

### 1.3 设计原则

- 一致性优先：同局“同问同答”，禁止临时改汤底
- 体验优先：移动端优先、低挫败、卡点可推进
- 安全优先：汤底不外泄、密钥不下发、接口可限流
- 可运维优先：日志可追溯、错误码统一、故障可降级

***

## 2. 技术栈

- 前端：React + TypeScript + Vite
- 样式：Tailwind CSS + Shadcn UI
- 路由：React Router
- 状态管理：React Query（服务端状态）+ Zustand（本地 UI 状态）
- 后端：Node.js + Express（REST API，运行于 Vercel Serverless）
- 数据库：Vercel Postgres（PostgreSQL）
- 鉴权：JWT Access Token + Refresh Token
- AI：DeepSeek API（题目生成 + 裁判问答）
- 部署：Vercel（前端 + API）+ Vercel Postgres

***

## 3. 系统架构

### 3.1 架构概览

```text
[Web App (React)]
   | HTTPS (Bearer/Cookie)
   v
[API Layer (Express on Vercel Functions)]
   |-- Auth Module (JWT/Refresh)
   |-- Game Module (session/message/unlock/submit/end)
   |-- Puzzle Module (generate/random/detail/favorite)
   |-- Safety Module (内容预警/风控)
   |-- AI Gateway (DeepSeek, retry/fallback)
   v
[Vercel Postgres]
```

### 3.2 关键链路

- 开局链路：创建题目（或抽题）→ 创建 session → 返回 surface
- 问答链路：问题入库 → 语义归一化 → 按汤底判定 → 更新板书 → 返回答案
- 解锁链路：校验当前 level → 按层返回线索 → 持久化解锁进度
- 结算链路：提交还原文本 → 比对关键点覆盖度 → 生成复盘 → 终局入库

***

## 4. 项目结构

```text
AI_Turtle_Soup_Game/
├─ src/
│  ├─ app/
│  │  ├─ router.tsx
│  │  └─ providers.tsx
│  ├─ pages/
│  │  ├─ LobbyPage.tsx
│  │  ├─ GamePage.tsx
│  │  ├─ ResultPage.tsx
│  │  └─ AuthPage.tsx
│  ├─ components/
│  │  ├─ lobby/
│  │  │  └─ PuzzleCard.tsx
│  │  ├─ game/
│  │  │  ├─ SurfacePanel.tsx
│  │  │  ├─ ChatPanel.tsx
│  │  │  ├─BoardPanel.tsx
│  │  │  └─ UnlockPanel.tsx
│  │  └─ common/
│  │     ├─ Loading.tsx
│  │     └─ ErrorState.tsx
│  ├─ services/
│  │  ├─ httpClient.ts
│  │  ├─ authApi.ts
│  │  ├─ puzzleApi.ts
│  │  └─ sessionApi.ts
│  ├─ stores/
│  │  └─ uiStore.ts
│  ├─ hooks/
│  │  ├─ useSession.ts
│  │  ├─ useUnlock.ts
│  │  └─ useAuth.ts
│  ├─ types/
│  │  ├─ api.ts
│  │  └─ domain.ts
│  └─ main.tsx
├─ api/
│  ├─ index.ts
│  ├─ middlewares/
│  │  ├─ auth.ts
│  │  ├─ rateLimit.ts
│  │  ├─ requestId.ts
│  │  └─ errorHandler.ts
│  ├─ modules/
│  │  ├─ auth/
│  │  ├─ puzzle/
│  │  ├─ session/
│  │  ├─ safety/
│  │  └─ ai/
│  ├─ db/
│  │  ├─ client.ts
│  │  ├─ schema.sql
│  │  └─ queries/
│  └─ shared/
│     ├─ constants.ts
│     └─ response.ts
├─ docs/
│  ├─ PRD.md
│  ├─ RESEARCH.md
│  └─ TECH_DESIGN.md
└─ package.json
```

***

## 5. 数据模型设计

### 5.1 Puzzle（题目）

- id: uuid
- title: varchar(120)
- difficulty: enum('easy','medium','hard')
- tags: text[]
- content_warning: text | null
- surface: text
- bottom_key_points: jsonb
- bottom_timeline: jsonb
- bottom_facts: jsonb
- source_type: enum('ai_generated','seed')
- created_at: timestamptz

### 5.2 Session（对局）

- id: uuid
- user_id: uuid | null
- puzzle_id: uuid
- status: enum('active','completed','abandoned')
- unlock_level: int default 0
- hints_used: int default 0
- questions_count: int default 0
- board_confirmed: jsonb
- board_excluded: jsonb
- board_suspects: jsonb
- version: int default 0
- started_at: timestamptz
- completed_at: timestamptz | null

### 5.3 SessionMessage（对话）

- id: uuid
- session_id: uuid
- role: enum('player','ai')
- content: text
- answer_type: enum('yes','no','irrelevant','need_specific','unknown') | null
- normalized_question: text | null
- rationale_summary: text | null
- created_at: timestamptz

### 5.4 User（用户）

- id: uuid
- email: varchar(200) unique
- password_hash: text
- nickname: varchar(60)
- avatar: text | null
- created_at: timestamptz

### 5.5 UserFavorite（收藏）

- user_id: uuid
- puzzle_id: uuid
- created_at: timestamptz
- unique(user_id, puzzle_id)

### 5.6 索引建议

- sessions(user_id, started_at desc)
- sessions(puzzle_id)
- session_messages(session_id, created_at)
- puzzles(difficulty, created_at desc)
- puzzles using gin(tags)

***

## 6. API 设计

### 6.1 统一响应格式

```json
{
  "code": 0,
  "message": "ok",
  "data": {},
  "requestId": "req_xxx"
}
```

### 6.2 鉴权接口

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- GET /api/users/me
- GET /api/users/me/favorites

### 6.3 题目接口

- POST /api/puzzles
- GET /api/puzzles/random
- GET /api/puzzles/:id
- POST /api/puzzles/:id/favorite

### 6.4 对局接口

- POST /api/sessions
- GET /api/sessions/:id
- POST /api/sessions/:id/messages
- POST /api/sessions/:id/unlock
- POST /api/sessions/:id/submit
- POST /api/sessions/:id/end

### 6.5 错误码

- 40001 参数错误
- 40101 未登录或令牌无效
- 40301 无权限访问
- 40401 资源不存在
- 40901 状态冲突
- 42901 请求过于频繁
- 50001 服务内部错误
- 50301 AI 服务暂不可用

### 6.6 幂等策略

- /sessions/:id/unlock：同层重复返回相同结果
- /sessions/:id/end：重复调用返回当前终态
- /sessions/:id/submit：支持 clientRequestId 防重

***

## 7. AI 设计

### 7.1 模块划分

- Puzzle Generator：生成 surface + 结构化 bottom
- Referee Judge：基于 bottom 对玩家问题判定
- Board Summarizer：更新 confirmed/excluded/suspects
- Result Reviewer：评估提交还原覆盖率并生成复盘

### 7.2 裁判判定 Prompt（模板）

```text
你是海龟汤主持人，只能依据“本局汤底”判定，不得新增设定。

【汤面】
{surface}

【汤底结构】
- keyPoints: {keyPoints}
- timeline: {timeline}
- facts: {facts}

【历史已确认口径】
{historyFacts}

【玩家问题】
{question}

请仅输出 JSON：
{
  "answerType": "是|否|无关|需要更具体|无法判断",
  "reply": "面向玩家的短回复（1句）",
  "normalizedQuestion": "归一化问题",
  "rationaleSummary": "不泄底的内部依据摘要（20字内）"
}
```

### 7.3 同问同答策略

- 先基于 normalizedQuestion 在同 session 检索最近 N 轮
- 若命中且语义等价，直接返回历史 answerType 与 reply
- 仅在未命中时调用模型，调用后写入“口径缓存”

### 7.4 失败降级

- AI 超时/5xx：重试最多 2 次（指数退避）
- 连续失败：返回 50301 + 友好提示（可重试或换题）
- 降级模式：仅保留“是/否/无关/无法判断”硬回复

***

## 8. 安全与风控

### 8.1 汤底防泄漏

- Level 4 之前，API 不返回完整 bottom 文本
- 日志只记 key point 标题，不记完整因果链
- 前端本地缓存不保存完整汤底

### 8.2 鉴权安全

- Access Token 短时效，Refresh Token 长时效
- 优先 HttpOnly Cookie 存储 Refresh Token
- 密钥通过环境变量管理，禁止硬编码

### 8.3 输入与内容风控

- 输入长度限制（如 500 字）
- 基础注入防护（参数化查询）
- 敏感内容检测 + 题目预警标签
- 一键换题始终可用

### 8.4 频控策略

- 登录用户：/messages 每分钟 20 次
- 游客 IP：/messages 每分钟 10 次
- /unlock 独立限流，防止刷解锁接口

***

## 9. 性能与可观测性

### 9.1 性能目标

- 随机开局返回汤面：P90 < 5 秒
- 问答接口：P90 < 5 秒
- 再来一局创建 session：< 3 秒

### 9.2 观测指标

- 开局成功率、问答成功率、结算成功率
- 同问同答一致率
- 卡住率（连续3次无关/无法判断）
- 提示使用率、通关率、退出点分布
- AI 调用失败率、平均重试次数

### 9.3 日志规范

- 每请求带 requestId
- 关键操作日志：createSession/sendMessage/unlock/submit/end
- 错误日志包含：errorCode、requestId、sessionId（若有）

***

## 10. 部署与配置

### 10.1 环境

- development：本地联调
- preview：PR 自动预览
- production：线上环境

### 10.2 环境变量（示例）

- DATABASE_URL
- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- DEEPSEEK_API_KEY
- DEEPSEEK_BASE_URL
- RATE_LIMIT_USER_PER_MIN
- RATE_LIMIT_GUEST_PER_MIN

### 10.3 发布流程

- 提交代码到分支 → 生成 Preview
- 通过基础回归（登录、开局、问答、解锁、结算）
- 合并主分支自动发布 Production

***

## 11. 测试策略

### 11.1 单元测试

- 判定映射逻辑（answerType 枚举）
- 幂等逻辑（unlock/end/submit）
- 口径缓存命中与回放

### 11.2 集成测试

- auth 全流程（register/login/refresh/logout）
- session 全流程（create/message/unlock/submit/end）
- 未登录访问受保护接口返回 40101

### 11.3 E2E 测试（移动端优先）

- 新用户注册并完成一局
- 卡住后使用渐进解锁到 Level 2
- 提交还原并进入结果页

***

## 12. MVP 里程碑

### M1：工程骨架

- 前后端脚手架、数据库连通、基础鉴权

### M2：核心玩法闭环

- 开局、问答、板书、解锁、结算全链路可跑通

### M3：上线保障

- 限流、错误码、日志、回归测试、发布到 production

***

## 13. 风险与应对

- AI 回答波动导致不一致：引入口径缓存 + 归一化 + 历史优先
- Serverless 冷启动带来延迟：缓存热点题目，缩短首包内容
- 内容风险：预警分级 + 一键换题 + 生成约束
- 高频刷接口：分角色限流 + 行为审计 + 异常告警

***

## 14. 与 PRD/RESEARCH 对齐说明

- 已对齐“娱乐社交、单人对AI、渐进解锁汤底、移动端优先”
- 已对齐“Vercel + Vercel Postgres + Node.js/Express + DeepSeek”
- 已覆盖 P0 验收的工程实现路径与可测试策略
