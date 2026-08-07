/**
 * 出站限速：两条消息间隔 ≥ ONEBOT_SEND_MIN_INTERVAL_MS（默认 5s）。
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  createOneBotAdapter,
  __resetOneBotOutboundPaceForTests,
  outboundMinIntervalMs,
} from "../infra/channels/onebotBot.js";

describe("onebot 出站限速", () => {
  const prev = process.env.ONEBOT_SEND_MIN_INTERVAL_MS;

  beforeEach(() => {
    process.env.ONEBOT_SEND_MIN_INTERVAL_MS = "200";
    __resetOneBotOutboundPaceForTests();
  });

  afterEach(() => {
    if (prev === undefined) delete process.env.ONEBOT_SEND_MIN_INTERVAL_MS;
    else process.env.ONEBOT_SEND_MIN_INTERVAL_MS = prev;
    __resetOneBotOutboundPaceForTests();
    vi.unstubAllGlobals();
  });

  it("outboundMinIntervalMs 读 env", () => {
    expect(outboundMinIntervalMs()).toBe(200);
  });

  it("两次 send_private_msg 间隔 ≥ 200ms", async () => {
    const times: number[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        // unused — we use undici inside
        return new Response("{}");
      }),
    );

    // 拦截 undici：通过 mock send 路径 —— 直接 monkey patch adapter 内部难；
    // 改为 spy HTTP：用自定义 httpUrl 指向本地假服务
    const { createServer } = await import("node:http");
    const hits: number[] = [];
    const server = createServer((req, res) => {
      hits.push(Date.now());
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", retcode: 0, data: { message_id: hits.length } }));
    });
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", () => r()));
    const addr = server.address();
    if (!addr || typeof addr === "string") throw new Error("no port");
    const httpUrl = `http://127.0.0.1:${addr.port}`;

    const adapter = createOneBotAdapter({
      httpUrl,
      accessToken: "",
      secret: "",
      enabled: true,
      allowedUsers: ["1"],
      allowedGroups: [],
      groupMessageTypes: ["text"],
      groupRequireAt: true,
    }) as ReturnType<typeof createOneBotAdapter> & {
      sendOneBotApi: (ep: string, p: Record<string, unknown>) => Promise<unknown>;
    };

    const t0 = Date.now();
    await Promise.all([
      adapter.sendOneBotApi("/send_private_msg", { user_id: 1, message: "a" }),
      adapter.sendOneBotApi("/send_private_msg", { user_id: 1, message: "b" }),
    ]);
    const elapsed = Date.now() - t0;
    expect(hits).toHaveLength(2);
    expect(hits[1]! - hits[0]!).toBeGreaterThanOrEqual(180);
    expect(elapsed).toBeGreaterThanOrEqual(180);

    await new Promise<void>((r) => server.close(() => r()));
  }, 15_000);

  it("delete_msg 不占用发信间隔（可立刻撤）", async () => {
    const { createServer } = await import("node:http");
    const hits: Array<{ url: string; at: number }> = [];
    const server = createServer((req, res) => {
      hits.push({ url: req.url || "", at: Date.now() });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", retcode: 0, data: {} }));
    });
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", () => r()));
    const addr = server.address();
    if (!addr || typeof addr === "string") throw new Error("no port");
    const httpUrl = `http://127.0.0.1:${addr.port}`;

    const adapter = createOneBotAdapter({
      httpUrl,
      accessToken: "",
      secret: "",
      enabled: true,
      allowedUsers: ["1"],
      allowedGroups: [],
      groupMessageTypes: ["text"],
      groupRequireAt: true,
    }) as ReturnType<typeof createOneBotAdapter> & {
      sendOneBotApi: (ep: string, p: Record<string, unknown>) => Promise<unknown>;
      deleteMessage: (id: string | number) => Promise<unknown>;
    };

    await adapter.sendOneBotApi("/send_private_msg", { user_id: 1, message: "x" });
    const t1 = Date.now();
    await adapter.deleteMessage(12345);
    expect(Date.now() - t1).toBeLessThan(150);
    expect(hits.some((h) => h.url?.includes("delete_msg"))).toBe(true);

    await new Promise<void>((r) => server.close(() => r()));
  }, 15_000);
});
