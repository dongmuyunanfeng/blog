// 扫描 src/content/posts/*.md，把里面引用的本地图片（Typora / Windows 绝对路径）
// 复制到 public/assets/images。只拷图、不改文章文字（文章里的本地路径保留，由构建期
// rehype 插件转成 /assets/images/...，这样 Typora 本地预览和网站都能正常显示）。
//
// 用法：
//   node scripts/sync-images.mjs            只拷图（不碰 git）
//   node scripts/sync-images.mjs --push     拷图 + commit + push
//   node scripts/sync-images.mjs --dry-run  只预览
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
let skipped = 0;
let missing = 0;
const touchedPosts = new Set();

function collect(raw) {
  if (!raw) return;
  const s = raw.trim();
  if (/^(https?:)?\/\//i.test(s)) return; // 远程 / http
  if (s.startsWith('/')) return;          // 已是站点路径，无需处理
  const norm = s.replace(/^file:\/\/+/i, '').replace(/\\/g, '/');
  if (!/^[A-Za-z]:\//.test(norm)) return; // 非 Windows 绝对路径
  if (!IMAGE_EXT.test(norm)) return;      // 非图片后缀
  if (!fs.existsSync(norm)) { missing++; return; }

  const base = norm.split('/').pop();
  const dest = path.join(IMAGES_DIR, base);
  if (fs.existsSync(dest)) { skipped++; return; }
  if (!DRY_RUN) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    fs.copyFileSync(norm, dest);
  }
  copied++;
}

function scanContent(content) {
  // HTML <img src="...">
  for (const m of content.matchAll(/<img\b[^>]*?\bsrc=(["'])([^"']+)\1[^>]*?>/gi)) {
    collect(m[2]);
  }
  // Markdown ![alt](path)
  for (const m of content.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
    collect(m[1]);
  }
}

for (const f of fs.readdirSync(POSTS_DIR)) {
  if (!f.endsWith('.md') || f === '_template.md') continue;
  const content = fs.readFileSync(path.join(POSTS_DIR, f), 'utf8');
  const before = { copied, missing };
  scanContent(content);
  if (copied !== before.copied || missing !== before.missing) touchedPosts.add(f);
}

console.log(`\n${DRY_RUN ? '【DRY-RUN 预览】' : '【同步完成】'}`);
console.log(`  新复制图片: ${copied} 张`);
console.log(`  已存在跳过: ${skipped} 张`);
if (missing) console.log(`  缺失源文件: ${missing} 处`);
if (touchedPosts.size) console.log(`  涉及文章: ${[...touchedPosts].join(', ')}`);
else console.log(`  没有需要复制的新图片`);

if (PUSH && !DRY_RUN) {
  execSync(`git add public/assets/images scripts/sync-images.mjs package.json src/content/posts`, { cwd: ROOT, stdio: 'inherit' });
  try {
    execSync(`git diff --cached --quiet`, { cwd: ROOT, stdio: 'pipe' });
    console.log('\n没有需要提交的改动，跳过 push。');
  } catch {
    execSync(`git commit -m "sync: upload post images"`, { cwd: ROOT, stdio: 'inherit' });
    execSync(`git push`, { cwd: ROOT, stdio: 'inherit' });
    console.log('\n已提交并推送到 GitHub。');
  }
}
