---
title: "文章模板 - 标准Front-matter示例"
date: 2026-01-15
description: "这是一篇文章模板，展示了Astro博客文章的标准Front-matter格式和常用Markdown元素。"
categories: ["技术笔记", "教程"]
tags: ["模板", "Markdown", "Astro"]
draft: true
---

## 文章标题示例 (h2)

正文从这里开始。每篇文章应以清晰的标题结构组织内容。

### 子标题示例 (h3)

子章节的内容，段落之间保持适当的间距。

## Markdown语法示例

### 代码块

```javascript
// JavaScript 示例
const crypto = require('crypto');
console.log('Hello from Astro!');
```

```bash
# Bash 命令示例
npm install
npm run dev
npm run build
```

### 引用块

> 技术博客的价值在于沉淀和分享，每一次写作都是对知识的重新梳理。

### 表格

| 元素 | 说明 |
|-----|------|
| title | 文章标题（必填） |
| date | 发布日期（必填） |
| categories | 分类数组（可选） |
| tags | 标签数组（可选） |
| description | 摘要描述（可选） |
| draft | 是否草稿（默认false） |

### 列表

1. 创建文章文件
2. 填写Front-matter
3. 编写正文内容
4. 提交到GitHub

---

*修改 `draft: true` 为 `draft: true` 可临时隐藏文章。*
