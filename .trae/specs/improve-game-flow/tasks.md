# Tasks

- [x] Task 1: 定义并实现对局状态模型与存储键
  - [x] 明确 gameStatus/endReason 的枚举与默认值
  - [x] 统一 sessionStorage keys（与 ResultPage 取数逻辑一致）

- [x] Task 2: 调整 GamePage 关键按钮行为与确认交互
  - [x] “查看汤底”：二次确认后写入承接数据并跳转 `/result`
  - [x] “结束游戏”：二次确认后标记放弃并跳转 `/`

- [x] Task 3: 补齐中途放弃与重开策略
  - [x] 返回大厅后再进入 /game/:id 自动视为新局并清理上一局终态
  - [x] 保持对话发送功能不回退

- [x] Task 4: 对齐 ResultPage 的承接与展示
  - [x] 结果页从 state/query/sessionStorage 读取 storyId/messages 的策略保持不变
  - [x] 若需要展示“本局如何结束”，基于 endReason 显示一行说明（可选）

- [x] Task 5: 验证与回归
  - [x] `npm run build` 通过
  - [x] 手动验证：查看汤底 → /result 正常揭晓
  - [x] 手动验证：结束游戏 → 返回大厅
  - [x] 手动验证：中途放弃后再进对局为新局

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 2
- Task 4 depends on Task 1
- Task 5 depends on Task 2-4
