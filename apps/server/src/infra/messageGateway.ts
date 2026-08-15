/**
 * MessageGateway — IM 通道统一入站（对齐 MetaBlog / OpenClaw / Hermes 信封模式）。
 *
 * 原则：
 * - 单运行时：入站 → ChannelBinding → SessionStreamHub.startIfNotRunning（交互式，不入 async 池）
 * - Adapter 只做协议编解码；网关负责幂等、绑定、起流、回发
 * - 未配置凭证时 Adapter enabled=false，doctor 可体检
 */

import type { PrismaClient } from "@prisma/client";
import type { ChatAttachment } from "@knowpilot/shared";
import type { AppConfig } from "./config.js";
import type { ServiceContainer } from "./serviceContainer.js";
import { claimWebhookEvent } from "./webhookIdempotency.js";
import {
  resolveOrCreateChannelBinding,
  setDefaultChannelSession,
} from "./channelBinding.js";
import { getStreamHub } from "./sessionStreamHub.js";
import { createTrpcInvoker } from "./trpcInvoker.js";
import { wrapEmitForChannelReply } from "./channelStreamBridge.js";
import {
  clearChannelOutbound,
  shouldSkipChannelFallback,
} from "./channelOutboundLedger.js";
import { notifyAgentUi } from "./uiStateNotify.js";
import { IM_SLASH_HELP_TEXT, parseImSlashCommand } from "./imSlashCommands.js";

/**
 * 群聊共享 session 时，把说话人写进正文，否则 LLM 分不清是谁在 @。
 * displayName 优先用平台昵称 / QQ 号；缺省回退 openid。
 */
export function prefixGroupSpeaker(
  text: string,
  speakerPeerId: string,
  displayName?: string,
): string {
  const id = speakerPeerId.trim();
  if (!id && !displayName?.trim()) return text;
  const already = text.startsWith("【群成员") || text.startsWith("[群成员");
  if (already) return text;
  // 始终带 openid，便于 Agent 用 send_qq_text.atOpenIds 艾特群里其他人
  const name = displayName?.trim();
  const label = name && id ? `${name} | openid=${id}` : name || (id ? `openid=${id}` : "未知");
  return `【群成员 ${label}】\n${text}`;
}

export type ImChannel = "qq" | "feishu" | "telegram" | "onebot";

export type UnifiedMessage = {
  envelope: {
    channel: ImChannel;
    /** 对端稳定 id（QQ openid 等） */
    peerId: string;
    /** 群聊 id；单聊可空 */
    chatId?: string;
    timestamp: string;
  };
  payload: {
    text: string;
    /** QQ 引用图等：落库后喂 LLM（vision / OCR 路径） */
    attachments?: ChatAttachment[];
  };
  meta: {
    /** 通道侧事件幂等键（qq message id 等） */
    eventId: string;
    /** 通道回传字段（replyTo 等） */
    replyTo?: string;
    /** 群聊说话人展示名（昵称 / QQ 号）；缺省用 openid */
    speakerLabel?: string;
    /**
     * QQ 群：true=回发时引用该入站消息（引用条；平台常连带 @）。
     * 默认 false=普通气泡不艾特。排队 drain 一条条回复时应置 true。
     */
    quoteInbound?: boolean;
    raw?: unknown;
  };
};

export type ChannelReplyChunk = {
  text: string;
  /** 流式是否结束 */
  finish: boolean;
  streamId?: string;
  /** 模型的 reasoning/thinking 内容；IM 渠道可额外转发给用户 */
  reasoning?: string;
  /**
   * IM 状态条（非 token 流）：queued=已入队；working=已开始处理。
   * QQ 官方无同气泡编辑，不能复用 Web 流式；状态条 + 终稿引用才是可行路径。
   */
  imStatus?: "queued" | "working";
  /** 覆盖本条是否强制引用入站（缺省看 UnifiedMessage.meta.quoteInbound） */
  imQuote?: boolean;
};

/** SessionQueueItem.attachments 中的 IM 入站元数据（drain 回发 / 引用依赖） */
export type ImInboundQueueMeta = {
  v: 1;
  channel: ImChannel;
  peerId: string;
  chatId?: string;
  eventId: string;
  replyTo: string;
  /** 入站图片等（排队后 drain 原样喂 chatAgentStream） */
  chatAttachments?: ChatAttachment[];
};

export const IM_INBOUND_QUEUE_KIND = "im_inbound" as const;

function sanitizeQueuedChatAttachments(raw: unknown): ChatAttachment[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const out: ChatAttachment[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const a = item as Record<string, unknown>;
    if (a.type === "post") continue; // IM 入站不排队文章引用
    const name = typeof a.name === "string" ? a.name : "";
    const mimeType = typeof a.mimeType === "string" ? a.mimeType : "";
    const previewUrl = typeof a.previewUrl === "string" ? a.previewUrl : "";
    if (!name || !mimeType || !previewUrl) continue;
    out.push({
      type: "image",
      name,
      mimeType,
      previewUrl,
      extractedText: typeof a.extractedText === "string" ? a.extractedText : undefined,
      source: a.source === "ocr" || a.source === "vision" || a.source === "user" ? a.source : "user",
    });
  }
  return out.length ? out : undefined;
}

export function buildImInboundAttachment(msg: UnifiedMessage): ImInboundQueueMeta {
  return {
    v: 1,
    channel: msg.envelope.channel,
    peerId: msg.envelope.peerId,
    chatId: msg.envelope.chatId,
    eventId: msg.meta.eventId,
    replyTo: msg.meta.replyTo || msg.meta.eventId,
    chatAttachments: msg.payload.attachments?.length ? msg.payload.attachments : undefined,
  };
}

export function parseImInboundAttachment(raw: unknown): ImInboundQueueMeta | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const channel = o.channel;
  if (channel !== "qq" && channel !== "feishu" && channel !== "telegram" && channel !== "onebot") {
    return null;
  }
  const peerId = typeof o.peerId === "string" ? o.peerId.trim() : "";
  const eventId = typeof o.eventId === "string" ? o.eventId.trim() : "";
  if (!peerId || !eventId) return null;
  return {
    v: 1,
    channel,
    peerId,
    chatId: typeof o.chatId === "string" && o.chatId ? o.chatId : undefined,
    eventId,
    replyTo: typeof o.replyTo === "string" && o.replyTo ? o.replyTo : eventId,
    chatAttachments: sanitizeQueuedChatAttachments(o.chatAttachments),
  };
}

export function unifiedMessageFromImInbound(
  content: string,
  meta: ImInboundQueueMeta,
): UnifiedMessage {
  return {
    envelope: {
      channel: meta.channel,
      peerId: meta.peerId,
      chatId: meta.chatId,
      timestamp: new Date().toISOString(),
    },
    payload: {
      text: content,
      attachments: meta.chatAttachments,
    },
    meta: {
      eventId: meta.eventId,
      replyTo: meta.replyTo,
    },
  };
}

export interface ChannelAdapter {
  readonly channel: ImChannel;
  readonly name: string;
  /** 凭证齐备且允许启动 */
  readonly enabled: boolean;
  /** 连接态：disconnected | connecting | connected | error */
  getStatus(): { state: string; detail?: string; lastError?: string };
  start(): Promise<void>;
  stop(): Promise<void>;
  /** 向原渠道回发（流式分片或终稿） */
  reply(msg: UnifiedMessage, chunk: ChannelReplyChunk): Promise<void>;
}

export type GatewayHandleResult =
  | { ok: true; sessionId: string; duplicate?: boolean; busy?: boolean }
  | { ok: false; error: string };

export type GatewayDeps = {
  prisma: PrismaClient;
  services: ServiceContainer;
  config: AppConfig;
};

const adapters = new Map<ImChannel, ChannelAdapter>();
let deps: GatewayDeps | null = null;
const stats = {
  received: 0,
  started: 0,
  duplicate: 0,
  busy: 0,
  failed: 0,
};

export function registerChannelAdapter(adapter: ChannelAdapter): void {
  adapters.set(adapter.channel, adapter);
}

export function getChannelAdapter(channel: ImChannel): ChannelAdapter | undefined {
  return adapters.get(channel);
}

export function listChannelAdapters(): ChannelAdapter[] {
  return [...adapters.values()];
}

export function getMessageGatewayStats() {
  return { ...stats, channels: Object.fromEntries(
    [...adapters.entries()].map(([k, a]) => [k, { enabled: a.enabled, ...a.getStatus() }]),
  ) };
}

export function initMessageGateway(next: GatewayDeps): void {
  deps = next;
}

/**
 * 处理归一化入站消息（Adapter / 单测共用）。
 * 幂等键写入 ProcessedWebhookEvent（source=im:{channel}）。
 */
export async function handleIncomingMessage(msg: UnifiedMessage): Promise<GatewayHandleResult> {
  if (!deps) return { ok: false, error: "MessageGateway 未初始化" };
  let text = msg.payload.text?.trim();
  const inboundAttachments = msg.payload.attachments?.length ? msg.payload.attachments : undefined;
  if (!text && !inboundAttachments?.length) return { ok: false, error: "空消息" };
  if (!text) text = "（见附件）";

  const slash = parseImSlashCommand(text);
  let forceChatId: string | undefined;
  if (slash.type === "new") {
    forceChatId = `${Date.now()}-${(slash.topicLabel || "新话题").slice(0, 30)}`;
    text = slash.topicLabel || "我们开始一个新话题。";
  }

  stats.received += 1;
  const eventId = `${msg.envelope.channel}:${msg.meta.eventId}`;
  const claim = await claimWebhookEvent(deps.prisma, eventId, `im:${msg.envelope.channel}`, "im_chat");
  if (!claim.claimed) {
    stats.duplicate += 1;
    return { ok: true, sessionId: "", duplicate: true };
  }

  try {
    const binding = await resolveOrCreateChannelBinding(deps.prisma, deps.services, deps.config, {
      channel: msg.envelope.channel,
      peerId: msg.envelope.peerId,
      chatId: msg.envelope.chatId ?? null,
      forceChatId,
    });

    // 群聊全群一个 session：正文标注说话人，历史上下文里才能区分谁在讲话
    if (msg.envelope.chatId?.trim()) {
      text = prefixGroupSpeaker(text, msg.envelope.peerId, msg.meta.speakerLabel);
    }

    const adapter = adapters.get(msg.envelope.channel);
    const replyText = async (body: string) => {
      if (!adapter) return;
      await adapter.reply(msg, { text: body, finish: true }).catch(() => {});
    };

    // /new 创建的新 session 要把默认绑定切过去，否则下一条无 chatId 的消息会回到旧 session
    if (slash.type === "new") {
      await setDefaultChannelSession(
        deps.prisma,
        msg.envelope.channel,
        msg.envelope.peerId,
        msg.envelope.chatId ?? null,
        binding.sessionId,
        binding.agentId,
      );
    }

    if (slash.type === "help") {
      await replyText(IM_SLASH_HELP_TEXT);
      return { ok: true, sessionId: binding.sessionId };
    }

    if (slash.type === "ping") {
      await replyText(`pong · ${new Date().toLocaleString("zh-CN", { hour12: false })}`);
      return { ok: true, sessionId: binding.sessionId };
    }

    if (slash.type === "id") {
      const lines = [
        `channel: ${msg.envelope.channel}`,
        `openid: ${msg.envelope.peerId}`,
        msg.envelope.chatId
          ? `group_openid: ${msg.envelope.chatId}`
          : "chat: 私聊",
        "（把 openid 写入 QQ_BOT_ALLOWED_OPENIDS；群 openid 写入 QQ_BOT_ALLOWED_GROUPS）",
      ];
      await replyText(lines.join("\n"));
      return { ok: true, sessionId: binding.sessionId };
    }

    if (slash.type === "where") {
      const [agent, session] = await Promise.all([
        deps.prisma.agent.findUnique({
          where: { id: binding.agentId },
          select: { name: true, sourceSlug: true, model: true, workspaceId: true },
        }),
        deps.prisma.chatSession.findUnique({
          where: { id: binding.sessionId },
          select: { title: true, autoName: true, status: true, model: true },
        }),
      ]);
      const ws = agent?.workspaceId
        ? await deps.prisma.workspace.findUnique({
            where: { id: agent.workspaceId },
            select: { name: true },
          })
        : null;
      const sessionLabel = session?.autoName || session?.title || binding.title || binding.sessionId;
      await replyText(
        [
          `Agent: ${agent?.name || binding.agentId}${agent?.sourceSlug ? ` (${agent.sourceSlug})` : ""}`,
          `模型: ${session?.model || agent?.model || "—"}`,
          ws?.name ? `Workspace: ${ws.name}` : null,
          `会话: ${sessionLabel}`,
          `sessionId: ${binding.sessionId}`,
          msg.envelope.chatId ? "通道: 群聊" : "通道: 私聊",
          `Web: /chat?sessionId=${binding.sessionId}&agentId=${binding.agentId}`,
        ]
          .filter(Boolean)
          .join("\n"),
      );
      return { ok: true, sessionId: binding.sessionId };
    }

    if (slash.type === "status" || slash.type === "queue") {
      const hub = getStreamHub();
      const pending = await deps.services.sessionQueueItem.listBySession(binding.sessionId);
      const imPending = pending.filter((i) => i.kind === IM_INBOUND_QUEUE_KIND && !i.claimedAt);

      if (slash.type === "queue" && slash.action === "clear") {
        const ids = imPending.map((i) => i.id);
        if (ids.length > 0) {
          await deps.prisma.sessionQueueItem.deleteMany({
            where: { id: { in: ids }, claimedAt: null, kind: IM_INBOUND_QUEUE_KIND },
          });
        }
        await replyText(
          ids.length > 0
            ? `已清空 ${ids.length} 条排队（正在跑的不受影响；要用 /stop 打断）。`
            : "队列是空的，没有可清空的项。",
        );
        return { ok: true, sessionId: binding.sessionId };
      }

      const running = hub?.isRunning(binding.sessionId) ?? false;
      if (slash.type === "status") {
        await replyText(
          [
            running ? "状态: 正在回复" : "状态: 空闲",
            `排队: ${imPending.length} 条`,
            `session: ${(await deps.prisma.chatSession.findUnique({
              where: { id: binding.sessionId },
              select: { autoName: true, title: true },
            }))?.autoName || binding.title || binding.sessionId}`,
          ].join("\n"),
        );
        return { ok: true, sessionId: binding.sessionId };
      }

      // /queue list
      if (imPending.length === 0) {
        await replyText(running ? "正在回复；队列为空。" : "队列为空。");
      } else {
        const preview = imPending
          .slice(0, 5)
          .map((i, idx) => `${idx + 1}. ${i.content.replace(/\s+/g, " ").slice(0, 40)}`)
          .join("\n");
        const more = imPending.length > 5 ? `\n…共 ${imPending.length} 条` : "";
        await replyText(
          `排队 ${imPending.length} 条${running ? "（前方还在回复）" : ""}：\n${preview}${more}\n\n清空：/queue clear`,
        );
      }
      return { ok: true, sessionId: binding.sessionId };
    }

    // 清空当前 IM session 上下文
    if (slash.type === "clear") {
      await deps.prisma.chatMessage.deleteMany({ where: { sessionId: binding.sessionId } });
      // 推拉铁律：session 内容变化后推列表变更，让 web 侧栏/打开的标签页实时刷新
      await notifyAgentUi(deps.prisma, binding.agentId, { type: "session_list_changed" });
      await replyText("已清空当前会话上下文，继续聊吧。");
      return { ok: true, sessionId: binding.sessionId };
    }

    const hub = getStreamHub();

    // 强制停止当前 session 的 runner（专治 IM 侧 stuck 在「回复中」）
    if (slash.type === "stop") {
      if (!hub) {
        stats.failed += 1;
        return { ok: false, error: "SessionStreamHub 未就绪" };
      }
      const stopped = hub.forceStop(binding.sessionId);
      await replyText(
        stopped ? "已强制停止当前回复，可以继续发消息。" : "当前没有正在回复的消息。",
      );
      return { ok: true, sessionId: binding.sessionId };
    }

    if (!hub) {
      stats.failed += 1;
      return { ok: false, error: "SessionStreamHub 未就绪" };
    }

    const session = await deps.prisma.chatSession.findUnique({
      where: { id: binding.sessionId },
      select: { systemPrompt: true },
    });

    const body = {
      sessionId: binding.sessionId,
      agentId: binding.agentId,
      message: text,
      source: "channel" as const,
      clientMessageId: eventId,
      attachments: inboundAttachments,
      config: session?.systemPrompt ? { systemPrompt: session.systemPrompt } : undefined,
    };

    // C-S34：入站气泡在起流前落库。start 返回 started 但 runner 未跑 / busy 入队时，开着的 Chat 已有气泡。
    // persist 侧按 clientMessageId 去重，runner 不会写第二条。
    if (text) {
      await deps.services.message.create({
        sessionId: binding.sessionId,
        role: "user",
        content: text,
        attachments: inboundAttachments,
        toolResults: { clientMessageId: eventId },
        source: "channel",
      });
    }

    const invoke = createTrpcInvoker({
      services: deps.services,
      config: deps.config,
      prisma: deps.prisma,
    });
    const { chatAgentStream } = await import("./agentStream/index.js");

    // QQ：正式回发交给工具（at/quote 由模型定）；系统只在无 answer 出站时兜底
    if (msg.envelope.channel === "qq") {
      clearChannelOutbound(binding.sessionId);
    }

    const started = await hub.startIfNotRunning(binding.sessionId, body, async (emit, signal) => {
      const channelEmit = adapter
        ? wrapEmitForChannelReply(
            emit,
            (chunk) =>
              adapter.reply(msg, chunk).catch((err) => {
                console.warn(
                  `[MessageGateway] ${msg.envelope.channel} 回发失败:`,
                  err instanceof Error ? err.message : err,
                );
              }),
            msg.envelope.channel === "qq"
              ? {
                  fallbackOnlyWhenNoAnswer: {
                    sessionId: binding.sessionId,
                    shouldSkipFallback: (finalText) =>
                      shouldSkipChannelFallback(binding.sessionId, "qq", finalText),
                  },
                }
              : undefined,
          )
        : null;
      try {
        await chatAgentStream(
          deps!.services,
          deps!.config,
          body,
          invoke,
          channelEmit ?? emit,
          signal,
        );
      } finally {
        await channelEmit?.waitForChannelReplies?.().catch(() => {});
      }
    });

    if (started === "busy") {
      stats.busy += 1;
      // 服务端 IM drain（im_inbound）——不依赖 Web 前端；回发引用原消息说明已排队
      const pending = await deps.services.sessionQueueItem.listBySession(binding.sessionId);
      const imPending = pending.filter((i) => i.kind === IM_INBOUND_QUEUE_KIND && !i.claimedAt).length;
      const created = await deps.services.sessionQueueItem.create({
        sessionId: binding.sessionId,
        kind: IM_INBOUND_QUEUE_KIND,
        content: text,
        source: "user",
        attachments: buildImInboundAttachment(msg),
      });
      if (!created.success) {
        stats.failed += 1;
        return { ok: false, error: created.error?.message || "IM 入队失败" };
      }
      const queuePos = imPending + 1;
      const { enqueueImChannelDrain } = await import("./imChannelDrain.js");
      void enqueueImChannelDrain(binding.sessionId).catch(() => {});
      if (adapter) {
        void adapter
          .reply(msg, {
            text: `已排队（第 ${queuePos} 条），上一条结束后会继续回复。`,
            finish: false,
            imStatus: "queued",
            imQuote: false,
          })
          .catch((err) => {
            console.warn(
              `[MessageGateway] ${msg.envelope.channel} 排队回发失败:`,
              err instanceof Error ? err.message : err,
            );
          });
      }
      return { ok: true, sessionId: binding.sessionId, busy: true };
    }
    if (started === "duplicate") {
      stats.duplicate += 1;
      return { ok: true, sessionId: binding.sessionId, duplicate: true };
    }
    stats.started += 1;
    if (adapter) {
      void adapter
        .reply(msg, {
          text: "收到，正在处理…",
          finish: false,
          imStatus: "working",
          imQuote: false,
        })
        .catch(() => {});
    }
    const { enqueueImChannelDrain } = await import("./imChannelDrain.js");
    void enqueueImChannelDrain(binding.sessionId).catch(() => {});
    return { ok: true, sessionId: binding.sessionId };
  } catch (err) {
    stats.failed += 1;
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function startAllChannelAdapters(): Promise<void> {
  const { bootDetail } = await import("./bootLog.js");
  const parts: string[] = [];
  for (const adapter of adapters.values()) {
    if (!adapter.enabled) {
      bootDetail(`  📡 [IM] ${adapter.name} 未启用（缺凭证或 config 关闭）`);
      parts.push(`${adapter.channel}=off`);
      continue;
    }
    try {
      await adapter.start();
      const state = adapter.getStatus().state;
      bootDetail(`  📡 [IM] ${adapter.name} 已启动 · ${state}`);
      parts.push(`${adapter.channel}=${state}`);
    } catch (err) {
      console.warn(
        `  ⚠️ [IM] ${adapter.name} 启动失败:`,
        err instanceof Error ? err.message : err,
      );
      parts.push(`${adapter.channel}=error`);
    }
  }
  if (parts.length > 0) {
    console.log(`  📡 [IM] ${parts.join(" · ")}`);
  }
}

export async function stopAllChannelAdapters(): Promise<void> {
  for (const adapter of adapters.values()) {
    await adapter.stop().catch((err) => { console.warn("[messageGateway.ts] best-effort failed:", err instanceof Error ? err.message : err); });
  }
}

/** 单测 / 管理页「模拟入站」 */
export async function __resetMessageGatewayForTests(): Promise<void> {
  adapters.clear();
  deps = null;
  stats.received = 0;
  stats.started = 0;
  stats.duplicate = 0;
  stats.busy = 0;
  stats.failed = 0;
}
