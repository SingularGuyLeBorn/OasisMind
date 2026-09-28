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

/**
 * 入站 msg_id 缓存。
 *
 * 平台被动时效（带 msg_id 才算被动）：群 ≈5min、私聊 ≈60min——超时带 msg_id 必失败。
 * 这与「服务要不要重启」无关：进程一直开着，超时后改发**主动消息**（不带 msg_id）即可，
 * 长任务 1 小时也能回，无需重启。
 *
 * 本地缓存 24h 只为记住 peer↔msgId；真正出站前用 {@link isQqPassiveWindowFresh} 过滤。
 */
const lastInboundByPeer = new Map<string, { msgId: string; at: number }>();
/** 同一入站 msg_id 的被动 msg_seq 递增，避免 40054005 去重 */
const nextSeqByMsgId = new Map<string, number>();
/** 本地记住入站的最长时间（不是平台被动窗） */
export const QQ_PASSIVE_MSG_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
/** 平台被动窗：群 5min / 私聊 60min */
export const QQ_PLATFORM_PASSIVE_TTL_MS = {
  group: 5 * 60 * 1000,
  c2c: 60 * 60 * 1000,
} as const;

function peerInboundKeys(opts: { openid: string; groupOpenid?: string }): string[] {
  return opts.groupOpenid
    ? [`g:${opts.groupOpenid}:${opts.openid}`, `g:${opts.groupOpenid}`]
    : [`u:${opts.openid}`];
}

export function rememberQqOfficialInbound(opts: {
  openid: string;
  groupOpenid?: string;
  msgId: string;
}): void {
  const key = opts.groupOpenid
    ? `g:${opts.groupOpenid}:${opts.openid}`
    : `u:${opts.openid}`;
  const prev = lastInboundByPeer.get(key);
  if (prev && prev.msgId !== opts.msgId) nextSeqByMsgId.delete(prev.msgId);
  if (!nextSeqByMsgId.has(opts.msgId)) nextSeqByMsgId.set(opts.msgId, 1);
  lastInboundByPeer.set(key, { msgId: opts.msgId, at: Date.now() });
  // 群维度也记一份，便于群内工具省略个人维度
  if (opts.groupOpenid) {
    lastInboundByPeer.set(`g:${opts.groupOpenid}`, { msgId: opts.msgId, at: Date.now() });
  }
}

/** 本地缓存内的 msg_id（含已过平台被动窗的）；出站请用 fresh 版 */
export function peekQqOfficialPassiveMsgId(opts: {
  openid: string;
  groupOpenid?: string;
}): string | undefined {
  for (const key of peerInboundKeys(opts)) {
    const hit = lastInboundByPeer.get(key);
    if (hit && Date.now() - hit.at < QQ_PASSIVE_MSG_CACHE_TTL_MS) return hit.msgId;
  }
  return undefined;
}

/** 该 peer 最近入站是否仍在平台被动窗内（群 5min / 私聊 60min） */
export function isQqPassiveWindowFresh(opts: {
  openid: string;
  groupOpenid?: string;
  /** 若传入则还要求缓存里的 msgId 一致 */
  msgId?: string;
}): boolean {
  const ttl = opts.groupOpenid
    ? QQ_PLATFORM_PASSIVE_TTL_MS.group
    : QQ_PLATFORM_PASSIVE_TTL_MS.c2c;
  const want = opts.msgId?.trim();
  for (const key of peerInboundKeys(opts)) {
    const hit = lastInboundByPeer.get(key);
    if (!hit) continue;
    if (want && hit.msgId !== want) continue;
    if (Date.now() - hit.at < ttl) return true;
  }
  return false;
}

/** 仅当仍在平台被动窗内才返回 msg_id；过期返回 undefined → 调用方走主动消息 */
export function peekQqOfficialFreshPassiveMsgId(opts: {
  openid: string;
  groupOpenid?: string;
}): string | undefined {
  if (!isQqPassiveWindowFresh(opts)) return undefined;
  return peekQqOfficialPassiveMsgId(opts);
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
  nextSeqByMsgId.clear();
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
  /**
   * 取引用详情失败时是否仍发送。
   * - 默认不传（等同平台默认 false）：失败则整条不发，调用方应降级重试无引用
   * - true：失败仍发出 → 客户端常只剩 @、没有引用条（群聊已踩坑，勿默认开）
   */
  ignoreGetMessageError?: boolean;
};

export type QqOfficialSendMediaOpts = {
  openid: string;
  groupOpenid?: string;
  kind: QqOfficialMediaKind;
  file: string;
  fileName?: string;
  /** 被动回复窗口（带 msg_id 群聊常会自动 @ 对方） */
  msgId?: string;
  msgSeq?: number;
  /**
   * 未显式传 msgId 时，是否 peek 最近入站作被动窗口。
   * 默认 false：主动消息、群聊不艾特。quote / 需要被动额度时再开。
   */
  useLastInboundAsPassive?: boolean;
  /** 可见引用气泡（与 msg_id 被动窗口正交） */
  messageReference?: QqOfficialMessageReference;
  accessToken?: string;
  /** 同 sendQqOfficialText.allowPassiveFallback */
  allowPassiveFallback?: boolean;
};

/** 群未开通「主动消息」能力时平台返回 */
export function isQqActiveMessageDenied(err: unknown): boolean {
  const m = err instanceof Error ? err.message : String(err);
  return /40034105|主动消息失败|无权限/.test(m);
}

/** 同一 msg_id + msg_seq 重发被平台去重 */
export function isQqMsgSeqDeduped(err: unknown): boolean {
  const m = err instanceof Error ? err.message : String(err);
  return /40054005|消息被去重|msgseq/i.test(m);
}

/** 为被动窗口分配不重复的 msg_seq；无 msgId 的主动发送不占序号 */
export function allocateQqPassiveMsgSeq(msgId: string, preferred?: number): number {
  const next = nextSeqByMsgId.get(msgId) ?? 1;
  const want = preferred && preferred > 0 ? preferred : next;
  const seq = Math.max(next, want);
  nextSeqByMsgId.set(msgId, seq + 1);
  return seq;
}

function resolveOutboundMsgSeq(msgId: string | undefined, preferred?: number): number {
  if (!msgId) return preferred && preferred > 0 ? preferred : 1;
  return allocateQqPassiveMsgSeq(msgId, preferred);
}

export type QqOfficialSendTextOpts = {
  openid: string;
  groupOpenid?: string;
  text: string;
  msgId?: string;
  msgSeq?: number;
  useLastInboundAsPassive?: boolean;
  /** 可见引用气泡（与 msg_id 被动窗口正交） */
  messageReference?: QqOfficialMessageReference;
  accessToken?: string;
  /**
   * 主动消息被拒（40034105 无权限）时，是否自动改带新鲜 msg_id 再发。
   * 默认 true（群未开通主动能力时仍能回）。状态条应传 false，避免平台顺带艾特。
   */
  allowPassiveFallback?: boolean;
};

function resolveOutboundMsgId(opts: {
  openid: string;
  groupOpenid?: string;
  msgId?: string;
  useLastInboundAsPassive?: boolean;
}): string | undefined {
  // 显式 msgId 由调用方保证仍在被动窗内（bot 按 inboundAt、工具按 fresh peek）。
  // peek 路径只返回仍新鲜的 id；过期则 undefined → 主动消息，无需重启。
  const explicit = opts.msgId?.trim();
  if (explicit) return explicit;
  if (opts.useLastInboundAsPassive) {
    return peekQqOfficialFreshPassiveMsgId({
      openid: opts.openid,
      groupOpenid: opts.groupOpenid,
    });
  }
  return undefined;
}

function applyMessageReference(
  body: Record<string, unknown>,
  ref: QqOfficialMessageReference | undefined,
): void {
  const messageId = ref?.messageId?.trim();
  if (!messageId) return;
  const mr: Record<string, unknown> = { message_id: messageId };
  // 仅显式传入时才带该字段；群聊文档 MessageReference 只有 message_id
  if (ref?.ignoreGetMessageError === true) mr.ignore_get_message_error = true;
  if (ref?.ignoreGetMessageError === false) mr.ignore_get_message_error = false;
  body.message_reference = mr;
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

async function postTextOnce(
  accessToken: string,
  opts: QqOfficialSendTextOpts,
  msgId: string | undefined,
  msgSeq: number,
): Promise<{ msgSeq: number; usedMsgId?: string; refIdx?: string }> {
  const body: Record<string, unknown> = {
    content: opts.text.slice(0, 4000) || "（空）",
    msg_type: 0,
  };
  if (msgId) {
    body.msg_id = msgId;
    body.msg_seq = msgSeq;
  }
  applyMessageReference(body, opts.messageReference);
  const res = await postQqOfficialJson(
    accessToken,
    `${peerPath(opts.openid, opts.groupOpenid)}/messages`,
    body,
  );
  const ext = res.ext_info as { ref_idx?: string } | undefined;
  const refIdx = typeof ext?.ref_idx === "string" ? ext.ref_idx : undefined;
  if (opts.messageReference?.messageId && !refIdx) {
    console.warn(
      "[qq] 已带 message_reference 但响应无 ref_idx，客户端可能不显示引用条",
    );
  }
  return { msgSeq, usedMsgId: msgId, refIdx };
}

async function postTextWithDedupRetry(
  accessToken: string,
  opts: QqOfficialSendTextOpts,
  msgId: string | undefined,
  msgSeq: number,
): Promise<{ msgSeq: number; usedMsgId?: string; refIdx?: string }> {
  try {
    return await postTextOnce(accessToken, opts, msgId, msgSeq);
  } catch (err) {
    if (!msgId || !isQqMsgSeqDeduped(err)) throw err;
    const retrySeq = allocateQqPassiveMsgSeq(msgId);
    console.warn(
      "[qq] 被动窗口 msg_seq 去重(40054005)，改用 seq=",
      retrySeq,
    );
    return await postTextOnce(accessToken, opts, msgId, retrySeq);
  }
}

export async function sendQqOfficialText(
  opts: QqOfficialSendTextOpts,
): Promise<{ msgSeq: number; usedMsgId?: string; refIdx?: string }> {
  const accessToken = opts.accessToken || (await ensureQqOfficialAccessToken());
  const msgId = resolveOutboundMsgId(opts);
  const msgSeq = resolveOutboundMsgSeq(msgId, opts.msgSeq);
  try {
    return await postTextWithDedupRetry(accessToken, opts, msgId, msgSeq);
  } catch (err) {
    // 未带 msg_id 的主动发送被拒 → 用仍新鲜的入站 msg_id 再发（否则群里会「全哑」）
    if (
      msgId ||
      opts.allowPassiveFallback === false ||
      !isQqActiveMessageDenied(err)
    ) {
      throw err;
    }
    const fallbackId = peekQqOfficialFreshPassiveMsgId({
      openid: opts.openid,
      groupOpenid: opts.groupOpenid,
    });
    if (!fallbackId) throw err;
    const fallbackSeq = allocateQqPassiveMsgSeq(fallbackId);
    console.warn(
      "[qq] 主动消息无权限(40034105)，降级被动窗口 msg_id=",
      fallbackId.slice(0, 12),
      "… seq=",
      fallbackSeq,
    );
    return await postTextWithDedupRetry(accessToken, opts, fallbackId, fallbackSeq);
  }
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

  const msgId = resolveOutboundMsgId(opts);
  const msgSeq = resolveOutboundMsgSeq(msgId, opts.msgSeq);
  const buildBody = (id: string | undefined, seq: number) => {
    const body: Record<string, unknown> = {
      msg_type: 7,
      media: { file_info: fileInfo },
    };
    if (id) {
      body.msg_id = id;
      body.msg_seq = seq;
    }
    applyMessageReference(body, opts.messageReference);
    if (opts.kind === "image") body.content = "";
    return body;
  };

  const postMedia = async (id: string | undefined, seq: number) => {
    try {
      await postQqOfficialJson(accessToken, `${base}/messages`, buildBody(id, seq));
      return seq;
    } catch (err) {
      if (!id || !isQqMsgSeqDeduped(err)) throw err;
      const retrySeq = allocateQqPassiveMsgSeq(id);
      console.warn("[qq] 被动媒体 msg_seq 去重(40054005)，改用 seq=", retrySeq);
      await postQqOfficialJson(accessToken, `${base}/messages`, buildBody(id, retrySeq));
      return retrySeq;
    }
  };

  try {
    const usedSeq = await postMedia(msgId, msgSeq);
    return { fileInfo, msgSeq: usedSeq, usedMsgId: msgId, fileName };
  } catch (err) {
    if (
      msgId ||
      opts.allowPassiveFallback === false ||
      !isQqActiveMessageDenied(err)
    ) {
      throw err;
    }
    const fallbackId = peekQqOfficialFreshPassiveMsgId({
      openid: opts.openid,
      groupOpenid: opts.groupOpenid,
    });
    if (!fallbackId) throw err;
    const fallbackSeq = allocateQqPassiveMsgSeq(fallbackId);
    console.warn(
      "[qq] 主动媒体无权限(40034105)，降级被动窗口 msg_id=",
      fallbackId.slice(0, 12),
      "… seq=",
      fallbackSeq,
    );
    const usedSeq = await postMedia(fallbackId, fallbackSeq);
    return { fileInfo, msgSeq: usedSeq, usedMsgId: fallbackId, fileName };
  }
}
