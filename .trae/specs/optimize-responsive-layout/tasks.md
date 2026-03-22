# Tasks

- [x] Task 1: 盘点现有布局问题并确定断点策略
  - [x] 明确 Mobile / Tablet / Desktop 断点（Tailwind：sm/md/lg）
  - [x] 明确需要优化的区域（Home、Game、ChatBox、Header）

- [x] Task 2: 优化首页（/）移动端与桌面端布局
  - [x] 调整容器宽度与留白，使桌面端信息不过于分散
  - [x] 调整故事卡片网格列数与间距，使移动端更易点击、桌面端更高效浏览

- [x] Task 3: 优化游戏页（/game/:id）响应式布局
  - [x] 移动端单列：故事信息卡 + ChatBox + 底部操作区
  - [x] 桌面端分栏：左故事信息、右聊天区（避免拥挤与双重滚动）

- [x] Task 4: 优化 ChatBox 在不同视口下的高度与滚动体验
  - [x] 统一消息列表滚动区域与输入区布局
  - [x] 确保发送按钮在窄屏不被挤压且可点击

- [x] Task 5: 验证与回归
  - [x] `npm run build` 通过
  - [x] 手动验证 375×812（手机）与 1440×900（桌面）两种视口的 Home/Game 页面

# Task Dependencies
- Task 2-4 depends on Task 1
- Task 5 depends on Task 2-4
