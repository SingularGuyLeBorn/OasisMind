/**
 * GitHub Pages 上传前的离线审计。
 *
 * Pages 产物只能包含静态站 out：拒绝符号链接、硬链接、私密目录名和超过平台上限的包。
 * 内容字段级白名单由 publicContentVerifier 负责，这里守住最终上传目录的文件系统边界。
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(siteRoot, "out");
const projectRoot = path.resolve(siteRoot, "../..");
const MAX_PAGES_ARTIFACT_BYTES = 1024 ** 3;
const forbiddenEverywhere = new Set([".env", ".git"]);
const forbiddenTopLevel = new Set(["config", "content", "data", "prisma", "workspaces"]);
const inspectableExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".rss",
  ".txt",
  ".xml",
]);

/**
 * 目录名白名单只能阻止“整桶误上传”，拦不住绝对路径或密钥被序列化进 JSON/JS。
 * 最终 Pages 包因此还要扫描文本内容；仅匹配本机真实根路径和高置信凭据形态，
 * 不因公开技术文章正常提到 `secret`、`DATABASE_URL` 等术语而误报。
 */
const sensitiveLiteralMarkers = [
  { label: "项目绝对路径", value: projectRoot },
  { label: "用户主目录", value: os.homedir() },
  { label: "私人批注目录", value: "content/.private/annotations" },
  { label: "SQLite 本地连接", value: "file:./dev.db" },
].flatMap(({ label, value }) => {
  const normalized = value.replace(/\\/g, "/");
  return [
    { label, value: normalized.toLowerCase() },
    { label, value: normalized.replace(/\//g, "\\").toLowerCase() },
  ];
});
const sensitivePatterns = [
  { label: "私钥正文", pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i },
  {
    label: "非占位密钥赋值",
    pattern:
      /(?:CREDENTIAL_MASTER_KEY|QQ_BOT_SECRET|ZHIHU_ACCESS_SECRET|WEIXIN_CLAWBOT_BOT_TOKEN)\s*[:=]\s*["']?(?!<|your-|example|placeholder|\*{3})[^\s"',;}]{8,}/i,
  },
];

function fail(message) {
  throw new Error(`Pages 产物审计失败：${message}`);
}

function verifyInspectableFile(relative, absolute) {
  if (!inspectableExtensions.has(path.extname(relative).toLowerCase())) return;
  const source = fs.readFileSync(absolute, "utf8");
  // JSON/JS 会把反斜杠写成 `\\`；先还原一层，避免真实 Windows 路径逃过扫描。
  const normalized = source.replace(/\\\\/g, "\\").toLowerCase();
  for (const marker of sensitiveLiteralMarkers) {
    if (marker.value && normalized.includes(marker.value)) {
      fail(`${relative} 包含${marker.label}`);
    }
  }
  for (const marker of sensitivePatterns) {
    if (marker.pattern.test(source)) fail(`${relative} 包含${marker.label}`);
  }
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
    verifyInspectableFile(relative, absolute);
    fileCount += 1;
    totalBytes += stat.size;
    if (totalBytes > MAX_PAGES_ARTIFACT_BYTES) fail("未压缩产物超过 GitHub Pages 1 GiB 上限");
  }
}

if (fileCount === 0) fail("out 目录为空");
console.log(`Pages 产物审计通过：${fileCount} 个文件，${(totalBytes / 1024 / 1024).toFixed(1)} MiB。`);
