# Tasks

- [x] Task 1: 优化后端 system prompt
  - [x] 重写裁判指令，明确“是/否/无关”的判定规则
  - [x] 增加覆盖边界情况的示例（纯数字/乱码/非问句短语/明确相关/明确无关/不确定）
  - [x] 保持输出约束为三选一且可被后端校验

- [x] Task 2: 增加后端 Fallback 输出
  - [x] 上游异常/超时/结构不合法/输出不规范时，兜底返回 `{ ok:true, answer:\"无关\" }`
  - [x] 增加可选提示字段（例如 `fallback:true` 与 `notice`），用于前端提示“请重新提问”

- [x] Task 3: 前端展示“请重新提问”提示
  - [x] 在对局页收到 fallback/notice 时，追加“系统提示”气泡
  - [x] 保持对局计数逻辑不被异常提示干扰（不额外增加提问次数）

- [x] Task 4: 验证与回归
  - [x] api：对 `question=22`、`question=??`、`question=伞是雨伞吗` 等进行回归，输出稳定为合法三选一
  - [x] web：提问流程正常；当 fallback 触发时提示用户重新提问
  - [x] `npm run build`（web/api）通过

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 2
- Task 4 depends on Task 1-3
