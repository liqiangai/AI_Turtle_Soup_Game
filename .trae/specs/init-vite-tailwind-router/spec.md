# React+Vite+Tailwind 初始化 Spec

## Why
当前仓库需要一个可在 Vercel 部署的 React + TypeScript + Vite 前端工程骨架，并按项目文档约束完成 Tailwind CSS 与基础路由能力，作为后续功能开发的起点。

## What Changes
- 初始化 React + TypeScript + Vite 项目骨架
- 配置 Tailwind CSS（含 PostCSS）并接入全局样式入口
- 安装并接入 react-router-dom，提供基础路由配置
- 创建与技术设计一致的基础目录结构与页面占位
- 确保本地可启动开发服务器（dev）并通过基础校验

## Impact
- Affected specs: 前端工程骨架 | 样式系统 | 路由系统
- Affected code: 新增前端项目文件（Vite/React/Tailwind）与基础页面/路由文件

## ADDED Requirements

### Requirement: Vite React 项目初始化
系统 SHALL 提供可运行的 React + TypeScript + Vite 项目，并包含标准开发/构建脚本。

#### Scenario: 本地启动成功
- **WHEN** 开发者安装依赖并启动开发服务器
- **THEN** 应用可在浏览器打开且无启动错误

### Requirement: Tailwind CSS 生效
系统 SHALL 集成 Tailwind CSS，确保在页面中使用 Tailwind class 能产生对应样式。

#### Scenario: 样式验证
- **WHEN** 页面元素使用 Tailwind class（如背景色/字体色）
- **THEN** 页面渲染效果符合 class 预期

### Requirement: 基础路由配置
系统 SHALL 使用 react-router-dom 提供基础路由，并提供至少 4 个页面入口用于后续功能扩展。

#### Scenario: 路由切换
- **WHEN** 用户访问不同路由路径（/、/game、/result、/auth）
- **THEN** 对应页面组件被正确渲染

### Requirement: 基础目录结构
系统 SHALL 创建与 TECH_DESIGN.md 中项目结构约定一致的核心目录（pages/components/services/stores/types/app）。

#### Scenario: 结构可对齐
- **WHEN** 开发者查看项目目录
- **THEN** 能找到约定的目录与基础文件（路由与页面占位）

## MODIFIED Requirements
无

## REMOVED Requirements
无

