# 体验与可观测性优化 Spec

## Why
当前前后端功能已跑通，但在加载态、错误提示、移动端适配与后端可观测性（日志/错误一致性/接口文档）上还不够完善，影响使用体验与排障效率。

## What Changes
### 前端优化
- 添加加载状态管理：对关键异步流程（如 AI 提问、提交还原、解锁线索）提供一致的 pending/disabled/反馈展示
- 优化错误提示：将技术性错误转为用户可理解信息，避免长文本/HTML 直接展示；错误展示样式统一
- 添加更多交互动画：增强页面与聊天消息的进入/状态切换动画，保持不影响性能
- 优化移动端适配：统一窄屏下的布局节奏（标题/摘要/消息气泡换行与截断规则、safe-area、滚动区域）

### 后端优化
- 添加请求日志：记录 method/path/status/duration/requestId 等，便于定位问题
- 优化错误处理：统一错误响应结构，避免默认 HTML 错误页；对非预期异常提供兜底与 requestId
- 添加接口文档：提供可访问的 API 文档入口（至少包含 `/api/chat`、`/api/test` 的请求/响应示例）

## Impact
- Affected specs: MVP 体验打磨、调试/运维可观测性
- Affected code:
  - `web/src/pages/GamePage.tsx`
  - `web/src/components/game/*`
  - `web/src/services/api.ts`
  - `api/src/server.ts`（或对应后端入口与中间件）

## ADDED Requirements
### Requirement: Frontend Loading States
系统 SHALL 在关键异步交互期间提供可见的加载状态，并避免重复提交。

#### Scenario: Ask AI
- **WHEN** 用户发送提问且请求进行中
- **THEN** 输入框与发送按钮进入禁用态并展示“AI 思考中…”
- **THEN** 请求完成后恢复可输入状态

### Requirement: User-Friendly Error Presentation
系统 SHALL 将错误提示统一为用户可理解信息，不直接展示 HTML/堆栈/原始响应体。

#### Scenario: Network / Server Error
- **WHEN** 网络异常、后端非 2xx、或响应结构异常
- **THEN** UI 以统一样式展示简短错误信息（例如“网络异常，请稍后重试”）

### Requirement: Mobile Layout Consistency
系统 SHALL 在移动端维持故事详情页与聊天区布局一致性，不因标题/摘要/消息文本长度造成布局抖动或被裁切。

#### Scenario: Long title / long surface / long message
- **WHEN** 标题或文本很长
- **THEN** 标题与摘要按统一规则截断或限行
- **THEN** 消息气泡文本可换行，不出现右侧硬裁切

### Requirement: Request Logging
系统 SHALL 为每个请求生成或透传 `requestId` 并输出结构化请求日志。

#### Scenario: Normal request
- **WHEN** 请求完成
- **THEN** 日志包含 `requestId`、method、path、status、durationMs

### Requirement: Consistent Error Responses
系统 SHALL 统一后端错误响应结构为 JSON，并避免默认 HTML 错误页。

#### Scenario: Unhandled exception
- **WHEN** 后端发生未捕获异常
- **THEN** 返回 `HTTP 500` 与 `{ ok:false, message, requestId }`

### Requirement: API Documentation
系统 SHALL 提供接口文档入口，描述主要接口、参数与返回结构。

#### Scenario: Access docs
- **WHEN** 访问文档入口（例如 `/api/docs` 或 `/api/openapi.json`）
- **THEN** 可查看 `/api/chat` 与 `/api/test` 的说明与示例

## MODIFIED Requirements
无

## REMOVED Requirements
无

