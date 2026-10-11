/** [OM-FREEPLAY] 实测长文懒加载图片造成页面高度漂移；只读公开哈希 WebP 头，预留真实比例。 */
import fs from "node:fs";
import path from "node:path";
import { SITE_BASE_PATH } from "../siteConfig";

export interface ImageSize { width: number; height: number }

const assetPattern = /^\/api\/v1\/assets\/([0-9a-f]{2})\/([0-9a-f]{64})\.webp(?:[?#].*)?$/;
const cache = new Map<string, ImageSize>();

export function readPublicImageSize(src: string, publicRoot = path.join(process.cwd(), "public"), basePath = SITE_BASE_PATH): ImageSize | undefined {
  const assetSrc = basePath && src.startsWith(`${basePath}/`) ? src.slice(basePath.length) : src;
  const match = assetPattern.exec(assetSrc);
  if (!match) return undefined;
  const [, prefix, hash] = match;
  const file = path.join(publicRoot, "api", "v1", "assets", prefix, `${hash}.webp`);
  const cached = cache.get(file);
  if (cached) return cached;
  const header = Buffer.alloc(30);
  let handle: number;
  try {
    handle = fs.openSync(file, "r");
  } catch (error) {
    throw new Error(`公开图片缺失：${src}（${error instanceof Error ? error.message : String(error)}）`);
  }
  try {
    if (fs.readSync(handle, header, 0, header.length, 0) < header.length) throw new Error("文件头不足 30 字节");
  } finally {
    fs.closeSync(handle);
  }
  if (header.toString("ascii", 0, 4) !== "RIFF" || header.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error(`公开图片不是 WebP：${src}`);
  }
  const chunk = header.toString("ascii", 12, 16);
  let width: number;
  let height: number;
  if (chunk === "VP8 ") {
    if (header[23] !== 0x9d || header[24] !== 0x01 || header[25] !== 0x2a) throw new Error(`WebP VP8 帧头损坏：${src}`);
    width = header.readUInt16LE(26) & 0x3fff;
    height = header.readUInt16LE(28) & 0x3fff;
  } else if (chunk === "VP8X") {
    width = 1 + header.readUIntLE(24, 3);
    height = 1 + header.readUIntLE(27, 3);
  } else if (chunk === "VP8L") {
    // WebP Lossless 规范：签名 0x2f 后依次是 14 位宽、14 位高和 4 位标志（低位先读）。
    if (header[20] !== 0x2f) throw new Error(`WebP VP8L 签名损坏：${src}`);
    const bits = header.readUInt32LE(21);
    if (bits >>> 29) throw new Error(`WebP VP8L 版本号无效：${src}`);
    width = 1 + (bits & 0x3fff);
    height = 1 + ((bits >>> 14) & 0x3fff);
  } else {
    throw new Error(`暂不支持的 WebP 格式 ${chunk}：${src}`);
  }
  if (width <= 0 || height <= 0) throw new Error(`公开图片宽高无效：${src}`);
  const size = { width, height };
  cache.set(file, size);
  return size;
}
