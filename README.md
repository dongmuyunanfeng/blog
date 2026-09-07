# 栋木遇楠枫 - Astro 静态博客

基于 [Astro](https://astro.build) 构建的个人技术博客，部署在 GitHub Pages，自定义域名 [www.dongmunanfeng.com](https://www.dongmunanfeng.com)。

## ✨ 功能特性

- ⚡ Astro 静态生成，加载快、SEO 友好
- 📝 Markdown 写作，支持 Typora 本地预览与网站展示同一份源文件
- 🖼️ 图片构建期自动转换：文章里的本地绝对路径自动转为网站路径，无需手动处理
- 🗂️ 分类 / 标签 / 归档 / 分页 / 相关文章推荐
- 💬 Giscus 评论区（基于 GitHub Discussions，无后端）
- 👁️ 文章阅读数统计（countapi.xyz）
- 🌗 明暗主题切换、粒子背景、点击特效
- 🔍 sitemap 自动生成

## 🛠️ 技术栈

- [Astro](https://astro.build) 7.x
- [@astrojs/markdown-satteri](https://www.npmjs.com/package/@astrojs/markdown-satteri) Markdown 处理
- [Giscus](https://giscus.app) 评论系统
- GitHub Actions + GitHub Pages 自动部署

## 🚀 本地开发

环境要求：Node.js 22+

```bash
npm install
npm run dev
# 访问 http://localhost:4321
```

生产构建与预览：

```bash
npm run build
npm run preview
```

## ✍️ 写文章 & 发布

文章放在 `src/content/posts/` 目录下，以 `.md` 为后缀。

### 1. 新建文章

复制 `src/content/posts/_template.md` 作为模板，填写 Front-matter：

```yaml
---
title: "文章标题"
date: 2026-09-07
description: "文章摘要描述"
categories: ["项目"]
tags: ["AI", "知识图谱"]
draft: false          # true 时不显示在首页
coverImage: ""        # 可选，封面图
---
```

Front-matter 字段说明：

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | ✅ | 文章标题 |
| `date` | ✅ | 发布日期 |
| `description` | 可选 | 摘要，用于列表与 SEO |
| `categories` | 可选 | 分类数组 |
| `tags` | 可选 | 标签数组 |
| `draft` | 可选 | `true` 时文章不会出现在首页（默认 `false`） |
| `coverImage` | 可选 | 封面图路径 |

### 2. 插入图片

用 Typora 正常插入图片即可，本地绝对路径（`C:\...`）或 `![alt](路径)` 都行。构建时 `astro.config.mjs` 里的插件会自动把本地路径转成网站路径，Typora 预览和网站都能正常显示。

### 3. 同步图片并发布

双击 `src/content/sync.bat`（或在项目根目录执行 `npm run sync`），脚本会：

1. 扫描所有文章里的图片引用，把本地图片复制到 `public/assets/images/`；
2. 提交图片 + 文章 + 同步脚本 + `package.json`，并推送到 GitHub；
3. GitHub Actions 自动构建并部署到 GitHub Pages。

相关命令：

```bash
npm run sync       # 拷图 + commit + push（发布）
npm run sync:dry   # 只预览会拷哪些图，不实际操作
```

> 只改文字、不涉及新图片时，也可以手动提交：
> ```bash
> git add src/content/posts/
> git commit -m "Add: 文章标题"
> git push
> ```

## 📁 项目结构

```
blog/
├── src/
│   ├── content/
│   │   ├── posts/           # 博客文章（.md）
│   │   └── sync.bat         # 双击同步图片并发布
│   ├── components/          # Astro 组件
│   ├── layouts/             # 布局
│   ├── pages/               # 页面（首页/文章/分类/标签/归档/关于）
│   ├── styles/              # 全局样式
│   └── content.config.ts    # 文章 Front-matter 校验 schema
├── public/
│   ├── assets/images/       # 文章图片（由脚本自动复制）
│   └── assets/videos/       # 背景视频
├── astro.config.mjs         # Astro 配置（含图片路径转换插件）
├── scripts/sync-images.mjs  # 图片同步脚本
├── CNAME                    # 自定义域名
└── .github/workflows/       # GitHub Actions 部署流水线
```

## 🚢 部署

通过 GitHub Actions 自动部署到 GitHub Pages：

- 推送 `master` 分支触发自动构建部署
- 自定义域名：`dongmunanfeng.com`
- 查看部署状态：仓库 **Actions** 标签页

详细的部署步骤、自定义域名绑定、Giscus 评论配置，请参考 [DEPLOY.md](./DEPLOY.md)。

## 📄 License

[待补充]
