/**
 * 微信 iLink HTTP 客户端（扫码 / 长轮询 / 发消息 / 取上传地址）。
 * 不经过 OpenClaw CLI。默认基址 https://ilinkai.weixin.qq.com
 *
 * 回发必须带 from_user_id=""、client_id、context_token、base_info，
 * 否则接口常 200 但微信端静默丢消息。
 *
 * getupdates 是长轮询（timeout ~40s）；上层只需在返回后再隔几百毫秒重入。
 */

import { randomInt, randomUUID } from "node:crypto";

export const WEIXIN_ILINK_DEFAULT_BASE = "https://ilinkai.weixin.qq.com";
export const WEIXIN_CDN_DEFAULT_BASE = "https://novac2c.cdn.weixin.qq.com/c2c";
export const WEIXIN_CHANNEL_VERSION = "1.0.3";

/** getuploadurl.media_type */
export const WEIXIN_UPLOAD_MEDIA = {
  image: 1,
  video: 2,
  file: 3,
  voice: 4,
} as const;

/** MessageItem.type */
export const WEIXIN_ITEM_TYPE = {
  text: 1,
  image: 2,
  voice: 3,
  file: 4,
  video: 5,
} as const;

export type WeixinIlinkSession = {
  botToken: string;
  baseUrl: string;
  getUpdatesBuf: string;
  boundUserId: string;
  accountId: string;
  lastContextToken?: string;
};

export type WeixinQrStart = {
  qrcode: string;
  qrcodeImgContent: string;
};

export type WeixinQrStatus =
  | { phase: "wait" }
  | { phase: "expired" }
  | {
      phase: "confirmed";
      session: Omit<WeixinIlinkSession, "getUpdatesBuf" | "boundUserId" | "lastContextToken">;
    };

export type WeixinCdnRef = {
  encrypt_query_param?: string;
  encryptQueryParam?: string;
  aes_key?: string;
  aesKey?: string;
  encrypt_type?: number;
  encryptType?: number;
};

export type WeixinInboundItem = {
  type?: number;
  text_item?: { text?: string };
  textItem?: { text?: string };
  text?: string;
  image_item?: {
    media?: WeixinCdnRef;
    url?: string;
    aeskey?: string;
    mid_size?: number;
  };
  imageItem?: WeixinInboundItem["image_item"];
  voice_item?: {
    media?: WeixinCdnRef;
    encode_type?: number;
    text?: string;
    playtime?: number;
  };
  voiceItem?: WeixinInboundItem["voice_item"];
  file_item?: {
    media?: WeixinCdnRef;
    file_name?: string;
    md5?: string;
    len?: string;
  };
  fileItem?: WeixinInboundItem["file_item"];
  video_item?: {
    media?: WeixinCdnRef;
    video_size?: number;
    play_length?: number;
    thumb_media?: WeixinCdnRef;
  };
  videoItem?: WeixinInboundItem["video_item"];
};

export type WeixinInboundMessage = {
  from_user_id?: string;
  fromUserId?: string;
  to_user_id?: string;
  message_id?: string;
  messageId?: string;
  message_type?: number;
  messageType?: number;
  context_token?: string;
  contextToken?: string;
  group_id?: string;
  groupId?: string;
  item_list?: WeixinInboundItem[];
  itemList?: WeixinInboundItem[];
  msg?: WeixinInboundMessage;
};

export type WeixinUpdatesResult = {
  messages: WeixinInboundMessage[];
  getUpdatesBuf: string;
};

export type WeixinMediaKind = "image" | "voice" | "video" | "file";

export type WeixinParsedMedia = {
  kind: WeixinMediaKind;
  url?: string;
  aeskeyHex?: string;
  encryptQueryParam?: string;
  aesKeyRaw?: string;
  fileName?: string;
  asrText?: string;
  durationMs?: number;
};

type FetchImpl = typeof fetch;

function firstText(...vals: unknown[]): string {
  for (const v of vals) {
    if (typeof v === "string") {
      const s = v.trim();
      if (s) return s;
    }
  }
  return "";
}

export function randomWechatUinHeader(): string {
  return Buffer.from(String(randomInt(0, 0xffff_ffff)), "utf8").toString("base64");
}

export function ilinkHeaders(botToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    AuthorizationType: "ilink_bot_token",
    "X-WECHAT-UIN": randomWechatUinHeader(),
  };
  if (botToken) headers.Authorization = `Bearer ${botToken}`;
  return headers;
}

export function inboundFromUserId(msg: WeixinInboundMessage): string {
  const inner = msg.msg;
  return firstText(msg.from_user_id, msg.fromUserId, inner?.from_user_id, inner?.fromUserId);
}

export function inboundMessageId(msg: WeixinInboundMessage): string {
  const inner = msg.msg;
  return firstText(msg.message_id, msg.messageId, inner?.message_id, inner?.messageId);
}

export function inboundContextToken(msg: WeixinInboundMessage): string {
  const inner = msg.msg;
  return firstText(msg.context_token, msg.contextToken, inner?.context_token, inner?.contextToken);
}

export function inboundGroupId(msg: WeixinInboundMessage): string {
  const inner = msg.msg;
  return firstText(msg.group_id, msg.groupId, inner?.group_id, inner?.groupId);
}

export function inboundMessageType(msg: WeixinInboundMessage): number {
  const inner = msg.msg;
  const n = msg.message_type ?? msg.messageType ?? inner?.message_type ?? inner?.messageType;
  return typeof n === "number" ? n : Number(n) || 0;
}

export function inboundItems(msg: WeixinInboundMessage): WeixinInboundItem[] {
  const inner = msg.msg;
  return msg.item_list ?? msg.itemList ?? inner?.item_list ?? inner?.itemList ?? [];
}

function cdnParam(ref?: WeixinCdnRef): { encryptQueryParam?: string; aesKeyRaw?: string } {
  if (!ref) return {};
  return {
    encryptQueryParam: String(ref.encrypt_query_param ?? ref.encryptQueryParam ?? "").trim() || undefined,
    aesKeyRaw: String(ref.aes_key ?? ref.aesKey ?? "").trim() || undefined,
  };
}

export function extractWeixinText(msg: WeixinInboundMessage): string {
  const parts: string[] = [];
  for (const it of inboundItems(msg)) {
    const t = it.text_item?.text ?? it.textItem?.text ?? (typeof it.text === "string" ? it.text : "");
    if (t?.trim()) parts.push(t.trim());
    const asr = it.voice_item?.text ?? it.voiceItem?.text;
    if (asr?.trim()) parts.push(asr.trim());
  }
  return parts.join("\n").trim();
}

export function parseWeixinMediaItems(msg: WeixinInboundMessage): WeixinParsedMedia[] {
  const out: WeixinParsedMedia[] = [];
  for (const it of inboundItems(msg)) {
    const type = typeof it.type === "number" ? it.type : Number(it.type) || 0;
    if (type === WEIXIN_ITEM_TYPE.image || it.image_item || it.imageItem) {
      const img = it.image_item ?? it.imageItem;
      out.push({
        kind: "image",
        url: img?.url?.trim() || undefined,
        aeskeyHex: img?.aeskey?.trim() || undefined,
        ...cdnParam(img?.media),
      });
    } else if (type === WEIXIN_ITEM_TYPE.voice || it.voice_item || it.voiceItem) {
      const v = it.voice_item ?? it.voiceItem;
      out.push({
        kind: "voice",
        asrText: v?.text?.trim() || undefined,
        durationMs: v?.playtime,
        ...cdnParam(v?.media),
      });
    } else if (type === WEIXIN_ITEM_TYPE.video || it.video_item || it.videoItem) {
      const v = it.video_item ?? it.videoItem;
      out.push({
        kind: "video",
        durationMs: v?.play_length,
        ...cdnParam(v?.media),
      });
    } else if (type === WEIXIN_ITEM_TYPE.file || it.file_item || it.fileItem) {
      const f = it.file_item ?? it.fileItem;
      out.push({
        kind: "file",
        fileName: f?.file_name?.trim() || undefined,
        ...cdnParam(f?.media),
      });
    }
  }
  return out;
}

/** message_type=1 用户消息（含图/语音/视频）；0 偶发未填类型 */
export function isWeixinUserMessage(msg: WeixinInboundMessage): boolean {
  const t = inboundMessageType(msg);
  return t === 0 || t === 1;
}

export function isWeixinUserAllowed(opts: {
  allowedUserIds: string[];
  boundUserId: string;
  fromUserId: string;
}): { ok: true; bindAs?: string } | { ok: false; reason: string } {
  const from = opts.fromUserId.trim();
  if (!from) return { ok: false, reason: "empty_user" };
  if (opts.allowedUserIds.includes("*")) return { ok: true };
  if (opts.allowedUserIds.length > 0) {
    return opts.allowedUserIds.includes(from)
      ? { ok: true }
      : { ok: false, reason: `user_not_allowed:${from}` };
  }
  if (opts.boundUserId) {
    return opts.boundUserId === from ? { ok: true } : { ok: false, reason: `not_bound_user:${from}` };
  }
  // 空名单且未扫码绑定：拒入站（与 QQ 一致；禁止先到先绑定）
  return { ok: false, reason: "allowlist_empty" };
}

export function splitWeixinText(text: string, maxChars = 1800): string[] {
  const t = text.trim();
  if (!t) return [];
  if (t.length <= maxChars) return [t];
  const chunks: string[] = [];
  let rest = t;
  while (rest.length > maxChars) {
    let cut = rest.lastIndexOf("\n", maxChars);
    if (cut < maxChars * 0.5) cut = rest.lastIndexOf("。", maxChars);
    if (cut < maxChars * 0.5) cut = maxChars;
    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) chunks.push(rest);
  return chunks.filter(Boolean);
}

async function ilinkJson<T>(opts: {
  baseUrl: string;
  method: "GET" | "POST";
  path: string;
  query?: Record<string, string>;
  body?: unknown;
  botToken?: string;
  timeoutMs: number;
  fetchImpl: FetchImpl;
}): Promise<T> {
  const base = opts.baseUrl.endsWith("/") ? opts.baseUrl : `${opts.baseUrl}/`;
  const url = new URL(opts.path.replace(/^\//, ""), base);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) url.searchParams.set(k, v);
  }
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), opts.timeoutMs);
  try {
    const res = await opts.fetchImpl(url.toString(), {
      method: opts.method,
      headers: ilinkHeaders(opts.botToken),
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      signal: ac.signal,
    });
    const raw = (await res.json()) as T & { ret?: number; errcode?: number; errmsg?: string; err_msg?: string };
    const ret = raw.ret ?? raw.errcode ?? (res.ok ? 0 : res.status);
    if (ret !== 0) {
      const msg = raw.errmsg || raw.err_msg || res.statusText || `ilink ret=${ret}`;
      throw new Error(`iLink ${opts.path}: ${msg}`);
    }
    return raw;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchWeixinQr(opts: {
  baseUrl?: string;
  fetchImpl?: FetchImpl;
}): Promise<WeixinQrStart> {
  const baseUrl = opts.baseUrl || WEIXIN_ILINK_DEFAULT_BASE;
  const fetchImpl = opts.fetchImpl ?? fetch;
  const raw = await ilinkJson<{
    qrcode?: string;
    qrcode_img_content?: string;
    qrcodeImgContent?: string;
  }>({
    baseUrl,
    method: "GET",
    path: "ilink/bot/get_bot_qrcode",
    query: { bot_type: "3" },
    timeoutMs: 15_000,
    fetchImpl,
  });
  const qrcode = String(raw.qrcode ?? "").trim();
  const qrcodeImgContent = String(raw.qrcode_img_content ?? raw.qrcodeImgContent ?? qrcode).trim();
  if (!qrcode) throw new Error("iLink 未返回 qrcode");
  return { qrcode, qrcodeImgContent };
}

export async function pollWeixinQrStatus(opts: {
  baseUrl?: string;
  qrcode: string;
  fetchImpl?: FetchImpl;
}): Promise<WeixinQrStatus> {
  const baseUrl = opts.baseUrl || WEIXIN_ILINK_DEFAULT_BASE;
  const fetchImpl = opts.fetchImpl ?? fetch;
  const raw = await ilinkJson<{
    status?: string;
    bot_token?: string;
    botToken?: string;
    baseurl?: string;
    baseUrl?: string;
    ilink_bot_id?: string;
    account_id?: string;
  }>({
    baseUrl,
    method: "GET",
    path: "ilink/bot/get_qrcode_status",
    query: { qrcode: opts.qrcode },
    timeoutMs: 15_000,
    fetchImpl,
  });
  const status = String(raw.status ?? "").toLowerCase();
  if (status === "expired" || status === "timeout") return { phase: "expired" };
  if (status === "confirmed" || status === "scanned_confirmed" || raw.bot_token || raw.botToken) {
    const botToken = String(raw.bot_token ?? raw.botToken ?? "").trim();
    if (!botToken) return { phase: "wait" };
    return {
      phase: "confirmed",
      session: {
        botToken,
        baseUrl: String(raw.baseurl ?? raw.baseUrl ?? baseUrl).trim() || baseUrl,
        accountId: String(raw.ilink_bot_id ?? raw.account_id ?? "").trim(),
      },
    };
  }
  return { phase: "wait" };
}

export async function pollWeixinUpdates(opts: {
  session: WeixinIlinkSession;
  fetchImpl?: FetchImpl;
}): Promise<WeixinUpdatesResult> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const raw = await ilinkJson<{
    msgs?: WeixinInboundMessage[];
    messages?: WeixinInboundMessage[];
    get_updates_buf?: string;
    getUpdatesBuf?: string;
  }>({
    baseUrl: opts.session.baseUrl,
    method: "POST",
    path: "ilink/bot/getupdates",
    botToken: opts.session.botToken,
    body: {
      get_updates_buf: opts.session.getUpdatesBuf,
      base_info: { channel_version: WEIXIN_CHANNEL_VERSION },
    },
    timeoutMs: 40_000,
    fetchImpl,
  });
  return {
    messages: raw.msgs ?? raw.messages ?? [],
    getUpdatesBuf: String(raw.get_updates_buf ?? raw.getUpdatesBuf ?? opts.session.getUpdatesBuf ?? ""),
  };
}

export async function sendWeixinItems(opts: {
  session: WeixinIlinkSession;
  toUserId: string;
  contextToken: string;
  items: unknown[];
  fetchImpl?: FetchImpl;
}): Promise<void> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  await ilinkJson({
    baseUrl: opts.session.baseUrl,
    method: "POST",
    path: "ilink/bot/sendmessage",
    botToken: opts.session.botToken,
    body: {
      msg: {
        from_user_id: "",
        to_user_id: opts.toUserId,
        client_id: randomUUID(),
        message_type: 2,
        message_state: 2,
        context_token: opts.contextToken,
        item_list: opts.items,
      },
      base_info: { channel_version: WEIXIN_CHANNEL_VERSION },
    },
    timeoutMs: 20_000,
    fetchImpl,
  });
}

export async function sendWeixinText(opts: {
  session: WeixinIlinkSession;
  toUserId: string;
  contextToken: string;
  text: string;
  fetchImpl?: FetchImpl;
}): Promise<void> {
  await sendWeixinItems({
    session: opts.session,
    toUserId: opts.toUserId,
    contextToken: opts.contextToken,
    items: [{ type: WEIXIN_ITEM_TYPE.text, text_item: { text: opts.text } }],
    fetchImpl: opts.fetchImpl,
  });
}

export async function getWeixinUploadUrl(opts: {
  session: WeixinIlinkSession;
  toUserId: string;
  mediaType: number;
  filekey: string;
  rawsize: number;
  rawfilemd5: string;
  filesize: number;
  aeskeyHex: string;
  fetchImpl?: FetchImpl;
}): Promise<{ uploadParam: string }> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const raw = await ilinkJson<{
    upload_param?: string;
    uploadParam?: string;
  }>({
    baseUrl: opts.session.baseUrl,
    method: "POST",
    path: "ilink/bot/getuploadurl",
    botToken: opts.session.botToken,
    body: {
      filekey: opts.filekey,
      media_type: opts.mediaType,
      to_user_id: opts.toUserId,
      rawsize: opts.rawsize,
      rawfilemd5: opts.rawfilemd5,
      filesize: opts.filesize,
      no_need_thumb: true,
      aeskey: opts.aeskeyHex,
      base_info: { channel_version: WEIXIN_CHANNEL_VERSION },
    },
    timeoutMs: 20_000,
    fetchImpl,
  });
  const uploadParam = String(raw.upload_param ?? raw.uploadParam ?? "").trim();
  if (!uploadParam) throw new Error("iLink getuploadurl 未返回 upload_param");
  return { uploadParam };
}
