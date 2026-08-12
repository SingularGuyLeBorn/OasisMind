/**
 * webhook 幂等 + 死信（DLQ）helper。
 *
 * 幂等：webhook 通道（AgentMail event_id）与兜底轮询通道（poll:message_id）共用一张
 *      ProcessedWebhookEvent 表，消费前 INSERT OR IGNORE 抢占，未插入 = 已处理。
 *      替代 askUserGate 的内存 Set（重启不丢）。
 *
 * DLQ：处理失败 / 未匹配 pending 的邮件回复落 DeadLetterMail 表，方便事后追查。
 *      不阻断主流程，仅审计。
 */

import type { PrismaClient } from "@prisma/client";

/**
 * 抢占事件：消费前调用，成功 = 本进程认领，false = 已被其他通道/进程处理。
 * SQLite 用 INSERT OR IGNORE（Prisma createMany 不支持 skipDuplicates），
 * 重复投递不抛错，也就不会刷 prisma:error。
 */
export async function claimWebhookEvent(
  prisma: PrismaClient,
  eventId: string,
  source: string,
  kind: string,
): Promise<{ claimed: boolean }> {
  if (!eventId) return { claimed: true }; // 无 event_id 不做幂等（下游状态保护兜底）
  try {
    const inserted = await prisma.$executeRaw`
      INSERT OR IGNORE INTO "ProcessedWebhookEvent" ("id", "source", "kind", "processedAt")
      VALUES (${eventId}, ${source}, ${kind}, ${new Date().toISOString()})
    `;
    return { claimed: Number(inserted) > 0 };
  } catch (err) {
    // 其他错误不阻断（降级为不幂等，下游状态保护兜底）
    console.warn("[webhookIdempotency] claim 异常，降级放行:", err instanceof Error ? err.message : err);
    return { claimed: true };
  }
}

/**
 * 落死信：处理失败 / 未匹配 pending 时调用，仅审计，不阻断。
 */
export async function recordDeadLetterMail(
  prisma: PrismaClient,
  input: {
    messageId?: string;
    threadId?: string;
    inReplyTo?: string;
    subject?: string;
    fromAddr?: string;
    text: string;
    error: string;
    source: "webhook" | "poller";
  },
): Promise<void> {
  try {
    await prisma.deadLetterMail.create({
      data: {
        messageId: input.messageId ?? null,
        threadId: input.threadId ?? null,
        inReplyTo: input.inReplyTo ?? null,
        subject: input.subject ?? null,
        fromAddr: input.fromAddr ?? null,
        text: input.text,
        error: input.error,
        source: input.source,
      },
    });
  } catch (err) {
    // DLQ 落表失败不阻断主流程，仅 warn
    console.warn("[webhookIdempotency] recordDeadLetter 异常:", err instanceof Error ? err.message : err);
  }
}
