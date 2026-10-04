/**
 * IM 统一附件落盘层。
 *
 * 职责：限制下载体积、识别真实 MIME、净化文件名、计算 SHA-256，并把 QQ/微信
 * 的协议字段收拢成 ChannelAttachment。事实源是落盘文件与附件结构本身；适配器
 * 不得再各自发明“路径文字”。失败返回 status=failed 的附件，不静默丢弃。
 */

import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import type { ChannelAttachment } from "@oasismind/shared";
import { getAppConfig } from "../config.js";

export const CHANNEL_ATTACHMENT_MAX_BYTES = 25 * 1024 * 1024;
export const CHANNEL_IMAGE_INLINE_MAX_BYTES = Math.floor(1.5 * 1024 * 1024);
// [OM-FREEPLAY] 用户要求网络传输必须有超时但未指定时长；30 秒避免远程 IM 一直挂起。
export const CHANNEL_ATTACHMENT_TIMEOUT_MS = 30_000;

export type ChannelAttachmentSource = ChannelAttachment["source"];
export type ChannelAttachmentKind = ChannelAttachment["kind"];

function sanitizeFileName(raw: string, fallback: string): string {
  const base = path.basename(raw.trim() || fallback);
  const safe = base.replace(/[<>:"/\\|?*\u0000-\u001f]+/g, "_").replace(/\s+/g, " ").trim();
  return (safe || fallback).slice(0, 180);
}

function extensionForMime(mime: string): string {
  const table: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "video/mp4": ".mp4",
    "audio/wav": ".wav",
    "audio/ogg": ".ogg",
    "audio/mpeg": ".mp3",
    "application/pdf": ".pdf",
    "application/zip": ".zip",
  };
  return table[mime] ?? ".bin";
}

/** 文件扩展名只作为声明提示；图片和视频仍必须通过魔数复核。 */
export function mimeForChannelFileName(fileName: string): string {
  const extension = path.extname(fileName).toLowerCase();
  const table: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".mp4": "video/mp4",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".mp3": "audio/mpeg",
    ".silk": "audio/silk",
    ".slk": "audio/silk",
    ".amr": "audio/amr",
    ".m4a": "audio/mp4",
    ".aac": "audio/aac",
    ".pdf": "application/pdf",
    ".zip": "application/zip",
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".json": "application/json",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };
  return table[extension] ?? "application/octet-stream";
}

/** 只相信可由魔数确认的格式；其余保持 application/octet-stream。 */
export function sniffChannelMime(bytes: Buffer): string {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (bytes.length >= 6 && ["GIF87a", "GIF89a"].includes(bytes.subarray(0, 6).toString("ascii"))) return "image/gif";
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (bytes.length >= 12 && bytes.subarray(4, 8).toString("ascii") === "ftyp") return "video/mp4";
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WAVE") return "audio/wav";
  if (bytes.length >= 4 && bytes.subarray(0, 4).toString("ascii") === "OggS") return "audio/ogg";
  if (bytes.length >= 3 && bytes.subarray(0, 3).toString("ascii") === "ID3") return "audio/mpeg";
  if (bytes.length >= 5 && bytes.subarray(0, 5).toString("ascii") === "%PDF-") return "application/pdf";
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && [0x03, 0x05, 0x07].includes(bytes[2] ?? -1)) return "application/zip";
  return "application/octet-stream";
}

function kindFromMime(mime: string, hinted?: ChannelAttachmentKind): ChannelAttachmentKind {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return hinted && hinted !== "text" ? hinted : "file";
}

function mimeFamily(mime: string): string {
  return mime.split("/", 1)[0]?.toLowerCase() ?? "";
}

async function readResponseWithLimit(response: Response, maxBytes: number): Promise<Buffer> {
  const declared = Number(response.headers.get("content-length") || 0);
  if (declared > maxBytes) {
    throw new Error(`附件大小 ${declared} 字节超过上限 ${maxBytes} 字节`);
  }
  if (!response.body) return Buffer.alloc(0);
  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let total = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      const chunk = Buffer.from(next.value);
      total += chunk.length;
      if (total > maxBytes) {
        await reader.cancel("attachment too large").catch(() => {});
        throw new Error(`附件下载超过上限 ${maxBytes} 字节`);
      }
      chunks.push(chunk);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, total);
}

/** 下载需要先解密的媒体原始字节（微信 CDN）；仍执行统一超时与体积护栏。 */
export async function fetchChannelAttachmentBytes(
  url: string,
  fetchImpl: typeof fetch = fetch,
  maxBytes = CHANNEL_ATTACHMENT_MAX_BYTES,
): Promise<Buffer> {
  const response = await fetchImpl(url, {
    headers: { "User-Agent": "OasisMind-Channel/1.0" },
    signal: AbortSignal.timeout(CHANNEL_ATTACHMENT_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`下载 HTTP ${response.status}`);
  const bytes = await readResponseWithLimit(response, maxBytes);
  if (bytes.length === 0) throw new Error("附件内容为空");
  return bytes;
}

export function createFailedChannelAttachment(opts: {
  id?: string;
  source: ChannelAttachmentSource;
  kind: ChannelAttachmentKind;
  fileName: string;
  mimeType: string;
  remoteUrl?: string;
  remoteId?: string;
  caption?: string;
  error: string;
}): ChannelAttachment {
  const now = new Date().toISOString();
  return {
    type: "channel",
    id: opts.id ?? randomUUID(),
    kind: opts.kind,
    fileName: opts.fileName,
    mimeType: opts.mimeType || "application/octet-stream",
    size: null,
    sha256: null,
    source: opts.source,
    remoteUrl: opts.remoteUrl,
    remoteId: opts.remoteId,
    caption: opts.caption,
    status: "failed",
    error: opts.error,
    createdAt: now,
    updatedAt: now,
  };
}

/** 已取得明文 bytes 的平台（如微信 CDN 解密后）复用同一校验与落盘路径。 */
export function materializeChannelAttachmentBytes(opts: {
  source: ChannelAttachmentSource;
  bytes: Buffer;
  fileName?: string;
  declaredMime?: string;
  hintedKind?: ChannelAttachmentKind;
  remoteUrl?: string;
  remoteId?: string;
  caption?: string;
}): ChannelAttachment {
  const id = randomUUID();
  const declaredMime = (opts.declaredMime || "application/octet-stream").split(";", 1)[0]!.trim().toLowerCase();
  const hintedKind = opts.hintedKind ?? kindFromMime(declaredMime);
  const fallbackName = `attachment${extensionForMime(declaredMime)}`;
  const inputName = sanitizeFileName(opts.fileName || fallbackName, fallbackName);
  try {
    if (opts.bytes.length === 0) throw new Error("附件内容为空");
    if (opts.bytes.length > CHANNEL_ATTACHMENT_MAX_BYTES) {
      throw new Error(`附件大小 ${opts.bytes.length} 字节超过上限 ${CHANNEL_ATTACHMENT_MAX_BYTES} 字节`);
    }
    const sniffedMime = sniffChannelMime(opts.bytes);
    if (
      sniffedMime !== "application/octet-stream" &&
      declaredMime !== "application/octet-stream" &&
      mimeFamily(sniffedMime) !== mimeFamily(declaredMime)
    ) {
      throw new Error(`MIME 不匹配：声明 ${declaredMime}，实际 ${sniffedMime}`);
    }
    if (
      ["image", "video", "audio"].includes(hintedKind) &&
      sniffedMime === "application/octet-stream" &&
      mimeFamily(declaredMime) !== hintedKind
    ) {
      throw new Error(`无法验证 ${hintedKind} 附件，声明 MIME 为 ${declaredMime || "未知"}`);
    }
    if (["image", "video"].includes(hintedKind) && sniffedMime === "application/octet-stream") {
      throw new Error(`无法通过文件魔数验证 ${hintedKind} 附件，拒绝仅凭扩展名发送`);
    }
    const mimeType = sniffedMime !== "application/octet-stream" ? sniffedMime : declaredMime;
    const kind = kindFromMime(mimeType, hintedKind);
    const extension = path.extname(inputName) || extensionForMime(mimeType);
    const stem = path.basename(inputName, path.extname(inputName));
    const fileName = sanitizeFileName(`${stem}${extension}`, `attachment${extension}`);
    const storageKey = `channels/${opts.source}/${new Date().toISOString().slice(0, 7)}/${id}-${fileName}`;
    const localPath = `content/uploads/${storageKey}`;
    const absPath = path.join(getAppConfig().contentPaths.uploads, storageKey);
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    const tempPath = `${absPath}.${randomUUID()}.tmp`;
    fs.writeFileSync(tempPath, opts.bytes, { flag: "wx" });
    fs.renameSync(tempPath, absPath);
    const now = new Date().toISOString();
    return {
      type: "channel",
      id,
      kind,
      fileName,
      mimeType,
      size: opts.bytes.length,
      sha256: createHash("sha256").update(opts.bytes).digest("hex"),
      source: opts.source,
      localPath,
      storageKey,
      remoteUrl: opts.remoteUrl,
      remoteId: opts.remoteId,
      caption: opts.caption,
      status: "ready",
      previewUrl:
        kind === "image" && opts.bytes.length <= CHANNEL_IMAGE_INLINE_MAX_BYTES
          ? `data:${mimeType};base64,${opts.bytes.toString("base64")}`
          : undefined,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    return createFailedChannelAttachment({
      id,
      source: opts.source,
      kind: hintedKind,
      fileName: inputName,
      mimeType: declaredMime,
      remoteUrl: opts.remoteUrl,
      remoteId: opts.remoteId,
      caption: opts.caption,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/** 文本也使用统一附件模型；正文放在 caption，哈希用于传输幂等。 */
export function createTextChannelAttachment(opts: {
  text: string;
  source?: Extract<ChannelAttachmentSource, "agent" | "local">;
  fileName?: string;
}): ChannelAttachment {
  const text = opts.text;
  const bytes = Buffer.from(text, "utf8");
  const now = new Date().toISOString();
  return {
    type: "channel",
    id: randomUUID(),
    kind: "text",
    fileName: sanitizeFileName(opts.fileName || "message.txt", "message.txt"),
    mimeType: "text/plain; charset=utf-8",
    size: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    source: opts.source ?? "agent",
    caption: text,
    status: "ready",
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 把已通过 Workspace/hostAccess 权限检查的文件复制进受控发送区。
 * 调用方必须先用 resolveAgentFsPath；本函数只负责文件与媒体真实性校验。
 */
export function materializeLocalChannelAttachment(opts: {
  absPath: string;
  source?: Extract<ChannelAttachmentSource, "agent" | "local">;
  fileName?: string;
  hintedKind?: ChannelAttachmentKind;
  caption?: string;
}): ChannelAttachment {
  const stat = fs.statSync(opts.absPath);
  if (!stat.isFile()) {
    return createFailedChannelAttachment({
      source: opts.source ?? "agent",
      kind: opts.hintedKind ?? "file",
      fileName: opts.fileName || path.basename(opts.absPath) || "attachment.bin",
      mimeType: "application/octet-stream",
      caption: opts.caption,
      error: "发送路径不是普通文件",
    });
  }
  if (stat.size > CHANNEL_ATTACHMENT_MAX_BYTES) {
    return createFailedChannelAttachment({
      source: opts.source ?? "agent",
      kind: opts.hintedKind ?? "file",
      fileName: opts.fileName || path.basename(opts.absPath),
      mimeType: mimeForChannelFileName(opts.fileName || opts.absPath),
      caption: opts.caption,
      error: `附件大小 ${stat.size} 字节超过上限 ${CHANNEL_ATTACHMENT_MAX_BYTES} 字节`,
    });
  }
  return materializeChannelAttachmentBytes({
    source: opts.source ?? "agent",
    bytes: fs.readFileSync(opts.absPath),
    fileName: opts.fileName || path.basename(opts.absPath),
    declaredMime: mimeForChannelFileName(opts.fileName || opts.absPath),
    hintedKind: opts.hintedKind,
    caption: opts.caption,
  });
}

/**
 * 自动回复中的 Markdown 路径没有 NativeToolContext，不能据此读取任意本机文件。
 * 因此这里只接受 content/uploads（及其 /uploads 别名）；授权主机文件必须显式走发送工具，
 * 由 resolveAgentFsPath 完成 hostAccess 与私聊检查。
 */
export async function materializeReplyChannelReference(opts: {
  reference: string;
  kind: Exclude<ChannelAttachmentKind, "text">;
  caption?: string;
}): Promise<ChannelAttachment> {
  const reference = opts.reference.trim();
  if (/^https?:\/\//i.test(reference)) {
    return materializeRemoteChannelAttachment({
      source: "remote",
      remoteUrl: reference,
      hintedKind: opts.kind,
      caption: opts.caption,
    });
  }

  const uploadsRoot = path.resolve(getAppConfig().contentPaths.uploads);
  let candidate = reference.replace(/\\/g, "/");
  if (candidate.startsWith("/uploads/")) candidate = `content${candidate}`;
  else if (candidate.startsWith("uploads/")) candidate = `content/${candidate}`;
  const abs = path.isAbsolute(candidate)
    ? path.resolve(candidate)
    : path.resolve(getAppConfig().projectRoot, candidate);
  const relative = path.relative(uploadsRoot, abs);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("自动回复只允许发送 content/uploads 内的文件；本机文件请使用显式发送工具");
  }
  const realRoot = fs.realpathSync(uploadsRoot);
  const realFile = fs.realpathSync(abs);
  const realRelative = path.relative(realRoot, realFile);
  if (!realRelative || realRelative.startsWith("..") || path.isAbsolute(realRelative)) {
    throw new Error("附件符号链接越过 content/uploads，已拒绝发送");
  }
  return materializeLocalChannelAttachment({
    absPath: realFile,
    source: "agent",
    hintedKind: opts.kind,
    caption: opts.caption,
  });
}

export async function materializeRemoteChannelAttachment(opts: {
  source: Exclude<ChannelAttachmentSource, "agent" | "local">;
  remoteUrl: string;
  remoteId?: string;
  fileName?: string;
  declaredMime?: string;
  hintedKind?: ChannelAttachmentKind;
  caption?: string;
  fetchImpl?: typeof fetch;
  maxBytes?: number;
}): Promise<ChannelAttachment> {
  const id = randomUUID();
  const declaredMime = (opts.declaredMime || "application/octet-stream").split(";", 1)[0]!.trim().toLowerCase();
  const hintedKind = opts.hintedKind ?? kindFromMime(declaredMime);
  const fallbackName = `attachment${extensionForMime(declaredMime)}`;
  const inputName = sanitizeFileName(opts.fileName || fallbackName, fallbackName);
  try {
    const response = await (opts.fetchImpl ?? fetch)(opts.remoteUrl, {
      headers: { "User-Agent": "OasisMind-Channel/1.0" },
      signal: AbortSignal.timeout(CHANNEL_ATTACHMENT_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`下载 HTTP ${response.status}`);
    const bytes = await readResponseWithLimit(response, opts.maxBytes ?? CHANNEL_ATTACHMENT_MAX_BYTES);
    if (bytes.length === 0) throw new Error("附件内容为空");

    const responseMime = (response.headers.get("content-type") || "").split(";", 1)[0]!.trim().toLowerCase();
    const sniffedMime = sniffChannelMime(bytes);
    // 平台声明与 HTTP 响应互相矛盾时立即拒绝。例如 QQ 附件声称是图片，
    // CDN 却返回 text/html 登录页；若只信平台字段，会把错误页当图片永久保存。
    if (
      responseMime &&
      responseMime !== "application/octet-stream" &&
      declaredMime !== "application/octet-stream" &&
      mimeFamily(responseMime) !== mimeFamily(declaredMime)
    ) {
      throw new Error(`MIME 不匹配：平台声明 ${declaredMime}，HTTP 响应 ${responseMime}`);
    }
    const claimedMime = declaredMime !== "application/octet-stream" ? declaredMime : responseMime;
    if (
      sniffedMime !== "application/octet-stream" &&
      claimedMime &&
      claimedMime !== "application/octet-stream" &&
      mimeFamily(sniffedMime) !== mimeFamily(claimedMime)
    ) {
      throw new Error(`MIME 不匹配：声明 ${claimedMime}，实际 ${sniffedMime}`);
    }
    if (
      ["image", "video", "audio"].includes(hintedKind) &&
      sniffedMime === "application/octet-stream" &&
      mimeFamily(claimedMime) !== hintedKind
    ) {
      throw new Error(`无法验证 ${hintedKind} 附件，响应 MIME 为 ${claimedMime || "未知"}`);
    }

    return materializeChannelAttachmentBytes({
      source: opts.source,
      bytes,
      fileName: inputName,
      declaredMime: sniffedMime !== "application/octet-stream" ? sniffedMime : claimedMime,
      hintedKind,
      remoteUrl: opts.remoteUrl,
      remoteId: opts.remoteId,
      caption: opts.caption,
    });
  } catch (error) {
    return createFailedChannelAttachment({
      id,
      source: opts.source,
      kind: hintedKind,
      fileName: inputName,
      mimeType: declaredMime,
      remoteUrl: opts.remoteUrl,
      remoteId: opts.remoteId,
      caption: opts.caption,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/** 给用户和 Agent 的可读摘要；结构化附件本身仍随消息落库。 */
export function formatInboundChannelAttachment(attachment: ChannelAttachment): string {
  if (attachment.status === "failed") {
    return `${attachment.fileName}（${attachment.kind} 下载失败：${attachment.error}）`;
  }
  const location = attachment.localPath || attachment.storageKey || attachment.remoteUrl || "无位置";
  return `${attachment.kind}: ${attachment.fileName} · ${attachment.mimeType} · ${attachment.size ?? 0}B · ${location}`;
}
