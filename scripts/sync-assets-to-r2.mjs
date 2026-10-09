#!/usr/bin/env node
/**
 * 将 content/ 下的文章配图与 uploads/ 同步到 R2（或任意 S3 兼容对象存储）。
 *
 * 行为：
 * - 只上传，不删除本地文件；本地 content/ 仍是事实源。
 * - R2 key 与本地相对路径一致，例如：
 *   content/LargeLanguageModelGuide/1-导论/images/foo.png
 *   → key: LargeLanguageModelGuide/1-导论/images/foo.png
 * - 通过 MD5 跳过未变化的文件。
 *
 * 用法：
 *   1. 在 .env 中配置 R2_* 变量（参考 .env.example）。
 *   2. pnpm install
 *   3. node scripts/sync-assets-to-r2.mjs
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let S3Client;
let PutObjectCommand;
let HeadObjectCommand;
try {
  const s3 = await import("@aws-sdk/client-s3");
  S3Client = s3.S3Client;
  PutObjectCommand = s3.PutObjectCommand;
  HeadObjectCommand = s3.HeadObjectCommand;
} catch {
  console.error("缺少 @aws-sdk/client-s3，请先运行：pnpm install");
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

function readEnv(key) {
  const value = process.env[key];
  if (!value || !value.trim()) {
    throw new Error(`缺少环境变量 ${key}，请参考 .env.example 配置 R2 凭据`);
  }
  return value.trim();
}

const endpoint = readEnv("R2_ENDPOINT");
const bucket = readEnv("R2_BUCKET_NAME");
const accessKeyId = readEnv("R2_ACCESS_KEY_ID");
const secretAccessKey = readEnv("R2_SECRET_ACCESS_KEY");
const contentDir = process.env.OM_CONTENT_DIR
  ? path.resolve(process.env.OM_CONTENT_DIR)
  : path.join(projectRoot, "content");

const s3 = new S3Client({
  region: "auto",
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
});

const ASSET_EXTENSIONS = new Set([
  ".avif",
  ".bmp",
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
  ".pdf",
  ".mp4",
  ".webm",
]);

const MIME_TYPES = {
  ".avif": "image/avif",
  ".bmp": "image/bmp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function toPosix(value) {
  return value.replace(/\\/g, "/");
}

function getContentType(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

function md5Base64(buffer) {
  return createHash("md5").update(buffer).digest("base64");
}

async function uploadFile(key, filePath) {
  const body = fs.readFileSync(filePath);
  const contentType = getContentType(filePath);
  const etag = `"${md5Base64(body)}"`;

  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    if (head.ETag === etag) {
      console.log(`  跳过（未变化）: ${key}`);
      return;
    }
  } catch {
    // 文件不存在或查询失败，继续上传
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  console.log(`  上传: ${key}`);
}

function collectFiles(dir, prefix, out) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(prefix, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, relPath, out);
    } else if (ASSET_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      out.push({ key: toPosix(relPath), fullPath });
    }
  }
}

async function main() {
  if (!fs.existsSync(contentDir)) {
    throw new Error(`content 目录不存在：${contentDir}`);
  }

  const files = [];
  collectFiles(contentDir, "", files);

  console.log(`发现 ${files.length} 个待同步资源，目标 bucket：${bucket}`);

  for (const { key, fullPath } of files) {
    await uploadFile(key, fullPath);
  }

  console.log("同步完成。");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
