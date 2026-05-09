# 项目上下文（context）

## 1. 项目目标
- 本项目是“3D打印产品展示与管理平台”，包含公开官网（展示+询价）与后台管理（内容与线索管理）。
- 仓库入口： [README.md](file:///d:/Wysen/print_site_code/print-site-code/README.md)
- PRD： [.trae/documents/3D打印产品展示与管理平台-PRD.md](file:///d:/Wysen/print_site_code/print-site-code/.trae/documents/3D%E6%89%93%E5%8D%B0%E4%BA%A7%E5%93%81%E5%B1%95%E7%A4%BA%E4%B8%8E%E7%AE%A1%E7%90%86%E5%B9%B3%E5%8F%B0-PRD.md)
- 技术架构： [.trae/documents/3D打印产品展示与管理平台-技术架构.md](file:///d:/Wysen/print_site_code/print-site-code/.trae/documents/3D%E6%89%93%E5%8D%B0%E4%BA%A7%E5%93%81%E5%B1%95%E7%A4%BA%E4%B8%8E%E7%AE%A1%E7%90%86%E5%B9%B3%E5%8F%B0-%E6%8A%80%E6%9C%AF%E6%9E%B6%E6%9E%84.md)

## 2. 技术栈
- 前端：React 18 + TypeScript + Vite + react-router-dom
- 样式：Tailwind CSS
- 状态：zustand
- 后端：Node.js + Express（TypeScript）
- 数据：SQLite（better-sqlite3）
- 鉴权：JWT（jsonwebtoken）
- 文件：腾讯云 COS（cos-nodejs-sdk-v5）

## 3. 目录结构
- 前端代码： [workspace/src](file:///d:/Wysen/print_site_code/print-site-code/workspace/src)
- 后端代码： [workspace/api](file:///d:/Wysen/print_site_code/print-site-code/workspace/api)
- 数据库迁移： [workspace/migrations](file:///d:/Wysen/print_site_code/print-site-code/workspace/migrations)
- 运维/踩坑记录： [workspace/docs/wiki](file:///d:/Wysen/print_site_code/print-site-code/workspace/docs/wiki)
- AI 研发流程与模板（本仓库约定）： [workspace/docs/ai](file:///d:/Wysen/print_site_code/print-site-code/workspace/docs/ai)

## 4. 本地开发
- 安装依赖：`npm i`
- 启动前后端（推荐）：`npm run dev`
- 类型检查：`npm run check`
- Lint：`npm run lint`
- 构建：`npm run build`

## 5. 环境变量
- 示例文件： [workspace/.env.example](file:///d:/Wysen/print_site_code/print-site-code/workspace/.env.example)
- 本地建议：复制为 `workspace/.env` 后再改值

## 6. AI 协作约束（必须遵守）
- 任何实现变更必须先基于现有代码与文档，不允许臆测依赖与接口。
- 任何输出必须可验证：给出验证步骤与命令，且优先使用仓库已有 scripts（`check`/`lint`/`build`/手动路径）。
- 任何变更必须可回滚：明确改动面、风险点与回滚策略。
