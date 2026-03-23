# 故事列表卡片统一为 div Spec

## Why
当前故事列表项使用 `Link` 渲染为 `<a>`，在部分浏览器/样式组合下会出现交互与布局表现不一致。需要统一使用 `div` 作为列表卡片根节点，保持样式、功能与布局一致，同时保证可访问性与路由跳转行为不变。

## What Changes
- 修改 `web/src/components/lobby/GameCard.tsx`
  - 将根节点从 `Link`/`<a>` 改为 `div`
  - 点击卡片时跳转到 `/game/:id`（保持原有路径规则不变）
  - 保持现有视觉样式（className）与内容结构（标题、难度、汤面摘要）
  - 补齐键盘可访问性：支持 Tab 聚焦、Enter/Space 触发跳转
- 不修改故事数据结构与路由结构

## Impact
- Affected specs: 大厅故事列表交互一致性
- Affected code:
  - `web/src/components/lobby/GameCard.tsx`

## ADDED Requirements
### Requirement: Div Card Rendering
系统 SHALL 将故事列表卡片根节点渲染为 `div`，并保持现有 UI 样式与布局一致。

#### Scenario: Render
- **WHEN** 进入故事列表页
- **THEN** 每个故事卡片根节点为 `div`
- **THEN** 卡片包含标题、难度标签、汤面摘要，且布局与当前“效果是好的”的卡片一致

### Requirement: Navigation Behavior
系统 SHALL 保持故事卡片的跳转能力与用户操作一致。

#### Scenario: Click to navigate
- **WHEN** 用户点击故事卡片
- **THEN** 跳转到 `/game/<story.id>`（与当前逻辑一致）

#### Scenario: Keyboard to navigate
- **WHEN** 用户用 Tab 聚焦到故事卡片并按下 Enter 或 Space
- **THEN** 跳转到对应对局页

## MODIFIED Requirements
无

## REMOVED Requirements
无

