/**
 * 微信 ClawBot 通道适配器。
 *
 * 分层：weixinIlink（HTTP）→ weixinMedia（加解密/CDN）→ 本文件（ChannelAdapter）。
 * 官方 openclaw-weixin-cli 只装 OpenClaw，这里直连 iLink。
 */

import { randomUUID } from "node:crypto";
import type { ChannelAttachment } from "@oasismind/shared";
import { bootDetail } from "../bootLog.js";
import { getAppConfig } from "../config.js";
import type {
  ChannelAdapter,
  ChannelReplyChunk,
  ChannelSendTarget,
  UnifiedMessage,
} from "../messageGateway.js";
import { handleIncomingMessage } from "../messageGateway.js";
import { planImReply } from "./imReplyText.js";
import {
  type WeixinMediaKind,
  extractWeixinText,
  fetchWeixinQr,
  inboundContextToken,
  inboundFromUserId,
  inboundGroupId,
  inboundMessageId,
  isWeixinUserAllowed,
  isWeixinUserMessage,
  parseWeixinMediaItems,
  pollWeixinQrStatus,
  pollWeixinUpdates,
  sendWeixinText,
  splitWeixinText,
} from "./weixinIlink.js";
import {
  createTextChannelAttachment,
  materializeReplyChannelReference,
} from "./channelAttachment.js";
import { createMultimodalChannelCapabilities } from "./channelCapabilities.js";
import {
  deriveChannelIdempotencyKey,
  sendChannelAttachment,
} from "./channelTransfer.js";
import {
  composeWeixinUserText,
  extraOutboundMedia,
  loadWeixinMediaBytes,
  materializeWeixinInboundMedia,
  sendWeixinLocalMedia,
} from "./weixinMedia.js";
import {
  deleteWeixinClawBotSession,
  readWeixinClawBotSession,
  writeWeixinClawBotSession,
  type WeixinClawBotConfig,
} from "./weixinSession.js";

type ReplyCtx = {
  toUserId: string;
  contextToken: string;
};

type LoginPhase = "idle" | "waiting_scan" | "connected";

export type WeixinClawBotController = {
  startQrLogin: () => Promise<{ qrcode: string; imageDataUrl: string }>;
  logout: () => Promise<void>;
  getLoginSnapshot: () => {
    phase: LoginPhase;
    boundUserId: string;
    accountId: string;
    lastError?: string;
  };
};

let controller: WeixinClawBotController | null = null;

export function getWeixinClawBotController(): WeixinClawBotController | null {
  return controller;
}

export function __resetWeixinClawBotControllerForTests(): void {
  controller = null;
}


export const WEIXIN_POLL_GAP_MS = 400;
export const WEIXIN_POLL_GAP_MAX_MS = 8000;

/** 长轮询成功立刻重入；失败指数退避，避免空转打盘/打接口。 */
export function nextWeixinPollGap(ok: boolean, prevMs: number): number {
  if (ok) return WEIXIN_POLL_GAP_MS;
  return Math.min(WEIXIN_POLL_GAP_MAX_MS, Math.max(prevMs, WEIXIN_POLL_GAP_MS) * 2);
}

async function toImageDataUrl(payload: string): Promise<string> {
  const p = payload.trim();
  if (p.startsWith("data:image")) return p;
  // iLink 常返回 liteapp.weixin.qq.com 扫码 URL，不是 png；一律画成二维码
  if (/^[A-Za-z0-9+/]+=*$/.test(p) && p.length > 80 && !p.startsWith("http")) {
    return `data:image/png;base64,${p}`;
  }
  const QRCode = await import("qrcode");
  return QRCode.toDataURL(p, { width: 280, margin: 1 });
}

export function createWeixinClawBotAdapter(
  cfg: WeixinClawBotConfig,
  deps?: { fetchImpl?: typeof fetch },
): ChannelAdapter & WeixinClawBotController {
  const fetchImpl = deps?.fetchImpl ?? fetch;
  let state = "disconnected";
  let lastError: string | undefined;
  let loginPhase: LoginPhase = "idle";
  let running = false;
  let pollTimer: ReturnType<typeof setTimeout> | null = null;
  let qrPollTimer: ReturnType<typeof setTimeout> | null = null;
  let session = readWeixinClawBotSession(cfg.sessionDir);
  const replyCtx = new Map<string, ReplyCtx>();
  const lastContextByUser = new Map<string, string>();
  let lastPersisted = session ? JSON.stringify(session) : "";
  let pollGapMs = WEIXIN_POLL_GAP_MS;

  const persist = () => {
    if (!session) return;
    const json = JSON.stringify(session);
    if (json === lastPersisted) return;
    lastPersisted = json;
    writeWeixinClawBotSession(cfg.sessionDir, session);
  };

  const stopTimers = () => {
    if (pollTimer) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
    if (qrPollTimer) {
      clearTimeout(qrPollTimer);
      qrPollTimer = null;
    }
  };

  const rememberContext = (userId: string, token: string) => {
    if (!token) return;
    lastContextByUser.set(userId, token);
    if (session) {
      session.lastContextToken = token;
      persist();
    }
  };

  const ingest = async (msg: Parameters<typeof extractWeixinText>[0]) => {
    if (!isWeixinUserMessage(msg)) return;
    const fromUserId = inboundFromUserId(msg);
    const rawText = extractWeixinText(msg);
    const eventId = inboundMessageId(msg) || randomUUID();
    const contextToken = inboundContextToken(msg);
    const groupId = inboundGroupId(msg);
    const gate = isWeixinUserAllowed({
      allowedUserIds: cfg.allowedUserIds,
      boundUserId: session?.boundUserId || "",
      fromUserId,
    });
    if (!gate.ok) {
      bootDetail(`[weixin-clawbot] skip ${gate.reason}`);
      return;
    }
    if (gate.bindAs && session) {
      session.boundUserId = gate.bindAs;
      persist();
    }
    const mediaItems = parseWeixinMediaItems(msg);
    const media =
      mediaItems.length > 0
        ? await materializeWeixinInboundMedia(mediaItems, fetchImpl)
        : { mediaLines: [], attachments: [] };
    const text = composeWeixinUserText({ text: rawText, mediaLines: media.mediaLines });
    if (!text && media.attachments.length === 0) return;
    rememberContext(fromUserId, contextToken);
    replyCtx.set(eventId, { toUserId: fromUserId, contextToken });
    handleIncomingMessage({
      envelope: {
        channel: "weixin",
        peerId: fromUserId,
        chatId: groupId || undefined,
        timestamp: new Date().toISOString(),
      },
      payload: {
        text: text || "（请查看附件）",
        attachments: media.attachments.length ? media.attachments : undefined,
      },
      meta: { eventId, replyTo: eventId },
    }).catch((err) => {
      console.error("[weixin-clawbot] inbound error:", err instanceof Error ? err.message : err);
    });
  };

  const loopOnce = async () => {
    if (!running || !session) return;
    try {
      const result = await pollWeixinUpdates({ session, fetchImpl });
      const prevBuf = session.getUpdatesBuf;
      session.getUpdatesBuf = result.getUpdatesBuf;
      if (session.getUpdatesBuf !== prevBuf) persist();
      for (const m of result.messages) await ingest(m);
      lastError = undefined;
      state = "connected";
      loginPhase = "connected";
      pollGapMs = nextWeixinPollGap(true, pollGapMs);
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      state = "error";
      pollGapMs = nextWeixinPollGap(false, pollGapMs);
      bootDetail(`[weixin-clawbot] poll: ${lastError}`);
    }
  };

  const scheduleLoop = () => {
    if (!running) return;
    pollTimer = setTimeout(() => {
      loopOnce()
        .catch(() => {})
        .finally(() => {
          if (running) scheduleLoop();
        });
    }, pollGapMs);
  };

  const startPolling = () => {
    if (!session) return;
    running = true;
    state = "connecting";
    loginPhase = "connected";
    scheduleLoop();
  };

  const startQrLogin = async () => {
    if (!cfg.enabled) throw new Error("WEIXIN_CLAWBOT_ENABLED=false");
    const qr = await fetchWeixinQr({ baseUrl: cfg.baseUrl, fetchImpl });
    loginPhase = "waiting_scan";
    state = "connecting";
    lastError = undefined;
    const imageDataUrl = await toImageDataUrl(qr.qrcodeImgContent || qr.qrcode);
    const started = Date.now();
    const tick = async () => {
      if (Date.now() - started > 5 * 60_000) {
        loginPhase = session ? "connected" : "idle";
        state = session ? "connected" : "disconnected";
        lastError = "qr expired";
        return;
      }
      try {
        const st = await pollWeixinQrStatus({ baseUrl: cfg.baseUrl, qrcode: qr.qrcode, fetchImpl });
        if (st.phase === "expired") {
          loginPhase = "idle";
          lastError = "qr expired";
          return;
        }
        if (st.phase === "confirmed") {
          session = {
            botToken: st.session.botToken,
            baseUrl: st.session.baseUrl || cfg.baseUrl,
            getUpdatesBuf: "",
            boundUserId: session?.boundUserId || "",
            accountId: st.session.accountId,
          };
          persist();
          startPolling();
          return;
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
      qrPollTimer = setTimeout(() => {
        tick().catch(() => {});
      }, 1500);
    };
    tick().catch((err) => {
      lastError = err instanceof Error ? err.message : String(err);
    });
    return { qrcode: qr.qrcode, imageDataUrl };
  };

  const logout = async () => {
    running = false;
    stopTimers();
    session = null;
    deleteWeixinClawBotSession(cfg.sessionDir);
    replyCtx.clear();
    loginPhase = "idle";
    state = "disconnected";
    lastError = undefined;
  };

  const sendAttachment = async (
    target: ChannelSendTarget,
    attachment: ChannelAttachment,
  ): Promise<unknown> => {
    if (!session?.botToken) throw new Error("微信 ClawBot 尚未登录");
    if (target.chatId) throw new Error("微信 ClawBot 当前不支持主动向群聊发送附件");
    if (target.mentionPeerIds?.length) throw new Error("微信 ClawBot 不支持成员艾特");
    const contextToken = lastContextByUser.get(target.peerId) || session.lastContextToken || "";
    if (!contextToken) throw new Error("微信缺少 context_token；请先由该用户向 ClawBot 发一条消息");

    if (attachment.kind === "text") {
      const text = attachment.caption?.trim() || "";
      if (!text) throw new Error("微信文本附件正文为空");
      for (const part of splitWeixinText(text)) {
        await sendWeixinText({
          session,
          toUserId: target.peerId,
          contextToken,
          text: part,
          fetchImpl,
        });
      }
      return { parts: splitWeixinText(text).length };
    }

    const source = attachment.localPath || attachment.remoteUrl || "";
    if (!source) throw new Error("微信附件没有可发送的受控路径");
    const loaded = await loadWeixinMediaBytes(source, fetchImpl);
    if (!loaded) throw new Error(`微信附件无法读取或超过大小上限：${attachment.fileName}`);
    const kind: WeixinMediaKind = attachment.kind === "audio" ? "voice" : attachment.kind;
    await sendWeixinLocalMedia({
      session,
      toUserId: target.peerId,
      contextToken,
      kind,
      bytes: loaded.bytes,
      fileName: attachment.fileName || loaded.fileName,
      fetchImpl,
    });
    if (attachment.caption?.trim()) {
      await sendWeixinText({
        session,
        toUserId: target.peerId,
        contextToken,
        text: attachment.caption.trim(),
        fetchImpl,
      });
    }
    return { fileName: attachment.fileName, kind };
  };

  const adapter: ChannelAdapter & WeixinClawBotController = {
    channel: "weixin",
    name: "微信 ClawBot",
    enabled: cfg.enabled,
    capabilities: createMultimodalChannelCapabilities({ supportsQuote: false }),
    getStatus: () => ({
      state: cfg.enabled ? state : "disconnected",
      detail: session?.boundUserId ? `user=${session.boundUserId}` : loginPhase,
      lastError,
    }),
    start: async () => {
      controller = adapter;
      if (!cfg.enabled) {
        state = "disconnected";
        return;
      }
      session = readWeixinClawBotSession(cfg.sessionDir);
      lastPersisted = session ? JSON.stringify(session) : "";
      if (session?.botToken) {
        startPolling();
        bootDetail("[weixin-clawbot] session restored, polling");
      } else {
        state = "disconnected";
        bootDetail("[weixin-clawbot] no session; bind via /channels QR");
      }
    },
    stop: async () => {
      running = false;
      stopTimers();
      if (controller === adapter) controller = null;
      state = "disconnected";
    },
    reply: async (msg: UnifiedMessage, chunk: ChannelReplyChunk) => {
      if (chunk.imStatus === "queued" || chunk.imStatus === "working") return;
      if (!chunk.finish || !session) return;
      const live = session;
      const ctx = replyCtx.get(msg.meta.eventId);
      const toUserId = ctx?.toUserId || msg.envelope.peerId;
      const contextToken =
        ctx?.contextToken || lastContextByUser.get(toUserId) || live.lastContextToken || "";
      if (!contextToken) {
        lastError = "missing context_token";
        console.error("[weixin-clawbot] reply skipped: no context_token");
        return;
      }
      const answer = chunk.text || "";
      const extras = extraOutboundMedia(answer);
      const plans = planImReply({
        reasoning: chunk.reasoning,
        answer,
      });
      const target = { peerId: toUserId };
      const sendTracked = async (attachment: ChannelAttachment, suffix: string) => {
        if (attachment.status !== "ready") {
          throw new Error(attachment.error || `附件 ${attachment.fileName} 校验失败`);
        }
        const transfer = await sendChannelAttachment({
          dataDir: getAppConfig().dataDir,
          channel: "weixin",
          target,
          attachment,
          idempotencyKey: deriveChannelIdempotencyKey({
            channel: "weixin",
            target,
            sourceTurnId: `${msg.meta.eventId}:${suffix}`,
            attachment,
          }),
        });
        if (transfer.record.status !== "sent") {
          throw new Error(transfer.record.error || `微信传输状态 ${transfer.record.status}`);
        }
      };
      try {
        for (const [planIndex, plan] of plans.entries()) {
          if (plan.kind === "thinking_text") {
            await sendTracked(
              createTextChannelAttachment({ text: plan.text }),
              `plan-${planIndex}-thinking`,
            );
          } else if (plan.kind === "thinking_file") {
            const preview = plan.content.slice(0, 1800);
            await sendTracked(
              createTextChannelAttachment({
                text: `【思考过程】\n${preview}${plan.content.length > 1800 ? "\n…" : ""}`,
              }),
              `plan-${planIndex}-thinking-preview`,
            );
          } else {
            await sendTracked(
              createTextChannelAttachment({ text: plan.text }),
              `plan-${planIndex}-answer`,
            );
            for (const [imageIndex, image] of plan.imageUrls.entries()) {
              const attachment = await materializeReplyChannelReference({
                reference: image,
                kind: "image",
              });
              await sendTracked(attachment, `plan-${planIndex}-image-${imageIndex}`);
            }
            for (const [extraIndex, extra] of extras.entries()) {
              if (plan.imageUrls.includes(extra.url)) continue;
              const attachment = await materializeReplyChannelReference({
                reference: extra.url,
                kind: extra.kind === "voice" ? "audio" : extra.kind,
              });
              await sendTracked(attachment, `plan-${planIndex}-extra-${extraIndex}`);
            }
          }
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        console.error("[weixin-clawbot] reply failed:", lastError);
        throw err;
      } finally {
        replyCtx.delete(msg.meta.eventId);
      }
    },
    sendAttachment,
    startQrLogin,
    logout,
    getLoginSnapshot: () => ({
      phase: loginPhase,
      boundUserId: session?.boundUserId || "",
      accountId: session?.accountId || "",
      lastError,
    }),
  };

  controller = adapter;
  return adapter;
}
