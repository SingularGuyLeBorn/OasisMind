#!/usr/bin/env node
/**
 * 将未被 Markdown 引用的 content/ 资源移到 data/trash/orphaned-content-assets/。
 * 默认 dry-run；加 --yes 才真正移动。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const contentDir = path.join(projectRoot, "content");
const trashRoot = path.join(projectRoot, "data", "trash", "orphaned-content-assets");
const orphanListPath = path.join(projectRoot, "tmp", "orphaned-content-assets.txt");

const yes = process.argv.includes("--yes");

if (!fs.existsSync(orphanListPath)) {
  console.error(`未找到孤儿列表：${orphanListPath}`);
  console.error("请先运行：node scripts/find-orphaned-content-assets.mjs");
  process.exit(1);
}

const orphans = fs
  .readFileSync(orphanListPath, "utf8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

if (orphans.length === 0) {
  console.log("没有孤儿资源需要移动。");
  process.exit(0);
}

console.log(`发现 ${orphans.length} 个孤儿资源。`);
console.log(`目标回收站：${trashRoot}`);

let moved = 0;
let skipped = 0;
let bytes = 0;

for (const relPath of orphans) {
  const source = path.join(contentDir, relPath);
  const target = path.join(trashRoot, relPath);

  if (!fs.existsSync(source)) {
    console.log(`  跳过（不存在）: ${relPath}`);
    skipped++;
    continue;
  }

  const stat = fs.statSync(source);
  bytes += stat.size;

  if (yes) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.renameSync(source, target);
    console.log(`  移动: ${relPath}`);
  } else {
    console.log(`  将移动: ${relPath}`);
  }
  moved++;
}

console.log(
  yes
    ? `\n完成：移动 ${moved} 个文件，跳过 ${skipped} 个，共 ${(bytes / 1024 / 1024).toFixed(2)} MB。`
    : `\nDry-run 完成：将移动 ${moved} 个文件，跳过 ${skipped} 个，共 ${(bytes / 1024 / 1024).toFixed(2)} MB。`,
);

if (!yes) {
  console.log("\n这是演习。真正移动请运行：");
  console.log("  node scripts/move-orphaned-content-assets-to-trash.mjs --yes");
}
