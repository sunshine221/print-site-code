# 应用工作区（workspace）

本目录是本项目的实际 Node.js 工作区（包含前端 + 后端 + 迁移），所有 `npm` 命令都在这里执行。仓库总入口见根目录 `README.md`。

## AI 开发流程（必读）
- 项目上下文：`../contexts/context.md`
- 稳定 AI 开发流程：`docs/ai/workflow.md`
- Trae 规则模板（多角色切换）：`docs/ai/trae-rules-template.md`
- 需求卡片/Tech Spec/发布模板：`docs/ai/templates/`

## 快速开始

```bash
npm -v
npm i
npm run dev
```

## Node 版本建议
- 建议使用 Node LTS（优先 22.13+），避免 `better-sqlite3` 在 Windows 下需要本地编译环境导致安装失败。

## 常用命令

- 类型检查：`npm run check`
- Lint：`npm run lint`
- 构建：`npm run build`

## 目录说明

- 前端（React + Vite）：`src/`
- 后端（Express）：`api/`
- 数据库迁移（SQLite）：`migrations/`
- 项目文档：`docs/`
  - AI 研发流程与模板：`docs/ai/`
  - 需求卡片/Tech Spec/发布：`docs/project/`
