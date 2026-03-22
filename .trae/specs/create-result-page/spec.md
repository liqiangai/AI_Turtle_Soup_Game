# Result 结果页 Spec

## Why
当前 `/result` 页面缺少明确的“终局承接”，玩家结束对局后无法获得仪式感的揭晓体验，也无法回看本局的汤底与关键对话，影响成就感与复盘价值。

## What Changes
- 在 `/result` 提供结果页 UI：故事标题、汤底揭晓（突出显示）、可选对话历史
- 提供“再来一局”主按钮与“返回大厅”次按钮
- 提供“揭晓汤底”的仪式感动效（首屏渐显/遮罩揭幕/轻微高光线等，Tailwind 实现）
- 明确结果页的数据来源与缺省策略（MVP：无后端时从路由参数/导航 state/sessionStorage 获取）

## Impact
- Affected specs: 终局流程承接（PRD 3.4）、安全边界（Level 4 仅结果页展示）、视觉规范（深色神秘 + 金色强调）
- Affected code:
  - web/src/pages/ResultPage.tsx
  - web/src/pages/GamePage.tsx（终局跳转时携带 storyId 与可选 messages）
  - web/src/app/router.tsx（不修改路由结构：仍为 `/result`）
  - web/src/types/domain.ts（若需要对话结构类型复用）

## ADDED Requirements
### Requirement: Result Page Content
系统 SHALL 在 `/result` 展示本局结果信息。

#### Scenario: 成功进入结果页（有 storyId）
- **WHEN** 用户进入 `/result` 且能解析到 `storyId`
- **THEN** 展示故事标题
- **THEN** 以“仪式感”方式揭晓汤底（突出显示，长文本可读）
- **THEN** 可选展示玩家对话历史（如果有数据）
- **THEN** 提供“再来一局”（主）与“返回大厅”（次）按钮

#### Scenario: 结果页缺少 storyId
- **WHEN** 用户直接访问 `/result` 且无法获得 `storyId`
- **THEN** 展示友好提示（未找到本局信息）
- **THEN** 仅提供“返回大厅”按钮

### Requirement: Data Passing (MVP)
系统 SHALL 在无后端的情况下以最小成本传递结果页所需数据。

#### Data Sources Priority
系统 SHALL 按以下优先级解析数据：
1) `location.state`（由 `/game/:id` 结束时导航传入：`storyId`、可选 `messages`）
2) URL 查询参数（例如 `/result?storyId=...`）
3) `sessionStorage`（键：`lastStoryId`、`lastMessages`，用于刷新页兜底）

### Requirement: Reveal Ceremony
系统 SHALL 提供揭晓汤底的仪式感，不引入重型依赖。

#### Scenario: 首次渲染揭晓
- **WHEN** 结果页首次渲染
- **THEN** 汤底区以渐显 + 高光线/遮罩揭幕动画呈现（Tailwind + CSS 动画即可）
- **THEN** 动效时长克制（约 200–600ms），避免影响阅读

## MODIFIED Requirements
### Requirement: Safety & Spoiler Control
系统 SHALL 保持“完整汤底 Level 4 仅在 `/result` 展示”的约束；对局页不得直接展示完整汤底（AGENTS/PRD/TECH_DESIGN）。

## REMOVED Requirements
无

