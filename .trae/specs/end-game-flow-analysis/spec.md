# AI 海龟汤「结束游戏」流程与交互 Spec

## Why
目前前端已出现“结束游戏/查看汤底”等入口，但缺少统一的终局语义与交互约定，导致玩家不知道何时算结束、结束后会发生什么，也容易误触或剧透。

## What Changes
- 明确“结束游戏”的定义、触发方式与结果承载页（/result）
- 明确终局方式共 4 种，并补充“方式清单（详细描述）”与“终局原因枚举字段定义”
- 定义更友好的终局交互：二次确认（结束/查看汤底）、提交还原失败默认继续推理、结果页承接 CTA（含确认文案/默认按钮）
- 明确安全约束：Level 4（完整汤底）仅能在结算页展示，终局前不得在前端/日志泄露完整汤底

## Impact
- Affected specs: 对局流程（PRD 3.3/3.4）、安全约束（AGENTS/TECH_DESIGN）
- Affected code (未来实现目标):
  - web/src/pages/GamePage.tsx
  - web/src/pages/ResultPage.tsx
  - api/modules/session/*（/end、/submit）
  - api/modules/ai/*（复盘总结/判定）

## ADDED Requirements
### Requirement: End Game Options (4) Detailed List
系统 SHALL 仅支持以下 4 种“终局方式”（对玩家可见命名），并在终局时记录结构化的终局原因字段用于复盘展示、埋点分析与一致性对齐。

| # | 终局方式（面向玩家） | 典型入口/触发 | 是否二次确认 | 终局原因枚举（endReason） | 是否允许展示完整汤底 | 结果页承接要点 |
|---:|---|---|---|---|---|---|
| 1 | 主动结束（放弃推理） | 对局中点击“结束游戏” | 必须 | `abandoned_by_user` | 仅在 `/result` 可选“查看完整汤底”后展示 | 先展示复盘与引导，再提供“看汤底（剧透）/再来一局/返回大厅” |
| 2 | 提交还原并通关 | 提交“我认为真相是……”并判定通过 | 不需要（提交行为本身已显式） | `solved_by_submit` | 直接在 `/result` 展示 Level 4 完整汤底 | 强化“通关”反馈与关键推理节点，提供分享/再来一局 |
| 3 | 查看完整汤底（剧透终止） | 对局中点击“查看汤底（剧透）” | 必须 | `reveal_bottom` | `/result` 展示 Level 4 完整汤底 | 明确“已剧透结束”，避免误会“还能继续问” |
| 4 | 超时结算 | 对局超时（默认 30 分钟）自动触发 | 不适用 | `timeout` | `/result` 默认不主动弹出汤底，需用户点击“看汤底（剧透）” | 解释超时原因，优先提供“再来一局/返回大厅”，减少挫败 |

### Requirement: End Game Reason Enum Field Definition
系统 SHALL 定义“终局原因”枚举字段 `endReason`，并在 Session 终态与结果页展示数据中保持一致语义。

#### Field: endReason
- **字段名**：`endReason`
- **字段类型**：`string`（枚举）
- **字段用途**：用于结果页展示“本局如何结束”、用于埋点/审计、用于复盘总结分支选择（例如通关/放弃/剧透/超时）
- **取值定义**：
  - `abandoned_by_user`：玩家主动放弃推理结束本局（通过“结束游戏”确认结束触发）
  - `solved_by_submit`：玩家提交还原并判定通过，通关结束本局
  - `reveal_bottom`：玩家主动选择查看完整汤底导致本局结束（剧透终止）
  - `timeout`：系统因超时自动结束本局
- **展示映射（建议）**：
  - `abandoned_by_user` → “你选择结束本局”
  - `solved_by_submit` → “恭喜通关”
  - `reveal_bottom` → “你查看了完整汤底（已剧透）”
  - `timeout` → “本局已超时结算”
- **安全标记（建议）**：
  - `reveal_bottom`、`solved_by_submit` 属于“允许展示 Level 4 完整汤底”的终局原因
  - `abandoned_by_user`、`timeout` 默认不自动展示完整汤底，但允许在 `/result` 由用户显式点击“看汤底（剧透）”后展示

### Requirement: End Game Semantics
系统 SHALL 将“结束游戏”定义为 Session 从 `active` 进入终态（`completed` 或 `abandoned`），并将终局信息统一在 `/result` 展示。

#### Scenario: 用户主动结束（放弃推理）
- **WHEN** 用户点击“结束游戏”
- **THEN** 弹出二次确认：说明将进入结算页（可复盘、可再来一局），可选择“继续推理”（默认）或“确认结束”
- **THEN** 终局原因记录为 `abandoned_by_user`
- **THEN** 跳转 `/result` 展示复盘信息（不含剧透分享内容）

#### Scenario: 用户提交还原（尝试通关）
- **WHEN** 用户提交“我认为真相是……”
- **THEN** 服务端判定接近度与缺失方向
- **THEN** 若判定通过：终局原因记录为 `solved_by_submit`，跳转 `/result` 展示完整汤底与复盘
- **THEN** 若判定未通过：默认继续推理（不结束），并提供可选入口“结束并看汤底”

#### Scenario: 查看完整汤底（剧透终止）
- **WHEN** 用户点击“查看汤底”（明确标注为剧透）
- **THEN** 必须二次确认，提示“查看后将立即结束本局并在结算页展示完整汤底，无法撤回”
- **THEN** 终局原因记录为 `reveal_bottom`
- **THEN** 跳转 `/result`（展示 Level 4 完整汤底）

#### Scenario: 超时结束
- **WHEN** 对局超过默认 30 分钟（PRD 3.3）
- **THEN** 自动结算：提示“本局已超时，进入结算”
- **THEN** 终局原因记录为 `timeout`
- **THEN** 跳转 `/result`

### Requirement: Friendly Exit UX
系统 SHALL 提供低挫败的终局交互，避免误触与强剧透。

#### Scenario: 误触保护
- **WHEN** 用户在对局中触发“结束/查看汤底”
- **THEN** 必须二次确认（移动端按钮更容易误触）
- **THEN** 默认聚焦与默认按钮均为“继续推理/先不看”（避免误触导致结束或剧透）

#### Scenario: 二次确认文案（建议）
- **结束游戏确认弹窗**
  - 标题：结束本局？
  - 说明：结束后将进入结算页查看复盘；在结算页你仍可选择查看完整汤底（剧透）。
  - 按钮：主按钮（默认/聚焦）“继续推理”；次按钮 “确认结束”
- **查看汤底确认弹窗**
  - 标题：查看完整汤底（剧透）？
  - 说明：查看后本局将立即结束，并在结算页展示完整汤底；该操作无法撤回。
  - 按钮：主按钮（默认/聚焦）“先不看”；次按钮 “确认查看”

#### Scenario: 结果页友好承接
- **WHEN** 用户进入 `/result`
- **THEN** 展示“本局数据”（提问轮次、提示使用次数、是否通关、终局原因）
- **THEN** 展示“复盘时间线/关键节点”（PRD 3.4）
- **THEN** 提供“再来一局 / 返回大厅”

#### Scenario: 提交还原失败继续推理分支（关键低挫败）
- **WHEN** 用户提交还原且判定未通过
- **THEN** 默认留在对局，不触发终局、不跳转 `/result`
- **THEN** 给出可执行的反馈（例如“接近度”“缺失方向”“建议下一问的聚焦点”）
- **THEN** 提供可选入口“结束并看汤底（剧透）”，该入口进入“查看汤底”二次确认流程

## MODIFIED Requirements
### Requirement: Safety & Spoiler Control
系统 SHALL 在 Level 4 之前不向前端下发完整汤底文本；完整汤底仅能在 `/result` 或结算流程中获取与展示（AGENTS/PRD/TECH_DESIGN）。

## REMOVED Requirements
无
