# 优化 AI Prompt 与 Fallback Spec

## Why
当前对局裁判由大模型返回 “是/否/无关”。当用户输入含糊、非问句或模型输出不规范时，会出现体验不一致（例如输入“22”偶发得到“是”）。需要通过更清晰的指令、更丰富的示例、更严格的约束来提升稳定性，并提供兜底策略避免异常输出破坏游戏体验。

## What Changes
### 后端（/api/chat）
- 优化系统提示词（system prompt）
  - 更清晰的判定规则（何时是/否/无关）
  - 增加典型示例（few-shot），覆盖：
    - 纯数字/乱码/无意义输入
    - 非是非问句的短语/陈述（例如“伞是雨伞”）
    - 与汤面/汤底明确相关/明确无关/不确定三类
  - 更严格的输出约束：只允许输出单个词（是/否/无关），禁止任何额外字符
- 添加 AI 输出 Fallback（不改变主要裁判逻辑）
  - 如果上游返回不规范（非三选一）或上游异常/超时：返回默认答案 `无关`
  - 同时返回一个可选字段提示前端展示“请重新提问”（例如 `notice` 或 `fallback:true`）

### 前端（web）
- 处理后端返回的可选提示字段
  - 当检测到 fallback/notice 时，以“系统提示”气泡提示用户重新提问
- 当后端返回 `answer=无关` 且携带 fallback 标记时，不计入“有效推理反馈”的文案引导（仅提示重试，不改变核心计数规则）

## Impact
- Affected specs: 对局裁判稳定性、错误与异常体验
- Affected code:
  - `api/src/server.ts`
  - `web/src/services/api.ts`
  - `web/src/pages/GamePage.tsx`

## ADDED Requirements
### Requirement: Prompt Clarity & Examples
系统 SHALL 使用更清晰的裁判指令，并包含覆盖关键边界情况的示例，提升输出稳定性。

#### Scenario: Non-question input
- **WHEN** 用户输入纯数字/乱码/无意义字符/不构成是非问句的短语
- **THEN** AI SHOULD 回答“无关”

#### Scenario: Deterministic answer
- **WHEN** 问题可由汤面/汤底明确判断为真或假
- **THEN** AI SHOULD 分别回答“是”或“否”

### Requirement: Output Strictness
系统 SHALL 约束 AI 输出仅为 `是`/`否`/`无关` 三选一。

#### Scenario: Upstream output contains extra text
- **WHEN** 上游输出包含解释、标点、换行、多个词
- **THEN** 系统 MUST 归一化/兜底为合法输出

### Requirement: Fallback & Re-ask Guidance
系统 SHALL 在 AI 输出异常或上游异常时提供默认回答并提示用户重新提问。

#### Scenario: Upstream error/timeout
- **WHEN** 上游 HTTP 错误、超时、JSON 结构不合法
- **THEN** 返回 `ok:true` 与 `answer:"无关"` 并携带 `fallback`/`notice`
- **THEN** 前端展示“系统提示：请换一种问法再问一次”

## MODIFIED Requirements
无

## REMOVED Requirements
无

