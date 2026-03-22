# Tasks

- [x] Task 1: 创建后端项目目录与依赖清单
  - [x] 新建 `api/` 并初始化 `package.json`
  - [x] 安装 `express`、`cors`（以及实现所需的运行/开发依赖）
  - [x] 提供 `.env.example`（PORT、FRONTEND_ORIGIN）

- [x] Task 2: 编写基础服务器代码
  - [x] 创建 Express app 与监听端口
  - [x] 增加健康日志输出（启动成功信息）

- [x] Task 3: 配置 CORS 允许前端访问
  - [x] 默认允许 `http://localhost:5173`
  - [x] 支持 `FRONTEND_ORIGIN` 覆盖

- [x] Task 4: 添加测试接口 GET /api/test
  - [x] 返回 200 与 JSON 响应体

- [x] Task 5: 启动验证
  - [x] 服务可通过 `npm run dev` 或 `npm start` 启动
  - [x] 使用浏览器或 curl/fetch 访问 `/api/test` 成功

# Task Dependencies
- Task 2-4 depends on Task 1
- Task 5 depends on Task 2-4
