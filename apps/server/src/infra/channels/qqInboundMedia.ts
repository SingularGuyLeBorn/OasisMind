/**
 * QQ 入站富媒体：解析 attachments / 引用 msg_elements，下载到 content/uploads/qq/。
 *
 * 手机 QQ 群聊常无法「图文同条 + @」——用户先发图，再引用该图并 @ 机器人。
 * 引用事件里被引用附件在 msg_elements[].attachments（或本条 attachments）。
 */

import type { ChannelAttachment } from "@oasismind/shared";
import {
  formatInboundChannelAttachment,
  materializeRemoteChannelAttachment,
} from "./channelAttachment.js";

export type QqRawAttachment = {
  url: string;
  filename?: string;
  contentType?: string;
  width?: number;
  height?: number;
  size?: number;
};

export type QqInboundMediaResult = {
  /** 用户可见的附件摘要；结构化事实仍在 attachments 中。 */
  mediaLines: string[];
  /** 五类媒体统一进入消息附件；图片附带 previewUrl 时可直送 vision。 */
  attachments: ChannelAttachment[];
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

function inferQqAttachmentKind(attachment: QqRawAttachment): ChannelAttachment["kind"] {
  const probe = `${attachment.contentType || ""} ${attachment.filename || ""}`.toLowerCase();
  if (/image|\.(?:jpe?g|png|gif|webp|bmp)\b/.test(probe)) return "image";
  if (/video|\.(?:mp4|mov|webm|mkv|m4v)\b/.test(probe)) return "video";
  if (/audio|voice|\.(?:silk|slk|amr|wav|mp3|m4a|aac|ogg)\b/.test(probe)) return "audio";
  return "file";
}

/** 下载入站/引用附件，并统一生成可落库的 ChannelAttachment。 */
export async function materializeQqInboundMedia(
  d: Record<string, unknown>,
): Promise<QqInboundMediaResult> {
  const quotedText = extractQqQuotedText(d);
  const raws = collectQqRawAttachments(d);
  if (raws.length === 0) {
    return { mediaLines: [], attachments: [], quotedText };
  }

  const mediaLines: string[] = [];
  const attachments: ChannelAttachment[] = [];

  for (const raw of raws) {
    const attachment = await materializeRemoteChannelAttachment({
      source: "qq",
      remoteUrl: raw.url,
      fileName: raw.filename,
      declaredMime: raw.contentType,
      hintedKind: inferQqAttachmentKind(raw),
    });
    attachments.push(attachment);
    mediaLines.push(formatInboundChannelAttachment(attachment));
  }

  return { mediaLines, attachments, quotedText };
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
