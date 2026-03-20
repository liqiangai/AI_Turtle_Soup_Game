# AI海龟汤游戏开发指令

## 项目概述

本项目是一个面向移动端优先的 AI 海龟汤网站，定位为娱乐社交、单人对 AI。  
玩家通过提问推进剧情，系统支持渐进解锁汤底、自动板书、结果复盘，并使用 DeepSeek API 作为唯一 AI 提供方。

## 产品与技术边界

- 玩法定位：娱乐社交（轻松、节奏快、低挫败）
- 对局形态：单人对 AI
- 汤底策略：渐进解锁（Level 1-4），Level 4 前禁止返回完整汤底
- AI 提供商：仅使用 DeepSeek API
- 部署形态：Vercel（前端 + Serverless API）+ Vercel Postgres

## 技术栈约束

- 前端：React + TypeScript + Vite
- 样式：Tailwind CSS + Shadcn UI
- 路由：React Router
- 状态管理：React Query（服务端状态）+ Zustand（本地状态）
- 后端：Node.js + Express（运行在 Vercel Serverless Functions）
- 数据库：Vercel Postgres（PostgreSQL）
- 鉴权：JWT Access Token + Refresh Token

## 开发规范

- 使用 TypeScript，保证类型完备，避免 `any` 泛滥
- 使用函数式组件 + Hooks，组件职责单一、可复用
- 严格分层：页面层、组件层、服务层、数据访问层
- API 响应遵循统一结构：`code/message/data/requestId`
- 关键接口保持幂等：`unlock`、`end`、`submit`
- 同局必须“同问同答”，禁止临时修改汤底事实

## 代码风格

- 组件名：PascalCase
- 函数名：camelCase
- 常量：UPPER_SNAKE_CASE
- 类型名：以 `T` 前缀（如 `TSession`）
- 文件命名：组件 `PascalCase.tsx`，工具/服务 `camelCase.ts`

## 目录约定

- `src/pages`：页面级容器（Lobby/Game/Result/Auth）
- `src/components`：可复用 UI 组件（lobby/game/common）
- `src/services`：HTTP 与业务 API 调用
- `src/stores`：本地 UI 状态
- `api/modules`：后端模块（auth/puzzle/session/safety/ai）
- `api/db`：数据库连接、SQL 与查询逻辑

## 关键业务规则

- 回答枚举：是 / 否 / 无关 / 需要更具体 / 无法判断
- 渐进解锁：
  - Level 1：关键点列表
  - Level 2：单点揭示
  - Level 3：因果连接
  - Level 4：完整汤底
- 卡点推进：支持提示与引导，但不允许破坏事实口径
- 复盘输出：接近度、缺失方向、关键提问节点

## 安全与风控要求

- DeepSeek API Key、JWT Secret、数据库连接串仅使用环境变量
- 严禁在前端、日志、错误信息中泄露完整汤底
- 输入限制长度并做基础注入防护
- 敏感内容需预警并支持一键换题
- `/messages` 与 `/unlock` 必须限流并记录审计信息

## 鉴权与会话要求

- Access Token 短时效，Refresh Token 长时效
- 优先使用 HttpOnly Cookie 存储 Refresh Token
- 退出登录需使 Refresh Token 失效
- 受保护接口（收藏、用户信息、历史记录）必须校验登录态

## 性能与稳定性要求

- 随机开局返回汤面：P90 < 5 秒
- 问答接口：P90 < 5 秒
- 再来一局创建 Session：< 3 秒
- AI 调用失败重试最多 2 次，失败后返回标准错误码 `50301`

## 设计风格要求

- 视觉基调：神秘悬疑、深蓝色调
- 强调色：金色系
- 适配优先级：移动端优先，不为桌面端牺牲移动体验
- 交互重点：低挫败、可推进、可复盘

## 测试要求

- 单元测试：判定枚举映射、幂等逻辑、口径缓存命中
- 集成测试：auth 全流程、session 全流程、鉴权边界
- E2E 测试：新用户完整跑通开局→问答→解锁→结算
- 回归检查：同问同答一致率、汤底泄漏风险、限流策略生效

## 发布与运维要求

- 环境：development / preview / production
- 分支触发 preview，主分支自动发布 production
- 发布前必须完成核心回归：登录、开局、问答、解锁、结算
- 线上日志必须带 requestId，支持按 sessionId 追踪问题
