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
文章详情页底部评论区 + 卡片上的评论数都会自动同步。

---

### 3.1 开启 Discussions

1. 打开你的 GitHub 仓库页面
2. 点击顶部 **Settings** 标签
3. 左侧菜单找到 **Discussions**，点击确保开关是 **On**（绿色）
4. https://github.com/apps/giscus安装

---

### 3.2 访问 https://giscus.app 配置

1. 打开 https://giscus.app
2. 点击 **Install Giscus**，选择你的 GitHub 账号授权
3. 选择你的仓库（Repository）
4. 进入配置页面，按以下步骤操作：

#### ① 确认 Discussion 类别
- 在 **Discussion category** 下拉框中选择一个类别
- 如果没有类别，点击页面里的 **Create a new category**，填写：
  - **Category name**：`Announcements`（或任意名称）
  - **Description**：留空
  - 点击 **Create Category**

#### ② 获取 Repository ID 和 Category ID
这两种方式任选其一：

**方式一：giscus.app 页面直接看**
- 配置页面顶部会显示你的 **Repository ID**（一串 base64 字符，如 `MDEwOlJlcG9zaXRvcnkzNjEyNTU0MDc=`）
- 在 **Discussion category** 下拉框旁边的预览区会显示 **Category ID**（如 `MCAQl_...`）

**方式二：用 GitHub API 查询（更精确）**
在终端运行：
```bash
# 获取 Repository ID
gh api repos/YOUR_USERNAME/your-repo-name --jq '.node_id'

# 获取 Discussion 类别 ID
gh api repos/YOUR_USERNAME/your-repo-name/discussion-categories --jq '.discussions_categories[0].node_id'
```
（需要先安装 GitHub CLI：https://cli.github.com）

如果没装 `gh`，也可以手动查看：
1. 打开 https://github.com/YOUR_USERNAME/your-repo-name/discussions/categories
2. 点击任意类别，URL 里会包含类似 `discussion_categories/12345` 的数字，这就是 Category ID 的数值部分

---

### 3.3 配置 GitHub Secrets

1. 进入仓库 **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**，依次添加以下 4 个：

| Secret 名称 | 值 | 示例 |
|---|---|---|
| `GISCUS_REPO` | 仓库名（用户/仓库） | `dongdong/blog` |
| `GISCUS_REPO_ID` | 上面获取的 Repository ID | `MDEwOlJlcG9zaXRvcnkzNjEyNTU0MDc=` |
| `GISCUS_CATEGORY` | Discussion 类别名 | `Announcements` |
| `GISCUS_CATEGORY_ID` | 上面获取的 Category ID | `MCAQl_...` |

---

### 3.4 确保 Discussion 与文章匹配

Giscus 通过文章的 URL 路径自动匹配 Discussion，格式是：`/posts/文章slug`

你的文章默认 slug 是文件名（如 `hello-world`），Giscus 会匹配标题包含 `hello-world` 的 Discussion。

**两种 Discussion 创建方式：**

**方式一：自动创建（推荐）**
- 不需要手动创建
- 当用户第一次在文章评论区评论时，Giscus 会自动为该文章创建一条 Discussion
- 之后该文章的所有评论都会出现在这条 Discussion 下

**方式二：手动提前创建**
1. 进入 https://github.com/YOUR_USERNAME/your-repo-name/discussions
2. 点击 **New discussion**
3. Category 选择你配置的类别（如 `Announcements`）
4. Title 填写文章 slug（如 `hello-world`），或包含 slug 的标题
5. 点击 **Start discussion**

> 注意：Discussion 标题中必须包含文章的 slug，否则评论数无法匹配显示。

---

### 3.5 验证

1. 推送代码到 main 分支，等待 GitHub Actions 部署完成
2. 访问任意文章页面（如 `https://YOUR_USERNAME.github.io/your-repo-name/posts/hello-world/`）
3. 页面底部应显示 **💬 评论区** 和 **发表评论** 按钮
4. 首页文章卡片应显示真实评论数（评论数查询需要 Giscus 配置好）

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

### 写文章
直接在 `src/content/posts/` 下用 Typora 写新 `.md` 文件（可复制 `_template.md` 改 Front-matter）。
文章里的图片用 Typora 正常插入即可（本地绝对路径 `C:\...` 或 `![alt](路径)` 都行），Typora 本地预览能正常显示，无需手动改成网站路径。

### 同步图片并上传
双击 `src/content/sync.bat`（或在项目根目录运行 `npm run sync`），脚本会：
1. 扫描所有文章里的图片引用，把本地图片复制到 `public/assets/images/`；
2. 提交（`sync: upload post images`）并推送到 GitHub。

- `npm run sync`：拷图 + commit + push
- `npm run sync:dry`：只预览会拷哪些图，不实际操作

> 文章里的本地路径**不会被改动**，构建时由 `astro.config.mjs` 里的插件自动转成
> `/assets/images/<文件名>`，所以 Typora 预览和网站都能正常显示图片。

### 只更新文字（不拷图）
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
- `draft: false` 才会显示在首页，`draft: true` 不会显示

---

## 7. 注意事项

- 阅读数使用 countapi.xyz 云端存储，换设备也能看到真实数字
- 评论数在 Giscus 配置后自动显示
- 头像放置在 `public/assets/images/avatar.jpg`
- 视频背景放置在 `public/assets/videos/banner.mp4`
- 文章图片由 `sync.bat` / `npm run sync` 自动复制到 `public/assets/images/`，构建时自动把本地路径转成网站路径，无需手动管理
- 每次推送 `main` 分支都会触发自动构建部署
- GitHub Pages 域名：`https://YOUR_USERNAME.github.io/your-repo-name/`
