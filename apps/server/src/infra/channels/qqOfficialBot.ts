/**
 * QQ 开放平台官方 Bot（Access Token + HTTP 发消息；事件可 WebSocket 或 webhook）。
 * 文档：https://bot.q.qq.com/wiki/
 *
 * 家里手机指挥推荐：QQ_BOT_WS=true（本机出站连官方网关，无需公网回调）。
 * 有公网/隧道时可用 POST /api/webhooks/qq。
 */

import WebSocket from "ws";
import { randomUUID } from "node:crypto";
import type {
  ChannelAdapter,
  ChannelReplyChunk,
  UnifiedMessage,
} from "../messageGateway.js";
import { handleIncomingMessage } from "../messageGateway.js";
import { bootDetail } from "../bootLog.js";
import {
  mdToPlain,
  planImReply,
  resolveProjectMediaPath,
  stripMarkdownImages,
  writeThinkingTxtFile,
} from "./imReplyText.js";
import {
  ensureQqOfficialAccessToken,
  rememberQqOfficialInbound,
  sendQqOfficialMedia,
  sendQqOfficialText,
} from "./qqOfficialMedia.js";
import {
  formatQqGroupHistoryBlock,
  formatSpeakerLabel,
  pushQqGroupHistory,
  takeQqGroupHistory,
} from "./qqGroupContext.js";

const API_BASE = "https://api.sgroup.qq.com";

/**
 * GROUP_AND_C2C_EVENT（1<<25）：
 * - C2C_MESSAGE_CREATE / GROUP_AT_MESSAGE_CREATE
 * - GROUP_MESSAGE_CREATE（需手机 QQ 群设置「机器人可获取的群聊消息范围」= 获取群内全部消息）
 */
export const QQ_GROUP_AND_C2C_INTENT = 1 << 25;

export type QqBotConfig = {
  appId: string;
  secret: string;
  enabled: boolean;
  /** 用户 openid 白名单；空=拒所有人；*=全开 */
  allowedOpenIds: string[];
  /**
   * 群 openid 白名单（仅群聊生效）。
   * 空=拒绝一切群消息；*=任意群；列表=仅这些群。
   * @ 触发仍须发送者在 allowedOpenIds；未 @ 的 GROUP_MESSAGE_CREATE 只按群白名单累计上下文。
   */
  allowedGroups: string[];
  useWs: boolean;
};

/** 纯函数：单聊/群聊入站是否放行（供单测） */
export function isQqInboundAllowed(
  cfg: Pick<QqBotConfig, "allowedOpenIds" | "allowedGroups">,
  opts: { openid: string; groupOpenid?: string },
): { ok: true } | { ok: false; reason: string } {
  const allowAllUsers = cfg.allowedOpenIds.includes("*");
  const userOk = allowAllUsers || cfg.allowedOpenIds.includes(opts.openid);
  if (!userOk) {
    return { ok: false, reason: `user_not_allowed:${opts.openid}` };
  }
  if (opts.groupOpenid) {
    const allowAllGroups = cfg.allowedGroups.includes("*");
    const groupOk = allowAllGroups || cfg.allowedGroups.includes(opts.groupOpenid);
    if (!groupOk) {
      return {
        ok: false,
        reason:
          cfg.allowedGroups.length === 0
            ? `group_denied_empty_allowlist:${opts.groupOpenid}`
            : `group_not_allowed:${opts.groupOpenid}`,
      };
    }
  }
  return { ok: true };
}

function parseCsvEnv(raw: string | undefined): string[] {
  return (raw || "")
    .split("#")[0]!
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * 数字号 → 平台 openid 映射（官方事件只有 openid）。
 * 用户：`2251061018=14A17D73...`；群：`1098299609=2FE7E775...`
 * 多项用逗号或分号分隔。
 */
export function parseQqIdOpenIdMap(raw: string | undefined): Map<string, string> {
  const map = new Map<string, string>();
  const body = (raw || "").split("#")[0] || "";
  for (const part of body.split(/[,;]/)) {
    const s = part.trim();
    if (!s) continue;
    const eq = s.indexOf("=");
    if (eq <= 0) continue;
    const id = s.slice(0, eq).trim();
    const openid = s.slice(eq + 1).trim();
    if (/^\d{5,12}$/.test(id) && openid) map.set(id, openid);
  }
  return map;
}

/** @deprecated 用 parseQqIdOpenIdMap */
export const parseQqOpenIdMap = parseQqIdOpenIdMap;

/** openid → 数字 QQ 号（依赖 QQ_BOT_QQ_OPENID_MAP 反查；官方事件本身不给 QQ 号） */
export function resolveQqNumberForOpenId(
  openid: string,
  idToOpenId: Map<string, string> = parseQqIdOpenIdMap(process.env.QQ_BOT_QQ_OPENID_MAP),
): string | undefined {
  const oid = openid.trim();
  if (!oid) return undefined;
  for (const [qq, mapped] of idToOpenId) {
    if (mapped === oid) return qq;
  }
  return undefined;
}

/** 是否应起 Agent（未 @ 的全量群消息只累计） */
export function shouldDispatchQqInbound(parsed: {
  groupOpenid?: string;
  eventType?: string;
  mentionsBot?: boolean;
}): boolean {
  if (!parsed.groupOpenid) return true;
  if (parsed.eventType === "GROUP_MESSAGE_CREATE") return Boolean(parsed.mentionsBot);
  // GROUP_AT_MESSAGE_CREATE / 无 t（旧 webhook 常只推 @）→ 起流
  return true;
}

function detectMentionsBot(d: Record<string, unknown>): boolean {
  const mentions = d.mentions;
  if (!Array.isArray(mentions)) return false;
  return mentions.some((m) => {
    if (!m || typeof m !== "object") return false;
    const o = m as Record<string, unknown>;
    return o.bot === true || o.bot === 1;
  });
}

/**
 * 把白名单里的数字 QQ/群号展开为 openid；已是 openid / * 的原样保留。
 * 未映射的纯数字项会 warn 并丢弃（避免误以为数字号能直接匹配事件）。
 */
export function expandAllowedIds(
  entries: string[],
  idToOpenId: Map<string, string>,
  label: string,
): string[] {
  const out = new Set<string>();
  for (const e of entries) {
    if (e === "*") {
      out.add("*");
      continue;
    }
    if (/^\d{5,12}$/.test(e)) {
      const mapped = idToOpenId.get(e);
      if (mapped) {
        out.add(mapped);
        out.add(e); // 若平台偶发带数字 group_id 也放行
      } else {
        console.warn(
          `[qq] ${label} 含数字号 ${e}，但无对应 OPENID_MAP（官方事件多为 openid）`,
        );
        out.add(e); // 仍保留：平台若直接推数字 id 可命中
      }
      continue;
    }
    out.add(e);
  }
  for (const [id, openid] of idToOpenId) {
    if (entries.includes(id) || entries.includes(openid) || entries.includes("*")) {
      out.add(openid);
      out.add(id);
    }
  }
  return [...out];
}

export function expandAllowedOpenIds(
  entries: string[],
  qqToOpenId: Map<string, string>,
): string[] {
  return expandAllowedIds(entries, qqToOpenId, "QQ_BOT_ALLOWED_OPENIDS");
}

type TokenState = { accessToken: string; expiresAt: number };

export type QqInboundParsed = {
  openid: string;
  content: string;
  msgId: string;
  groupOpenid?: string;
  /** 事件原始 d（附件/引用解析用） */
  rawD: Record<string, unknown>;
  /** 本条或引用里是否带附件（允许无文字） */
  hasMediaHint: boolean;
  /** WS/webhook 顶层 t，如 GROUP_MESSAGE_CREATE */
  eventType?: string;
  /** author.username：群名片/昵称（平台有则带） */
  username?: string;
  /** mentions 含 bot:true，或 GROUP_AT 事件 */
  mentionsBot?: boolean;
};

/** 纯函数：从 webhook / WS 事件体抽出入站字段（供单测） */
export function parseQqInboundPayload(body: unknown): QqInboundParsed | { error: string } {
  const b = body as Record<string, unknown>;
  const d = (b.d ?? b) as Record<string, unknown>;
  const eventType = String(b.t ?? "").trim() || undefined;
  const author = (d.author ?? {}) as {
    id?: string;
    user_openid?: string;
    member_openid?: string;
    username?: string;
  };
  const openid = String(
    author.user_openid || author.member_openid || author.id || d.author_openid || "",
  ).trim();
  const username = String(author.username || "").trim() || undefined;
  const content = String(d.content ?? "")
    .replace(/<@!\d+>/g, "")
    .trim();
  const msgId = String(d.id ?? d.msg_id ?? randomUUID());
  const groupOpenid = String(d.group_openid || d.group_id || "").trim() || undefined;
  const mentionsBot =
    eventType === "GROUP_AT_MESSAGE_CREATE" || detectMentionsBot(d);
  let hasMediaHint = Array.isArray(d.attachments) && d.attachments.length > 0;
  if (!hasMediaHint && Array.isArray(d.msg_elements)) {
    hasMediaHint = d.msg_elements.some((el) => {
      const e = el as { attachments?: unknown[] };
      return Array.isArray(e?.attachments) && e.attachments.length > 0;
    });
  }
  if (!openid) return { error: "缺 openid" };
  if (!content && !hasMediaHint) return { error: "缺 openid/content" };
  return {
    openid,
    content,
    msgId,
    groupOpenid,
    rawD: d,
    hasMediaHint,
    eventType,
    username,
    mentionsBot,
  };
}

/** Identify 帧 payload（供单测断言 intents） */
export function buildQqIdentifyPayload(accessToken: string): {
  op: 2;
  d: { token: string; intents: number; shard: [number, number] };
} {
  return {
    op: 2,
    d: {
      token: `QQBot ${accessToken}`,
      intents: QQ_GROUP_AND_C2C_INTENT,
      shard: [0, 1],
    },
  };
}

export function buildQqResumePayload(opts: {
  accessToken: string;
  sessionId: string;
  seq: number | null;
}): { op: 6; d: { token: string; session_id: string; seq: number | null } } {
  return {
    op: 6,
    d: {
      token: `QQBot ${opts.accessToken}`,
      session_id: opts.sessionId,
      seq: opts.seq,
    },
  };
}

/** 终稿纯文本（QQ 不渲染 Markdown） */
export function qqReplyPlainText(text: string, maxChars = 4000): string {
  const plain = mdToPlain(stripMarkdownImages(text || "")).trim();
  return (plain || "（空回复）").slice(0, maxChars);
}

export function createQqOfficialBotAdapter(cfg: QqBotConfig): ChannelAdapter {
  let token: TokenState | null = null;
  let ws: WebSocket | null = null;
  let stopped = true;
  let state = "disconnected";
  let lastError: string | undefined;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let lastSeq: number | null = null;
  let sessionId: string | null = null;
  let reconnectAttempt = 0;
  let lastHeartbeatAt: number | undefined;
  let lastEventAt: number | undefined;
  let lastRejectedOpenId: string | undefined;
  let lastRejectedGroup: string | undefined;
  let resumeNext = false;

  const openMode = cfg.allowedOpenIds.includes("*");
  if (openMode) {
    bootDetail("[qq] 用户白名单：允许所有 openid（QQ_BOT_ALLOWED_OPENIDS=*）");
  } else if (cfg.allowedOpenIds.length > 0) {
    bootDetail(`[qq] 用户白名单：仅允许 ${cfg.allowedOpenIds.length} 个 openid`);
  } else {
    bootDetail("[qq] 用户白名单：未配置，拒绝所有用户");
  }
  if (cfg.allowedGroups.includes("*")) {
    bootDetail("[qq] 群白名单：允许所有群（仍须 @ 且发送者在用户白名单）");
  } else if (cfg.allowedGroups.length > 0) {
    bootDetail(
      `[qq] 群白名单：仅允许 ${cfg.allowedGroups.length} 个群 · ${cfg.allowedGroups.join(",")}`,
    );
  } else {
    bootDetail("[qq] 群白名单：空=拒绝一切群消息（只开单聊）；指定群填 QQ_BOT_ALLOWED_GROUPS");
  }
  const replyCtx = new Map<
    string,
    {
      openid: string;
      msgId: string;
      isGroup: boolean;
      groupOpenid?: string;
      /** 入站时刻：用于判断平台被动窗是否仍新鲜（与服务是否重启无关） */
      inboundAt: number;
      /** 同一 msg_id 下一条可用的 msg_seq（状态条与终稿共享） */
      nextMsgSeq: number;
    }
  >();

  const ensureReplyCtx = (msg: UnifiedMessage) => {
    const key = msg.meta.eventId;
    const existing = replyCtx.get(key);
    if (existing) return existing;
    const created = {
      openid: msg.envelope.peerId,
      msgId: msg.meta.replyTo || msg.meta.eventId,
      isGroup: Boolean(msg.envelope.chatId),
      groupOpenid: msg.envelope.chatId,
      inboundAt: Date.now(),
      nextMsgSeq: 1,
    };
    replyCtx.set(key, created);
    return created;
  };

  const clearHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  };

  const ensureToken = async (): Promise<string> => {
    const accessToken = await ensureQqOfficialAccessToken({
      appId: cfg.appId,
      secret: cfg.secret,
    });
    token = { accessToken, expiresAt: Date.now() + 3600_000 };
    return accessToken;
  };

  const isGroupAllowed = (groupOpenid: string | undefined): boolean => {
    if (!groupOpenid) return true;
    const allowAllGroups = cfg.allowedGroups.includes("*");
    return allowAllGroups || cfg.allowedGroups.includes(groupOpenid);
  };

  const ingestParsed = (parsed: QqInboundParsed) => {
    const dispatch = shouldDispatchQqInbound(parsed);

    // 群白名单：未 @ 的累计与 @ 起流都先过群门
    if (parsed.groupOpenid && !isGroupAllowed(parsed.groupOpenid)) {
      lastRejectedGroup = parsed.groupOpenid;
      console.log(
        `[qq] 忽略非白名单群 ${parsed.groupOpenid}（填 QQ_BOT_ALLOWED_GROUPS；全量消息须群设置「获取群内全部消息」）`,
      );
      return;
    }

    // 未 @：只写入环形缓冲，不起 Agent
    if (!dispatch && parsed.groupOpenid) {
      const qqNumber = resolveQqNumberForOpenId(parsed.openid);
      const bufText =
        parsed.content.trim() || (parsed.hasMediaHint ? "（附件）" : "");
      if (bufText) {
        pushQqGroupHistory(parsed.groupOpenid, {
          openid: parsed.openid,
          username: parsed.username,
          qqNumber,
          text: bufText,
          at: new Date(),
        });
      }
      return;
    }

    const gate = isQqInboundAllowed(cfg, {
      openid: parsed.openid,
      groupOpenid: parsed.groupOpenid,
    });
    if (!gate.ok) {
      if (gate.reason.startsWith("user_")) {
        lastRejectedOpenId = parsed.openid;
        console.log(
          `[qq] 忽略非白名单用户 ${parsed.openid}（写入 QQ_BOT_ALLOWED_OPENIDS）`,
        );
      } else {
        lastRejectedGroup = parsed.groupOpenid;
        console.log(
          `[qq] 忽略非白名单群 ${parsed.groupOpenid}（指定人×指定群：填 QQ_BOT_ALLOWED_GROUPS）`,
        );
      }
      return;
    }

    void (async () => {
      try {
        const { composeQqUserText, materializeQqInboundMedia } = await import(
          "./qqInboundMedia.js"
        );
        const media = await materializeQqInboundMedia(parsed.rawD);
        let text = composeQqUserText({
          content: parsed.content,
          quotedText: media.quotedText,
          mediaLines: media.mediaLines,
        });
        if (!text.trim() && media.chatAttachments.length === 0) return;

        if (parsed.groupOpenid) {
          const hist = takeQqGroupHistory(parsed.groupOpenid);
          const block = formatQqGroupHistoryBlock(hist);
          if (block) text = block + (text || "（见附件）");
        }

        const qqNumber = resolveQqNumberForOpenId(parsed.openid);
        const speakerLabel = formatSpeakerLabel({
          openid: parsed.openid,
          username: parsed.username,
          qqNumber,
        });

        rememberQqOfficialInbound({
          openid: parsed.openid,
          groupOpenid: parsed.groupOpenid,
          msgId: parsed.msgId,
        });
        const msg: UnifiedMessage = {
          envelope: {
            channel: "qq",
            peerId: parsed.openid,
            chatId: parsed.groupOpenid,
            timestamp: new Date().toISOString(),
          },
          payload: {
            text: text || "（见附件）",
            attachments: media.chatAttachments.length ? media.chatAttachments : undefined,
          },
          meta: {
            eventId: parsed.msgId,
            replyTo: parsed.msgId,
            speakerLabel,
            raw: parsed.rawD,
          },
        };
        replyCtx.set(parsed.msgId, {
          openid: parsed.openid,
          msgId: parsed.msgId,
          isGroup: Boolean(parsed.groupOpenid),
          groupOpenid: parsed.groupOpenid,
          inboundAt: Date.now(),
          nextMsgSeq: 1,
        });
        const r = await handleIncomingMessage(msg);
        if (!r.ok) console.warn(`[qq] 入站失败: ${r.error}`);
      } catch (err) {
        console.warn(`[qq] 入站异常:`, err instanceof Error ? err.message : err);
      }
    })();
  };

  /** 供 Express webhook / WS 共用 */
  const ingestWebhookPayload = (body: unknown) => {
    const parsed = parseQqInboundPayload(body);
    if ("error" in parsed) return { ok: false as const, error: parsed.error };
    ingestParsed(parsed);
    return { ok: true as const };
  };

  const scheduleReconnect = (reason?: string) => {
    if (stopped || !cfg.useWs) return;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    // gateway 400 / 热重载连打：拉长退避，避免一直 HTTP 400
    const base = Math.min(90_000, 3_000 * 2 ** Math.min(reconnectAttempt, 5));
    const delay =
      reason && /gateway HTTP 400|closed before READY/i.test(reason)
        ? Math.max(base, 15_000)
        : base;
    reconnectAttempt += 1;
    resumeNext = Boolean(sessionId);
    console.warn(
      `[qq] WS 将在 ${Math.round(delay / 1000)}s 后重连（第 ${reconnectAttempt} 次）${
        reason ? ` · ${reason.slice(0, 80)}` : ""
      }`,
    );
    reconnectTimer = setTimeout(() => {
      void startWs().catch((e) => {
        lastError = e instanceof Error ? e.message : String(e);
        state = "error";
        scheduleReconnect(lastError);
      });
    }, delay);
  };

  const startHeartbeat = (intervalMs: number, accessToken: string) => {
    clearHeartbeat();
    const ms = Math.max(5_000, intervalMs);
    heartbeatTimer = setInterval(() => {
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      try {
        ws.send(JSON.stringify({ op: 1, d: lastSeq }));
        lastHeartbeatAt = Date.now();
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }, ms);
    // Identify / Resume 后立即发一拍心跳（accessToken 仅用于日志对齐）
    void accessToken;
  };

  const startWs = async () => {
    const accessToken = await ensureToken();
    const gatewayRes = await fetch(`${API_BASE}/gateway`, {
      headers: { Authorization: `QQBot ${accessToken}` },
    });
    if (!gatewayRes.ok) throw new Error(`QQ gateway HTTP ${gatewayRes.status}`);
    const gw = (await gatewayRes.json()) as { url?: string };
    if (!gw.url) throw new Error("QQ gateway 无 url");
    state = "connecting";
    clearHeartbeat();

    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const settleOk = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      const settleErr = (err: Error) => {
        if (settled) return;
        settled = true;
        reject(err);
      };

      ws = new WebSocket(gw.url!);
      ws.on("open", () => {
        /* 等 Hello 再 Identify/Resume */
      });
      ws.on("message", (data) => {
        try {
          const frame = JSON.parse(String(data)) as {
            op?: number;
            t?: string;
            s?: number | null;
            d?: Record<string, unknown>;
          };
          if (typeof frame.s === "number") lastSeq = frame.s;
          lastEventAt = Date.now();

          if (frame.op === 10) {
            const interval = Number(
              (frame.d as { heartbeat_interval?: number } | undefined)?.heartbeat_interval ??
                41_000,
            );
            const tryResume = resumeNext && sessionId;
            resumeNext = false;
            if (tryResume && sessionId) {
              ws?.send(
                JSON.stringify(
                  buildQqResumePayload({
                    accessToken,
                    sessionId,
                    seq: lastSeq,
                  }),
                ),
              );
            } else {
              ws?.send(JSON.stringify(buildQqIdentifyPayload(accessToken)));
            }
            startHeartbeat(interval, accessToken);
            return;
          }

          if (frame.op === 9) {
            // Invalid session → 下次全量 Identify
            sessionId = null;
            lastSeq = null;
            resumeNext = false;
            lastError = "QQ WS invalid session (op=9)";
            ws?.close();
            return;
          }

          if (frame.op === 11) {
            lastHeartbeatAt = Date.now();
            return;
          }

          if (frame.t === "READY") {
            const d = frame.d ?? {};
            sessionId = typeof d.session_id === "string" ? d.session_id : sessionId;
            state = "connected";
            reconnectAttempt = 0;
            lastError = undefined;
            settleOk();
            return;
          }

          if (frame.t === "RESUMED") {
            state = "connected";
            reconnectAttempt = 0;
            lastError = undefined;
            settleOk();
            return;
          }

          if (
            frame.t === "C2C_MESSAGE_CREATE" ||
            frame.t === "GROUP_AT_MESSAGE_CREATE" ||
            frame.t === "GROUP_MESSAGE_CREATE"
          ) {
            ingestWebhookPayload({ t: frame.t, d: frame.d });
          }
          if (frame.t === "GROUP_ADD_ROBOT") {
            const g = String(
              (frame.d as { group_openid?: string } | undefined)?.group_openid || "",
            ).trim();
            if (g) {
              console.log(
                `[qq] 机器人被拉进群 group_openid=${g}（写入 QQ_BOT_ALLOWED_GROUPS 或设 * 后 @ 即可）`,
              );
              lastRejectedGroup = undefined;
            }
          }
        } catch {
          /* ignore malformed frames */
        }
      });
      ws.on("close", () => {
        clearHeartbeat();
        state = "disconnected";
        ws = null;
        if (!settled) settleErr(new Error("QQ WS closed before READY"));
        if (!stopped && cfg.useWs) scheduleReconnect();
      });
      ws.on("error", (err) => {
        lastError = err.message;
        state = "error";
        if (!settled) settleErr(err);
      });
    });
  };

  const statusDetail = (): string => {
    if (!cfg.enabled) return "未配置";
    const mode = cfg.useWs ? "ws" : "webhook";
    const parts = [`app=${cfg.appId.slice(0, 6)}…`, mode];
    if (cfg.useWs) {
      if (lastHeartbeatAt) parts.push(`hb=${new Date(lastHeartbeatAt).toISOString().slice(11, 19)}`);
      if (lastEventAt) parts.push(`evt=${new Date(lastEventAt).toISOString().slice(11, 19)}`);
      if (sessionId) parts.push("session=ok");
    }
    if (lastRejectedOpenId) parts.push(`rejectedUser=${lastRejectedOpenId}`);
    if (lastRejectedGroup) parts.push(`rejectedGroup=${lastRejectedGroup}`);
    const g =
      cfg.allowedGroups.includes("*")
        ? "groups=*"
        : cfg.allowedGroups.length > 0
          ? `groups=${cfg.allowedGroups.length}`
          : "groups=off";
    parts.push(g);
    return parts.join(" · ");
  };

  const adapter: ChannelAdapter & { ingestWebhookPayload: typeof ingestWebhookPayload } = {
    channel: "qq",
    name: "QQ 官方机器人",
    enabled: cfg.enabled,
    getStatus: () => ({
      state: cfg.enabled ? state : "disconnected",
      detail: statusDetail(),
      lastError,
    }),
    start: async () => {
      if (!cfg.enabled) return;
      stopped = false;
      reconnectAttempt = 0;
      await ensureToken();
      state = cfg.useWs ? "connecting" : "connected";
      if (cfg.useWs) {
        try {
          await startWs();
        } catch (err) {
          // 启动失败（gateway 400 / READY 前断开）不能停在 error：后台继续重连
          lastError = err instanceof Error ? err.message : String(err);
          state = "error";
          scheduleReconnect(lastError);
          throw err;
        }
      } else lastError = undefined;
    },
    stop: async () => {
      stopped = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = null;
      clearHeartbeat();
      ws?.close();
      ws = null;
      state = "disconnected";
    },
    reply: async (msg, chunk: ChannelReplyChunk) => {
      const accessToken = await ensureToken();
      const ctx = ensureReplyCtx(msg);
      const openid = ctx.openid;
      const groupOpenid = ctx.isGroup ? ctx.groupOpenid : undefined;
      const isGroup = Boolean(groupOpenid);
      // 默认主动消息（无 msg_id）——不依赖平台被动窗，长任务无需重启服务。
      // 仅在被动窗仍新鲜且显式要引用时才带 msg_id。
      const wantQuote =
        chunk.imQuote === true ||
        (chunk.imQuote !== false && Boolean(msg.meta.quoteInbound));

      const { QQ_PLATFORM_PASSIVE_TTL_MS } = await import("./qqOfficialMedia.js");
      const platformTtl = isGroup
        ? QQ_PLATFORM_PASSIVE_TTL_MS.group
        : QQ_PLATFORM_PASSIVE_TTL_MS.c2c;
      // 按本条入站时刻算被动窗；超时改主动消息，绝不需要重启服务
      const passiveFresh = Date.now() - ctx.inboundAt < platformTtl;

      const sendActiveText = async (plain: string) => {
        await sendQqOfficialText({
          openid,
          groupOpenid,
          text: plain,
          accessToken,
        });
      };

      const sendPlainText = async (text: string) => {
        const plain = qqReplyPlainText(text);
        // 优先主动；被动窗过期时绝不再带 msg_id
        try {
          await sendActiveText(plain);
          return;
        } catch (err) {
          if (!passiveFresh) {
            lastError = err instanceof Error ? err.message : String(err);
            throw err;
          }
          console.warn(
            "[qq] 主动回发失败，尝试仍新鲜的被动窗口:",
            err instanceof Error ? err.message : err,
          );
        }
        try {
          await sendQqOfficialText({
            openid,
            groupOpenid,
            text: plain,
            msgId: ctx.msgId,
            msgSeq: ctx.nextMsgSeq++,
            accessToken,
          });
        } catch (err) {
          lastError = err instanceof Error ? err.message : String(err);
          // 被动失败再主动一次（额度/瞬断）
          await sendActiveText(plain);
        }
      };

      const sendQuotedText = async (text: string) => {
        const plain = qqReplyPlainText(text);
        if (!passiveFresh) {
          // 窗口已过：引用做不到，普通主动气泡照发（不重启也能回）
          await sendActiveText(plain);
          return;
        }
        const seq = ctx.nextMsgSeq++;
        try {
          await sendQqOfficialText({
            openid,
            groupOpenid,
            text: plain,
            msgId: ctx.msgId,
            msgSeq: seq,
            messageReference: { messageId: ctx.msgId },
            accessToken,
          });
        } catch (err) {
          console.warn(
            "[qq] 带引用回发失败，降级主动普通气泡:",
            err instanceof Error ? err.message : err,
          );
          await sendActiveText(plain);
        }
      };

      const sendText = async (text: string) => {
        if (wantQuote) await sendQuotedText(text);
        else await sendPlainText(text);
      };

      // 状态条：排队 / 开始处理（非 token 流；官方无同气泡编辑）
      // 禁止被动降级（带 msg_id 会平台自动艾特）。群无主动权限时状态条可静默失败，正式回复仍会降级发出。
      if (chunk.imStatus === "queued" || chunk.imStatus === "working") {
        const text = chunk.text.trim();
        if (!text) return;
        try {
          await sendQqOfficialText({
            openid,
            groupOpenid,
            text: qqReplyPlainText(text),
            accessToken,
            allowPassiveFallback: false,
          });
        } catch (err) {
          lastError = err instanceof Error ? err.message : String(err);
          console.warn("[qq] 状态条主动发送失败（不降级被动/不艾特）:", lastError);
        }
        return;
      }

      // token 节流片丢弃——QQ 不能复用 Web 流式气泡
      if (!chunk.finish) return;

      const sendMediaFile = async (
        file: string,
        kind: "image" | "video" | "voice" | "file",
        fileName?: string,
      ) => {
        const sendActiveMedia = () =>
          sendQqOfficialMedia({
            openid,
            groupOpenid,
            kind,
            file,
            fileName,
            accessToken,
          });
        try {
          if (wantQuote && passiveFresh) {
            try {
              await sendQqOfficialMedia({
                openid,
                groupOpenid,
                kind,
                file,
                fileName,
                msgId: ctx.msgId,
                msgSeq: ctx.nextMsgSeq++,
                messageReference: { messageId: ctx.msgId },
                accessToken,
              });
              return;
            } catch (err) {
              console.warn(
                "[qq] 带引用富媒体失败，降级主动:",
                err instanceof Error ? err.message : err,
              );
            }
          }
          try {
            await sendActiveMedia();
            return;
          } catch (err) {
            if (!passiveFresh) throw err;
            console.warn(
              "[qq] 主动发媒体失败，尝试仍新鲜的被动窗口:",
              err instanceof Error ? err.message : err,
            );
          }
          await sendQqOfficialMedia({
            openid,
            groupOpenid,
            kind,
            file,
            fileName,
            msgId: ctx.msgId,
            msgSeq: ctx.nextMsgSeq++,
            accessToken,
          });
        } catch (err) {
          lastError = err instanceof Error ? err.message : String(err);
          throw err;
        }
      };

      const plans = planImReply({
        reasoning: chunk.reasoning,
        answer: chunk.text || "",
      });

      // 正式答案优先：长任务后被动窗口易过期；思考过程失败不得挡答案
      const ordered = [
        ...plans.filter((p) => p.kind === "answer"),
        ...plans.filter((p) => p.kind !== "answer"),
      ];

      let answerSent = false;
      for (const plan of ordered) {
        try {
          if (plan.kind === "thinking_text") {
            await sendText(plan.text);
          } else if (plan.kind === "thinking_file") {
            const abs = writeThinkingTxtFile(plan.fileName, plan.content);
            try {
              await sendMediaFile(abs, "file", plan.fileName);
            } catch (err) {
              console.warn(
                "[qq] 思考 txt 富媒体发送失败，降级文本:",
                err instanceof Error ? err.message : err,
              );
              const preview = plan.content.slice(0, 800);
              await sendText(
                `【思考过程较长，完整内容见电脑 /chat】\n${preview}${plan.content.length > 800 ? "\n…" : ""}`,
              );
            }
          } else {
            await sendText(plan.text);
            answerSent = true;
            for (const img of plan.imageUrls) {
              try {
                const local = resolveProjectMediaPath(img);
                await sendMediaFile(local || img, "image");
              } catch (err) {
                console.warn(
                  "[qq] 回复配图发送失败:",
                  img,
                  err instanceof Error ? err.message : err,
                );
                await sendText(`（配图发送失败：${img}）`).catch(() => {});
              }
            }
          }
        } catch (err) {
          console.warn(
            `[qq] 回发片段失败 kind=${plan.kind}:`,
            err instanceof Error ? err.message : err,
          );
          lastError = err instanceof Error ? err.message : String(err);
          if (plan.kind === "answer" && !answerSent) {
            // 被动窗口过期时强制主动群消息再试一次
            try {
              await sendQqOfficialText({
                openid,
                groupOpenid,
                text: qqReplyPlainText(plan.text).slice(0, 3500),
                accessToken,
              });
              answerSent = true;
            } catch (err2) {
              console.warn(
                "[qq] 主动兜底回发仍失败:",
                err2 instanceof Error ? err2.message : err2,
              );
              await sendQqOfficialText({
                openid,
                groupOpenid,
                text: "任务已完成，完整回复请打开见微 /chat 查看（QQ 回发失败）。",
                accessToken,
              }).catch(() => {});
            }
          }
        }
      }

      replyCtx.delete(msg.meta.eventId);
    },
    ingestWebhookPayload,
  };

  return adapter;
}

export function loadQqBotConfigFromEnv(): QqBotConfig {
  const appId = (process.env.QQ_BOT_APP_ID || "").trim();
  const secret = (process.env.QQ_BOT_SECRET || "").trim();
  const yamlOff = process.env.QQ_BOT_ENABLED === "false";
  const qqMap = parseQqIdOpenIdMap(process.env.QQ_BOT_QQ_OPENID_MAP);
  const groupMap = parseQqIdOpenIdMap(process.env.QQ_BOT_GROUP_OPENID_MAP);
  const allowedUsers = parseCsvEnv(process.env.QQ_BOT_ALLOWED_OPENIDS);
  const allowedGroups = parseCsvEnv(process.env.QQ_BOT_ALLOWED_GROUPS);
  return {
    appId,
    secret,
    enabled: Boolean(appId && secret) && !yamlOff,
    allowedOpenIds: expandAllowedIds(allowedUsers, qqMap, "QQ_BOT_ALLOWED_OPENIDS"),
    allowedGroups: expandAllowedIds(allowedGroups, groupMap, "QQ_BOT_ALLOWED_GROUPS"),
    useWs: process.env.QQ_BOT_WS === "1" || process.env.QQ_BOT_WS === "true",
  };
}

export function getQqAdapterIngest(
  adapter: ChannelAdapter,
): ((body: unknown) => { ok: boolean; error?: string }) | null {
  const a = adapter as ChannelAdapter & {
    ingestWebhookPayload?: (body: unknown) => { ok: boolean; error?: string };
  };
  return a.ingestWebhookPayload ?? null;
}
