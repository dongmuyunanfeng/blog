# 栋木遇楠枫 - Astro 静态博客部署文档

## 1. 仓库初始化

### 1.1 创建 GitHub 仓库
1. 访问 https://github.com/new
2. 仓库名称建议：`blog` 或 `dongmuyunanfeng`
3. 设置为 **Public**（GitHub Pages 要求）
4. 点击 **Create repository**

### 1.2 推送项目代码
```bash
cd blog
git init
git add .
git commit -m "Initial commit: Astro blog setup"
git remote add origin https://github.com/YOUR_USERNAME/your-repo-name.git
git branch -M main
git push -u origin main
```

### 1.3 本地开发
```bash
cd blog
npm install
npm run dev
# 访问 http://localhost:4321
```

---

## 2. 自定义域名绑定

### 2.1 创建 CNAME 文件
在 `blog/` 目录下创建 `CNAME` 文件（无扩展名），内容为你的域名：
```
your-domain.com
```
提交推送：
```bash
echo "your-domain.com" > blog/CNAME
git add blog/CNAME
git commit -m "Add custom domain"
git push
```

### 2.2 GitHub Pages 配置
1. 进入仓库 **Settings** → **Pages**
2. **Source**: 选择 "GitHub Actions"
3. 在 **Custom domain** 填入你的域名
4. 勾选 **Enforce HTTPS**

### 2.3 DNS 解析配置
在域名服务商添加以下记录：

**CNAME 方式（推荐）：**
```
Type: CNAME
Name: www (或 @ 取决于服务商)
Value: YOUR_USERNAME.github.io.
TTL: Auto
```

### 2.4 更新 Astro 配置
修改 `blog/astro.config.mjs`：
```js
site: 'https://your-domain.com',
```

---

## 3. 评论系统 (Giscus)

Giscus 是基于 GitHub Discussions 的免费评论系统，无需后端，无需付费。

### 3.1 开启 Discussions
1. 进入仓库 **Settings** → **Discussions**，确保功能已启用

### 3.2 创建 Giscus Discussion 类别
1. 访问 https://giscus.app
2. 选择你的仓库
3. 创建一个新的 Discussion 类别（如 `Announcements` 或 `Blog Comments`）
4. 记录以下信息：
   - **Repository ID**：`MDEwOlJlcG9zaXRvcnk=...`
   - **Category ID**：`MCAg...`

### 3.3 配置 GitHub Secrets
进入仓库 **Settings** → **Secrets and variables** → **Actions**，添加以下 4 个 Secrets：

| Secret 名称 | 值 |
|---|---|
| `GISCUS_REPO` | `你的用户名/仓库名`，如 `myname/blog` |
| `GISCUS_REPO_ID` | 从 giscus.app 获取的仓库 ID |
| `GISCUS_CATEGORY` | Discussion 类别名，如 `Announcements` |
| `GISCUS_CATEGORY_ID` | 从 giscus.app 获取的类别 ID |

### 3.4 验证
部署后访问任意文章页面，底部应出现评论区。

---

## 4. 阅读数统计

阅读数使用 [countapi.xyz](https://countapi.xyz)（免费，无需配置，无注册）。

### 工作原理
- 每次页面加载时，客户端自动调用 API 递增计数
- 数据存储在 countapi.xyz 云端，无需自己的服务器
- API 格式：`https://countapi.xyz/hit/<namespace>/<key>`

### 配置
当前配置为：
- namespace: `dongmu-blog`
- key: 每篇文章的 slug（如 `hello-world`）

如需修改 namespace，全局替换 `countapi.xyz/hit/dongmu-blog` 为你的自定义名称。

### 验证
部署后首页文章列表的阅读数显示 `--` 会变为实际数字，每次刷新页面数字递增。

---

## 5. 部署状态

- GitHub Actions 会在 push 到 `main` 分支时自动构建部署
- 查看部署状态：仓库 **Actions** 标签页
- 访问地址：`https://YOUR_USERNAME.github.io/your-repo-name/`

---

## 6. 阅读数与评论数

### 阅读数
使用 [countapi.xyz](https://countapi.xyz)（免费，无需配置，无注册）。每次页面加载自动计数，每篇文章独立统计，换设备也能看到真实数字。

### 评论数
评论数通过 GitHub API 自动从 Giscus Discussion 获取，**无需额外配置**。

前提是 Giscus 已配置（见第 3 节），系统会自动匹配每篇文章的 Giscus 讨论帖并显示评论数量。

## 6. 发布文章

### 本地方式
1. 在 `blog/src/content/posts/` 创建新 `.md` 文件
2. 参考 `_template.md` 格式编写 Front-matter
3. 提交推送：
   ```bash
   git add src/content/posts/
   git commit -m "Add: 文章标题"
   git push
   ```

### Front-matter 格式
```yaml
---
title: 文章标题
date: 2026-08-21
categories: [技术笔记]
tags: [Astro, 入门]
description: 文章摘要描述
draft: false
---
```
- `draft: false` 才会显示在首页，`true` 仅本地可见

---

## 7. 注意事项

- 阅读数使用 countapi.xyz 云端存储，换设备也能看到真实数字
- 评论数在 Giscus 配置后自动显示
- 头像放置在 `public/assets/images/avatar.jpg`
- 视频背景放置在 `public/assets/videos/banner.mp4`
- 新增图片资源放入 `public/assets/images/`
- 每次推送 `main` 分支都会触发自动构建部署
- GitHub Pages 域名：`https://YOUR_USERNAME.github.io/your-repo-name/`
