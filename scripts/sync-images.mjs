// 扫描 src/content/posts/*.md，把本地图片引用（Typora / Windows 绝对路径）
// 同步到 public/assets/images 并改写为 /assets/images/...，可选 commit + push。
//
// 用法：
//   node scripts/sync-images.mjs            只同步 + 改写（不碰 git）
//   node scripts/sync-images.mjs --push     同步 + 改写 + commit + push
//   node scripts/sync-images.mjs --dry-run  只预览，不改任何文件
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'src', 'content', 'posts');
const IMAGES_DIR = path.join(ROOT, 'public', 'assets', 'images');

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|bmp|avif|ico)$/i;

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const PUSH = args.includes('--push');

let copied = 0;
let rewritten = 0;
let missing = 0;
const touched = [];

function toWebPath(raw) {
  if (!raw) return null;
  const s = raw.trim();
  if (/^(https?:)?\/\//i.test(s)) return null; // 远程 / http
  if (s.startsWith('/')) return null;          // 已是 /assets/... 等站点路径
  const norm = s.replace(/^file:\/\/+/i, '').replace(/\\/g, '/');
  if (!/^[A-Za-z]:\//.test(norm)) return null; // 非 Windows 绝对路径
  if (!IMAGE_EXT.test(norm)) return null;      // 非图片后缀
  if (!fs.existsSync(norm)) { missing++; return null; }

  const base = norm.split('/').pop();
  const dest = path.join(IMAGES_DIR, base);
  if (!fs.existsSync(dest)) {
    if (!DRY_RUN) {
      fs.mkdirSync(IMAGES_DIR, { recursive: true });
      fs.copyFileSync(norm, dest);
    }
    copied++;
  }
  return `/assets/images/${base}`;
}

function processContent(content) {
  // HTML <img src="...">
  content = content.replace(/<img\b[^>]*?>/gi, (tag) =>
    tag.replace(/\bsrc=(["'])([^"']+)\1/i, (m, q, p) => {
      const web = toWebPath(p);
      if (!web) return m;
      rewritten++;
      return `src=${q}${web}${q}`;
    })
  );
  // Markdown ![alt](path)
  content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, p) => {
    const web = toWebPath(p);
    if (!web) return m;
    rewritten++;
    return `![${alt}](${web})`;
  });
  return content;
}

for (const f of fs.readdirSync(POSTS_DIR)) {
  if (!f.endsWith('.md') || f === '_template.md') continue;
  const filePath = path.join(POSTS_DIR, f);
  const content = fs.readFileSync(filePath, 'utf8');
  const next = processContent(content);
  if (next !== content) {
    touched.push(f);
    if (!DRY_RUN) fs.writeFileSync(filePath, next);
  }
}

console.log(`\n${DRY_RUN ? '【DRY-RUN 预览】' : '【同步完成】'}`);
console.log(`  复制图片: ${copied} 张`);
console.log(`  改写引用: ${rewritten} 处`);
if (missing) console.log(`  缺失源文件(未处理): ${missing} 处`);
if (touched.length) console.log(`  涉及文章: ${touched.join(', ')}`);
else console.log(`  没有需要处理的内容`);

if (PUSH && !DRY_RUN) {
  execSync(`git add public/assets/images src/content/posts scripts/sync-images.mjs package.json`, { cwd: ROOT, stdio: 'inherit' });
  try {
    execSync(`git diff --cached --quiet`, { cwd: ROOT, stdio: 'pipe' });
    console.log('\n没有需要提交的改动，跳过 push。');
  } catch {
    execSync(`git commit -m "sync: update post images and content"`, { cwd: ROOT, stdio: 'inherit' });
    execSync(`git push`, { cwd: ROOT, stdio: 'inherit' });
    console.log('\n已提交并推送到 GitHub。');
  }
}
