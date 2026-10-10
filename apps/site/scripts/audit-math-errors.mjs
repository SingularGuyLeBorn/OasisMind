import fs from "node:fs";
import path from "node:path";
const root = path.resolve(".reading");
const errors = new Map();
let files = 0;
const manifest = JSON.parse(fs.readFileSync(path.resolve('public/api/v1/index.json'), 'utf8'));
// 只检查本次发布清单，避免旧缓存路径污染验收结果。
const readingFiles = [...manifest.posts.map(post => `posts/${post.garden}/${post.slug}.json`),
  ...manifest.gardens.map(garden => `gardens/${garden.id}.json`), 'pages/about.json'];
for (const relative of readingFiles) {
      const file = path.join(root, relative);
      files++;
      const { html, excerptHtml } = JSON.parse(fs.readFileSync(file, "utf8"));
      for (const match of `${html ?? ""}${excerptHtml ?? ""}`.matchAll(/class="katex-error"[^>]*title="([^"]*)"[^>]*>([\s\S]*?)<\/span>/g)) {
        const key = match[1];
        const group = errors.get(key) ?? { count: 0, sample: path.relative(root, file), formula: match[2].slice(0, 180) };
        group.count++;
        errors.set(key, group);
      }
}
console.log(JSON.stringify({ files, errors: [...errors.entries()].map(([error, detail]) => ({ error, ...detail })) }, null, 2));
if (errors.size) process.exitCode = 1;
