/**
 * Chat 附件图 → LLM 可用 URL（W3）。
 *
 * 多模态模型直传 vision 时，把附件图解析成 LLM 能直接消费的 URL：
 * - data: 原样
 * - http(s) 非内网：原样（内网拒绝，复用 assertPublicHttpUrl）
 * - /uploads/ | content/uploads/... | 项目内相对路径：读文件转 data URL，单张上限 4MiB
 *
 * 纯文本模型的「静默识图」走 chatImageEnrich.ts，不在此处。
 */

import fs from "fs";
import path from "path";
import type { AppConfig } from "./config.js";
import type { ChatImageAttachment } from "@oasismind/shared";
import { assertPublicHttpUrl } from "./safeHttpUrl.js";
import { resolveSafePath } from "./safePath.js";

/** [OM-FREEPLAY] 单张图送入 vision 模型的原始字节上限：4MiB（本文锁死）。 */
export const MAX_VISION_IMAGE_BYTES = 4 * 1024 * 1024;

function mimeFromExt(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  return "image/png";
}

/** 把 /uploads/... | content/uploads/... | 项目内相对路径解析到 projectRoot 内绝对路径。 */
export function resolveLocalImagePath(config: AppConfig, rawPath: string): string {
  const trimmed = rawPath.trim().replace(/\\/g, "/");
  if (trimmed.startsWith("/uploads/")) {
    return resolveSafePath(config, `content/uploads/${trimmed.slice("/uploads/".length)}`);
  }
  if (trimmed.startsWith("content/uploads/")) {
    return resolveSafePath(config, trimmed);
  }
  return resolveSafePath(config, trimmed);
}

/**
 * 解析附件图为 LLM 可用 URL。
 * @returns data URL / 公网 http(s) URL；失败（不可读、超 4MiB、内网、不存在）返回 null
 */
export function resolveImageUrlForLlm(att: ChatImageAttachment, config: AppConfig): string | null {
  const preview = (att.previewUrl ?? "").trim();
  if (!preview) return null;

  if (preview.startsWith("data:")) return preview;

  if (/^https?:\/\//i.test(preview)) {
    try {
      assertPublicHttpUrl(preview, "附件图片");
      return preview;
    } catch {
      return null;
    }
  }

  try {
    const abs = resolveLocalImagePath(config, preview);
    if (!fs.existsSync(abs)) return null;
    const stat = fs.statSync(abs);
    if (!stat.isFile()) return null;
    if (stat.size > MAX_VISION_IMAGE_BYTES) return null;
    const mime = att.mimeType?.trim() || mimeFromExt(abs);
    const b64 = fs.readFileSync(abs).toString("base64");
    return `data:${mime};base64,${b64}`;
  } catch {
    return null;
  }
}
