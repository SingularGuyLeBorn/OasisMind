/**
 * 微信 iLink 富媒体。
 *
 * AES-128-ECB 加解密、CDN 上下载、入站落盘、出站上传。
 * 图片内嵌 data URL 上限见 WEIXIN_VISION_INLINE_MAX_BYTES。
 */

import fs from "node:fs";
import path from "node:path";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { ChatAttachment } from "@oasismind/shared";
import { getAppConfig } from "../config.js";
import { resolveProjectMediaPath } from "./imReplyText.js";
import {
  WEIXIN_CDN_DEFAULT_BASE,
  WEIXIN_ITEM_TYPE,
  WEIXIN_UPLOAD_MEDIA,
  type WeixinIlinkSession,
  type WeixinMediaKind,
  type WeixinParsedMedia,
  getWeixinUploadUrl,
  sendWeixinItems,
} from "./weixinIlink.js";

const MAX_BYTES = 25 * 1024 * 1024;
/** 超过此大小的入站图只落盘+写路径，不再内嵌 data URL（避免撑爆 LLM 上下文）。 */
export const WEIXIN_VISION_INLINE_MAX_BYTES = Math.floor(1.5 * 1024 * 1024);

export function decodeWeixinAesKey(raw: string): Buffer {
  const s = raw.trim();
  if (!s) throw new Error("empty aes key");
  if (/^[0-9a-fA-F]{32}$/.test(s)) return Buffer.from(s, "hex");
  const decoded = Buffer.from(s, "base64");
  if (decoded.length === 16) return decoded;
  const asText = decoded.toString("utf8");
  if (decoded.length === 32 && /^[0-9a-fA-F]{32}$/.test(asText)) {
    return Buffer.from(asText, "hex");
  }
  throw new Error(`unsupported aes key encoding (decoded ${decoded.length} bytes)`);
}

export function encryptWeixinAesEcb(plain: Buffer, key: Buffer): Buffer {
  const cipher = createCipheriv("aes-128-ecb", key, null);
  return Buffer.concat([cipher.update(plain), cipher.final()]);
}

export function decryptWeixinAesEcb(cipherText: Buffer, key: Buffer): Buffer {
  const decipher = createDecipheriv("aes-128-ecb", key, null);
  return Buffer.concat([decipher.update(cipherText), decipher.final()]);
}

function extForKind(kind: WeixinMediaKind, fileName?: string): string {
  const fromName = fileName ? path.extname(fileName) : "";
  if (fromName) return fromName;
  if (kind === "image") return ".jpg";
  if (kind === "video") return ".mp4";
  if (kind === "voice") return ".silk";
  return ".bin";
}

function sniffMime(buf: Buffer, kind: WeixinMediaKind): string {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e) return "image/png";
  if (buf.length >= 6 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "image/gif";
  if (buf.length >= 12 && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) {
    return "image/webp";
  }
  if (kind === "image") return "image/jpeg";
  if (kind === "video") return "video/mp4";
  if (kind === "voice") return "audio/silk";
  return "application/octet-stream";
}

export function weixinChatImageAttachment(opts: {
  fileName: string;
  relPath: string;
  bytes: Buffer;
}): ChatAttachment | null {
  if (opts.bytes.length > WEIXIN_VISION_INLINE_MAX_BYTES) return null;
  const mime = sniffMime(opts.bytes, "image");
  return {
    type: "image",
    name: opts.fileName,
    mimeType: mime,
    previewUrl: `data:${mime};base64,${opts.bytes.toString("base64")}`,
    extractedText: `图片已保存到 ${opts.relPath}`,
    source: "user",
  };
}

async function fetchBytes(url: string, fetchImpl: typeof fetch): Promise<Buffer> {
  const res = await fetchImpl(url);
  if (!res.ok) throw new Error(`download HTTP ${res.status}: ${url.slice(0, 120)}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length <= 0 || buf.length > MAX_BYTES) throw new Error(`skip media size ${buf.length}`);
  return buf;
}

export async function downloadWeixinCdnObject(opts: {
  encryptQueryParam: string;
  aesKeyRaw?: string;
  aeskeyHex?: string;
  fetchImpl?: typeof fetch;
}): Promise<Buffer> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const url = `${WEIXIN_CDN_DEFAULT_BASE}/download?encrypted_query_param=${encodeURIComponent(opts.encryptQueryParam)}`;
  const cipher = await fetchBytes(url, fetchImpl);
  const keySrc = opts.aeskeyHex || opts.aesKeyRaw;
  if (!keySrc) return cipher;
  try {
    return decryptWeixinAesEcb(cipher, decodeWeixinAesKey(keySrc));
  } catch (err) {
    console.warn("[weixin-media] decrypt failed, keep ciphertext:", err instanceof Error ? err.message : err);
    return cipher;
  }
}

export type WeixinInboundMediaResult = {
  mediaLines: string[];
  chatAttachments: ChatAttachment[];
};

export async function materializeWeixinInboundMedia(
  items: WeixinParsedMedia[],
  fetchImpl?: typeof fetch,
): Promise<WeixinInboundMediaResult> {
  const impl = fetchImpl ?? fetch;
  const destDir = path.join(getAppConfig().contentPaths.uploads, "weixin");
  fs.mkdirSync(destDir, { recursive: true });

  const results = await Promise.all(
    items.map(async (item) => {
      const mediaLines: string[] = [];
      const chatAttachments: ChatAttachment[] = [];
      try {
        let bytes: Buffer | null = null;
        if (item.url && /^https?:\/\//i.test(item.url)) {
          bytes = await fetchBytes(item.url, impl);
        } else if (item.encryptQueryParam) {
          bytes = await downloadWeixinCdnObject({
            encryptQueryParam: item.encryptQueryParam,
            aesKeyRaw: item.aesKeyRaw,
            aeskeyHex: item.aeskeyHex,
            fetchImpl: impl,
          });
        }
        if (!bytes) {
          mediaLines.push(`（${item.kind} 无下载地址）`);
          return { mediaLines, chatAttachments };
        }
        const fileName = `${Date.now().toString(36)}-${randomBytes(4).toString("hex")}${extForKind(item.kind, item.fileName)}`;
        fs.writeFileSync(path.join(destDir, fileName), bytes);
        const rel = `content/uploads/weixin/${fileName}`;
        if (item.kind === "image") {
          const att = weixinChatImageAttachment({ fileName, relPath: rel, bytes });
          if (att) chatAttachments.push(att);
          mediaLines.push(`图片: ${rel}${att ? "" : "（过大未内嵌视觉，请用路径读取）"}`);
        } else if (item.kind === "voice") {
          mediaLines.push(`语音: ${rel}${item.asrText ? ` 识别：${item.asrText}` : ""}`);
        } else if (item.kind === "video") {
          mediaLines.push(`视频: ${rel}`);
        } else {
          mediaLines.push(`文件: ${rel}${item.fileName ? `（${item.fileName}）` : ""}`);
        }
      } catch (err) {
        mediaLines.push(`（${item.kind} 下载失败：${err instanceof Error ? err.message : String(err)}）`);
      }
      return { mediaLines, chatAttachments };
    }),
  );

  return {
    mediaLines: results.flatMap((r) => r.mediaLines),
    chatAttachments: results.flatMap((r) => r.chatAttachments),
  };
}

function kindFromMediaUrl(url: string): WeixinMediaKind | null {
  const clean = url.trim().split("?")[0]?.split("#")[0] ?? "";
  const ext = path.extname(clean).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"].includes(ext)) return "image";
  if ([".mp4", ".mov", ".webm", ".mkv", ".m4v"].includes(ext)) return "video";
  if ([".silk", ".slk", ".amr", ".wav", ".mp3", ".m4a", ".aac", ".ogg"].includes(ext)) return "voice";
  if ([".pdf", ".zip", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt"].includes(ext)) return "file";
  return null;
}

/** 从回复 Markdown 抽出语音/视频/文件（图片由 planImReply.imageUrls 处理）。 */
export function extraOutboundMedia(text: string): Array<{ kind: Exclude<WeixinMediaKind, "image">; url: string }> {
  const seen = new Set<string>();
  const out: Array<{ kind: Exclude<WeixinMediaKind, "image">; url: string }> = [];
  const consider = (raw: string) => {
    const url = raw.trim().replace(/^<|>$/g, "");
    if (!url || seen.has(url)) return;
    const kind = kindFromMediaUrl(url);
    if (!kind || kind === "image") return;
    seen.add(url);
    out.push({ kind, url });
  };
  const mdRe = /\[(?:[^\]]*)\]\(([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = mdRe.exec(text)) !== null) {
    if (m.index > 0 && text[m.index - 1] === "!") continue;
    consider(m[1] ?? "");
  }
  const bareRe =
    /(?:^|[\s"'`])(\/?(?:content|uploads|data|workspaces)\/[^\s"'<>]+\.(?:mp4|mov|webm|mkv|m4v|silk|slk|amr|wav|mp3|m4a|aac|ogg|pdf|zip|docx?|xlsx?|pptx?|txt))/gi;
  while ((m = bareRe.exec(text)) !== null) consider(m[1] ?? "");
  return out;
}

export function composeWeixinUserText(opts: { text: string; mediaLines: string[] }): string {
  const parts: string[] = [];
  if (opts.mediaLines.length) {
    parts.push(`【附件】\n${opts.mediaLines.map((l) => `- ${l}`).join("\n")}`);
  }
  const body = opts.text.trim();
  if (body) parts.push(body);
  else if (opts.mediaLines.length) parts.push("（请结合上方附件处理）");
  return parts.join("\n\n").trim();
}

function aesKeyAsOfficialBase64(hexKey: string): string {
  return Buffer.from(hexKey, "utf8").toString("base64");
}

export async function loadWeixinMediaBytes(
  src: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ bytes: Buffer; fileName: string } | null> {
  const raw = src.trim();
  if (!raw) return null;
  try {
    if (/^https?:\/\//i.test(raw)) {
      const bytes = await fetchBytes(raw, fetchImpl);
      const name = path.basename(new URL(raw).pathname) || "media.bin";
      return { bytes, fileName: name.split("?")[0] || "media.bin" };
    }
    const abs = resolveProjectMediaPath(raw);
    if (!abs || !fs.existsSync(abs)) return null;
    const bytes = fs.readFileSync(abs);
    if (bytes.length <= 0 || bytes.length > MAX_BYTES) return null;
    return { bytes, fileName: path.basename(abs) };
  } catch (err) {
    console.warn("[weixin-media] load bytes failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

export async function sendWeixinLocalMedia(opts: {
  session: WeixinIlinkSession;
  toUserId: string;
  contextToken: string;
  kind: WeixinMediaKind;
  bytes: Buffer;
  fileName?: string;
  fetchImpl?: typeof fetch;
}): Promise<void> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const filekey = randomBytes(16).toString("hex");
  const aeskeyHex = randomBytes(16).toString("hex");
  const cipher = encryptWeixinAesEcb(opts.bytes, Buffer.from(aeskeyHex, "hex"));
  const rawMd5 = createHash("md5").update(opts.bytes).digest("hex");
  const uploadMediaType =
    opts.kind === "image"
      ? WEIXIN_UPLOAD_MEDIA.image
      : opts.kind === "video"
        ? WEIXIN_UPLOAD_MEDIA.video
        : opts.kind === "voice"
          ? WEIXIN_UPLOAD_MEDIA.voice
          : WEIXIN_UPLOAD_MEDIA.file;
  const { uploadParam } = await getWeixinUploadUrl({
    session: opts.session,
    toUserId: opts.toUserId,
    mediaType: uploadMediaType,
    filekey,
    rawsize: opts.bytes.length,
    rawfilemd5: rawMd5,
    filesize: cipher.length,
    aeskeyHex,
    fetchImpl,
  });
  const uploadUrl =
    `${WEIXIN_CDN_DEFAULT_BASE}/upload?encrypted_query_param=${encodeURIComponent(uploadParam)}` +
    `&filekey=${encodeURIComponent(filekey)}`;
  const up = await fetchImpl(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream" },
    body: new Uint8Array(cipher),
  });
  if (!up.ok) {
    const t = await up.text().catch(() => "");
    throw new Error(`weixin CDN upload HTTP ${up.status}: ${t.slice(0, 180)}`);
  }
  const encryptedParam = (up.headers.get("x-encrypted-param") || up.headers.get("X-Encrypted-Param") || "").trim();
  if (!encryptedParam) throw new Error("weixin CDN upload 未返回 x-encrypted-param");
  const media = {
    encrypt_query_param: encryptedParam,
    aes_key: aesKeyAsOfficialBase64(aeskeyHex),
    encrypt_type: 1,
  };
  const item =
    opts.kind === "image"
      ? { type: WEIXIN_ITEM_TYPE.image, image_item: { media, mid_size: cipher.length } }
      : opts.kind === "video"
        ? { type: WEIXIN_ITEM_TYPE.video, video_item: { media, video_size: cipher.length } }
        : opts.kind === "voice"
          ? { type: WEIXIN_ITEM_TYPE.voice, voice_item: { media } }
          : {
              type: WEIXIN_ITEM_TYPE.file,
              file_item: {
                media,
                file_name: opts.fileName || "file.bin",
                md5: rawMd5,
                len: String(opts.bytes.length),
              },
            };
  await sendWeixinItems({
    session: opts.session,
    toUserId: opts.toUserId,
    contextToken: opts.contextToken,
    items: [item],
    fetchImpl,
  });
}
