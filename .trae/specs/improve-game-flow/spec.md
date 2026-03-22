# 完善游戏流程 Spec

## Why
当前对局页的“查看汤底/结束游戏”语义与页面承接不一致，玩家中途退出/放弃缺少明确反馈；同时缺少对局状态（进行中/已结束）的统一管理，影响结果页展示与后续扩展（复盘、埋点、会话一致性）。

## What Changes
- 统一对局内两个关键动作的语义与跳转：
  - “查看汤底” → 进入 `/result` 并展示完整汤底（剧透揭晓）
  - “结束游戏” → 返回大厅 `/`（中途放弃，不进入结果页）
- 支持中途放弃游戏（从任意对局状态可触发，带二次确认避免误触）
- 引入最小可用的对局状态管理：
  - `in_progress` / `ended`
  - `endReason`（放弃/揭晓等）
  - 以 `sessionStorage` 为主的持久化与结果页数据承接（与现有 ResultPage 取数策略对齐）

## Impact
- Affected specs: 终局流程（PRD 3.3/3.4）、安全边界（Level 4 仅结果页展示）、交互低挫败（RESEARCH）
- Affected code:
  - web/src/pages/GamePage.tsx
  - web/src/pages/ResultPage.tsx
  - web/src/stores/uiStore.ts（如选择用 Zustand 承载状态）
  - web/src/types/domain.ts（如补充 endReason 类型）

## ADDED Requirements
### Requirement: Button Semantics
系统 SHALL 将对局页按钮语义固定为以下行为。

#### Scenario: 点击“查看汤底”
- **WHEN** 用户在 `/game/:id` 点击“查看汤底”
- **THEN** 二次确认提示“将结束本局并进入结果页揭晓完整汤底（剧透）”
- **THEN** 写入本局结果承接数据（至少：`storyId`、可选：`messages`、`endReason=reveal_bottom`、`gameStatus=ended`）
- **THEN** 跳转 `/result`，结果页展示故事标题与完整汤底

#### Scenario: 点击“结束游戏”
- **WHEN** 用户在 `/game/:id` 点击“结束游戏”
- **THEN** 二次确认提示“将返回大厅（可稍后再玩）”
- **THEN** 写入本局状态为结束（`gameStatus=ended`，`endReason=abandoned_by_user`）
- **THEN** 跳转 `/`（大厅）

### Requirement: Abandon Flow
系统 SHALL 支持玩家中途放弃游戏，并确保交互低挫败与可恢复。

#### Scenario: 放弃后再次进入对局
- **WHEN** 用户返回大厅后再次进入任意 `/game/:id`
- **THEN** 视为新一局（清理上一局 `gameStatus/endReason`），并正常开始对话

### Requirement: Game State Management (MVP)
系统 SHALL 在前端维护最小对局状态，用于驱动跳转、结果页承接与后续扩展。

#### State Model
- `gameStatus`: `"in_progress" | "ended"`
- `endReason`: `"abandoned_by_user" | "reveal_bottom" | "unknown"`
- `lastStoryId`: string
- `lastMessages`: TChatMessage[]（可选）

#### Storage Strategy
系统 SHALL 使用 `sessionStorage` 作为默认持久化手段：
- Key 建议：
  - `gameStatus`
  - `endReason`
  - `lastStoryId`
  - `lastMessages`

### Requirement: Result Page Safety
系统 SHALL 保持“完整汤底仅在 `/result` 展示”的边界。

#### Scenario: 对局页不展示完整汤底
- **WHEN** 用户在 `/game/:id`
- **THEN** 页面不展示 `story.bottom` 的完整文本
- **THEN** 若需要揭晓，必须通过“查看汤底”跳转 `/result`

## MODIFIED Requirements
### Requirement: Existing Navigation
系统 SHALL 保持路由结构不变（/、/game/:id、/result、/auth），仅调整按钮行为与数据承接方式。

## REMOVED Requirements
无

