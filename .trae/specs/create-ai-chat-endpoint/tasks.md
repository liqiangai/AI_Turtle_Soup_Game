# Tasks

- [x] Task 1: 扩展后端环境变量与配置
  - [x] 更新 `api/.env.example` 增加 DEEPSEEK_API_KEY（及可选 BASE_URL/MODEL）
  - [x] 在 server 启动时加载并校验必要配置（缺失时给出清晰错误）

- [x] Task 2: 实现 POST /api/chat 接口
  - [x] 定义请求体结构（question、story）
  - [x] 做最小参数校验并返回 400（统一错误格式）
  - [x] 构造 system prompt（基于 story.surface + story.bottom，限制输出“是/否/无关”）

- [x] Task 3: 调用 DeepSeek 并解析回答
  - [x] 通过 fetch 调用 `${DEEPSEEK_BASE_URL}/chat/completions`
  - [x] 解析 choices[0].message.content 得到 answer
  - [x] 校验 answer 仅允许：是/否/无关（否则视为上游异常）

- [x] Task 4: 错误处理与日志
  - [x] 上游异常返回 AI_UPSTREAM_ERROR（或等价 code）
  - [x] 不记录敏感信息（API Key、完整汤底）到日志

- [x] Task 5: 验证与回归
  - [x] `npm run typecheck`（api）通过
  - [x] `npm run dev` 启动成功
  - [x] 使用 curl/fetch 访问 POST /api/chat 返回预期 answer

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 2
- Task 4 depends on Task 2-3
- Task 5 depends on Task 2-4
