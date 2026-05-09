## 目的
在腾讯云 Ubuntu 服务器上配置代理，使服务器能够访问 GitHub（用于 `git clone` / `curl` / 安装依赖等），并记录本次配置流程与踩坑经验，便于复用。

## 背景与现象
### 初始问题
- 服务器无法访问 GitHub：
  - `curl -I https://github.com` 超时
  - `git clone https://github.com/...` 长时间卡住或失败

### 诊断结论
- 服务器到 GitHub 443 出站链路不可用（Timeout），需要通过代理实现访问。

## 方案选型
### 为什么不建议 Clash Verge Rev
- Clash Verge Rev 为桌面 GUI 客户端，服务器通常为无桌面环境（headless），部署成本高且不符合服务器运维习惯。

### 推荐方案：Mihomo（Clash Meta 内核）
- 适合服务器部署、可 systemd 常驻、可只监听本机、便于让 `curl/git/apt` 等走代理。
- 代理工作模式：本机监听 `127.0.0.1:<port>`，程序通过该端口转发请求到代理节点。

## 前置要求
- Ubuntu 服务器具备外网访问（至少能访问订阅地址/代理节点）
- 一个可用的订阅链接（生成 Clash 配置）
- 本文默认端口：
  - `mixed-port: 7890`（HTTP/SOCKS 混合端口）
  - 仅本机监听：`bind-address: 127.0.0.1` + `allow-lan: false`

## 安装与配置步骤（可复用）

### 1) 准备目录与权限
```bash
sudo mkdir -p /opt/mihomo /etc/mihomo
sudo chown -R $USER:$USER /opt/mihomo
```

### 2) 获取 mihomo 二进制
由于服务器可能无法直连 GitHub，推荐在本地电脑浏览器下载后上传到服务器（最稳）。

#### 2.1 在 GitHub 手动下载
- 打开发布页（示例版本 v1.19.24）：
  - https://github.com/MetaCubeX/mihomo/releases/tag/v1.19.24
- 选择下载：
  - `mihomo-linux-amd64-compatible-v1.19.24.gz`

选择理由：
- 服务器 Ubuntu 常见为 `x86_64`（amd64），`compatible` 兼容性更好。
- 若不确定架构，可在服务器执行 `uname -m`：
  - `x86_64` → 选择 `linux-amd64`
  - `aarch64` → 选择 `linux-arm64`

#### 2.2 上传到服务器并放置
将下载到本地的文件上传至服务器 `/opt/mihomo/mihomo.gz`（WinSCP 或 scp）。

示例（在本地电脑执行）：
```bash
scp ./mihomo-linux-amd64-compatible-v1.19.24.gz ubuntu@<公网IP>:/opt/mihomo/mihomo.gz
```

### 3) 解压与安装到 PATH
```bash
cd /opt/mihomo
gunzip -f mihomo.gz
chmod +x mihomo
sudo ln -sf /opt/mihomo/mihomo /usr/local/bin/mihomo
mihomo -v
```

说明：
- 软链接必须放在 `/usr/local/bin/`（默认在 PATH），放到 `/usr/local/mihomo` 会导致 `mihomo: command not found`。

### 4) 写入配置文件（订阅链接）
```bash
sudo curl -L "<订阅链接>" -o /etc/mihomo/config.yaml
```

安全建议（强烈）：
- 避免暴露管理端口到公网：
  - `external-controller` 仅允许 `127.0.0.1:9090`
- 代理端口仅监听本机：
  - `bind-address: 127.0.0.1`
  - `allow-lan: false`

### 5) 写入/修正关键运行项（避免冲突与语法错误）
订阅文件可能自带大量配置，常见问题是：
- key 重复（如 `allow-lan` 出现两次）
- DNS 配置里误写反引号或 URL 截断导致 YAML 解析失败
- 端口字段混用（同时写 `mixed-port` 和 `port`）

推荐将关键项统一为（示例）：
```yaml
mixed-port: 7890
allow-lan: false
bind-address: 127.0.0.1
mode: rule
log-level: info
mmdb: /etc/mihomo/Country.mmdb

dns:
  enable: true
  enhanced-mode: fake-ip
  nameserver:
    - 223.5.5.5
    - 119.29.29.29
```

说明：
- `mixed-port` 同时提供 HTTP/SOCKS 代理端口，最方便。
- `fake-ip` 有利于规则分流；如遇兼容问题可改 `redir-host`。

### 6) systemd 常驻运行
创建服务文件：
```bash
sudo tee /etc/systemd/system/mihomo.service >/dev/null <<'EOF'
[Unit]
Description=mihomo (Clash Meta)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/mihomo -d /etc/mihomo
Restart=always
RestartSec=3
LimitNOFILE=1048576

[Install]
WantedBy=multi-user.target
EOF
```

启动并设为开机自启：
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now mihomo
sudo systemctl status mihomo --no-pager
```

### 7) 验证代理是否可用
```bash
sudo ss -lntp | grep 7890
curl -I -x http://127.0.0.1:7890 https://github.com
```

若成功，将看到 `HTTP/1.1 200 OK` 或 `301/302`。

### 8) 让 git 走代理（可选）
如果系统全局网络仍不可达 GitHub，但 mihomo 可用，则让 git 使用本地代理：
```bash
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890
```

取消：
```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

## 踩坑记录与修复经验

### 1) URL 不要用反引号包起来
错误示例：
- `curl -I \`https://github.com\``
- `git clone \`https://github.com/xxx.git\``

说明：
- 反引号在 shell 中用于命令替换，容易造成参数异常，排查困难。
- 统一使用普通 URL：`curl -I https://github.com`

### 2) 权限导致下载失败，生成残缺文件
现象：
- `curl: (23) Failure writing output to destination`
- `/opt/mihomo` 无写权限

修复：
```bash
sudo chown -R $USER:$USER /opt/mihomo
```

### 3) 解压失败：不是 gzip 格式
现象：
- `gzip: mihomo.gz: not in gzip format`

原因：
- 下载失败时保存的是 HTML/错误页面或残缺内容，不是真正的 `.gz`。

排查：
```bash
file /opt/mihomo/mihomo.gz
ls -lh /opt/mihomo/mihomo.gz
head -c 200 /opt/mihomo/mihomo.gz
```

解决：
- 本地电脑下载后上传至服务器，避免服务器直连 GitHub。

### 4) mihomo 命令找不到：软链接路径不在 PATH
现象：
- `mihomo: command not found`

原因：
- 链接到了 `/usr/local/mihomo`，不在 PATH。

修复：
```bash
sudo ln -sf /opt/mihomo/mihomo /usr/local/bin/mihomo
```

### 5) 端口不监听：配置冲突/订阅不完整
现象：
- `curl -x http://127.0.0.1:7890 ...` 直接报 “Couldn't connect to server”
- `ss -lntp | grep 7890` 无输出

常见原因：
- `mixed-port` 写错（例如 789 写成 7890）
- 同时写了 `mixed-port` 和 `port`，造成混乱
- DNS 配置里有语法错误（反引号、URL 截断、列表括号没闭合）

修复策略：
- 先用最小安全配置跑通（只保留端口、安全绑定、DNS、mmdb）
- 再逐步合并订阅的 `proxies/proxy-groups/rules`

### 6) “需要代理才能下载 mmdb” 的死循环
现象：
- 日志提示：`Can't find MMDB, start download`
- 由于没有代理可用，下载 mmdb 失败，导致代理端口也起不来

解决：
- 在本地下载 `Country.mmdb` 后上传到服务器，并配置：
  - `mmdb: /etc/mihomo/Country.mmdb`

## 结果
- mihomo 通过 systemd 常驻
- `curl -I -x http://127.0.0.1:7890 https://github.com` 成功
- `git clone https://github.com/sunshine221/print-site-code.git` 可正常执行
