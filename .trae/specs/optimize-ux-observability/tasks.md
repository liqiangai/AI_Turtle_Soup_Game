# Tasks

- [x] Task 1: 前端加载状态统一
  - [x] 为提问/解锁线索/提交还原等异步操作补齐 pending 状态与禁用态
  - [x] 确保 loading 状态在成功/失败/取消（超时）时都能正确复位

- [x] Task 2: 前端错误提示统一
  - [x] 统一错误展示组件/样式（系统提示气泡或 toast 二选一并一致使用）
  - [x] 屏蔽原始 HTML/长响应体，改为简短可理解文案

- [x] Task 3: 交互动画增强
  - [x] 统一页面切换与消息进入动画节奏
  - [x] 避免影响滚动性能（移动端重点关注）

- [x] Task 4: 移动端适配收敛
  - [x] 标题/摘要/消息气泡文本在窄屏下不被裁切，截断与换行策略统一
  - [x] safe-area 与底部输入栏布局在主流机型下稳定

- [x] Task 5: 后端请求日志
  - [x] 引入 requestId（生成/透传）并在响应头返回
  - [x] 输出结构化请求日志（method/path/status/durationMs/requestId）

- [x] Task 6: 后端错误处理统一
  - [x] 统一错误响应为 `{ ok:false, message, requestId }`
  - [x] 处理 404/方法不允许等场景，避免返回默认 HTML

- [x] Task 7: 接口文档
  - [x] 增加文档入口（例如 `/api/docs` 或 `/api/openapi.json`）
  - [x] 覆盖 `/api/chat` 与 `/api/test` 请求/响应示例

- [x] Task 8: 验证与回归
  - [x] web：`npm run build` 通过
  - [x] api：启动后请求日志与错误响应符合预期
  - [x] 手动回归：移动端（窄屏）对局页布局与交互稳定一致

# Task Dependencies
- Task 2 depends on Task 1
- Task 4 depends on Task 1-3
- Task 6 depends on Task 5
- Task 8 depends on Task 1-7
