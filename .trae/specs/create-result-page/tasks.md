# Tasks

- [x] Task 1: 定义 Result 页数据契约与取数策略
  - [x] 明确 `storyId` 与 `messages` 的来源优先级（state/query/sessionStorage）
  - [x] 明确缺省/异常状态 UI（无 storyId、无 messages）

- [x] Task 2: 实现 ResultPage 页面布局与内容展示
  - [x] 展示故事标题
  - [x] 展示汤底长文本（高可读、突出显示）
  - [x] 可选展示对话历史列表（复用现有 Message 或轻量样式）

- [x] Task 3: 实现揭晓仪式感动效
  - [x] 汤底区“遮罩揭幕/渐显 + 高光线”动效（Tailwind/CSS）
  - [x] 确保动效不影响可访问性（prefers-reduced-motion 时降级）

- [x] Task 4: 实现底部操作与导航
  - [x] “再来一局”按钮：返回大厅并清理本局缓存
  - [x] “返回大厅”按钮：返回大厅

- [x] Task 5: 验证与回归
  - [x] `npm run build` 通过
  - [x] 手动验证：从 `/game/:id` 结束进入 `/result` 的数据承接
  - [x] 手动验证：直接访问 `/result` 的缺省提示

# Task Dependencies
- Task 2-4 depends on Task 1
- Task 5 depends on Task 2-4
