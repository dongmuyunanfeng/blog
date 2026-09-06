---
title: "dsh实现图片发送"
date: 2026-08-31
description: "在deepseek harness中实现让大语言模型理解图片"
categories: ["dsh"]
tags: ["工具", "插件", "图片"]
draft: true
---

# 安装 dsh-vision-router 插件（让图片可以发送）— 完整正确步骤

> 适用环境：Windows · DeepSeek Harness · Web 配置（profile 名称 `web`）
> 目标：安装 `dsh-vision-router` 插件，并让「发送图片 → 看图」可用。

---

<img src="C:\Users\DongDong\AppData\Roaming\Typora\typora-user-images\image-20260903152220714.png" alt="image-20260903152220714" style="zoom: 67%;" />

<img src="C:\Users\DongDong\AppData\Roaming\Typora\typora-user-images\image-20260903152311246.png" alt="image-20260903152311246" style="zoom:50%;" />

## 0. 关键路径（先记下来，后面会反复用到）

| 项                       | 值                                                  |
| ------------------------ | --------------------------------------------------- |
| Harness 代码目录         | `C:\Users\DongDong\Desktop\deepseek-harness`        |
| DSH 数据目录（DSH_HOME） | `C:\Users\DongDong\.dsh`                            |
| Web profile 目录         | `C:\Users\DongDong\.dsh\profiles\web`               |
| 全局设置文件             | `C:\Users\DongDong\.dsh\settings.yaml`              |
| Web 界面                 | http://127.0.0.1:3080                               |
| pnpm 可执行文件          | `C:\Users\DongDong\AppData\Local\pnpm\bin\pnpm.CMD` |

> 本文所有命令都在 **PowerShell** 里执行，且默认已先 `cd` 到 harness 目录。

---

## 1. 前置条件

- harness 依赖已安装过（`pnpm install` 完成）。
- Node.js 版本 ≥ 22.19 或 ≥ 24（本机为 v24.19.0）。
- pnpm 已安装（本机为 pnpm 11.x）。

---

## 2. 安装插件（核心步骤）

### 2.1 进入 harness 目录

```powershell
cd C:\Users\DongDong\Desktop\deepseek-harness
```

### 2.2 先查一下最新版本号（不要照抄旧版本）

```powershell
pnpm.CMD view dsh-vision-router version
```

假设输出是 `1.3.0`，下面的 `@1.3.0` 就替换成你查到的版本号。

### 2.3 执行安装

```powershell
pnpm.CMD dsh plugin --profile web add dsh-vision-router@1.3.0
```

这条命令做了什么：

- `dsh plugin --profile web add <包名>` 会把 `add` 后面的参数**原样转发给 pnpm**，在 profile 目录 `C:\Users\DongDong\.dsh\profiles\web` 里执行；
- 装完后自动检测该包是否声明了 `dsh.bundle`，有就自动登记进 `dsh.profile.bundles`（也就是「成为插件层」）。

**两个必须注意的点：**

1. **用 `pnpm.CMD`，不要用 `pnpm`**
   本机 PowerShell 的脚本执行策略会阻止 `pnpm.ps1`，报错：
   `pnpm.ps1 cannot be loaded because running scripts is disabled`。
   用 `.CMD` 后缀走 cmd 就不会触发这个限制。

2. **要带 `@版本号`**
   pnpm 11 的 `minimumReleaseAge`（供应链保护）会让「不带版本号的 `add`」自动选一个「足够旧」的版本（当时被选成了 1.1.1，而不是最新 1.3.0）。
   显式写版本号才能装最新版；pnpm 会自动在 profile 的 `pnpm-workspace.yaml` 里加上 `minimumReleaseAgeExclude`，无需手动改。

> 如果 `pnpm.CMD` 不在 PATH 上，用完整路径：
>
> ```powershell
> C:\Users\DongDong\AppData\Local\pnpm\bin\pnpm.CMD dsh plugin --profile web add dsh-vision-router@1.3.0
> ```
>
> 等价写法（直接调 dsh 脚本，绕开外层 pnpm 包装）：
>
> ```powershell
> node --import tsx/esm apps/cli/src/bin.ts plugin --profile web add dsh-vision-router@1.3.0
> ```

---

## 3. 验证安装成功

```powershell
pnpm.CMD dsh --profile web --dump-config
```

在输出里能找到下面内容即表示装好并已被加载：

```yaml
- id: vision-router
  name: dsh-vision-router
```

（也可以用管道过滤：`... --dump-config | findstr vision-router`）

---

## 4. 重启 Web 服务器（加载新插件）

1. 在**正在运行 Web 服务器的那个终端**里按 `Ctrl+C` 停掉；
2. 重新启动：

```powershell
cd C:\Users\DongDong\Desktop\deepseek-harness
pnpm.CMD dsh web
```

3. 浏览器刷新 http://127.0.0.1:3080 。

---

## 5. 配置视觉模型（让「看图」真正可用）

装完插件后，还需要一个「能看图的模型」作为视觉后端。

### 5.1 在「设置 → 模型」里添加/确认自定义提供方

用 Web 界面添加你的提供方（例如 `qianwen` / dashscope），并把视觉模型加进该提供方的模型列表。

### 5.2 关键：手动给视觉模型补上 `input: [ text, image ]`

**Web 表单不会写入 `input` 字段**，所以必须手动编辑
`C:\Users\DongDong\.dsh\settings.yaml`。

示例（把 `qwen3.5-omni-plus-2026-03-15` 标成视觉模型）：

```yaml
llm-pi-ai:
  providers:
    {
      qianwen:
        {
          apiKeyEnv: QIANWEN_API_KEY,
          api: openai-completions,
          baseURL: https://dashscope.aliyuncs.com/compatible-mode/v1,
          models:
            [
              { id: qwen3.8-max },
              { id: happyhorse-1.1-i2v },
              { id: qwen3.5-omni-plus-2026-03-15, input: [ text, image ] }
            ]
        }
    }
```

要点：

- `input` 的合法值**只有** `text` 和 `image` 两个。
- **omni / 多模态**模型才是「看图」模型；`i2v`（图生视频）不是「看图」模型，别标。
- 不写 `input` 时默认是 `['text']`（纯文字），视觉后端链就检测不到它。

### 5.3 在「设置 → 插件 → Vision Router」里选择视觉后端

刷新插件页后，「视觉后端链」下拉里就会出现
`qianwen / qwen3.5-omni-plus-2026-03-15`，选中并保存。

---

## 6. 验证图片发送

- 在聊天里发送一张图片；
- 问一句「这是谁 / 图里有什么」；
- 能正常描述图片内容 = 成功。

---

## 7. 常见问题排查（本次实际踩过的坑）

### 7.1 `pnpm.ps1 cannot be loaded because running scripts is disabled`

- 原因：PowerShell 执行策略阻止了 `.ps1` 脚本。
- 解决：一律用 `pnpm.CMD`（或完整路径 `...\pnpm\bin\pnpm.CMD`）。

### 7.2 装到的版本比预期旧（例如 1.1.1 而不是 1.3.0）

- 原因：pnpm 11 `minimumReleaseAge` 供应链保护。
- 解决：安装时显式带版本号 `dsh-vision-router@<最新版本>`。

### 7.3 保存设置一直转圈 / 无响应

- 原因：可能残留了写锁文件 `settings.yaml.lock`，阻塞后续所有写入。
- 解决：删除它，然后重试（必要时重启 Web 服务）：

```powershell
Remove-Item "C:\Users\DongDong\.dsh\settings.yaml.lock" -Force
```

### 7.4 视觉后端链「检测不到」刚添加的视觉模型

- 原因：模型没有声明 `input: [ text, image ]`，被判定为纯文字模型而过滤掉。
- 解决：见第 5.2 节，手动在 `settings.yaml` 给该模型补上 `input: [ text, image ]`。

---

## 8. 更新 / 卸载（备用）

```powershell
# 更新到指定新版本
pnpm.CMD dsh plugin --profile web add dsh-vision-router@<新版本号>

# 卸载
pnpm.CMD dsh plugin --profile web remove dsh-vision-router
```

> 每次改完插件（安装 / 更新 / 卸载）后，都要**重启 Web 服务器**（第 4 节）才会生效。