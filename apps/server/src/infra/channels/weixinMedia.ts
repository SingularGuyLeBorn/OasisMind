/**
 * 微信 iLink 富媒体。
 *
 * AES-128-ECB 加解密、CDN 上下载、统一附件落盘、出站上传。
 */

import fs from "node:fs";
import path from "node:path";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { ChannelAttachment } from "@oasismind/shared";
import { resolveProjectMediaPath } from "./imReplyText.js";
import {
  CHANNEL_ATTACHMENT_MAX_BYTES,
  createFailedChannelAttachment,
  fetchChannelAttachmentBytes,
  formatInboundChannelAttachment,
  materializeChannelAttachmentBytes,
} from "./channelAttachment.js";
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

export async function downloadWeixinCdnObject(opts: {
  encryptQueryParam: string;
  aesKeyRaw?: string;
  aeskeyHex?: string;
  fetchImpl?: typeof fetch;
}): Promise<Buffer> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const url = `${WEIXIN_CDN_DEFAULT_BASE}/download?encrypted_query_param=${encodeURIComponent(opts.encryptQueryParam)}`;
  const cipher = await fetchChannelAttachmentBytes(url, fetchImpl);
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
  attachments: ChannelAttachment[];
};

export async function materializeWeixinInboundMedia(
  items: WeixinParsedMedia[],
  fetchImpl?: typeof fetch,
): Promise<WeixinInboundMediaResult> {
  const impl = fetchImpl ?? fetch;
  const results = await Promise.all(
    items.map(async (item) => {
      const mediaLines: string[] = [];
      const attachments: ChannelAttachment[] = [];
      const kind = item.kind === "voice" ? "audio" : item.kind;
      const defaultName =
        item.kind === "image"
          ? "image.jpg"
          : item.kind === "video"
            ? "video.mp4"
            : item.kind === "voice"
              ? "voice.silk"
              : "file.bin";
      const declaredMime =
        item.kind === "image"
          ? "application/octet-stream"
          : item.kind === "video"
            ? "video/mp4"
            : item.kind === "voice"
              ? "audio/silk"
              : "application/octet-stream";
      try {
        let bytes: Buffer | null = null;
        if (item.url && /^https?:\/\//i.test(item.url)) {
          bytes = await fetchChannelAttachmentBytes(item.url, impl);
        } else if (item.encryptQueryParam) {
          bytes = await downloadWeixinCdnObject({
            encryptQueryParam: item.encryptQueryParam,
            aesKeyRaw: item.aesKeyRaw,
            aeskeyHex: item.aeskeyHex,
            fetchImpl: impl,
          });
        }
        if (!bytes) {
          throw new Error(`${item.kind} 无下载地址`);
        }
        const attachment = materializeChannelAttachmentBytes({
          source: "weixin",
          bytes,
          fileName: item.fileName || defaultName,
          declaredMime,
          hintedKind: kind,
          remoteUrl: item.url,
          remoteId: item.encryptQueryParam,
        });
        attachments.push(
          item.asrText
            ? { ...attachment, extractedText: item.asrText, caption: `语音识别：${item.asrText}` }
            : attachment,
        );
      } catch (err) {
        attachments.push(
          createFailedChannelAttachment({
            source: "weixin",
            kind,
            fileName: item.fileName || defaultName,
            mimeType: declaredMime,
            remoteUrl: item.url,
            remoteId: item.encryptQueryParam,
            error: err instanceof Error ? err.message : String(err),
          }),
        );
      }
      mediaLines.push(...attachments.map(formatInboundChannelAttachment));
      return { mediaLines, attachments };
    }),
  );

  return {
    mediaLines: results.flatMap((r) => r.mediaLines),
    attachments: results.flatMap((r) => r.attachments),
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
      const bytes = await fetchChannelAttachmentBytes(raw, fetchImpl);
      const name = path.basename(new URL(raw).pathname) || "media.bin";
      return { bytes, fileName: name.split("?")[0] || "media.bin" };
    }
    const abs = resolveProjectMediaPath(raw);
    if (!abs || !fs.existsSync(abs)) return null;
    const bytes = fs.readFileSync(abs);
    if (bytes.length <= 0 || bytes.length > CHANNEL_ATTACHMENT_MAX_BYTES) return null;
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
