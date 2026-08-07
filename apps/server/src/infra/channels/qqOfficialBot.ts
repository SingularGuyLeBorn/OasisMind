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

const API_BASE = "https://api.sgroup.qq.com";

/** GROUP_AND_C2C_EVENT：单聊 + 群 @ 机器人 */
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
   * 群内仍须发送者在 allowedOpenIds；平台侧本来就只推 @ 机器人事件。
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

type TokenState = { accessToken: string; expiresAt: number };

export type QqInboundParsed = {
  openid: string;
  content: string;
  msgId: string;
  groupOpenid?: string;
};

/** 纯函数：从 webhook / WS 事件体抽出入站字段（供单测） */
export function parseQqInboundPayload(body: unknown): QqInboundParsed | { error: string } {
  const b = body as Record<string, unknown>;
  const d = (b.d ?? b) as Record<string, unknown>;
  const author = (d.author ?? {}) as {
    id?: string;
    user_openid?: string;
    member_openid?: string;
  };
  const openid = String(
    author.user_openid || author.member_openid || author.id || d.author_openid || "",
  ).trim();
  const content = String(d.content ?? "")
    .replace(/<@!\d+>/g, "")
    .trim();
  const msgId = String(d.id ?? d.msg_id ?? randomUUID());
  const groupOpenid = String(d.group_openid || d.group_id || "").trim() || undefined;
  if (!openid || !content) return { error: "缺 openid/content" };
  return { openid, content, msgId, groupOpenid };
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
    { openid: string; msgId: string; isGroup: boolean; groupOpenid?: string }
  >();

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

  const ingestText = (opts: {
    openid: string;
    text: string;
    msgId: string;
    groupOpenid?: string;
  }) => {
    const gate = isQqInboundAllowed(cfg, {
      openid: opts.openid,
      groupOpenid: opts.groupOpenid,
    });
    if (!gate.ok) {
      if (gate.reason.startsWith("user_")) {
        lastRejectedOpenId = opts.openid;
        console.log(
          `[qq] 忽略非白名单用户 ${opts.openid}（写入 QQ_BOT_ALLOWED_OPENIDS）`,
        );
      } else {
        lastRejectedGroup = opts.groupOpenid;
        console.log(
          `[qq] 忽略非白名单群 ${opts.groupOpenid}（指定人×指定群：填 QQ_BOT_ALLOWED_GROUPS；平台侧须 @ 机器人才推送）`,
        );
      }
      return;
    }
    const text = opts.text.trim();
    if (!text) return;
    rememberQqOfficialInbound({
      openid: opts.openid,
      groupOpenid: opts.groupOpenid,
      msgId: opts.msgId,
    });
    const msg: UnifiedMessage = {
      envelope: {
        channel: "qq",
        peerId: opts.openid,
        chatId: opts.groupOpenid,
        timestamp: new Date().toISOString(),
      },
      payload: { text },
      meta: { eventId: opts.msgId, replyTo: opts.msgId },
    };
    replyCtx.set(opts.msgId, {
      openid: opts.openid,
      msgId: opts.msgId,
      isGroup: Boolean(opts.groupOpenid),
      groupOpenid: opts.groupOpenid,
    });
    handleIncomingMessage(msg)
      .then((r) => {
        if (!r.ok) console.warn(`[qq] 入站失败: ${r.error}`);
      })
      .catch((err) => {
        console.warn(`[qq] 入站异常:`, err instanceof Error ? err.message : err);
      });
  };

  /** 供 Express webhook / WS 共用 */
  const ingestWebhookPayload = (body: unknown) => {
    const parsed = parseQqInboundPayload(body);
    if ("error" in parsed) return { ok: false as const, error: parsed.error };
    ingestText({
      openid: parsed.openid,
      text: parsed.content,
      msgId: parsed.msgId,
      groupOpenid: parsed.groupOpenid,
    });
    return { ok: true as const };
  };

  const scheduleReconnect = () => {
    if (stopped || !cfg.useWs) return;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    const delay = Math.min(60_000, 2_000 * 2 ** Math.min(reconnectAttempt, 5));
    reconnectAttempt += 1;
    resumeNext = Boolean(sessionId);
    reconnectTimer = setTimeout(() => {
      void startWs().catch((e) => {
        lastError = e instanceof Error ? e.message : String(e);
        state = "error";
        scheduleReconnect();
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

          if (frame.t === "C2C_MESSAGE_CREATE" || frame.t === "GROUP_AT_MESSAGE_CREATE") {
            ingestWebhookPayload({ d: frame.d });
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
      if (cfg.useWs) await startWs();
      else lastError = undefined;
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
      // 只发终稿；可附带思考（短文本 / 长则 txt 富媒体），同一 msg_id 用 msg_seq 区分
      if (!chunk.finish) return;
      const accessToken = await ensureToken();
      const ctx = replyCtx.get(msg.meta.eventId) ?? {
        openid: msg.envelope.peerId,
        msgId: msg.meta.eventId,
        isGroup: Boolean(msg.envelope.chatId),
        groupOpenid: msg.envelope.chatId,
      };
      let msgSeq = 1;
      const openid = ctx.openid;
      const groupOpenid = ctx.isGroup ? ctx.groupOpenid : undefined;

      const sendText = async (text: string) => {
        try {
          await sendQqOfficialText({
            openid,
            groupOpenid,
            text: qqReplyPlainText(text),
            msgId: ctx.msgId,
            msgSeq: msgSeq++,
            accessToken,
          });
        } catch (err) {
          lastError = err instanceof Error ? err.message : String(err);
          throw err;
        }
      };

      const sendMediaFile = async (
        file: string,
        kind: "image" | "video" | "voice" | "file",
        fileName?: string,
      ) => {
        try {
          await sendQqOfficialMedia({
            openid,
            groupOpenid,
            kind,
            file,
            fileName,
            msgId: ctx.msgId,
            msgSeq: msgSeq++,
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

      for (const plan of plans) {
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
  return {
    appId,
    secret,
    enabled: Boolean(appId && secret) && !yamlOff,
    allowedOpenIds: parseCsvEnv(process.env.QQ_BOT_ALLOWED_OPENIDS),
    allowedGroups: parseCsvEnv(process.env.QQ_BOT_ALLOWED_GROUPS),
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
