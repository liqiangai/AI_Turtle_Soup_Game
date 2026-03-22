# Tasks

- [x] Task 1: 修改 askAI 调用后端 /api/chat
  - [x] 保持函数签名与现有 question 校验逻辑不变
  - [x] 将 fetch 目标改为 `http://localhost:3000/api/chat`
  - [x] 请求体调整为 `{ question, story }`
  - [x] 解析 `{ ok, answer }` 成功响应并返回 answer

- [x] Task 2: 完善网络错误处理
  - [x] 处理 fetch 抛错（断网/连接拒绝）并返回友好错误信息
  - [x] 处理非 2xx：优先使用后端 `message`，否则使用兜底文案
  - [x] 处理非预期响应结构与 answer 非法值

- [x] Task 3: 验证与回归
  - [x] `npm run build`（web）通过
  - [x] 手动验证：后端可用时正常返回“是/否/无关”
  - [x] 手动验证：后端不可用时出现友好错误提示（不崩溃）

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1-2
