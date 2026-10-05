/**
 * 统一 IM 出站入口。
 *
 * Agent、自动回复和管理页重试都必须经过这里：先查持久化幂等台账，再把同一份
 * ChannelAttachment 交给渠道适配器。这样业务层不需要猜 QQ/微信各自的上传状态，
 * 也不会因工具重试绕过 sent/uncertain 闸门。事实源是 data 下的传输台账；本模块只允许
 * 已启用适配器发送 ready 附件，能力不符、超限或状态不确定时都显式失败。
 */

import { createHash } from "node:crypto";
import { channelAttachmentSchema, type ChannelAttachment } from "@oasismind/shared";
import {
  getChannelAdapter,
  notifyChannelTransferUpdated,
  type ChannelSendTarget,
  type ImChannel,
} from "../messageGateway.js";
import {
  executeChannelTransfer,
  getChannelTransfer,
  type ChannelTransferExecution,
} from "./channelTransferLedger.js";

export function deriveChannelIdempotencyKey(opts: {
  channel: ImChannel;
  target: ChannelSendTarget;
  sourceTurnId: string;
  attachment: ChannelAttachment;
}): string {
  const raw = [
    "v1",
    opts.channel,
    opts.target.chatId || "private",
    opts.target.peerId,
    opts.sourceTurnId,
    opts.attachment.kind,
    opts.attachment.sha256 || opts.attachment.id,
  ].join("\u001f");
  return `channel:${createHash("sha256").update(raw).digest("hex")}`;
}

export async function sendChannelAttachment(opts: {
  dataDir: string;
  channel: ImChannel;
  target: ChannelSendTarget;
  attachment: ChannelAttachment;
  idempotencyKey: string;
  retry?: boolean;
}): Promise<ChannelTransferExecution> {
  const parsed = channelAttachmentSchema.safeParse(opts.attachment);
  if (!parsed.success) {
    throw new Error(`统一附件无效：${parsed.error.issues.map((issue) => issue.message).join("；")}`);
  }
  if (parsed.data.status !== "ready") {
    throw new Error(`附件状态必须为 ready，当前为 ${parsed.data.status}`);
  }
  const adapter = getChannelAdapter(opts.channel);
  if (!adapter?.enabled) throw new Error(`${opts.channel} 通道未启用`);
  if (!adapter.sendAttachment) throw new Error(`${adapter.name} 尚未实现统一附件出站`);
  if (!adapter.capabilities?.outbound.includes(parsed.data.kind)) {
    throw new Error(`${adapter.name} 不支持发送 ${parsed.data.kind}`);
  }
  if (parsed.data.size !== null && parsed.data.size > (adapter.capabilities?.maxBytes ?? 0)) {
    throw new Error(
      `${adapter.name} 附件上限为 ${adapter.capabilities?.maxBytes ?? 0} 字节，当前为 ${parsed.data.size} 字节`,
    );
  }

  const execution = await executeChannelTransfer({
    dataDir: opts.dataDir,
    idempotencyKey: opts.idempotencyKey,
    channel: opts.channel,
    target: opts.target,
    attachment: parsed.data,
    retry: opts.retry,
    send: () => adapter.sendAttachment!(opts.target, parsed.data),
  });
  await notifyChannelTransferUpdated({
    transferId: execution.record.id,
    channel: execution.record.channel,
    status: execution.record.status,
  });
  return execution;
}

export async function retryChannelTransfer(opts: {
  dataDir: string;
  transferId: string;
}): Promise<ChannelTransferExecution> {
  const record = getChannelTransfer(opts.dataDir, opts.transferId);
  if (!record) throw new Error(`未找到传输记录：${opts.transferId}`);
  if (record.status !== "failed" || !record.retrySafe) {
    throw new Error(
      record.status === "uncertain"
        ? "该传输结果不确定，禁止自动重试以免重复发送；请先到平台核对"
        : `只有 retrySafe=true 的 failed 传输可以重试，当前为 ${record.status}`,
    );
  }
  return sendChannelAttachment({
    dataDir: opts.dataDir,
    channel: record.channel,
    target: record.target,
    attachment: { ...record.attachment, status: "ready", error: undefined },
    idempotencyKey: record.idempotencyKey,
    retry: true,
  });
}
