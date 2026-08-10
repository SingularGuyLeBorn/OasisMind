/**
 * QQ 开放平台官方 Bot 富媒体出站（上传 file_data → msg_type=7）。
 * file_type: 1 图片 · 2 视频 · 3 语音 · 4 文件
 */

import fs from "node:fs";
import path from "node:path";
import { resolveProjectMediaPath } from "./imReplyText.js";

const TOKEN_URL = "https://bots.qq.com/app/getAppAccessToken";
export const QQ_OFFICIAL_API_BASE = "https://api.sgroup.qq.com";

export const QQ_OFFICIAL_FILE_TYPE = {
  image: 1,
  video: 2,
  voice: 3,
  file: 4,
} as const;

export type QqOfficialMediaKind = keyof typeof QQ_OFFICIAL_FILE_TYPE;

type TokenState = { accessToken: string; expiresAt: number };
let tokenCache: TokenState | null = null;

/** 最近一次入站，供工具主动发时尽量走被动回复窗口 */
const lastInboundByPeer = new Map<string, { msgId: string; at: number }>();
const PASSIVE_TTL_MS = 4 * 60 * 1000;

export function rememberQqOfficialInbound(opts: {
  openid: string;
  groupOpenid?: string;
  msgId: string;
}): void {
  const key = opts.groupOpenid
    ? `g:${opts.groupOpenid}:${opts.openid}`
    : `u:${opts.openid}`;
  lastInboundByPeer.set(key, { msgId: opts.msgId, at: Date.now() });
  // 群维度也记一份，便于群内工具省略个人维度
  if (opts.groupOpenid) {
    lastInboundByPeer.set(`g:${opts.groupOpenid}`, { msgId: opts.msgId, at: Date.now() });
  }
}

export function peekQqOfficialPassiveMsgId(opts: {
  openid: string;
  groupOpenid?: string;
}): string | undefined {
  const keys = opts.groupOpenid
    ? [`g:${opts.groupOpenid}:${opts.openid}`, `g:${opts.groupOpenid}`]
    : [`u:${opts.openid}`];
  for (const key of keys) {
    const hit = lastInboundByPeer.get(key);
    if (hit && Date.now() - hit.at < PASSIVE_TTL_MS) return hit.msgId;
  }
  return undefined;
}

export async function ensureQqOfficialAccessToken(opts?: {
  appId?: string;
  secret?: string;
}): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.accessToken;
  }
  const appId = (opts?.appId || process.env.QQ_BOT_APP_ID || "").trim();
  const secret = (opts?.secret || process.env.QQ_BOT_SECRET || "").trim();
  if (!appId || !secret) throw new Error("QQ_BOT_APP_ID / QQ_BOT_SECRET 未配置");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appId, clientSecret: secret }),
  });
  if (!res.ok) throw new Error(`QQ token HTTP ${res.status}`);
  const json = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    message?: string;
  };
  if (!json.access_token) throw new Error(json.message || "QQ token 无 access_token");
  tokenCache = {
    accessToken: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 7200) * 1000,
  };
  return tokenCache.accessToken;
}

export function __resetQqOfficialMediaForTests(): void {
  tokenCache = null;
  lastInboundByPeer.clear();
}

export async function loadQqOfficialMediaBytes(
  file: string,
): Promise<{ buf: Buffer; fileName: string }> {
  const raw = file.trim();
  if (!raw) throw new Error("file 为空");

  if (/^https?:\/\//i.test(raw)) {
    const res = await fetch(raw);
    if (!res.ok) throw new Error(`下载媒体失败 HTTP ${res.status}`);
    const ab = await res.arrayBuffer();
    const buf = Buffer.from(ab);
    const urlName = path.basename(new URL(raw).pathname) || "media.bin";
    return { buf, fileName: urlName.split("?")[0] || "media.bin" };
  }

  const abs = resolveProjectMediaPath(raw);
  if (!abs || !fs.existsSync(abs)) {
    throw new Error(`本地文件不存在: ${raw}`);
  }
  return { buf: fs.readFileSync(abs), fileName: path.basename(abs) };
}

export type QqOfficialMessageReference = {
  /** 被引用消息 ID（通常=用户入站 msg_id） */
  messageId: string;
  /** 取引用详情失败时仍发送（默认 true，避免引用失效卡死回发） */
  ignoreGetMessageError?: boolean;
};

export type QqOfficialSendMediaOpts = {
  openid: string;
  groupOpenid?: string;
  kind: QqOfficialMediaKind;
  file: string;
  fileName?: string;
  /** 被动回复窗口；省略则尝试 peek 最近入站 */
  msgId?: string;
  msgSeq?: number;
  /** 可见引用气泡（与 msg_id 被动窗口正交） */
  messageReference?: QqOfficialMessageReference;
  accessToken?: string;
};

export type QqOfficialSendTextOpts = {
  openid: string;
  groupOpenid?: string;
  text: string;
  msgId?: string;
  msgSeq?: number;
  /** 可见引用气泡（与 msg_id 被动窗口正交） */
  messageReference?: QqOfficialMessageReference;
  accessToken?: string;
};

function applyMessageReference(
  body: Record<string, unknown>,
  ref: QqOfficialMessageReference | undefined,
): void {
  const messageId = ref?.messageId?.trim();
  if (!messageId) return;
  body.message_reference = {
    message_id: messageId,
    ignore_get_message_error: ref?.ignoreGetMessageError !== false,
  };
}

function peerPath(openid: string, groupOpenid?: string): string {
  return groupOpenid
    ? `/v2/groups/${encodeURIComponent(groupOpenid)}`
    : `/v2/users/${encodeURIComponent(openid)}`;
}

async function postQqOfficialJson(
  accessToken: string,
  apiPath: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const res = await fetch(`${QQ_OFFICIAL_API_BASE}${apiPath}`, {
    method: "POST",
    headers: {
      Authorization: `QQBot ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`QQ ${apiPath} HTTP ${res.status}: ${t.slice(0, 240)}`);
  }
  return (await res.json().catch(() => ({}))) as Record<string, unknown>;
}

export async function sendQqOfficialText(
  opts: QqOfficialSendTextOpts,
): Promise<{ msgSeq: number; usedMsgId?: string }> {
  const accessToken = opts.accessToken || (await ensureQqOfficialAccessToken());
  const msgId =
    opts.msgId ||
    peekQqOfficialPassiveMsgId({ openid: opts.openid, groupOpenid: opts.groupOpenid });
  const msgSeq = opts.msgSeq ?? 1;
  const body: Record<string, unknown> = {
    content: opts.text.slice(0, 4000) || "（空）",
    msg_type: 0,
    msg_seq: msgSeq,
  };
  if (msgId) body.msg_id = msgId;
  applyMessageReference(body, opts.messageReference);
  await postQqOfficialJson(accessToken, `${peerPath(opts.openid, opts.groupOpenid)}/messages`, body);
  return { msgSeq, usedMsgId: msgId };
}

export async function sendQqOfficialMedia(
  opts: QqOfficialSendMediaOpts,
): Promise<{ fileInfo: string; msgSeq: number; usedMsgId?: string; fileName: string }> {
  const accessToken = opts.accessToken || (await ensureQqOfficialAccessToken());
  const { buf, fileName: resolvedName } = await loadQqOfficialMediaBytes(opts.file);
  const fileName = opts.fileName || resolvedName;
  const fileType = QQ_OFFICIAL_FILE_TYPE[opts.kind];
  const base = peerPath(opts.openid, opts.groupOpenid);

  const uploaded = await postQqOfficialJson(accessToken, `${base}/files`, {
    file_type: fileType,
    file_data: buf.toString("base64"),
    file_name: fileName,
    srv_send_msg: false,
  });
  const fileInfo = String(uploaded.file_info ?? "");
  if (!fileInfo) throw new Error("QQ 上传未返回 file_info");

  const msgId =
    opts.msgId ||
    peekQqOfficialPassiveMsgId({ openid: opts.openid, groupOpenid: opts.groupOpenid });
  const msgSeq = opts.msgSeq ?? 1;
  const body: Record<string, unknown> = {
    msg_type: 7,
    msg_seq: msgSeq,
    media: { file_info: fileInfo },
  };
  if (msgId) body.msg_id = msgId;
  applyMessageReference(body, opts.messageReference);
  // 图片可附带空 content；其它类型 content 常被忽略
  if (opts.kind === "image") body.content = "";

  await postQqOfficialJson(accessToken, `${base}/messages`, body);
  return { fileInfo, msgSeq, usedMsgId: msgId, fileName };
}
