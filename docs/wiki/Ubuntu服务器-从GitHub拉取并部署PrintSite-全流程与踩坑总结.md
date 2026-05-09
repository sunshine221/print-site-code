## 目的
记录本次在腾讯云 Ubuntu 服务器上从 GitHub 拉取项目代码，并完成安装依赖、构建、PM2 启动后端、Nginx 托管前端与反向代理 API 的全过程，同时沉淀踩坑与排查经验。

## 环境信息
- 服务器：腾讯云 Ubuntu（无桌面）
- Node.js：20.x
- Nginx：1.24.0（Ubuntu）
- 进程管理：PM2
- 后端端口：3000（Express）
- 站点域名/地址：`http://<域名或公网IP>/`

## 一、从 GitHub 拉取代码（网络可用前提）
### 1.1 常见问题：服务器直连 GitHub 失败导致 `git clone` 卡住
表现：
- `curl -I https://github.com` 超时
- `git clone https://github.com/...` 长时间无输出或失败

解决思路：
- 优先配置服务器代理（见本文“踩坑总结：GitHub 访问与代理”）
- 或使用压缩包上传到服务器绕开 GitHub 访问（备选方案）

### 1.2 正确的 clone 命令（不要用反引号）
```bash
cd /opt/print-site
git clone https://github.com/sunshine221/print-site-code.git
cd print-site-code
```

## 二、安装运行环境（一次性）
```bash
sudo apt update
sudo apt install -y git nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2
```

说明：
- `nginx`：托管前端静态文件 + 反向代理 `/api` 到后端
- `pm2`：守护 Node/Express 后端进程，支持开机自启
- 以上命令通常只需要执行一次：仅当服务器重装、需要升级系统包/Node/PM2 时才需要重复执行
- `sudo apt update` 不需要每次更新代码都执行，只有安装/升级系统包时再执行更合适

### 2.1 配置环境变量（一次性，必须）
进入项目目录，复制并编辑 `.env`：
```bash
cd /opt/print-site/print-site-code
cp .env.example .env
nano .env
```

至少要改这些（很关键）：
```bash
JWT_SECRET=改成强随机字符串
ADMIN_PASSWORD=改成你的管理员密码
DB_PATH=/opt/print-site/data/app.sqlite
PORT=3000
```

如果你要启用“代打上传直传 COS”，再补齐：
```bash
COS_BUCKET=...
COS_REGION=...
COS_SECRET_ID=...
COS_SECRET_KEY=...
UPLOAD_MAX_BYTES=209715200
```

并创建数据库目录（确保后端进程可写）：
```bash
sudo mkdir -p /opt/print-site/data
sudo chown -R $USER:$USER /opt/print-site/data
```

## 三、安装依赖（项目级）
在项目目录执行：
```bash
cd /opt/print-site/print-site-code
npm ci
```

说明：
- 推荐使用 `npm ci`（严格按 package-lock.json 安装，更稳定）
- 每次 Git 更新后是否需要执行依赖安装：
  - 若 `package.json` 或 `package-lock.json` 有变化：需要执行 `npm ci`
  - 若没有变化：通常可以跳过依赖安装，直接构建与重启即可

## 四、构建前后端产物
```bash
npm run build
```

构建结果：
- 前端：`/opt/print-site/print-site-code/dist`
- 后端：`/opt/print-site/print-site-code/api/dist`

## 五、启动后端（PM2）
```bash
cd /opt/print-site/print-site-code
pm2 start api/dist/server.js --name print-site-api
pm2 save
pm2 startup
```

检查是否在线：
```bash
pm2 list
```

验证后端健康检查（本机直连）：
```bash
curl -I http://127.0.0.1:3000/api/health
```

## 六、配置 Nginx（前端托管 + API 反向代理）
### 6.1 站点配置文件
```bash
sudo nano /etc/nginx/sites-available/print-site
```

示例配置（注意 root 指向 dist）：
```nginx
server {
  listen 80;
  server_name _;  # 可替换为你的域名，例如 server_name ymbj.online www.ymbj.online;

  root /opt/print-site/print-site-code/dist;
  index index.html;

  location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    try_files $uri /index.html;
  }
}
```

启用并重载：
```bash
sudo ln -sf /etc/nginx/sites-available/print-site /etc/nginx/sites-enabled/print-site
sudo nginx -t
sudo systemctl reload nginx
```

### 6.2 验证 Nginx 前端与 API
前端页面：
- `http://<域名或公网IP>/`
- `http://<域名或公网IP>/admin/login`

API（从 Nginx 入口验证）：
```bash
curl -i http://127.0.0.1/api/health
```

## 七、Git 更新后的服务器操作（每次发布/更新）
目标：当 GitHub 仓库有更新时，在服务器拉取最新代码并让线上立即生效。

### 7.1 先 SSH 登录腾讯云服务器
```bash
ssh ubuntu@你的公网IP
```

### 7.2 拉取最新代码
```bash
cd /opt/print-site/print-site-code
git pull
```

### 7.3 安装依赖（按需）
仅当 `package.json` 或 `package-lock.json` 有变化时执行：
```bash
cd /opt/print-site/print-site-code
npm ci
```

### 7.4 重新构建（前端 dist + 后端 api/dist）
```bash
cd /opt/print-site/print-site-code
npm run build
```

### 7.5 重启后端（PM2）
```bash
pm2 restart print-site-api
pm2 save
```

### 7.6 验证
后端本机直连：
```bash
curl -I http://127.0.0.1:3000/api/health
```
走 Nginx 入口：
```bash
curl -i http://127.0.0.1/api/health
```

## 八、踩坑总结与排查经验

### 8.1 命令不要带反引号
错误示例：
- `git clone \`https://github.com/...git\``
- `curl -I \`https://github.com\``

说明：
- 反引号在 shell 中是命令替换，容易造成参数异常或排查困难。

### 8.2 `npm install` 失败：better-sqlite3 编译缺少 g++
现象（关键行）：
- `make: g++: No such file or directory`

原因：
- `better-sqlite3` 是原生模块，需要编译工具链。

解决：
```bash
sudo apt update
sudo apt install -y build-essential python3 make g++
```
然后重新安装依赖：
```bash
rm -rf node_modules
npm ci
```

### 8.3 Nginx 404 Not Found（访问 /admin/login）
现象：
- 浏览器访问 `/admin/login` 显示 Nginx 404

原因：
- `root` 指向路径不对（真实 dist 在 `/opt/print-site/print-site-code/dist`）
- 或缺少 SPA 回退：`try_files $uri /index.html;`

排查：
```bash
sudo nginx -T | grep -n "root " -n | head
sudo nginx -T | grep -n "try_files \\$uri /index.html" -n
```

### 8.4 前端提示 “API not found”（/api/auth/login 404）
现象：
- 后端本机 `curl http://127.0.0.1:3000/api/health` 正常
- 浏览器请求 `http://<域名>/api/auth/login` 返回 404，前端显示 “API not found”

原因：
- `proxy_pass` 写法导致 URI 重写，把 `/api/...` 转发成 `/<...>`，后端路由匹配不到。

错误写法（会“吃掉 /api/”）：
```nginx
location /api/ {
  proxy_pass http://127.0.0.1:3000/;
}
```

正确写法（保留 /api 前缀）：
```nginx
location /api/ {
  proxy_pass http://127.0.0.1:3000;
}
```

验证（走 Nginx 入口）：
```bash
curl -i http://127.0.0.1/api/health
```

### 8.5 GitHub 访问与代理（概要）
当服务器直连 GitHub 超时时，可在服务器部署 mihomo 代理后再进行 clone。
- 重点：订阅配置可能依赖 `Country.mmdb`，如果无法自动下载会导致端口不监听，需要手动放置 mmdb 打破死循环。
- 详细记录见：
  - `docs/wiki/Ubuntu服务器-配置Mihomo代理访问GitHub-记录与踩坑总结.md`
