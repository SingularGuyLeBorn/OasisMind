/**
 * 微信 ClawBot 通道适配器。
 *
 * 分层：weixinIlink（HTTP）→ weixinMedia（加解密/CDN）→ 本文件（ChannelAdapter）。
 * 官方 openclaw-weixin-cli 只装 OpenClaw，这里直连 iLink。
 */

import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { bootDetail } from "../bootLog.js";
import type { ChannelAdapter, ChannelReplyChunk, UnifiedMessage } from "../messageGateway.js";
import { handleIncomingMessage } from "../messageGateway.js";
import { planImReply } from "./imReplyText.js";
import {
  WEIXIN_ILINK_DEFAULT_BASE,
  type WeixinIlinkSession,
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
  composeWeixinUserText,
  extraOutboundMedia,
  loadWeixinMediaBytes,
  materializeWeixinInboundMedia,
  sendWeixinLocalMedia,
} from "./weixinMedia.js";

export type WeixinClawBotConfig = {
  enabled: boolean;
  allowedUserIds: string[];
  baseUrl: string;
  sessionDir: string;
};

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

export function loadWeixinClawBotConfigFromEnv(dataDir?: string): WeixinClawBotConfig {
  const yamlOff = process.env.WEIXIN_CLAWBOT_ENABLED === "false";
  const allowed = (process.env.WEIXIN_CLAWBOT_ALLOWED_USER_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const baseUrl = (process.env.WEIXIN_CLAWBOT_API_BASE || WEIXIN_ILINK_DEFAULT_BASE).trim();
  const root = dataDir || process.env.OM_DATA_DIR || path.join(process.cwd(), "data");
  return {
    enabled: !yamlOff,
    allowedUserIds: allowed,
    baseUrl,
    sessionDir: path.join(root, "weixin-clawbot"),
  };
}

function sessionFile(dir: string): string {
  return path.join(dir, "session.json");
}

function readSession(dir: string): WeixinIlinkSession | null {
  try {
    const raw = fs.readFileSync(sessionFile(dir), "utf8");
    const parsed = JSON.parse(raw) as Partial<WeixinIlinkSession>;
    if (!parsed.botToken) return null;
    return {
      botToken: String(parsed.botToken),
      baseUrl: String(parsed.baseUrl || WEIXIN_ILINK_DEFAULT_BASE),
      getUpdatesBuf: String(parsed.getUpdatesBuf || ""),
      boundUserId: String(parsed.boundUserId || ""),
      accountId: String(parsed.accountId || ""),
      lastContextToken: String(parsed.lastContextToken || ""),
    };
  } catch {
    return null;
  }
}

function writeSession(dir: string, session: WeixinIlinkSession): void {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(sessionFile(dir), JSON.stringify(session), { encoding: "utf8", mode: 0o600 });
}

export const WEIXIN_POLL_GAP_MS = 400;
export const WEIXIN_POLL_GAP_MAX_MS = 8000;

/** 长轮询成功立刻重入；失败指数退避，避免空转打盘/打接口。 */
export function nextWeixinPollGap(ok: boolean, prevMs: number): number {
  if (ok) return WEIXIN_POLL_GAP_MS;
  return Math.min(WEIXIN_POLL_GAP_MAX_MS, Math.max(prevMs, WEIXIN_POLL_GAP_MS) * 2);
}

function deleteSession(dir: string): void {
  try {
    fs.unlinkSync(sessionFile(dir));
  } catch {
    /* ignore */
  }
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
  let session = readSession(cfg.sessionDir);
  const replyCtx = new Map<string, ReplyCtx>();
  const lastContextByUser = new Map<string, string>();
  let lastPersisted = session ? JSON.stringify(session) : "";
  let pollGapMs = WEIXIN_POLL_GAP_MS;

  const persist = () => {
    if (!session) return;
    const json = JSON.stringify(session);
    if (json === lastPersisted) return;
    lastPersisted = json;
    writeSession(cfg.sessionDir, session);
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
      mediaItems.length > 0 ? await materializeWeixinInboundMedia(mediaItems, fetchImpl) : { mediaLines: [], chatAttachments: [] };
    const text = composeWeixinUserText({ text: rawText, mediaLines: media.mediaLines });
    if (!text && media.chatAttachments.length === 0) return;
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
        attachments: media.chatAttachments.length ? media.chatAttachments : undefined,
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
    void tick();
    return { qrcode: qr.qrcode, imageDataUrl };
  };

  const logout = async () => {
    running = false;
    stopTimers();
    session = null;
    deleteSession(cfg.sessionDir);
    replyCtx.clear();
    loginPhase = "idle";
    state = "disconnected";
    lastError = undefined;
  };

  const adapter: ChannelAdapter & WeixinClawBotController = {
    channel: "weixin",
    name: "微信 ClawBot",
    enabled: cfg.enabled,
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
      session = readSession(cfg.sessionDir);
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
      const sendLocal = async (kind: WeixinMediaKind, url: string) => {
        const loaded = await loadWeixinMediaBytes(url, fetchImpl);
        if (!loaded) {
          console.error("[weixin-clawbot] media not found:", kind, url);
          return;
        }
        await sendWeixinLocalMedia({
          session: live,
          toUserId,
          contextToken,
          kind,
          bytes: loaded.bytes,
          fileName: loaded.fileName,
          fetchImpl,
        });
      };
      try {
        for (const plan of plans) {
          if (plan.kind === "thinking_text") {
            await sendWeixinText({ session: live, toUserId, contextToken, text: plan.text, fetchImpl });
          } else if (plan.kind === "thinking_file") {
            const preview = plan.content.slice(0, 1800);
            await sendWeixinText({
              session: live,
              toUserId,
              contextToken,
              text: `【思考过程】\n${preview}${plan.content.length > 1800 ? "\n…" : ""}`,
              fetchImpl,
            });
          } else {
            for (const part of splitWeixinText(plan.text)) {
              await sendWeixinText({ session: live, toUserId, contextToken, text: part, fetchImpl });
            }
            for (const img of plan.imageUrls) {
              await sendLocal("image", img);
            }
            for (const extra of extras) {
              if (plan.imageUrls.includes(extra.url)) continue;
              await sendLocal(extra.kind, extra.url);
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
