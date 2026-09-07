import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 把文章里残留的本地图片路径（C:\...\Typora\...、file:///C:/... 等）
// 在构建期转成 /assets/images/<文件名>，从而 Typora 本地预览和网站都能正常显示。
// markdown 图片 ![alt](路径) 会 URL-encode 成 C:%5CUsers%5C...，需先 decode 再归一化。
function toWeb(src) {
  let decoded = src;
  try {
    decoded = decodeURIComponent(src);
  } catch {
    // 非标准编码（如原始 HTML 里的字面反斜杠）直接按原文处理
  }
  const norm = decoded.replace(/^file:\/\/+/i, '').replace(/\\/g, '/');
  if (!/^[A-Za-z]:\//.test(norm)) return null;
  const base = norm.split('/').pop();
  return base ? `/assets/images/${base}` : null;
}

const localImagesPlugin = {
  name: 'local-images',
  element: {
    filter: ['img'],
    visit(node, ctx) {
      const src = node.properties && node.properties.src;
      if (typeof src !== 'string') return;
      const web = toWeb(src);
      if (web) ctx.setProperty(node, 'src', web);
    },
  },
  // 原始 HTML <img src="..."> 默认是 opaque 的 raw 节点，需单独处理并返回替换节点
  raw(node) {
    if (typeof node.value !== 'string') return;
    const next = node.value.replace(/<img\b[^>]*?>/gi, (tag) =>
      tag.replace(/\bsrc=(["'])([^"']+)\1/i, (attr, q, src) => {
        const web = toWeb(src);
        return web ? `src=${q}${web}${q}` : attr;
      })
    );
    if (next !== node.value) return { type: 'raw', value: next };
  },
};

export default defineConfig({
  site: 'https://www.dongmunanfeng.com',
  devToolbar: { enabled: false },
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'one-dark-pro',
    },
    processor: satteri({ hastPlugins: [localImagesPlugin] }),
  },
  vite: {
    resolve: {
      alias: {
        '@components': path.resolve(__dirname, 'src/components'),
        '@layouts': path.resolve(__dirname, 'src/layouts'),
        '@styles': path.resolve(__dirname, 'src/styles'),
        '@content': path.resolve(__dirname, 'src/content'),
      },
    },
  },
});
