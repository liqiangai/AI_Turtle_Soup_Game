# UX 优化计划（加载/错误/空态/动效/移动端）

## Summary
在不引入新重型依赖的前提下，优化对局聊天体验：补齐“加载动画、错误提示、空状态提示、交互动画、移动端可用性”。实现以局部增强为主（仅 AI 思考态 loading），错误以“系统提示气泡”写入消息流，动效保持克制并支持减少动效。

## Current State Analysis
### 现有实现概览（基于仓库现状）
- 对话区已有“思考中…”气泡（`isPending` 时渲染），但：
  - 发送按钮未显示 loading 反馈
  - 消息列表为空时无空态提示
  - 系统错误提示目前作为普通 AI 消息显示，视觉不区分
- 通用组件：
  - [Loading.tsx](file:///d:/workspace_ai/AI_Turtle_Soup_Game/web/src/components/common/Loading.tsx) 存在但未被页面使用
  - [ErrorState.tsx](file:///d:/workspace_ai/AI_Turtle_Soup_Game/web/src/components/common/ErrorState.tsx) 存在但未被页面使用
- 结果页已有“揭晓动效”CSS（支持 `prefers-reduced-motion`）：
  - [index.css](file:///d:/workspace_ai/AI_Turtle_Soup_Game/web/src/index.css#L9-L91)
- 移动端适配关键点已覆盖：
  - 对局页使用 `h-dvh`，输入区支持 `safe-area-inset-bottom`（[ChatBox.tsx](file:///d:/workspace_ai/AI_Turtle_Soup_Game/web/src/components/game/ChatBox.tsx)）

### 用户偏好/决策（已确认）
- 错误提示：以“插入对话气泡”为主（可回看）
- 加载动画：仅覆盖 AI 思考态（发送后“思考中…”+按钮 loading）
- 动效强度：克制（短时长、低位移，支持减少动效）

## Proposed Changes
### 1) ChatBox：空态 + 发送 loading + 细节动效（移动端友好）
**文件**： [ChatBox.tsx](file:///d:/workspace_ai/AI_Turtle_Soup_Game/web/src/components/game/ChatBox.tsx)
- **空状态提示**
  - 当 `props.messages.length === 0` 时，在消息区显示空态卡片（提示如何提问，给 2-3 条示例问题）。
- **加载动画**
  - `props.isPending === true` 时：
    - 保留“AI 主持人思考中...”气泡
    - 发送按钮显示 spinner/文案切换（例如“发送中”），并禁用输入/按钮（现已禁用按钮，补齐视觉反馈）。
- **交互动画（克制）**
  - 打开/关闭“思考中…”气泡、发送按钮状态切换采用轻微淡入（CSS class）。
- **移动端体验**
  - 保持现有 `safe-area` padding，不减少触达面积（按钮/输入框高度保持 44px+）。

### 2) Message：系统提示/错误消息视觉区分 + 消息出现动效
**文件**： [Message.tsx](file:///d:/workspace_ai/AI_Turtle_Soup_Game/web/src/components/game/Message.tsx)
- **错误提示**
  - 识别 `message.content` 以 `（系统提示）` 开头的消息（当前 GamePage 已按该格式写入），将其渲染为“系统提示样式”：
    - 更弱的底色 + 描边（偏 amber/rose 的中性方案，避免压迫感）
    - 文案更易读，仍保持与整体风格一致
- **交互动画（克制）**
  - 为每条消息气泡添加 “fade-up” 轻动画（仅首次出现），并在 `prefers-reduced-motion` 下禁用。

### 3) CSS：新增轻量动效工具类（复用现有 reduced-motion 约定）
**文件**： [index.css](file:///d:/workspace_ai/AI_Turtle_Soup_Game/web/src/index.css)
- 在 `@layer utilities` 中新增：
  - `@keyframes chatItemIn`（opacity + translateY 轻微上浮）
  - `@keyframes spinner`（旋转）或直接用 Tailwind `animate-spin`（若不够则补齐）
  - 对应 class：`.chat-item-in`、`.chat-spinner`
- 在 `@media (prefers-reduced-motion: reduce)` 中统一关闭新增动效（保持与结果页动效一致的可访问性策略）。

### 4) GamePage：错误格式统一与空态一致性（尽量少改）
**文件**： [GamePage.tsx](file:///d:/workspace_ai/AI_Turtle_Soup_Game/web/src/pages/GamePage.tsx)
- 确保 catch 分支写入的错误消息统一使用 `（系统提示）` 前缀（若已统一则不动）。
- 保持现有“立即插入用户消息、pending、AI 回复追加”的交互链路不回退。

## Assumptions & Decisions
- 不引入 Framer Motion/Lottie 等动画库；使用 Tailwind + 少量 CSS keyframes 实现。
- 不新增全局 Toast 系统；错误提示以消息流系统气泡为主（符合“可回看”偏好）。
- Loading 仅做 AI 思考态；不添加全屏遮罩或首页骨架屏（除非后续你希望更明显的全局加载）。

## Verification Steps
### 构建与静态检查
- `npm run build`（web/）必须通过
- `npm run lint`（若项目已配置）必须通过
- `npm run test`（若存在）保持通过

### 手动回归（桌面 + 移动端）
- 桌面（≥1024px）：
  - 发送问题：立刻出现用户消息；按钮出现 loading；消息区出现“思考中…”；收到 AI 回复后消失
  - 触发错误（断网/Key 错误）：消息流出现“系统提示”气泡，样式可区分
- 移动端（375×812）：
  - 输入区不被遮挡（safe-area 有效）
  - 空态提示在无消息时可见且不干扰输入
  - 动效克制，不影响滚动与输入

