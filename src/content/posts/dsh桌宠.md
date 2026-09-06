---
title: "dsh桌宠"
date: 2026-09-03
description: "C罗桌宠（dsh-ronaldo-pet）插件的安装、更新与故障排查手册"
categories: ["dsh"]
tags: ["桌宠", "插件", "dsh"]
draft: true
---

# C罗桌宠（dsh-ronaldo-pet）安装与维护手册

<img src="C:\Users\DongDong\AppData\Roaming\Typora\typora-user-images\image-20260903150615110.png" alt="image-20260903150615110" style="zoom: 33%;" />

> 这份手册面向**你自己动手操作**：怎么装、怎么改、怎么验证、出问题怎么查。
> 所有路径、命令、文件都是**本机实际生效**的，照抄即可。

---

## 一、先搞懂一件事：哪个文件真正生效（最重要）

桌宠是 DSH 的一个 **bundle 插件**，分两半：

| 半        | 文件               | 运行位置                   | 改完如何生效                             |
| --------- | ------------------ | -------------------------- | ---------------------------------------- |
| Host 半   | `host.js`          | 服务端（Node 进程）        | 改完 → **重启服务**                      |
| Client 半 | `client/client.js` | 浏览器（Web 界面）         | 改完 → **重启服务 + 刷新页面**           |
| 素材      | `assets/*`         | 服务端读取、按需发给浏览器 | 改完 → 重启服务 + **强刷页面**（有缓存） |

**关键坑（你之前踩过的就是这个）：**

服务加载的插件，不是你的源码目录，而是：

```
C:\Users\DongDong\.dsh\profiles\web\node_modules\dsh-ronaldo-pet\
```

也就是说：**你改源码目录 `主题\dsh-pet-ronaldo\` 里的文件，服务不会理会**，必须改（或复制到）上面 `node_modules` 里那份才生效。

### 本机关键路径速查表

| 用途                                 | 路径                                                         |
| ------------------------------------ | ------------------------------------------------------------ |
| ✅ **实际生效的插件**（改这里才管用） | `C:\Users\DongDong\.dsh\profiles\web\node_modules\dsh-ronaldo-pet\` |
| 📦 源码/备份目录（建议同步保留）      | `C:\Users\DongDong\Desktop\ai项目\deepseek工作区\主题\dsh-pet-ronaldo\` |
| ⚙️ profile 配置目录                   | `C:\Users\DongDong\.dsh\profiles\web\`                       |
| 🔌 DSH 源码（服务从这里启动）         | `C:\Users\DongDong\Desktop\deepseek-harness\`                |
| 🔁 重启脚本                           | `C:\Users\DongDong\Desktop\ai项目\deepseek工作区\重启DeepSeek服务.bat` |

---

## 二、必需文件清单

一个完整可用的插件目录 `dsh-ronaldo-pet\` 里必须有这些文件：

```
dsh-ronaldo-pet\
├── host.js                  # Host 半：轮询 agent 状态、注册路由、播放声音（常驻播放器方案）
├── client\
│   └── client.js            # Client 半：桌宠渲染、动画、拖动/点击交互
├── cordis.patch.yml         # bundle patch（声明插件 id）
├── package.json             # 包元数据 + dsh.bundle / dsh.client 配置
├── assets\
│   ├── spritesheet.webp     # 精灵图（1536×2288，8 列 × 11 行）
│   ├── siu.mp3              # SIU 提示音（当前生效的是 clean 版 62765 字节）
│   └── MciPlayer.dll        # MCI 播放助手 DLL（本地定制产物，GitHub 仓库里没有！）
└── ...（README/LICENSE/demo/docs/scripts 可省略，不影响运行）
```

> ⚠️ **`MciPlayer.dll` 特别注意**：它是之前为消除声音延迟而本地编译的，**GitHub 原始仓库里没有**。重新安装时一定要带上它，否则声音播不出来。丢失时如何重新生成见第八章。

---

## 三、日常更新流程（最常用，务必照做）

以后改桌宠（换声音、改动画、改行为）都走这套流程：

### 第 1 步：改文件（推荐改「生效区」，同步改「备份区」）

推荐方式：**直接改 `node_modules` 里那份**（它就是生效的），改完再复制回源码目录做备份。

```
C:\Users\DongDong\.dsh\profiles\web\node_modules\dsh-ronaldo-pet\host.js        ← 改这里管用
C:\Users\DongDong\.dsh\profiles\web\node_modules\dsh-ronaldo-pet\client\client.js
C:\Users\DongDong\.dsh\profiles\web\node_modules\dsh-ronaldo-pet\assets\...
```

改完，把改动**同步复制**到备份目录，保持两边一致：

```
C:\Users\DongDong\Desktop\ai项目\deepseek工作区\主题\dsh-pet-ronaldo\
```

> 复制命令示例（改完 `host.js` 后，从生效区同步回备份区）：
>
> ```powershell
> copy "C:\Users\DongDong\.dsh\profiles\web\node_modules\dsh-ronaldo-pet\host.js" `
>   "C:\Users\DongDong\Desktop\ai项目\deepseek工作区\主题\dsh-pet-ronaldo\host.js"
> ```

### 第 2 步：重启服务

双击：

```
C:\Users\DongDong\Desktop\ai项目\deepseek工作区\重启DeepSeek服务.bat
```

这个脚本会：关掉桌面版窗口 → 杀掉占用 3080 端口的旧服务 → 从 DSH 源码用 `node apps\cli\lib\bin.js web` 重新启动。

### 第 3 步：刷新页面 + 验证

- 改的是 `host.js`：重启后**新会话立即生效**，旧页面刷新一次即可。
- 改的是 `client/client.js`：重启后**刷新浏览器页面**（Ctrl+R）。
- 改的是 `assets\`（声音/图）：重启后**强刷**（Ctrl+Shift+R 或 Ctrl+F5），因为素材带 24 小时缓存。

---

## 四、替换声音 / 精灵图

### 换声音（SIU）

1. 把新音频文件重命名为 **`siu.mp3`**（必须这个名字）；
2. 覆盖到：

```
C:\Users\DongDong\.dsh\profiles\web\node_modules\dsh-ronaldo-pet\assets\siu.mp3
```

3. 重启服务 + 强刷页面验证。

> 本机已有的声音备选（都在工作目录根下）：
>
> | 文件                   | 大小       | 说明                               |
> | ---------------------- | ---------- | ---------------------------------- |
> | `siu_clean.mp3`        | 62765 字节 | 当前生效的 clean 版（裁剪/清理后） |
> | `siu_trimmed.mp3`      | 62139 字节 | 另一版裁剪                         |
> | `siu_original.bak.mp3` | 94493 字节 | 原始备份版                         |

### 换精灵图（桌宠形象）

1. 新图重命名为 **`spritesheet.webp`**（必须这个名字，格式 WebP）；
2. 尺寸要求 **1536×2288**（8 列 × 11 行，每格 192×208），否则动画会错位；
3. 覆盖到：

```
C:\Users\DongDong\.dsh\profiles\web\node_modules\dsh-ronaldo-pet\assets\spritesheet.webp
```

4. 重启服务 + 强刷页面。

---

## 五、全新安装（从零 / 换机器 / 手滑删了）

当前插件在 GitHub 上的版本是**旧版**（没有 `MciPlayer.dll`、没有常驻播放器、声音也不是 clean 版），所以**最稳妥的方式是从本地备份整目录复制**，而不是从 GitHub 重新拉。

### 方式一：从本地备份复制（推荐）

1. 确认 profile 目录存在：

```powershell
Test-Path "C:\Users\DongDong\.dsh\profiles\web"
```

2. 创建目标目录并整目录复制：

```powershell
$src = "C:\Users\DongDong\Desktop\ai项目\deepseek工作区\主题\dsh-pet-ronaldo"
$dst = "C:\Users\DongDong\.dsh\profiles\web\node_modules\dsh-ronaldo-pet"
if (Test-Path $dst) { Remove-Item $dst -Recurse -Force }
Copy-Item $src $dst -Recurse
```

3. 确认 `package.json` 里已声明 bundle（没有就补，见下）；
4. 重启服务。

### 方式二：GitHub 基础版 + 覆盖本地定制

只在「本地备份也没了」时用：

1. 在 profile 目录装 GitHub 基础版：

```powershell
cd "C:\Users\DongDong\.dsh\profiles\web"
pnpm install "github:WQ145/dsh-pet-ronaldo"
```

2. 手动补上 GitHub 没有的 4 个定制文件：
   - `host.js`（常驻播放器版）
   - `client\client.js`（本地定制版）
   - `assets\MciPlayer.dll`（重新生成，见第八章）
   - `assets\siu.mp3`（换成 clean 版）

---

## 六、profile 配置文件（安装/修复时用）

### `C:\Users\DongDong\.dsh\profiles\web\package.json`

关键是要有 `dsh.profile.bundles` 里包含 `"dsh-ronaldo-pet"`：

```json
{
  "name": "dsh-profile-web",
  "private": true,
  "dsh": {
    "profile": {
      "bundles": [
        "@deepseek-ai/dsh-base",
        "@deepseek-ai/dsh-web-app",
        "dsh-any-background",
        "dsh-ronaldo-pet"
      ]
    }
  },
  "dependencies": {
    "dsh-any-background": "github:Tkingxiao/dsh-any-background",
    "dsh-ronaldo-pet": "github:WQ145/dsh-pet-ronaldo"
  }
}
```

### `C:\Users\DongDong\.dsh\profiles\web\cordis.patch.yml`

（你的 webserver 端口/主机配置，一般不用动）

```yaml
- id: webserver
  config:
    host: '0.0.0.0'
    port: !!js ctx.webStartup.port ?? 3080
```

> 不要改 `cordis.yml`（它就是个空列表 `[]`，注释里写明了）。

---

## 七、验证桌宠是否正常

服务启动后，用下面三个地址验证（浏览器或 `curl` 都行）：

| 检查项       | 地址                                                 | 正常表现                                |
| ------------ | ---------------------------------------------------- | --------------------------------------- |
| 插件是否响应 | `http://127.0.0.1:3080/ronaldo-pet/state`            | 返回 JSON，如 `{"mode":"idle","seq":0}` |
| 声音文件     | `http://127.0.0.1:3080/ronaldo-pet/siu.mp3`          | 返回音频，大小 62765 字节               |
| 精灵图       | `http://127.0.0.1:3080/ronaldo-pet/spritesheet.webp` | 返回图片                                |

PowerShell 快速验证命令：

```powershell
# 状态（插件活着没有）
(Invoke-WebRequest "http://127.0.0.1:3080/ronaldo-pet/state" -UseBasicParsing).Content

# 声音文件大小（应 = 62765）
(Invoke-WebRequest "http://127.0.0.1:3080/ronaldo-pet/siu.mp3" -UseBasicParsing).RawContentLength
```

---

## 八、MciPlayer.dll 丢失时重新生成

`MciPlayer.dll` 是一个极小的 .NET 程序集（3072 字节），封装了 Windows 的 `winmm.dll` 的 `mciSendString` 调用。用下面命令即可重新生成：

```powershell
$out = "C:\Users\DongDong\.dsh\profiles\web\node_modules\dsh-ronaldo-pet\assets\MciPlayer.dll"
$src = @"
using System;
using System.Runtime.InteropServices;
namespace RonaldoPet {
  public static class Mci {
    [DllImport("winmm.dll", CharSet = CharSet.Unicode)]
    public static extern int mciSendString(string command, IntPtr buffer, int bufferSize, IntPtr callback);
  }
}
"@
Add-Type -TypeDefinition $src -OutputAssembly $out -OutputType Library
```

生成后验证（返回 `0` 表示成功）：

```powershell
Add-Type -Path $out
[RonaldoPet.Mci]::mciSendString('open new type waveaudio alias t', [IntPtr]::Zero, 0, [IntPtr]::Zero)
# 返回 0 即正常
```

> 实测：这个命令生成的 DLL 恰好 3072 字节，与现有一致，可放心使用。

---

## 九、故障排查

| 症状             | 原因                                      | 解决                                                         |
| ---------------- | ----------------------------------------- | ------------------------------------------------------------ |
| 桌宠根本不出现   | profile 没声明 bundle，或插件目录缺失     | 检查第六节 `bundles` 列表；确认 `node_modules\dsh-ronaldo-pet\` 存在 |
| 改了源码不生效   | 改的是备份目录，服务读的是 `node_modules` | 改（或复制）到 `node_modules\dsh-ronaldo-pet\`               |
| 声音延迟 1~2 秒  | 旧版每次冷启动 PowerShell                 | 确认 `host.js` 是「常驻播放器」版本（含 `spawn('powershell.exe'` 与 `ensurePlayer`） |
| 声音完全不响     | 缺 `MciPlayer.dll`，或 `siu.mp3` 路径不对 | 确认 `assets\MciPlayer.dll` 存在；第八章重新生成             |
| 换素材后还是旧的 | 浏览器缓存（素材有 24h 缓存）             | 强刷 Ctrl+Shift+R，或换无痕窗口                              |
| 服务起不来       | 3080 端口被占 / 启动命令错                | 运行重启脚本；确认是从 `deepseek-harness` 目录跑 `node apps\cli\lib\bin.js web` |

---

## 十、避坑清单（一句话版）

1. **生效目录只有一个**：`~\.dsh\profiles\web\node_modules\dsh-ronaldo-pet\`。
2. **改完必重启**（双击 `重启DeepSeek服务.bat`），改 client/素材还要刷新页面。
3. **`MciPlayer.dll` 是本地定制**，GitHub 上没有，别弄丢。
4. **素材文件名固定**：`siu.mp3`、`spritesheet.webp`，放在 `assets\` 下。
5. **素材有缓存**，换完强刷（Ctrl+Shift+R）。
6. 改完记得**同步备份目录**，避免两边版本不一致（这就是你上次「没变化」的根源之一）。