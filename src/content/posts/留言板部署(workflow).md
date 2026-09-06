---
title: "留言板部署(workflow)"
date: 2026-09-06
description: "以留言板为例，从零到上线部署前后端项目：GitHub + Neon + Render + GitHub Actions"
categories: ["教程"]
tags: ["部署", "Render", "GitHub Actions"]
draft: true
---

# 留言板地址

https://git-nanfeng-1.onrender.com/

### github地址

https://github.com/dongmuyunanfeng/CommentSystem.git


### 项目简介

> **<u>*实现代码推送到 GitHub，创建 Neon 云数据库，在 Render 部署后端，在 Render 部署前端，连接前后端，配置 GitHub Actions 自动部署。*</u>**

# GitHub 前后端项目部署完整教程

> 以留言板项目为例，从零到上线，附带每一步的原因解释

---

## 目录

1. [为什么需要部署？](#1-为什么需要部署)
2. [整体架构概览](#2-整体架构概览)
3. [准备工作](#3-准备工作)
4. [第一步：代码推送到 GitHub](#4-第一步代码推送到-github)
5. [第二步：创建 Neon 云数据库](#5-第二步创建-neon-云数据库)
6. [第三步：在 Render 部署后端](#6-第三步在-render-部署后端)
7. [第四步：在 Render 部署前端](#7-第四步在-render-部署前端)
8. [第五步：连接前后端](#8-第五步连接前后端)
9. [第六步：配置 GitHub Actions 自动部署](#9-第六步配置-github-actions-自动部署)
10. [完整工作流程总结](#10-完整工作流程总结)
11. [常见问题排查](#11-常见问题排查)

---

## 1. 为什么需要部署？

### 本地运行 vs 线上部署

|                  | 本地运行         | 线上部署           |
| ---------------- | ---------------- | ------------------ |
| **谁能访问**     | 只有你自己       | 任何人通过链接访问 |
| **是否需要开机** | 需要一直开着电脑 | 24 小时在线        |
| **数据存储**     | 在你电脑上       | 在云服务器上       |

**简单说**：本地写完的代码只有你自己能看，部署到线上后，发个链接别人就能用了。

### 为什么选择 Render？

- **免费**：有免费额度，足够个人项目使用
- **简单**：连上 GitHub 仓库就能自动部署
- **支持全栈**：既能跑后端（Node.js），也能放前端静态页面
- **自动部署**：代码推送到 GitHub，Render 自动更新

### 为什么选择 Neon 数据库？

- **免费**：0.5GB 存储，足够小项目
- **云端**：数据存在云端，不因服务器重启丢失
- **PostgreSQL**：最流行的开源数据库之一
- **无需安装**：注册即用，给一个连接地址就行

---

## 2. 整体架构概览

```
用户浏览器
    ↓ 访问前端页面
Render 前端 (Static Site)
https://xxx-1.onrender.com
    ↓ 用户发留言 → JS 调用后端 API
Render 后端 (Web Service)
https://xxx.onrender.com
    ↓ 读写数据
Neon 云数据库 (PostgreSQL)
```

**三层分离**：

- **前端**：负责页面展示，用户交互
- **后端**：负责处理请求，业务逻辑
- **数据库**：负责存储数据

---

## 3. 准备工作

开始前，你需要注册以下账号（全部免费）：

| 平台   | 地址               | 用途                         |
| ------ | ------------------ | ---------------------------- |
| GitHub | https://github.com | 存放代码                     |
| Render | https://render.com | 部署前后端（用 GitHub 登录） |
| Neon   | https://neon.tech  | 云数据库（用 GitHub 登录）   |

---

## 4. 第一步：代码推送到 GitHub

### 4.1 在 GitHub 创建仓库

1. 打开 https://github.com/new
2. 输入仓库名（如 `guestbook`）
3. **不要**勾选 "Add a README file"
4. 点击 "Create repository"

> **为什么不要勾选 README？** 因为我们本地已经有代码了，如果 GitHub 上也有文件，会产生冲突。

### 4.2 推送代码

在项目目录下执行：

```bash
git init                          # 初始化 Git 仓库
git add .                         # 添加所有文件
git commit -m "first commit"      # 提交
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin master         # 推送到 GitHub
```

---

## 5. 第二步：创建 Neon 云数据库

### 5.1 为什么需要云数据库？

项目开发时用的是 SQLite（一个文件数据库），它存在服务器本地。但 Render 免费版的服务器重启后会清空所有文件，SQLite 数据库也会丢失。

所以需要把数据库搬到云端——**数据独立存储，不随服务器重启而丢失**。

### 5.2 创建步骤

1. 打开 https://neon.tech，用 GitHub 登录
2. 点击 "Create project"
3. 填写项目名，选择离你最近的区域（如 Singapore）
4. 点击创建，等待几秒

### 5.3 获取连接字符串

创建完成后，Neon 会显示一个**连接字符串**（Connection string），格式类似：

```
postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
```

**复制这个字符串，后面要用。**

> **这是什么？** 这就是数据库的"地址+钥匙"。代码通过这个字符串找到你的数据库并连接。

### 5.4 代码如何连接数据库？

项目中的 `backend/src/db.ts` 关键代码：

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  // 从环境变量读取
});
```

> **为什么用环境变量而不是直接写死在代码里？** 因为数据库密码是敏感信息，不能提交到 GitHub 上。环境变量在 Render 上设置，只有服务器能读到。

---

## 6. 第三步：在 Render 部署后端

### 6.1 创建后端 Web Service

1. 打开 https://render.com，用 GitHub 登录
2. 点击 **New +** → **Web Service**
3. 选择你的 GitHub 仓库
4. 配置如下：

| 配置项             | 值                        | 为什么这样填               |
| ------------------ | ------------------------- | -------------------------- |
| **Name**           | 任意（如 `git-nanfeng`）  | 这是服务名                 |
| **Root Directory** | `backend`                 | 告诉 Render 代码在后端目录 |
| **Build Command**  | `npm ci && npm run build` | 安装依赖 → 编译 TypeScript |
| **Start Command**  | `npm start`               | 启动编译后的服务           |

> **注意**：Root Directory 已经是 `backend` 了，所以 Build Command 里**不要**再写 `cd backend`。Render 会自动进入 `backend` 目录执行命令。

### 6.2 配置环境变量（关键！）

在 **Environment** 部分，添加：

| Key            | Value                            |
| -------------- | -------------------------------- |
| `DATABASE_URL` | 你在 Neon 复制的那一串连接字符串 |

然后点击页面底部的 **Create Web Service**。

> **为什么要配置这个环境变量？**
> 回顾代码 `process.env.DATABASE_URL`，代码运行时从这个环境变量读取数据库地址。如果不设置，代码找不到数据库就会崩溃。

### 6.3 验证后端

部署完成后，Render 会给你一个 URL，如 `https://git-nanfeng.onrender.com`。

在浏览器打开 `https://你的后端URL/api/messages`，如果看到 `[]`（空数组），说明后端和数据库都跑通了。

---

## 7. 第四步：在 Render 部署前端

### 7.1 创建前端 Static Site

1. 点击 **New +** → **Static Site**
2. 选择同一个 GitHub 仓库
3. 配置如下：

| 配置项                | 值                        | 为什么这样填               |
| --------------------- | ------------------------- | -------------------------- |
| **Name**              | 任意                      |                            |
| **Root Directory**    | `frontend`                | 告诉 Render 代码在前端目录 |
| **Build Command**     | `npm ci && npm run build` | 安装依赖 → Vite 打包       |
| **Publish directory** | `dist`                    | Vite 打包后的输出文件夹    |

> **注意**：Publish directory 写 `dist`，不是 `frontend/dist`。因为 Root Directory 已经是 `frontend` 了，所有路径都是相对于 `frontend` 的。

4. 先**不要**点创建，还要配环境变量（下一步）。

---

## 8. 第五步：连接前后端

### 8.1 为什么需要这一步？

开发时前端通过 Vite 代理（`/api` → `localhost:3001`）访问后端。但部署到 Render 后，前端和后端是**两个独立的服务**，各有各的 URL。前端需要知道后端的完整地址才能发请求。

### 8.2 配置步骤

在前端 Static Site 的 **Environment** 中添加：

| Key            | Value                     |
| -------------- | ------------------------- |
| `VITE_API_URL` | `https://你的后端URL/api` |

> **为什么是 `/api` 结尾？** 后端路由是 `/api/messages`，所以 BASE 应该是 `/api`，前端代码会拼接成 `/api/messages`。

> **为什么用 `VITE_` 前缀？** Vite 只会在构建时把 `VITE_` 开头的环境变量注入到代码中。所以改了变量后必须重新构建才能生效。

### 8.3 创建并部署

添加完环境变量后，点击 **Create Static Site**。Render 会自动构建并部署。

部署完成后访问前端 URL（如 `https://xxx-1.onrender.com`），尝试发一条留言。

---

## 9. 第六步：配置 GitHub Actions 自动部署

### 9.1 为什么要用 GitHub Actions？

每次改代码后，手动去 Render 点部署很麻烦。GitHub Actions 可以做到：**你只负责 `git push`，剩下的自动完成**。

### 9.2 工作流程

```
git push → GitHub Actions 触发
              ↓
         ① 后端：安装依赖 → 类型检查 → 编译
         ② 前端：安装依赖 → 类型检查 → 打包
              ↓
         ③ 全部通过后 → 通知 Render 重新部署
```

### 9.3 CI 配置文件解读

文件位置：`.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [master, main]    # 推送到 master/main 分支时触发
  pull_request:
    branches: [master, main]    # 提 PR 时也触发

jobs:
  backend:                       # 后端检查
    runs-on: ubuntu-latest       # 在 GitHub 提供的虚拟机里运行
    defaults:
      run:
        working-directory: ./backend
    steps:
      - uses: actions/checkout@v4    # 拉取代码
      - uses: actions/setup-node@v4  # 安装 Node.js
        with:
          node-version: 20
      - run: npm ci                  # 安装依赖
      - run: npm run typecheck       # TypeScript 类型检查
      - run: npm run build           # 编译

  frontend:                      # 前端检查（同理）
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run typecheck
      - run: npm run build

  deploy:                        # 自动部署（仅 main/master 推送时）
    needs: [backend, frontend]   # 必须等前后端检查都通过
    if: github.event_name == 'push' && ...
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Render 后端部署
        run: curl -s -X POST "${{ secrets.RENDER_BACKEND_HOOK }}"
      - name: Trigger Render 前端部署
        run: curl -s -X POST "${{ secrets.RENDER_FRONTEND_HOOK }}"
```

### 9.4 配置 Render Deploy Hook 和 GitHub Secrets

1. 在 Render 每个服务的 **Settings** → **Deploy Hook** 复制 URL
2. 在 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**：
   - `RENDER_BACKEND_HOOK` = 后端 Deploy Hook URL
   - `RENDER_FRONTEND_HOOK` = 前端 Deploy Hook URL

> **为什么用 Secrets？** Deploy Hook URL 相当于"部署密码"，不能公开。GitHub Secrets 是加密存储的，只有 Actions 运行时能读到。

### 9.5 自动+手动双重保障

实际上，Render 自己也有 GitHub 集成——检测到仓库有新推送就会自动部署。加上 GitHub Actions 的 Deploy Hook，等于**双重保障**：

- **Render 自动检测**：代码推送后 Render 自动拉取并部署
- **Actions Deploy Hook**：CI 检查通过后才触发，确保只有没 bug 的代码才会部署

---

## 10. 完整工作流程总结

```
你写代码 → git push → GitHub
                          ↓
                    GitHub Actions 自动运行
                    （类型检查 + 编译）
                          ↓
                     全部通过 ✅
                          ↓
                   触发 Render 重新部署
                          ↓
               Render 拉取最新代码
                    ↓            ↓
              后端部署成功    前端部署成功
              (连 Neon 数据库)  (页面可访问)
                          ↓
                 别人打开前端链接
                 → 发留言 → 数据存到 Neon
                 → 永不丢失 ✅
```

**以后每次改代码，只需要**：`git add . && git commit -m "改了什么" && git push`，等几分钟就自动上线了。

---

## 11. 常见问题排查

### 前端显示"加载留言失败"

1. 后端是否在运行？直接访问后端 `/api/messages` 看是否返回数据
2. `VITE_API_URL` 是否配置正确？注意结尾有没有 `/api`
3. 改了环境变量后是否重新部署了？（Vite 变量需要重新构建）

### 后端报 ECONNREFUSED 127.0.0.1:5432

说明 `DATABASE_URL` 环境变量没读到。去 Render 后端 Environment 确认已配置。

### Render 日志显示 cd: backend: No such file or directory

Root Directory 已经设置为 `backend`，Build Command 里不需要再写 `cd backend`。

### Render 发布目录报错 "dist does not exist"

Publish directory 应为 `dist`，不是 `frontend/dist`。因为 Root Directory 已经是 `frontend`。

### 改完代码部署后页面没变化

可能是浏览器缓存。按 `Ctrl + F5` 强制刷新。

### Render 打开很慢

免费版服务在 15 分钟无访问后会休眠，下次访问需要 "唤醒"，大约等 30 秒。