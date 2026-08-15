/**
 * IM 通道入站排队 drain：busy 时写入 SessionQueueItem(kind=im_inbound)，
 * hub 收尾后由本模块服务端 FIFO 续跑（不依赖 Web 前端 drain）。
 */

import type { AppConfig } from "./config.js";
import type { ServiceContainer } from "./serviceContainer.js";
import { enqueueSessionAutoConsume } from "./asyncJobs/index.js";
import { getStreamHub, onHubRunSettled } from "./sessionStreamHub.js";
import { createTrpcInvoker } from "./trpcInvoker.js";
import { wrapEmitForChannelReply } from "./channelStreamBridge.js";
import {
  clearChannelOutbound,
  shouldSkipChannelFallback,
} from "./channelOutboundLedger.js";
import {
  IM_INBOUND_QUEUE_KIND,
  getChannelAdapter,
  parseImInboundAttachment,
  unifiedMessageFromImInbound,
  type GatewayDeps,
} from "./messageGateway.js";

let unsubSettled: (() => void) | null = null;
let drainDeps: GatewayDeps | null = null;

export function initImChannelDrain(deps: GatewayDeps): void {
  drainDeps = deps;
  if (unsubSettled) unsubSettled();
  unsubSettled = onHubRunSettled((sessionId) => {
    enqueueImChannelDrain(sessionId).catch((err) => {
      console.warn(
        `[imChannelDrain] settled 触发失败 session=${sessionId}:`,
        err instanceof Error ? err.message : err,
      );
    });
  });
}

export function stopImChannelDrain(): void {
  unsubSettled?.();
  unsubSettled = null;
  drainDeps = null;
}

/** 测试隔离 */
export function __resetImChannelDrainForTests(): void {
  stopImChannelDrain();
}

export function enqueueImChannelDrain(sessionId: string): Promise<void> {
  if (!drainDeps) return Promise.resolve();
  const { services, config, prisma } = drainDeps;
  return enqueueSessionAutoConsume(sessionId, async () => {
    const hub = getStreamHub();
    if (!hub) return;
    try {
      for (;;) {
        if (hub.isRunning(sessionId)) {
          await hub.waitFor(sessionId);
          continue;
        }
        const items = await services.sessionQueueItem.listBySession(sessionId);
        // FIFO：队首必须是 im_inbound，否则留给前端 user drain / superior drain
        const head = items.find((i) => !i.claimedAt);
        if (!head) return;
        if (head.kind !== IM_INBOUND_QUEUE_KIND) return;

        const meta = parseImInboundAttachment(head.attachments);
        if (!meta) {
          console.warn(`[imChannelDrain] 非法 im_inbound 元数据，丢弃 item=${head.id}`);
          await services.sessionQueueItem.finalize(head.id).catch(() => {});
          continue;
        }

        const claim = await services.sessionQueueItem.consume(head.id);
        if (!claim.claimed) continue;

        hub.markRunStarting(sessionId);
        try {
          await runImInboundItem({
            sessionId,
            content: head.content,
            meta,
            services,
            config,
            prisma,
          });
          await services.sessionQueueItem.finalize(head.id);
        } catch (err) {
          console.warn(
            `[imChannelDrain] 处理失败 session=${sessionId} item=${head.id}:`,
            err instanceof Error ? err.message : err,
          );
          // 保留 claimedAt，启动恢复 / 下次 settled 超龄后可再投
        } finally {
          hub.unmarkRunStarting(sessionId);
        }
      }
    } catch (err) {
      console.warn(`[imChannelDrain] 异常 session=${sessionId}:`, err);
    }
  });
}

async function runImInboundItem(opts: {
  sessionId: string;
  content: string;
  meta: NonNullable<ReturnType<typeof parseImInboundAttachment>>;
  services: ServiceContainer;
  config: AppConfig;
  prisma: GatewayDeps["prisma"];
}): Promise<void> {
  const hub = getStreamHub();
  if (!hub) throw new Error("SessionStreamHub 未就绪");

  const binding = await opts.prisma.channelBinding.findFirst({
    where: { sessionId: opts.sessionId },
    select: { agentId: true },
  });
  const agentId = binding?.agentId;
  if (!agentId) throw new Error(`im_inbound 无绑定 Agent session=${opts.sessionId}`);

  const session = await opts.prisma.chatSession.findUnique({
    where: { id: opts.sessionId },
    select: { systemPrompt: true },
  });

  const msg = unifiedMessageFromImInbound(opts.content, opts.meta);
  // 不强制 quote：排队可能已超平台被动窗（群≈5min）；系统/兜底走主动消息。
  // 要引用/艾特由 Agent 工具 at/quote 决定。
  msg.meta.quoteInbound = false;
  const adapter = getChannelAdapter(msg.envelope.channel);
  const eventId = `${msg.envelope.channel}:${msg.meta.eventId}`;

  const body = {
    sessionId: opts.sessionId,
    agentId,
    message: opts.content,
    source: "user" as const,
    clientMessageId: eventId,
    attachments: msg.payload.attachments,
    config: session?.systemPrompt ? { systemPrompt: session.systemPrompt } : undefined,
  };

  const invoke = createTrpcInvoker({
    services: opts.services,
    config: opts.config,
    prisma: opts.prisma,
  });
  const { chatAgentStream } = await import("./agentStream.js");

  // 恢复 QQ replyCtx / 被动窗口（drain 路径不再走 ingest）
  if (msg.envelope.channel === "qq") {
    clearChannelOutbound(opts.sessionId);
    const { rememberQqOfficialInbound } = await import("./channels/qqOfficialMedia.js");
    rememberQqOfficialInbound({
      openid: msg.envelope.peerId,
      groupOpenid: msg.envelope.chatId,
      msgId: msg.meta.replyTo || msg.meta.eventId,
    });
  }

  let waitChannelReplies: (() => Promise<void>) | undefined;
  const started = await hub.startIfNotRunning(opts.sessionId, body, async (emit, signal) => {
    const channelEmit = adapter
      ? wrapEmitForChannelReply(
          emit,
          (chunk) =>
            adapter.reply(msg, chunk).catch((err) => {
              console.warn(
                `[imChannelDrain] ${msg.envelope.channel} 回发失败:`,
                err instanceof Error ? err.message : err,
              );
            }),
          msg.envelope.channel === "qq"
            ? {
                fallbackOnlyWhenNoAnswer: {
                  sessionId: opts.sessionId,
                  shouldSkipFallback: (finalText) =>
                    shouldSkipChannelFallback(opts.sessionId, "qq", finalText),
                },
              }
            : undefined,
        )
      : null;
    waitChannelReplies = channelEmit?.waitForChannelReplies;
    try {
      await chatAgentStream(
        opts.services,
        opts.config,
        body,
        invoke,
        channelEmit ?? emit,
        signal,
      );
    } finally {
      await waitChannelReplies?.().catch(() => {});
    }
  });

  if (started === "busy" || started === "duplicate") {
    throw new Error(`im_inbound 起流未获槽: ${started}`);
  }

  if (adapter) {
    await adapter
      .reply(msg, {
        text: "收到，正在处理…",
        finish: false,
        imStatus: "working",
        imQuote: false,
      })
      .catch(() => {});
  }

  await hub.waitFor(opts.sessionId);
  await waitChannelReplies?.().catch(() => {});
}
