# 扩充故事与主题分类 Spec

## Why
当前故事数量偏少（约 5 个），可玩性与重复游玩价值有限；同时缺少主题分类，用户在大厅难以按偏好快速挑选故事。需要扩充到 15–20 个故事，并按主题（悬疑、温情、搞笑等）进行分类展示与筛选。

## What Changes
- 数据层：扩充故事数据到 15–20 个，并为每个故事增加主题分类字段
- UI 层：在大厅页提供主题分类展示与筛选入口（默认显示全部）
- 兼容性：保持现有故事卡片与对局流程不变；未设置主题时归入“未分类/其他”

## Impact
- Affected specs: 故事大厅体验、内容扩展
- Affected code:
  - `web/src/data/stories.ts`
  - `web/src/pages/HomePage.tsx`
  - `web/src/components/lobby/GameCard.tsx`（如需展示分类标签）

## ADDED Requirements
### Requirement: Story Count
系统 SHALL 提供不少于 15 个且不多于 20 个故事可供选择。

#### Scenario: Lobby shows enough stories
- **WHEN** 用户进入故事大厅
- **THEN** 能看到至少 15 个故事卡片

### Requirement: Story Category Metadata
系统 SHALL 为每个故事提供主题分类字段（例如：悬疑、温情、搞笑、惊悚、脑洞等）。

#### Scenario: Category present
- **WHEN** 大厅渲染故事卡片
- **THEN** 每个故事都能被归入一个主题分类（缺省归入“其他”）

### Requirement: Category Filter UI
系统 SHALL 在大厅页提供按主题筛选故事的能力。

#### Scenario: Filter by category
- **WHEN** 用户选择某个主题（例如“悬疑”）
- **THEN** 列表仅展示该主题下的故事

## MODIFIED Requirements
无

## REMOVED Requirements
无

