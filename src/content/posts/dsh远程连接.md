---
title: "dsh远程连接"
date: 2026-09-03
description: "通过 Tailscale 让手机远程访问电脑上的 DeepSeek Harness Web 界面"
categories: ["dsh"]
tags: ["远程连接", "Tailscale", "工具"]
draft: true
---

# DeepSeek Harness Web 手机远程连接指南（Tailscale）

> 目标：让手机（Android/iPhone）能远程访问电脑上运行的 DeepSeek Harness Web 界面（默认端口 `3080`），并且能正常对话、看历史记录。

---

<img src="C:\Users\DongDong\AppData\Roaming\Typora\typora-user-images\image-20260903150916375.png" alt="image-20260903150916375" style="zoom:33%;" />

## 〇、整体原理（先看懂这张图）

```
电脑（Windows）
  └─ 运行：dsh web  （监听 0.0.0.0:3080，即所有网卡）
        │
        ├──【场景A 同一WiFi】──→ 手机直接访问 http://192.168.0.154:3080 （最快）
        │
        └──【场景B 远程/流量】──→ 手机走 Tailscale 访问 http://100.88.155.90:3080
```

- 你现在的 Tailscale 状态是 **`direct`（直连）**，不是 `relay`（中转），已经是理想状态。
- 第一次打开会慢（要下载约 4.3MB 资源），**第二次以后会快**（浏览器缓存生效）。

---

## 一、需要准备的东西

| 设备 | 要求                                                         |
| ---- | ------------------------------------------------------------ |
| 电脑 | Windows，已装好 DeepSeek Harness，能运行 `dsh web`           |
| 手机 | Android 或 iPhone，能装 Tailscale App                        |
| 账号 | 一个 Tailscale 账号（免费即可），**电脑和手机登录同一个账号** |

---

## 二、第一步：在电脑上启动 Web 界面

### 2.1 打开终端

在电脑上按 `Win + R`，输入 `powershell` 回车（或用 CMD、Windows Terminal 都行）。

### 2.2 启动服务

```powershell
dsh web
```

> 如果你是从源码目录启动，先进入目录再运行：
>
> ```powershell
> cd C:\Users\DongDong\Desktop\deepseek-harness
> pnpm dsh web
> ```

启动成功后，终端会打印一行类似：

```
dsh web: http://127.0.0.1:3080 (LAN: http://192.168.0.154:3080)
```

- `127.0.0.1:3080` = 只能电脑自己访问
- `192.168.0.154:3080` = 局域网内其他设备（手机）可访问

### 2.3 确认服务器是否“对外”监听（关键）

在**另一个终端窗口**运行：

```powershell
netstat -ano | findstr :3080
```

**必须**看到这样一行（注意开头的 `0.0.0.0`）：

```
TCP    0.0.0.0:3080           0.0.0.0:0              LISTENING       17436
```

- ✅ 有 `0.0.0.0:3080 ... LISTENING` → 手机可以访问（正常）
- ❌ 只有 `127.0.0.1:3080` → 只在本机，手机连不上，需要看下一节

### 2.4 关于 `--host` 参数（重要）

Web 界面的启动命令支持这几个参数：

```powershell
dsh web --host <监听地址> --port <端口>
```

- `--port`：改端口（默认 3080）
- `--host 0.0.0.0`：绑定所有网卡，让局域网/Tailscale 都能访问

> ⚠️ 注意：**较新版本可能会拒绝 `--host 0.0.0.0`**（会报 `intentionally not supported`），这是出于安全考虑（避免把“可远程执行代码”的服务直接暴露到公网）。
>
> 如果你的版本拒绝 `0.0.0.0`，**请改用方案 C（`tailscale serve`）**，它不需要绑定 0.0.0.0 也能安全远程访问。

---

## 三、第二步：安装并登录 Tailscale

### 3.1 电脑端

1. 打开官网下载页：https://tailscale.com/download
2. 下载 Windows 版并安装
3. 安装完成后，任务栏右下角会出现 Tailscale 图标，点击登录你的账号

### 3.2 手机端

1. 应用商店（应用市场 / App Store）搜索 **Tailscale** 并安装
2. 打开，登录**和电脑同一个账号**

### 3.3 验证连接状态

在电脑终端运行：

```powershell
tailscale status
```

应该看到类似输出（你之前的就是这样）：

```
100.88.155.90  laptop-7ssace6p  dongmuyunanfeng@  windows  -
100.124.16.39  v2505a           dongmuyunanfeng@  android  active; direct ...
```

**重点看手机那一行：**

- ✅ `direct`（直连）→ 速度正常，理想状态
- ⚠️ `relay`（中转）→ 走了 Tailscale 中继服务器，会慢，见「常见问题」

---

## 四、第三步：在手机上访问

### 场景 A：手机和电脑在同一个 WiFi（最快，优先用这个）

1. 手机连上和电脑**同一个 WiFi**
2. 打开手机浏览器（Chrome / Safari 等）
3. 地址栏输入：

```
http://192.168.0.154:3080
```

> `192.168.0.154` 是你电脑的局域网 IP。如果变了，在电脑上运行 `ipconfig`，找到「无线局域网适配器 WLAN」下的 IPv4 地址替换即可。

### 场景 B：手机用流量 / 不在同一个网络（远程）

1. 手机保持 Tailscale 已连接（App 打开，显示 Connected）
2. 打开手机浏览器，输入电脑的 **Tailscale IP**：

```
http://100.88.155.90:3080
```

> `100.88.155.90` 是电脑的 Tailscale IP。在电脑上运行 `tailscale status`，第一列那个 `100.x.x.x` 就是。

### 场景 C：HTTPS + 干净域名（推荐长期使用，可选）

这个方案不需要服务器绑定 `0.0.0.0`，更安全，还能拿到 HTTPS（安全上下文）。

1. 电脑终端运行：

```powershell
tailscale serve --bg 3080
```

2. 手机打开（换成你自己的机器名和 tailnet 名）：

```
https://<电脑名>.<你的tailnet>.ts.net
```

例如你电脑名是 `laptop-7ssace6p`，地址类似：

```
https://laptop-7ssace6p.xxxxx.ts.net
```

> 好处：自动 HTTPS、干净好记的域名、不用记 IP。
> 注：若走 `tailscale serve` 后界面能打开但「新建会话/发消息」报错，可能是 `/api` 信任列表需要加上该域名，此时启动命令加上：
>
> ```powershell
> dsh web --trusted-host laptop-7ssace6p.xxxxx.ts.net
> ```

---

## 五、验证是否成功

手机浏览器打开后，应该能看到 **DeepSeek Harness 界面**，并且能：

- [ ] 新建会话 / 打开已有会话
- [ ] 发送消息并收到回复
- [ ] 历史记录正常显示（加载时短暂等待属正常）

> 提示：**第一次**打开会慢（下载约 4.3MB 资源），**之后**再打开/刷新会明显变快（缓存生效）。这是正常现象。

---

## 六、常见问题排查

### 6.1 手机打不开 / 一直转圈 / 白屏

按顺序检查：

1. 电脑端服务是否在运行（终端里 `dsh web` 还在跑）
2. `netstat -ano | findstr :3080` 是否显示 `0.0.0.0:3080 ... LISTENING`
3. 手机和电脑 Tailscale 是否都显示 Connected
4. 用的 IP 是否正确（同一 WiFi 用 `192.168.0.154`，远程用 `100.88.155.90`）

### 6.2 报 `crypto.randomUUID is not a function`

- 这个问题**已经修复**（加了兼容补丁），正常情况下不会再出现。
- 如果还出现：说明用的是老版本缓存，**强制刷新**（或清缓存重开）；更彻底的办法是改用方案 C 的 HTTPS 地址。

### 6.3 历史记录加载慢

- **已经优化**（历史分片合并 + gzip 压缩），正常情况下应该很快。
- 特别大的会话首次加载会稍慢，之后有缓存会快。

### 6.4 第一次打开慢、第二次以后快

- **这是正常现象**：第一次要下载全部资源并缓存，之后直接从缓存读。
- 想第一次也更快：① 尽量同一 WiFi；② 手机别用无痕/隐私模式（无痕不保留缓存）。

### 6.5 `tailscale status` 显示 `relay`（中转）而不是 `direct`

- 说明 Tailscale 没能建立点对点直连，走了中继（慢、且国内中继不稳定）。
- 可尝试：换网络、重启 Tailscale、`tailscale ping 100.88.155.90` 看延迟。
- 如果一直是 relay，建议：同一 WiFi 时直接用局域网 IP（场景 A），别走 Tailscale。

### 6.6 换了端口 / 换电脑

- 换端口：启动命令加 `--port 新端口`，手机地址也跟着改成 `:新端口`。
- 换电脑：手机地址里的 IP 换成新电脑的对应 IP（`ipconfig` 查局域网 IP、`tailscale status` 查 Tailscale IP）。

### 6.7 界面能打开，但功能报 `HTTP 403`（本次遇到的就是这个）

**症状**：界面/设置页能打开，但加载预设、历史、对话等报 `transport failure ... HTTP 403`。

**原因**：DeepSeek Harness 的 `/api` 有一个「信任栅栏」，它只在**服务器启动那一刻**扫描一次网卡 IP 作为可信名单，之后不会更新。如果启动时 Tailscale 还没连上（或 WiFi 的 IP 变了），手机访问用的 IP 就不在名单里，于是所有 `/api` 请求被拒（403）。

**解决**：

1. 确认电脑和手机 Tailscale 都已 Connected；
2. **重启 `dsh web`**（先 `Ctrl+C` 停掉，再重新启动），让它重新扫描网卡；
3. 手机刷新页面。

**彻底防止再犯**：启动命令固定加上 Tailscale IP：

```powershell
dsh web --trusted-host 100.88.155.90
```

> `100.88.155.90` 是你电脑的 Tailscale IP（`tailscale status` 可查）。这样即使 Tailscale 晚连上，该 IP 也永远被信任。

---

## 七、日常操作清单（照做即可）

### 开机 / 使用前

1. 电脑和手机**都先打开 Tailscale**，确认显示 Connected
2. 电脑终端启动：`dsh web --trusted-host 100.88.155.90`（保持窗口不关）
3. 手机浏览器打开对应地址（场景 A 或 B）

### 关闭 / 不用时

1. 手机直接关浏览器即可（不影响电脑）
2. 电脑要彻底停服：在 `dsh web` 的终端窗口按 `Ctrl + C`

### 改了代码 / 更新后

1. 先 `Ctrl + C` 停掉旧服务
2. 重新 `dsh web`
3. 手机**强制刷新**（或关掉重开）

---

## 附：你的关键信息速查

| 项目               | 值                          |
| ------------------ | --------------------------- |
| Web 端口           | `3080`                      |
| 电脑局域网 IP      | `192.168.0.154`             |
| 电脑 Tailscale IP  | `100.88.155.90`             |
| 电脑名             | `laptop-7ssace6p`           |
| Tailscale 连接状态 | `direct`（直连，正常）      |
| 同一 WiFi 访问地址 | `http://192.168.0.154:3080` |
| 远程访问地址       | `http://100.88.155.90:3080` |