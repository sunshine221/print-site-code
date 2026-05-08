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
### 1) 常见问题：服务器直连 GitHub 失败导致 `git clone` 卡住
表现：
- `curl -I https://github.com` 超时
- `git clone https://github.com/...` 长时间无输出或失败

解决思路：
- 优先配置服务器代理（见本文“踩坑总结：GitHub 访问与代理”）
- 或使用压缩包上传到服务器绕开 GitHub 访问（备选方案）

### 2) 正确的 clone 命令（不要用反引号）
```bash
cd /opt/print-site
git clone https://github.com/sunshine221/print-site-code.git
cd print-site-code
cd workspace
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

## 三、安装依赖（项目级）
在项目目录执行：
```bash
cd /opt/print-site/print-site-code/workspace
npm install
```

## 四、构建前后端产物
```bash
npm run build
```

构建结果：
- 前端：`/opt/print-site/print-site-code/workspace/dist`
- 后端：`/opt/print-site/print-site-code/workspace/api/dist`

## 五、启动后端（PM2）
```bash
cd /opt/print-site/print-site-code/workspace
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
### 1) 站点配置文件
```bash
sudo nano /etc/nginx/sites-available/print-site
```

示例配置（注意 root 指向 dist）：
```nginx
server {
  listen 80;
  server_name _;  # 可替换为你的域名，例如 server_name ymbj.online www.ymbj.online;

  root /opt/print-site/print-site-code/workspace/dist;
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

### 2) 验证 Nginx 前端与 API
前端页面：
- `http://<域名或公网IP>/`
- `http://<域名或公网IP>/admin/login`

API（从 Nginx 入口验证）：
```bash
curl -i http://127.0.0.1/api/health
```

## 七、踩坑总结与排查经验

### 1) 命令不要带反引号
错误示例：
- `git clone \`https://github.com/...git\``
- `curl -I \`https://github.com\``

说明：
- 反引号在 shell 中是命令替换，容易造成参数异常或排查困难。

### 2) `npm install` 失败：better-sqlite3 编译缺少 g++
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
rm -rf node_modules package-lock.json
npm install
```

### 3) Nginx 404 Not Found（访问 /admin/login）
现象：
- 浏览器访问 `/admin/login` 显示 Nginx 404

原因：
- `root` 指向路径不对（真实 dist 在 `/opt/print-site/print-site-code/workspace/dist`）
- 或缺少 SPA 回退：`try_files $uri /index.html;`

排查：
```bash
sudo nginx -T | grep -n "root " -n | head
sudo nginx -T | grep -n "try_files \\$uri /index.html" -n
```

### 4) 前端提示 “API not found”（/api/auth/login 404）
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

### 5) GitHub 访问与代理（概要）
当服务器直连 GitHub 超时时，可在服务器部署 mihomo 代理后再进行 clone。
- 重点：订阅配置可能依赖 `Country.mmdb`，如果无法自动下载会导致端口不监听，需要手动放置 mmdb 打破死循环。
- 详细记录见：
  - `docs/wiki/Ubuntu服务器-配置Mihomo代理访问GitHub-记录与踩坑总结.md`
