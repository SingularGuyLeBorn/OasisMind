#!/usr/bin/env node
/**
 * 扫描 content/ 下未被任何 Markdown 引用的图片/PDF 资源。
 * 只读分析，不删除任何文件。结果写入 tmp/orphaned-content-assets.txt。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const contentDir = path.join(projectRoot, "content");

const EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".avif",
  ".pdf",
]);

function toPosix(value) {
  return value.replace(/\\/g, "/");
}

function collectAssets(dir, prefix, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(prefix, entry.name);
    if (entry.isDirectory()) {
      collectAssets(fullPath, relPath, out);
    } else if (EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      out.set(toPosix(fullPath), toPosix(relPath));
    }
  }
}

function extractReferences(markdown, mdDir) {
  const refs = [];
  const add = (raw, force = false) => {
    const ref = raw.trim().replace(/^<|>$/g, "");
    if (!ref || ref.startsWith("#")) return;
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(ref)) return;

    const ext = path.extname(ref.split(/[?#]/)[0]).toLowerCase();
    if (!force && !EXTENSIONS.has(ext)) return;

    let resolved;
    if (ref.startsWith("/content/")) {
      resolved = path.resolve(contentDir, ref.slice("/content/".length));
    } else if (ref.startsWith("/api/posts/assets/")) {
      resolved = path.resolve(contentDir, ref.slice("/api/posts/assets/".length));
    } else if (ref.startsWith("/uploads/")) {
      resolved = path.resolve(contentDir, "uploads", ref.slice("/uploads/".length));
    } else if (ref.startsWith("/")) {
      return;
    } else {
      resolved = path.resolve(mdDir, ref);
    }
    refs.push(toPosix(resolved));
  };

  let m;

  // Markdown 图片：![alt](path) 强制解析
  const mdImgRegex = /!\[[^\]]*\]\(\s*(<?[^\s)>]+>?)\s*[^)]*\)/g;
  while ((m = mdImgRegex.exec(markdown))) add(m[1], true);

  // Markdown 链接：[text](path) 只解析资源
  const mdLinkRegex = /(?<!!)\[[^\]]*\]\(\s*(<?[^\s)>]+>?)\s*[^)]*\)/g;
  while ((m = mdLinkRegex.exec(markdown))) add(m[1], false);

  // HTML 标签 src/href 只解析资源
  const htmlRegex = /<(?:img|video|audio|source|a)\b[^>]*?\s(?:src|href)=["']([^"']+)["']/gi;
  while ((m = htmlRegex.exec(markdown))) add(m[1], false);

  // 链接引用定义 [id]: url 只解析资源
  const defRegex = /^[ \t]{0,3}\[[^\]]+\]:[ \t]*(<?\S+>?)/gm;
  while ((m = defRegex.exec(markdown))) add(m[1], false);

  return refs;
}

function collectMd(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) collectMd(fullPath, out);
    else if (entry.name.toLowerCase().endsWith(".md")) out.push(fullPath);
  }
}

const allAssets = new Map();
collectAssets(contentDir, "", allAssets);

const mdFiles = [];
collectMd(contentDir, mdFiles);

const referenced = new Set();
for (const mdPath of mdFiles) {
  const mdDir = path.dirname(mdPath);
  const content = fs.readFileSync(mdPath, "utf8");
  for (const ref of extractReferences(content, mdDir)) {
    referenced.add(ref);
  }
}

const orphans = [];
for (const [absPath, relPath] of allAssets) {
  if (!referenced.has(absPath)) {
    orphans.push(relPath);
  }
}

const brokenRefs = [];
for (const ref of referenced) {
  if (!allAssets.has(ref)) {
    brokenRefs.push(ref);
  }
}

function countByExt(files) {
  const stats = {};
  for (const relPath of files) {
    const ext = path.extname(relPath).toLowerCase();
    stats[ext] = (stats[ext] || 0) + 1;
  }
  return stats;
}

const dirCounts = {};
let orphanBytes = 0;
for (const relPath of orphans) {
  const dir = path.dirname(relPath);
  dirCounts[dir] = (dirCounts[dir] || 0) + 1;
  try {
    orphanBytes += fs.statSync(path.join(contentDir, relPath)).size;
  } catch {}
}

console.log("=== content/ 资源引用分析 ===");
console.log(`总资源文件: ${allAssets.size}`);
console.log(`被引用:    ${referenced.size}`);
console.log(`孤儿文件:  ${orphans.length}`);
console.log(`孤儿占比:  ${((orphans.length / allAssets.size) * 100).toFixed(1)}%`);
console.log(`孤儿大小:  ${(orphanBytes / 1024 / 1024).toFixed(2)} MB`);

console.log("\n全部资源扩展名分布:", countByExt(allAssets.values()));
console.log("孤儿扩展名分布:", countByExt(orphans));
console.log(`\n引用但文件不存在（可能已断裂）: ${brokenRefs.length}`);
if (brokenRefs.length > 0) {
  console.log("抽样 10 个:");
  brokenRefs.slice(0, 10).forEach((p) => console.log(`  ${p}`));
}

console.log("\n=== 孤儿最多的目录 Top 20 ===");
Object.entries(dirCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .forEach(([dir, count]) => console.log(`  ${count.toString().padStart(4)}  ${dir}`));

console.log("\n=== 随机 10 个孤儿 ===");
orphans.slice(0, 10).forEach((p) => console.log(`  ${p}`));

const outPath = path.join(projectRoot, "tmp", "orphaned-content-assets.txt");
const brokenPath = path.join(projectRoot, "tmp", "broken-content-asset-refs.txt");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, orphans.join("\n"), "utf8");
fs.writeFileSync(brokenPath, brokenRefs.join("\n"), "utf8");
console.log(`\n完整孤儿列表: ${outPath}`);
console.log(`断裂引用列表: ${brokenPath}`);
