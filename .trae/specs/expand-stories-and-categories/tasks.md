# Tasks

- [x] Task 1: 扩充故事数据到 15–20 个
  - [x] 为每个故事补齐标题、难度、汤面、线索、汤底与关键词字段
  - [x] 新增主题分类字段（例如 `category`）
  - [x] 确保现有 5 个故事也补齐分类字段

- [x] Task 2: 大厅页增加主题筛选 UI
  - [x] 在首页/大厅页增加分类选择器（全部 + 各分类）
  - [x] 切换分类后只展示该分类故事
  - [x] 默认展示全部

- [x] Task 3: 故事卡片展示分类（可选但推荐）
  - [x] 在卡片上展示分类标签（与难度标签并存或替代部分信息）
  - [x] 在移动端不挤压标题布局

- [x] Task 4: 验证与回归
  - [x] `web`：`npm run build` 通过
  - [x] 大厅页可见故事数量 15–20，分类筛选正常
  - [x] 任意故事可正常进入对局并进行提问

## Task Dependencies

- Task 2 depends on Task 1
- Task 3 depends on Task 1
- Task 4 depends on Task 1-3
