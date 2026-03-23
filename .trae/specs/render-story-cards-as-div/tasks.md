# Tasks

- [x] Task 1: 将故事卡片根节点改为 div
  - [x] 更新 `GameCard` 使用 `div` 作为根节点并保留原 className
  - [x] 使用路由跳转（点击触发 navigate 到 `/game/:id`）

- [x] Task 2: 补齐可访问性与交互一致
  - [x] 为卡片添加 `role="link"` 与 `tabIndex=0`
  - [x] 支持键盘 Enter/Space 触发跳转
  - [x] 保持 hover/focus 视觉反馈与现有一致

- [x] Task 3: 验证与回归
  - [x] `npm run build`（web）通过
  - [x] 手动验证：所有故事卡片布局一致，点击与键盘操作一致跳转

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1-2
