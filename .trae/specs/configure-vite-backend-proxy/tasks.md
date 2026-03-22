# Tasks

- [x] Task 1: 配置 Vite `/api` 代理到后端
  - [x] 修改 `web/vite.config.ts` 增加 `/api` proxy 到 `http://localhost:3000`
  - [x] 确保 `/api/chat`、`/api/test` 能正确转发

- [x] Task 2: 前端改用相对路径调用后端
  - [x] `web/src/services/api.ts` 将 `http://localhost:3000/api/chat` 改为 `/api/chat`
  - [x] 保持 `askAI(question, story)` 签名与现有错误处理逻辑不变

- [x] Task 3: 验证与回归
  - [x] `npm run build`（web）通过
  - [x] 手动验证：对局页提问时网络请求走 `/api/chat`（由 Vite 代理转发到后端）

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1-2
