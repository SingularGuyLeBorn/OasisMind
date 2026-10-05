/** 统一出站台账的离线状态机测试：以临时 data 目录为事实源，不调用真实 QQ/微信。 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTextChannelAttachment } from "../infra/channels/channelAttachment.js";
import {
  executeChannelTransfer,
  getChannelTransfer,
  listChannelTransfers,
} from "../infra/channels/channelTransferLedger.js";

describe("channelTransferLedger", () => {
  const roots: string[] = [];

  afterEach(() => {
    for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
  });

  function tempDataDir(): string {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "om-channel-transfer-"));
    roots.push(root);
    return root;
  }

  it("同一幂等键并发只发送一次，后续直接返回 sent 记录", async () => {
    const dataDir = tempDataDir();
    const send = vi.fn(async () => ({ messageId: "m1" }));
    const attachment = createTextChannelAttachment({ text: "hello" });
    const request = {
      dataDir,
      idempotencyKey: "same-message",
      channel: "qq" as const,
      target: { peerId: "u1" },
      attachment,
      send,
    };

    const [first, second] = await Promise.all([
      executeChannelTransfer(request),
      executeChannelTransfer(request),
    ]);

    expect(send).toHaveBeenCalledTimes(1);
    expect([first.duplicate, second.duplicate].sort()).toEqual([false, true]);
    expect(first.record.status).toBe("sent");
    expect(getChannelTransfer(dataDir, first.record.id)?.status).toBe("sent");
    expect(listChannelTransfers(dataDir)).toHaveLength(1);
  });

  it("明确失败须显式 retry，成功后不再重复发送", async () => {
    const dataDir = tempDataDir();
    const send = vi
      .fn<() => Promise<unknown>>()
      .mockRejectedValueOnce(new Error("HTTP 400 unsupported format"))
      .mockResolvedValueOnce({ messageId: "m2" });
    const base = {
      dataDir,
      idempotencyKey: "retry-message",
      channel: "weixin" as const,
      target: { peerId: "u2" },
      attachment: createTextChannelAttachment({ text: "retry" }),
      send,
    };

    const failed = await executeChannelTransfer(base);
    const blocked = await executeChannelTransfer(base);
    const retried = await executeChannelTransfer({ ...base, retry: true });
    const deduped = await executeChannelTransfer({ ...base, retry: true });

    expect(failed.record).toMatchObject({ status: "failed", retrySafe: true, attempts: 1 });
    expect(blocked.duplicate).toBe(true);
    expect(retried.record).toMatchObject({ status: "sent", attempts: 2 });
    expect(deduped.duplicate).toBe(true);
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("超时标为 uncertain，重复调用不会冒险重发", async () => {
    const dataDir = tempDataDir();
    const send = vi.fn(async () => {
      throw new Error("fetch failed: socket timeout");
    });
    const request = {
      dataDir,
      idempotencyKey: "uncertain-message",
      channel: "qq" as const,
      target: { peerId: "u3" },
      attachment: createTextChannelAttachment({ text: "maybe" }),
      send,
    };

    const first = await executeChannelTransfer(request);
    const second = await executeChannelTransfer({ ...request, retry: true });

    expect(first.record).toMatchObject({ status: "uncertain", retrySafe: false });
    expect(second.duplicate).toBe(true);
    expect(send).toHaveBeenCalledTimes(1);
  });
});
