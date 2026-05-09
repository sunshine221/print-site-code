# 项目上下文（context）

## 1. 项目目标
- 本项目是“3D打印产品展示与管理平台”，包含公开官网（展示+询价）与后台管理（内容与线索管理）。
- 仓库入口： [README.md](../README.md)
- PRD： [.trae/documents/3D打印产品展示与管理平台-PRD.md](../.trae/documents/3D打印产品展示与管理平台-PRD.md)
- 技术架构： [.trae/documents/3D打印产品展示与管理平台-技术架构.md](../.trae/documents/3D打印产品展示与管理平台-技术架构.md)

## 2. 技术栈
- 前端：React 18 + TypeScript + Vite + react-router-dom
- 样式：Tailwind CSS
- 状态：zustand
- 后端：Node.js + Express（TypeScript）
- 数据：SQLite（better-sqlite3）
- 鉴权：JWT（jsonwebtoken）
- 文件：腾讯云 COS（cos-nodejs-sdk-v5）

## 3. 目录结构
- 前端代码： [src](../src)
- 后端代码： [api](../api)
- 数据库迁移： [migrations](../migrations)
- 运维/踩坑记录： [docs/wiki](../docs/wiki)
- AI 研发流程与模板（本仓库约定）： [docs/ai](../docs/ai)

## 4. 本地开发
- 安装依赖：`npm i`
- 启动前后端（推荐）：`npm run dev`
- 类型检查：`npm run check`
- Lint：`npm run lint`
- 构建：`npm run build`

## 5. 环境变量
- 示例文件： [.env.example](../.env.example)
- 本地建议：复制为 `.env` 后再改值

## 6. AI 协作约束（必须遵守）
- 任何实现变更必须先基于现有代码与文档，不允许臆测依赖与接口。
- 任何输出必须可验证：给出验证步骤与命令，且优先使用仓库已有 scripts（`check`/`lint`/`build`/手动路径）。
- 任何变更必须可回滚：明确改动面、风险点与回滚策略。
