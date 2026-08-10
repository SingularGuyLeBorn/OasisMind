/**
 * QQ 入站富媒体：解析 attachments / 引用 msg_elements，下载到 content/uploads/qq/。
 *
 * 手机 QQ 群聊常无法「图文同条 + @」——用户先发图，再引用该图并 @ 机器人。
 * 引用事件里被引用附件在 msg_elements[].attachments（或本条 attachments）。
 */

import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { ChatAttachment } from "@knowpilot/shared";
import { getAppConfig } from "../config.js";

const MAX_BYTES = 25 * 1024 * 1024;

export type QqRawAttachment = {
  url: string;
  filename?: string;
  contentType?: string;
  width?: number;
  height?: number;
  size?: number;
};

export type QqInboundMediaResult = {
  /** 拼进用户文案的附件说明（视频/文件路径等） */
  mediaLines: string[];
  /** 图片 → Chat 附件（data URL，供 vision；非 vision 靠 mediaLines + 工具） */
  chatAttachments: ChatAttachment[];
  /** 引用原文（若有） */
  quotedText: string;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : null;
}

function normalizeUrl(raw: string): string {
  const u = raw.trim();
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u.replace(/^\/+/, "")}`;
}

function extFromMime(mime: string, fallback: string): string {
  const m = mime.toLowerCase();
  if (m.includes("jpeg") || m.includes("jpg")) return ".jpg";
  if (m.includes("png")) return ".png";
  if (m.includes("gif")) return ".gif";
  if (m.includes("webp")) return ".webp";
  if (m.includes("mp4")) return ".mp4";
  if (m.includes("wav")) return ".wav";
  if (m.includes("silk") || m === "voice") return ".silk";
  return fallback;
}

/** 从事件体收集本条 + 引用元素中的附件（递归 msg_elements） */
export function collectQqRawAttachments(d: Record<string, unknown>): QqRawAttachment[] {
  const out: QqRawAttachment[] = [];
  const seen = new Set<string>();

  const pushList = (list: unknown) => {
    if (!Array.isArray(list)) return;
    for (const item of list) {
      const a = asRecord(item);
      if (!a) continue;
      const url = normalizeUrl(String(a.url ?? ""));
      if (!url || seen.has(url)) continue;
      seen.add(url);
      const contentTypeRaw = a.content_type ?? a.contentType;
      out.push({
        url,
        filename: typeof a.filename === "string" ? a.filename : undefined,
        contentType: typeof contentTypeRaw === "string" ? contentTypeRaw : undefined,
        width: typeof a.width === "number" ? a.width : undefined,
        height: typeof a.height === "number" ? a.height : undefined,
        size: typeof a.size === "number" ? a.size : undefined,
      });
    }
  };

  pushList(d.attachments);

  const walkElements = (elements: unknown, depth: number) => {
    if (depth > 4 || !Array.isArray(elements)) return;
    for (const el of elements) {
      const e = asRecord(el);
      if (!e) continue;
      pushList(e.attachments);
      walkElements(e.msg_elements, depth + 1);
    }
  };
  walkElements(d.msg_elements, 0);

  // message_reference 内嵌 message / referenced_message（部分实现会带）
  const ref = asRecord(d.message_reference);
  if (ref) {
    for (const key of ["message", "referenced_message", "source_message"] as const) {
      const nested = asRecord(ref[key]);
      if (nested) {
        pushList(nested.attachments);
        walkElements(nested.msg_elements, 0);
      }
    }
  }

  return out;
}

/** 抽出引用文本（message_reference / msg_elements） */
export function extractQqQuotedText(d: Record<string, unknown>): string {
  const ref = asRecord(d.message_reference);
  if (ref) {
    for (const key of ["content", "title"] as const) {
      const t = typeof ref[key] === "string" ? String(ref[key]).trim() : "";
      if (t) return t;
    }
    for (const key of ["message", "referenced_message", "source_message"] as const) {
      const nested = asRecord(ref[key]);
      const t = nested && typeof nested.content === "string" ? nested.content.trim() : "";
      if (t) return t;
    }
  }

  const messageType = Number(d.message_type ?? 0);
  const elements = Array.isArray(d.msg_elements) ? d.msg_elements : [];
  if ((messageType === 103 || elements.length > 0) && elements[0]) {
    const el = asRecord(elements[0]);
    const t = el && typeof el.content === "string" ? el.content.trim() : "";
    if (t) return t;
  }
  return "";
}

async function downloadOne(
  att: QqRawAttachment,
  destDir: string,
): Promise<{ relPath: string; absPath: string; mime: string; kind: "image" | "video" | "file"; bytes: Buffer } | null> {
  try {
    const res = await fetch(att.url, {
      headers: { "User-Agent": "KnowPilot-QQBot/1.0" },
    });
    if (!res.ok) {
      console.warn(`[qq-media] 下载失败 HTTP ${res.status}: ${att.url.slice(0, 120)}`);
      return null;
    }
    const ab = await res.arrayBuffer();
    if (ab.byteLength <= 0 || ab.byteLength > MAX_BYTES) {
      console.warn(`[qq-media] 跳过异常大小 ${ab.byteLength}: ${att.url.slice(0, 80)}`);
      return null;
    }
    const bytes = Buffer.from(ab);
    const headerMime = (res.headers.get("content-type") || "").split(";")[0]!.trim();
    const nameLower = (att.filename || "").toLowerCase();
    const guessFromName =
      /\.(jpe?g|png|gif|webp)$/i.test(nameLower)
        ? "image/jpeg"
        : /\.(mp4|mov|webm)$/i.test(nameLower)
          ? "video/mp4"
          : "";
    const mime = (att.contentType || headerMime || guessFromName || "application/octet-stream").toLowerCase();
    let kind: "image" | "video" | "file" = "file";
    if (mime.startsWith("image/") || mime === "image" || /\.(jpe?g|png|gif|webp)$/i.test(nameLower)) {
      kind = "image";
    } else if (mime.startsWith("video/") || mime === "video/mp4" || /\.(mp4|mov|webm)$/i.test(nameLower)) {
      kind = "video";
    } else if (mime === "voice" || mime.startsWith("audio/")) {
      kind = "file";
    }

    const baseName = (att.filename || `qq-${Date.now().toString(36)}`).replace(/[^\w.\-()+]+/g, "_");
    const ext =
      path.extname(baseName) ||
      extFromMime(mime, kind === "image" ? ".jpg" : kind === "video" ? ".mp4" : ".bin");
    const fileName = `${Date.now().toString(36)}-${randomUUID().slice(0, 8)}${ext}`;
    const absPath = path.join(destDir, fileName);
    fs.writeFileSync(absPath, bytes);
    return {
      relPath: `content/uploads/qq/${fileName}`,
      absPath,
      mime: mime.startsWith("image/") || mime.startsWith("video/") || mime.startsWith("audio/")
        ? mime
        : kind === "image"
          ? "image/jpeg"
          : kind === "video"
            ? "video/mp4"
            : mime,
      kind,
      bytes,
    };
  } catch (err) {
    console.warn(
      `[qq-media] 下载异常:`,
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

/**
 * 下载入站/引用附件，生成 ChatAttachment（图片）与文案说明（视频/文件）。
 */
export async function materializeQqInboundMedia(
  d: Record<string, unknown>,
): Promise<QqInboundMediaResult> {
  const quotedText = extractQqQuotedText(d);
  const raws = collectQqRawAttachments(d);
  if (raws.length === 0) {
    return { mediaLines: [], chatAttachments: [], quotedText };
  }

  const config = getAppConfig();
  const destDir = path.join(config.contentPaths.uploads, "qq");
  fs.mkdirSync(destDir, { recursive: true });

  const mediaLines: string[] = [];
  const chatAttachments: ChatAttachment[] = [];

  for (const raw of raws) {
    const saved = await downloadOne(raw, destDir);
    if (!saved) {
      mediaLines.push(`（附件下载失败：${raw.filename || raw.url.slice(0, 60)}）`);
      continue;
    }
    if (saved.kind === "image") {
      const dataUrl = `data:${saved.mime};base64,${saved.bytes.toString("base64")}`;
      chatAttachments.push({
        type: "image",
        name: path.basename(saved.relPath),
        mimeType: saved.mime,
        previewUrl: dataUrl,
        extractedText: `图片已保存到 ${saved.relPath}（也可用 read_image / vision_describe）`,
        source: "user",
      });
      mediaLines.push(`图片: ${saved.relPath}`);
    } else if (saved.kind === "video") {
      mediaLines.push(`视频: ${saved.relPath}（可用相关工具分析；不能当图片 OCR）`);
    } else {
      mediaLines.push(`文件: ${saved.relPath}（mime=${saved.mime}）`);
    }
  }

  return { mediaLines, chatAttachments, quotedText };
}

/** 把引用原文 + 附件说明拼进用户可见文案 */
export function composeQqUserText(opts: {
  content: string;
  quotedText: string;
  mediaLines: string[];
}): string {
  const parts: string[] = [];
  if (opts.quotedText.trim()) {
    parts.push(`【引用消息】\n${opts.quotedText.trim()}`);
  }
  if (opts.mediaLines.length) {
    parts.push(`【附件】\n${opts.mediaLines.map((l) => `- ${l}`).join("\n")}`);
  }
  const body = opts.content.trim();
  if (body) parts.push(body);
  else if (parts.length === 0) parts.push("（空消息）");
  else if (!opts.quotedText.trim() && opts.mediaLines.length) {
    /* 仅附件 */
  } else if (!body && (opts.quotedText || opts.mediaLines.length)) {
    parts.push("（请结合上方引用/附件处理）");
  }
  return parts.join("\n\n");
}
