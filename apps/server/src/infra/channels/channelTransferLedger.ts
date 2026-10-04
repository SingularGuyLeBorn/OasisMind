/**
 * IM 出站传输台账。
 *
 * 事实源位于 data/channel-transfers/，每个幂等键一份原子 JSON；它不进入 Git，也不依赖
 * 可重建的 SQLite。状态只允许 pending → uploading → sent/failed/uncertain：sent 永不重发，
 * failed 只有显式 retry 才重试，网络超时等结果不确定的请求标 uncertain 并拒绝自动重试，
 * 从而避免“平台其实收到了，但本机没收到响应”造成重复消息。
 */

import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { channelAttachmentSchema, type ChannelAttachment } from "@oasismind/shared";
import type { ImChannel } from "../messageGateway.js";

export type ChannelTransferStatus =
  | "pending"
  | "uploading"
  | "sent"
  | "failed"
  | "uncertain";

export type ChannelTransferTarget = {
  peerId: string;
  chatId?: string;
  replyTo?: string;
  quote?: boolean;
  mentionPeerIds?: string[];
};

export type ChannelTransferRecord = {
  id: string;
  idempotencyKey: string;
  channel: ImChannel;
  target: ChannelTransferTarget;
  attachment: ChannelAttachment;
  status: ChannelTransferStatus;
  attempts: number;
  retrySafe: boolean;
  error?: string;
  platformResult?: unknown;
  createdAt: string;
  updatedAt: string;
};

export type ChannelTransferExecution = {
  record: ChannelTransferRecord;
  duplicate: boolean;
};

const lockTails = new Map<string, Promise<void>>();

function transferDir(dataDir: string): string {
  return path.join(dataDir, "channel-transfers");
}

function recordPath(dataDir: string, idempotencyKey: string): string {
  const name = createHash("sha256").update(idempotencyKey).digest("hex");
  return path.join(transferDir(dataDir), `${name}.json`);
}

function writeRecord(dataDir: string, record: ChannelTransferRecord): void {
  const file = recordPath(dataDir, record.idempotencyKey);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.${randomUUID()}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(record, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  fs.renameSync(temp, file);
}

function parseRecord(raw: unknown): ChannelTransferRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Partial<ChannelTransferRecord>;
  const attachment = channelAttachmentSchema.safeParse(value.attachment);
  if (
    !attachment.success ||
    typeof value.id !== "string" ||
    typeof value.idempotencyKey !== "string" ||
    !["qq", "weixin", "feishu", "telegram", "onebot"].includes(String(value.channel)) ||
    !value.target ||
    typeof value.target.peerId !== "string" ||
    !["pending", "uploading", "sent", "failed", "uncertain"].includes(String(value.status))
  ) {
    return null;
  }
  return { ...value, attachment: attachment.data } as ChannelTransferRecord;
}

function readRecordFile(file: string): ChannelTransferRecord | null {
  try {
    return parseRecord(JSON.parse(fs.readFileSync(file, "utf8")));
  } catch {
    return null;
  }
}

function jsonSafe(value: unknown): unknown {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return String(value);
  }
}

/** 4xx/本地校验是明确失败；超时、断网和 5xx 可能已经送达，必须标记 uncertain。 */
export function classifyChannelTransferError(error: unknown): {
  status: Extract<ChannelTransferStatus, "failed" | "uncertain">;
  retrySafe: boolean;
  message: string;
} {
  const message = error instanceof Error ? error.message : String(error);
  const uncertain = /timeout|timed out|abort|ECONN|ENET|socket|network|fetch failed|HTTP 5\d\d/i.test(message);
  return uncertain
    ? { status: "uncertain", retrySafe: false, message }
    : { status: "failed", retrySafe: true, message };
}

async function withKeyLock<T>(key: string, run: () => Promise<T>): Promise<T> {
  const waitFor = lockTails.get(key) ?? Promise.resolve();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const tail = waitFor.then(() => gate);
  lockTails.set(key, tail);
  await waitFor;
  try {
    return await run();
  } finally {
    release();
    if (lockTails.get(key) === tail) lockTails.delete(key);
  }
}

export function getChannelTransfer(
  dataDir: string,
  idOrIdempotencyKey: string,
): ChannelTransferRecord | null {
  const direct = recordPath(dataDir, idOrIdempotencyKey);
  if (fs.existsSync(direct)) return readRecordFile(direct);
  const dir = transferDir(dataDir);
  if (!fs.existsSync(dir)) return null;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith(".json")) continue;
    const record = readRecordFile(path.join(dir, name));
    if (record?.id === idOrIdempotencyKey) return record;
  }
  return null;
}

export function listChannelTransfers(dataDir: string, limit = 50): ChannelTransferRecord[] {
  const dir = transferDir(dataDir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => readRecordFile(path.join(dir, name)))
    .filter((record): record is ChannelTransferRecord => record !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, Math.max(1, Math.min(limit, 200)));
}

export async function executeChannelTransfer(opts: {
  dataDir: string;
  idempotencyKey: string;
  channel: ImChannel;
  target: ChannelTransferTarget;
  attachment: ChannelAttachment;
  retry?: boolean;
  send: () => Promise<unknown>;
}): Promise<ChannelTransferExecution> {
  return withKeyLock(opts.idempotencyKey, async () => {
    const existing = getChannelTransfer(opts.dataDir, opts.idempotencyKey);
    if (existing?.status === "sent" || existing?.status === "uploading" || existing?.status === "uncertain") {
      return { record: existing, duplicate: true };
    }
    if (existing?.status === "failed" && !opts.retry) {
      return { record: existing, duplicate: true };
    }

    const now = new Date().toISOString();
    const base: ChannelTransferRecord = existing ?? {
      id: randomUUID(),
      idempotencyKey: opts.idempotencyKey,
      channel: opts.channel,
      target: opts.target,
      attachment: opts.attachment,
      status: "pending",
      attempts: 0,
      retrySafe: true,
      createdAt: now,
      updatedAt: now,
    };
    const uploading: ChannelTransferRecord = {
      ...base,
      target: opts.target,
      attachment: { ...opts.attachment, status: "uploading", updatedAt: now },
      status: "uploading",
      attempts: base.attempts + 1,
      retrySafe: false,
      error: undefined,
      updatedAt: now,
    };
    writeRecord(opts.dataDir, uploading);

    try {
      const result = await opts.send();
      const sentAt = new Date().toISOString();
      const sent: ChannelTransferRecord = {
        ...uploading,
        attachment: { ...opts.attachment, status: "sent", updatedAt: sentAt },
        status: "sent",
        retrySafe: false,
        platformResult: jsonSafe(result),
        updatedAt: sentAt,
      };
      writeRecord(opts.dataDir, sent);
      return { record: sent, duplicate: false };
    } catch (error) {
      const failure = classifyChannelTransferError(error);
      const failedAt = new Date().toISOString();
      const failed: ChannelTransferRecord = {
        ...uploading,
        attachment: {
          ...opts.attachment,
          status: "failed",
          error: failure.message,
          updatedAt: failedAt,
        },
        status: failure.status,
        retrySafe: failure.retrySafe,
        error: failure.message,
        updatedAt: failedAt,
      };
      writeRecord(opts.dataDir, failed);
      return { record: failed, duplicate: false };
    }
  });
}
