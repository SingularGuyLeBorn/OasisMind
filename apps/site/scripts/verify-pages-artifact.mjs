/**
 * GitHub Pages 上传前的离线审计。
 *
 * Pages 产物只能包含静态站 out：拒绝符号链接、硬链接、私密目录名和超过平台上限的包。
 * 内容字段级白名单由 publicContentVerifier 负责，这里守住最终上传目录的文件系统边界。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(siteRoot, "out");
const MAX_PAGES_ARTIFACT_BYTES = 1024 ** 3;
const forbiddenEverywhere = new Set([".env", ".git"]);
const forbiddenTopLevel = new Set(["config", "content", "data", "prisma", "workspaces"]);

function fail(message) {
  throw new Error(`Pages 产物审计失败：${message}`);
}

if (!fs.existsSync(outDir) || !fs.statSync(outDir).isDirectory()) fail("缺少 apps/site/out");

let fileCount = 0;
let totalBytes = 0;
const pending = [outDir];
while (pending.length > 0) {
  const directory = pending.pop();
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(outDir, absolute).replace(/\\/g, "/");
    const stat = fs.lstatSync(absolute);
    if (stat.isSymbolicLink()) fail(`禁止符号链接：${relative}`);
    const normalizedName = entry.name.toLowerCase();
    const isTopLevel = !relative.includes("/");
    if (forbiddenEverywhere.has(normalizedName) || (isTopLevel && forbiddenTopLevel.has(normalizedName))) {
      fail(`包含私密目录或文件名：${relative}`);
    }
    if (entry.isDirectory()) {
      pending.push(absolute);
      continue;
    }
    if (!entry.isFile()) fail(`包含不支持的文件类型：${relative}`);
    if (stat.nlink > 1) fail(`禁止硬链接：${relative}`);
    fileCount += 1;
    totalBytes += stat.size;
    if (totalBytes > MAX_PAGES_ARTIFACT_BYTES) fail("未压缩产物超过 GitHub Pages 1 GiB 上限");
  }
}

if (fileCount === 0) fail("out 目录为空");
console.log(`Pages 产物审计通过：${fileCount} 个文件，${(totalBytes / 1024 / 1024).toFixed(1)} MiB。`);
