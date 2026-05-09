## 目的
记录在 Windows 环境下使用 Git Bash + robocopy，将“新解压包（图1）”同步覆盖到“旧仓库（图2，含 .git 历史）”，并完成一次正常的增量提交与推送（保留历史提交记录）。

## 场景与目录
### 新包目录（图1）
- `D:\Wysen\print_site_code\20260508_1.0\`
  - `api\`、`src\`、`docs\`、`migrations\` 等：项目源码
  - `.trae\documents\`：需求/技术文档

### 旧仓目录（图2）
- `D:\Wysen\print_site_code\print-site-code\`
  - 包含 `.git\`，用于保留历史提交记录

## 本次实际操作记录

### 1) 在 Git Bash 中执行 robocopy 的关键点
直接在 Git Bash 执行 robocopy 时，存在两个坑：
- Git Bash 会把 `/MIR` 这种参数当成路径进行转换，导致参数被改写为 `C:/Program Files/Git/MIR`，从而报 “无效参数”
- Windows CMD 的换行符 `^` 在 Git Bash 中不生效，会导致参数错乱

解决方案：
- 在 Git Bash 中执行 robocopy 时加：
  - `MSYS2_ARG_CONV_EXCL='*'`（禁用参数路径转换）

本次使用的命令（同步新包根目录到旧仓根目录，镜像覆盖；会同步源码目录与 `.trae` 等目录）：
```bash
MSYS2_ARG_CONV_EXCL='*' /c/Windows/System32/robocopy.exe "D:\Wysen\print_site_code\20260508_1.0" "D:\Wysen\print_site_code\print-site-code" /MIR /XD ".git" "node_modules" "dist" "api\dist" "api\data" /XF ".env"
```

说明：
- `/MIR`：镜像同步（新增/修改/删除都会同步到目标）
- `/XD ".git" ...`：排除 `.git` 与构建/数据目录，确保旧仓历史不被破坏
- `/XF ".env"`：避免提交本地敏感配置

适用场景：
- 旧仓根目录下包含源码目录与 `.trae/`（文档）的结构，需要一次性整体同步更新。

如需同时同步 `.trae/documents` 文档（用于跨设备继续开发），再额外执行：
```bash
MSYS2_ARG_CONV_EXCL='*' /c/Windows/System32/robocopy.exe "D:\Wysen\print_site_code\20260508_1.0\.trae" "D:\Wysen\print_site_code\print-site-code\.trae" /MIR
```

### 2) 检查改动
```bash
git status
```

显示有文件修改（Git Bash 可能以转义形式显示中文路径）。

### 3) 全量暂存、提交、推送
```bash
git add -A
git commit -m "chore: sync from 20260508_1.0"
git push origin main
```

结果：
- 成功推送到远端 `main`
- 输出示例：
  - `8be936d..dcfabec  main -> main`

## 踩坑与经验总结

### 0) 为什么要“新仓/旧仓”两套目录
背景：
- 每次拿到的新代码都是“压缩包解压出来的全量目录”，如果直接在新目录里 `git init` 并推送，历史提交会被切断。
- 旧仓目录中已经存在 `.git`，里面保存了完整历史（commit/branch/tag）。

结论：
- “旧仓（有 .git）”用于保留历史与持续迭代。
- “新仓（解压目录）”只是一次性的输入来源，用来覆盖同步到旧仓。

### 0.1) 新目录里 `git init` 后 push 为什么会报错（fetch first）
典型报错：
- `! [rejected] main -> main (fetch first)`
- `Updates were rejected because the remote contains work that you do not have locally.`

原因：
- 远端 `main` 已经存在历史提交，而新目录 `git init` 得到的是一个“全新历史”的仓库。
- Git 默认不允许把“无共同祖先的提交历史”直接推到同一个分支（避免误覆盖）。

两种正确做法：
- 推荐：在旧仓目录（有历史）里同步新包内容，再 commit/push。
- 备选：在新目录先 `git fetch origin` 并 `git checkout -B main origin/main` 接上远端历史后再提交（需要更谨慎）。

### 0.2) 只上传压缩包作为代码仓为什么不推荐
现象：
- 仓库里只有 `print-site-code.tar.gz` 一个文件，代码无法在线浏览、无法 diff/PR、无法按文件追踪历史。

建议：
- 解压后以“源码文件”形式提交到仓库，压缩包仅作为 Release 附件（可选）。

### 1) Git Bash 下 robocopy 参数被误判为路径
现象：
- robocopy 报 “无效参数 #3: C:/Program Files/Git/MIR”

原因：
- MSYS（Git Bash）会自动把以 `/` 开头的参数当作路径并进行转换。

解决：
- 使用 `MSYS2_ARG_CONV_EXCL='*'` 禁用参数转换。

### 2) Git Bash 不要使用 CMD 的换行符 ^
现象：
- `/XD` `/XF` 被 Bash 当成命令执行，出现 “No such file or directory”

解决：
- 在 CMD/PowerShell 里用 `^` 换行
- 或在 Git Bash 用一行命令（不要换行），并配合 `MSYS2_ARG_CONV_EXCL`

### 3) Git status 中文路径显示为转义串
现象：
- `modified: ".trae/documents/\346\274...SKU.json"`

解决（可选）：
```bash
git config --global core.quotepath false
```

### 4) 换行符警告（LF → CRLF）
现象：
- `warning: LF will be replaced by CRLF`

解释：
- Windows 下 Git 可能会对文本文件换行做自动转换，这是提示，不影响提交。

建议：
- 对跨平台项目，建议统一配置 `.gitattributes` 或 `core.autocrlf` 策略（后续再定）。

### 5) 同步源目录建议更精确
当旧仓根目录结构为 `...\print-site-code\`（根下有源码目录与 `.trae/`）时，有两种同步策略：
- 一次性同步根目录（简单）：`...\20260508_1.0` → `...\print-site-code`
- 拆分同步（更可控）：
  - 代码：`...\20260508_1.0` → `...\print-site-code`
  - 文档：`...\20260508_1.0\.trae` → `...\print-site-code\.trae`

如果你希望“代码与文档分开同步”，建议拆成两条 robocopy：
- 仅同步 `.trae` 文档：
  - 源：`...\20260508_1.0\.trae`
  - 目标：旧仓根目录下的 `.trae`（`...\print-site-code\.trae`）
