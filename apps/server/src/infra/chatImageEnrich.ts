/**
 * Chat 附件图静默识图（W3）——纯文本模型 persist 前的兜底。
 *
 * 多模态模型直传 vision（chatImageForLlm）；纯文本模型看不见图，
 * 在 persistUserMessage 写库前对缺 extractedText 的图调 vision 模型补描述，
 * 写入附件 JSON 的 extractedText + source: "vision"，随后走现有 OCR 拼接分支。
 * 失败不阻断发送：该张 extractedText 记「识图失败：…」，前端预览红字。
 */

import type { AppConfig } from "./config.js";
import type { ChatAttachment, ChatImageAttachment } from "@oasismind/shared";
import { isChatImageAttachment } from "@oasismind/shared";
import { describeImageWithVision } from "./tools/native/web/readImage.js";
import { resolveAuxiliaryModel } from "./auxiliaryModel.js";
import { MAX_VISION_IMAGE_BYTES, resolveLocalImagePath } from "./chatImageForLlm.js";
import fs from "fs";
import path from "path";

/** [OM-FREEPLAY] 单张识图超时 20s（本文锁死）。 */
const ENRICH_TIMEOUT_MS = 20_000;

const ENRICH_PROMPT =
  "请用中文简述这张图片的可见内容：主体、布局、可见文字与关键信息。不要编造。";

export interface ImageEnrichContext {
  config: AppConfig;
  /** 主对话模型，作 auxiliary 解析的回退。 */
  mainModel: string;
}

function mimeFromExt(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  return "image/png";
}

function withTimeout<T>(p: Promise<T>, ms: number, msg: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const to = setTimeout(() => reject(new Error(msg)), ms);
    p.then(
      (v) => {
        clearTimeout(to);
        resolve(v);
      },
      (e) => {
        clearTimeout(to);
        reject(e);
      },
    );
  });
}

/** 选可看图的辅助模型：strong_free 优先，不可用 fallback lite。 */
async function describeWithFallback(
  ctx: ImageEnrichContext,
  absPath: string,
  mimeType: string,
): Promise<string> {
  const strong = resolveAuxiliaryModel(ctx.config, {
    configured: "auto",
    mainModel: ctx.mainModel,
    preference: "strong_free",
  });
  try {
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), ENRICH_TIMEOUT_MS);
    try {
      const { text } = await withTimeout(
        describeImageWithVision(ctx.config, absPath, mimeType, ENRICH_PROMPT, strong, ac.signal),
        ENRICH_TIMEOUT_MS,
        "识图超时",
      );
      return text;
    } finally {
      clearTimeout(to);
    }
  } catch (e1) {
    const lite = resolveAuxiliaryModel(ctx.config, {
      configured: "auto",
      mainModel: ctx.mainModel,
      preference: "lite_free",
    });
    if (lite === strong) throw e1;
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), ENRICH_TIMEOUT_MS);
    try {
      const { text } = await withTimeout(
        describeImageWithVision(ctx.config, absPath, mimeType, ENRICH_PROMPT, lite, ac.signal),
        ENRICH_TIMEOUT_MS,
        "识图超时",
      );
      return text;
    } finally {
      clearTimeout(to);
    }
  }
}

/**
 * 对缺 extractedText 的图片附件静默识图，原地补 extractedText + source: "vision"。
 * 失败该张记「识图失败：…」不抛。返回新数组（不改原引用，避免污染前端乐观态）。
 */
export async function enrichImageAttachmentsForPersist(
  attachments: ChatAttachment[] | undefined,
  ctx: ImageEnrichContext,
): Promise<ChatAttachment[]> {
  const list = attachments ?? [];
  if (list.length === 0) return list;

  const result: ChatAttachment[] = [];
  for (const att of list) {
    if (!isChatImageAttachment(att)) {
      result.push(att);
      continue;
    }
    const image = att as ChatImageAttachment;
    if (image.extractedText?.trim()) {
      result.push(att);
      continue;
    }
    const enriched = await enrichOne(image, ctx);
    result.push(enriched);
  }
  return result;
}

async function enrichOne(
  att: ChatImageAttachment,
  ctx: ImageEnrichContext,
): Promise<ChatAttachment> {
  const preview = (att.previewUrl ?? "").trim();
  // data: URL / 公网 http(s)：persist 侧不下载远程图，仅本地文件识图。
  if (!preview || preview.startsWith("data:") || /^https?:\/\//i.test(preview)) {
    return att;
  }
  try {
    const abs = resolveLocalImagePath(ctx.config, preview);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) return att;
    if (fs.statSync(abs).size > MAX_VISION_IMAGE_BYTES) {
      return { ...att, extractedText: "识图失败：图片过大未送入模型", source: "vision" };
    }
    const mime = att.mimeType?.trim() || mimeFromExt(abs);
    const text = await describeWithFallback(ctx, abs, mime);
    return { ...att, extractedText: text.trim() || "识图失败：模型未返回描述", source: "vision" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ...att, extractedText: `识图失败：${msg}`, source: "vision" };
  }
}
