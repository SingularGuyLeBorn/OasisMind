import fs from "node:fs";
import path from "node:path";
const root = path.resolve(".reading");
const errors = new Map();
const rawFormulas = [];
let files = 0;
const manifest = JSON.parse(fs.readFileSync(path.resolve('public/api/v1/index.json'), 'utf8'));
// 只检查本次发布清单，避免旧缓存路径污染验收结果。
const readingFiles = [...manifest.posts.map(post => `posts/${post.garden}/${post.slug}.json`),
  ...manifest.gardens.map(garden => `gardens/${garden.id}.json`), 'pages/about.json'];
for (const relative of readingFiles) {
      const file = path.join(root, relative);
      files++;
      const { html, excerptHtml } = JSON.parse(fs.readFileSync(file, "utf8"));
      const rendered = `${html ?? ""}${excerptHtml ?? ""}`;
      for (const match of rendered.matchAll(/class="katex-error"[^>]*title="([^"]*)"[^>]*>([\s\S]*?)<\/span>/g)) {
        const key = match[1];
        const group = errors.get(key) ?? { count: 0, sample: path.relative(root, file), formula: match[2].slice(0, 180) };
        group.count++;
        errors.set(key, group);
      }
      // 用户要求不露出公式源码；排除代码示例和 KaTeX 的无障碍数学节点后检查可见文字。
      const visible = rendered.replace(/<(pre|code|math|annotation)\b[^>]*>[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, '');
      for (const match of visible.matchAll(/.{0,30}\\(?:frac|mathbf|mathbb|begin|sqrt|mathrm|left)\b.{0,100}/g)) {
        rawFormulas.push({ sample: relative, formula: match[0] });
      }
}
console.log(JSON.stringify({ files, errors: [...errors.entries()].map(([error, detail]) => ({ error, ...detail })), rawFormulas }, null, 2));
if (errors.size || rawFormulas.length) process.exitCode = 1;
