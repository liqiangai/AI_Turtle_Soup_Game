# AI 海龟汤游戏

[![Powered by CloudBase](https://7463-tcb-advanced-a656fc-1257967285.tcb.qcloud.la/mcp/powered-by-cloudbase-badge.svg)](https://github.com/TencentCloudBase/CloudBase-AI-ToolKit)

> 🐢 一个AI驱动的海龟汤（情境猜谜/水平思考游戏）网站，玩家与AI裁判对话，通过封闭提问逐步推理出故事真相。

## ✨ 项目特点

- 🤖 **AI智能裁判**：基于 DeepSeek API，自动判定问题答案（是/否/无关）
- 🎮 **渐进解锁**：免费无限提示，4级渐进解锁汤底，降低卡点挫败感
- 📱 **移动端优先**：响应式设计，完美适配手机、平板、桌面端
- 🔐 **完整鉴权**：JWT + Refresh Token 双令牌机制，安全可靠
- 🎨 **精美UI**：Tailwind CSS + Shadcn UI，神秘悬疑风格
- ⚡ **高性能**：React + TypeScript + Vite，构建速度极快
- 🛡️ **安全防护**：内容预警、敏感词检测、频率限制、幂等保护

## 🎯 核心玩法

1. **开局**：选择或随机获取一道海龟汤题目（汤面）
2. **提问**：通过是非问句向AI裁判提问，获取线索
3. **推理**：AI回答"是/否/无关"，逐步缩小真相范围
4. **解锁**：卡住时可使用渐进解锁，分4级揭示汤底
5. **还原**：提交你推理的真相，AI判定接近度
6. **复盘**：结算页展示完整汤底、推理路径、本局数据

## 🏗️ 技术栈

### 前端
- **框架**：React 18 + TypeScript + Vite
- **样式**：Tailwind CSS + Shadcn UI
- **路由**：React Router v6
- **状态管理**：React Query（服务端状态）+ Zustand（本地状态）
- **构建工具**：Vite 5.x

### 后端
- **运行时**：Node.js 18+
- **框架**：Express.js
- **数据库**：PostgreSQL（Vercel Postgres / 自建）
- **鉴权**：JWT Access Token + Refresh Token
- **AI集成**：DeepSeek API

### 部署
- **前端**：静态托管（CloudBase / Vercel / Nginx）
- **后端**：云服务器（腾讯云 Lighthouse）+ Docker
- **域名**：HTTPS + Let's Encrypt SSL 证书

## 📁 项目结构

```
AI_Turtle_Soup_Game/
├── web/                    # 前端项目
│   ├── src/
│   │   ├── components/    # React 组件
│   │   │   ├── game/      # 游戏页面组件
│   │   │   ├── lobby/     # 大厅组件
│   │   │   └── common/    # 通用组件
│   │   ├── services/      # API 服务层
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── stores/        # Zustand 状态管理
│   │   ├── types/         # TypeScript 类型定义
│   │   └── data/          # 静态数据（题目等）
│   ├── public/            # 静态资源
│   ├── index.html         # HTML 模板
│   └── vite.config.ts     # Vite 配置
│
├── api/                   # 后端项目
│   ├── src/
│   │   ├── server.ts      # Express 服务入口
│   │   └── ...           # 其他模块
│   ├── dist/             # 编译输出
│   ├── .env              # 环境变量
│   └── package.json      # 依赖配置
│
├── docs/                  # 文档
│   ├── PRD.md            # 产品需求文档
│   ├── TECH_DESIGN.md    # 技术设计文档
│   └── DEPLOYMENT.md     # 部署文档
│
├── rules/                 # 开发规范
│   └── ui-design/        # UI 设计规范
│
├── README.md              # 项目说明
├── CODEBUDDY.md           # CloudBase AI 开发规则
└── cloudbaserc.json       # CloudBase 配置
```

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL 数据库（可选，用于生产环境）

### 安装依赖

```bash
# 安装前端依赖
cd web
npm install

# 安装后端依赖
cd ../api
npm install
```

### 配置环境变量

#### 前端配置 (`web/.env`)

```env
# 开发环境使用相对路径，无需设置
# VITE_API_BASE_URL=
```

#### 后端配置 (`api/.env`)

```env
# 服务端口
PORT=3000

# 前端域名（CORS 白名单，逗号分隔）
FRONTEND_ORIGIN=http://localhost:5173

# DeepSeek API 配置
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat

# 数据库配置（生产环境）
# DATABASE_URL=postgresql://user:password@host:port/database

# JWT 密钥（生产环境）
# JWT_ACCESS_SECRET=your_access_secret
# JWT_REFRESH_SECRET=your_refresh_secret
```

### 启动开发服务器

```bash
# 启动后端（在 api 目录）
cd api
npm run dev

# 启动前端（在 web 目录，新终端）
cd web
npm run dev
```

访问 http://localhost:5173 即可开始游戏！

### 构建生产版本

```bash
# 构建前端
cd web
npm run build

# 构建后端
cd ../api
npm run build
```

## 🌐 部署说明

### 方式一：腾讯云 Lighthouse（推荐）

详细部署文档请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

#### 快速部署步骤

1. **准备服务器**：腾讯云 Lighthouse（2核4G，上海地域）
2. **安装环境**：Docker + Node.js
3. **上传代码**：使用 `deploy_project_preparation` 工具
4. **配置 Nginx**：反向代理 + HTTPS 证书
5. **启动服务**：Node.js 进程管理

#### 当前部署信息

- **服务器 IP**：101.43.98.2
- **域名**：https://www.aihugai.cn / https://aihugai.cn
- **状态**：✅ 已上线

### 方式二：Vercel + Vercel Postgres

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### 方式三：CloudBase 静态托管

```bash
# 安装 CloudBase CLI
npm i -g @cloudbase/cli

# 登录并部署
tcb login
tcb hosting deploy web/dist -e your-env-id
```

## 📖 API 文档

### 核心接口

#### 游戏对局

- `POST /api/sessions` - 创建新对局
- `GET /api/sessions/:id` - 获取对局详情
- `POST /api/sessions/:id/messages` - 发送玩家消息，AI回复
- `POST /api/sessions/:id/unlock` - 触发汤底解锁（按层级）
- `POST /api/sessions/:id/submit` - 提交还原，AI判定
- `POST /api/sessions/:id/end` - 结束对局

#### 题目管理

- `POST /api/puzzles` - AI生成新题目
- `GET /api/puzzles/random` - 随机获取一道题
- `GET /api/puzzles/:id` - 获取题目详情（不含汤底）
- `POST /api/puzzles/:id/favorite` - 收藏题目

#### 用户认证

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - 刷新访问令牌
- `POST /api/auth/logout` - 退出登录
- `GET /api/users/me` - 获取当前用户信息

### 统一响应格式

```json
{
  "ok": true,
  "message": "ok",
  "data": {},
  "requestId": "req_xxx"
}
```

### 错误码说明

| 错误码 | 说明 |
|--------|------|
| 40001 | 参数错误 |
| 40101 | 未登录或令牌无效 |
| 40301 | 无权限访问 |
| 40401 | 资源不存在 |
| 40901 | 状态冲突 |
| 42901 | 请求过于频繁 |
| 50001 | 服务内部错误 |
| 50301 | AI服务暂不可用 |

## 🎨 设计规范

项目遵循严格的 UI 设计规范，详见 [rules/ui-design/rule.md](./rules/ui-design/rule.md)

### 核心设计原则

- **色彩**：深蓝基调（#0D1B2A / #1B263B）+ 暖色高亮（#E0A458）
- **字体**：思源黑体 / Inter，避免常见 AI 美学字体
- **布局**：移动端优先，非对称布局，避免居中模板
- **交互**：流畅动画，即时反馈，降低挫败感

## 🔧 开发指南

### Git 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具链相关
```

### 代码规范

- TypeScript 严格模式
- ESLint + Prettier 格式化
- 函数注释使用 JSDoc
- 组件命名：PascalCase
- 文件命名：kebab-case

### 分支管理

- `main` - 生产分支
- `develop` - 开发分支
- `feature/*` - 功能分支
- `hotfix/*` - 紧急修复分支

## 📊 项目状态

### 已完成功能 ✅

- [x] 前端项目脚手架（React + Vite）
- [x] 后端 API 服务（Express + Node.js）
- [x] AI 裁判判定逻辑（DeepSeek API）
- [x] 游戏对局核心流程（开局→问答→结算）
- [x] 响应式 UI 设计
- [x] 域名绑定 + HTTPS 配置
- [x] 生产环境部署

### 进行中功能 🚧

- [ ] 用户注册/登录系统
- [ ] 数据库持久化存储
- [ ] 渐进解锁汤底（4级）
- [ ] 自动板书（已确认/排除/可疑）

### 计划中功能 📋

- [ ] 收藏功能
- [ ] 内容预警与一键换题
- [ ] 社交分享
- [ ] 排行榜
- [ ] 自定义出题
- [ ] 多人模式

## 📝 更新日志

### v0.2.0 (2026-03-29)

- ✅ 修复前端 API 地址配置问题（使用相对路径）
- ✅ 修复后端 CORS 配置（添加生产域名）
- ✅ 完善域名绑定与 HTTPS 配置
- ✅ 优化 AI 裁判提示词（支持猜测判定）

### v0.1.0 (2026-03-29)

- 🎉 初始版本发布
- ✅ 完成核心游戏流程
- ✅ AI 裁判判定功能
- ✅ 基础 UI 实现
- ✅ 生产环境部署

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

本项目基于 [CloudBase AI ToolKit](https://github.com/TencentCloudBase/CloudBase-AI-ToolKit) 开发。

## 🙏 致谢

- [CloudBase AI ToolKit](https://github.com/TencentCloudBase/CloudBase-AI-ToolKit) - AI 开发工具包
- [DeepSeek](https://www.deepseek.com/) - AI 模型服务
- [Shadcn UI](https://ui.shadcn.com/) - UI 组件库
- [Tencent CloudBase](https://cloud.tencent.com/product/tcb) - 云开发平台

## 📮 联系方式

- 项目主页：https://www.aihugai.cn
- 问题反馈：[GitHub Issues](https://github.com/your-repo/AI_Turtle_Soup_Game/issues)

---

**Powered by CloudBase AI ToolKit** 🚀
