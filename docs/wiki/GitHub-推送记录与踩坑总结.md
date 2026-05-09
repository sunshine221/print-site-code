## 目的
将本项目代码从本地推送到 GitHub，并记录执行过程、遇到的问题与修复经验，便于后续复用。

## 环境信息
- 本地终端：Git Bash（MINGW64）
- 仓库：`https://github.com/sunshine221/print-site-code.git`
- 分支：`main`

## 标准推送流程（推荐）
在项目根目录（包含 `package.json` 的目录）执行：

```bash
git init
git add .
git commit -m "init: print site"
git branch -M main
git remote add origin https://github.com/sunshine221/print-site-code.git
git push -u origin main
```

## 本次执行记录（按时间线）

### 1. 设置远端并推送
执行 `git push -u origin main` 后报错（典型）：
- `fatal: unable to access 'https://github.com/...': Failed to connect to github.com port 443 ... Could not connect to server`

结论：当前网络环境无法直连 GitHub 443，需要修复网络连通性或使用代理。

### 2. 检查 remote 配置
执行：

```bash
git remote -v
```

发现问题：
- `origin` 的 URL 包含反引号：`` `https://github.com/...` ``
- 存在拼写错误的远端名：`orign`

处理：删除错误 remote，并重新添加正确的 `origin`：

```bash
git remote remove origin
git remote remove orign
git remote add origin https://github.com/sunshine221/print-site-code.git
git remote -v
```

### 3. 验证网络连通性
使用 `curl` 验证 GitHub 是否可达（注意：不要加反引号）：

```bash
curl -I https://github.com
```

如果返回 `Failed to connect ... Could not connect to server`，说明网络仍不可达，需要代理或换网络。

### 4. 配置代理（本次有效端口为 2080）
若本机有代理服务，且代理端口为 `2080`，配置 Git 走代理：

```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
git config --global http.proxy http://127.0.0.1:2080
git config --global https.proxy http://127.0.0.1:2080
```

验证代理是否可用：

```bash
curl -I -x http://127.0.0.1:2080 https://github.com
```

出现 `HTTP/1.1 200 OK` 表示代理可用。

### 5. 再次推送
网络与远端修复完成后执行：

```bash
git push -u origin main
```

## 踩坑与经验总结

### 1) 命令里不要用反引号包 URL
错误示例：
- ``curl -I `https://github.com` ``
- 远端 URL 被设置为 `` `https://github.com/...` ``

影响：
- `git remote` 保存了包含反引号的非法 URL
- `git push` 可能提示 “unable to access '`https://...`'”

正确示例：
- `curl -I https://github.com`

### 2) 先看 `git remote -v`，清理拼写错误的 remote
本次出现了误拼远端 `orign`，会造成混乱与误操作。

建议流程：
- 每次推送前先 `git remote -v`
- 有异常直接 `git remote remove <name>` 后重建

### 3) `curl -I https://github.com` 是最快的网络诊断
- `curl` 都连不上，`git push` 一定连不上
- `curl` 能通但 `git push` 不通，再检查代理配置/证书/URL

### 4) Git 代理端口要与实际代理一致
本次一开始配置为 `7890`，但实际可用端口是 `2080`，导致：
- `Failed to connect to 127.0.0.1 port 7890`

建议：
- 先 `curl -I -x http://127.0.0.1:<port> https://github.com` 验证端口再写 git config

### 5) GitHub HTTPS 推送可能需要 Token
如果推送提示输入密码失败，原因通常是 GitHub 不再支持账号密码推送，需要：
- 使用 Personal Access Token（PAT）作为密码
- 或改用 SSH Key（长期更省事）
