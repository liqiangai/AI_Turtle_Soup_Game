Step 1：创建故事数据

请根据PRD.md，创建stories.ts文件，包含3-5个海龟汤故事数据。

每个故事包含：
- id, title, difficulty, surface, bottom

要求：
1. 类型定义完整
2. 故事要有趣，难度分级
3. 导出stories数组

Step 2：创建GameCard组件

请创建GameCard组件，显示单个游戏卡片：

要求：
1. 接收story作为props
2. 显示标题、难度标签
3. 卡片有hover效果
4. 点击卡片跳转到游戏页面
5. 使用Tailwind CSS，风格符合AGENTS.md

Step 3：创建Home页面

请创建Home页面，显示游戏大厅：

要求：
1. 显示页面标题"AI海龟汤"
2. 使用GameCard组件显示所有故事
3. 网格布局，响应式
4. 添加简单的介绍文字
5. 整体风格神秘悬疑

Step 4：配置路由

请配置React Router：
1. / 路径显示Home页面
2. /game/:id 路径显示Game页面（先创建空组件）