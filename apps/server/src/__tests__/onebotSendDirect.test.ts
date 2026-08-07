/**
 * 端到端：全局代理开启时，OneBot 回发必须成功（负向：Node fetch+dispatcher 会 fetch failed）。
 * 依赖本机 NapCat HTTP（ONEBOT_HTTP_URL，默认 127.0.0.1:3001）在线。
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setGlobalDispatcher, EnvHttpProxyAgent, fetch as undiciFetch, Agent } from "undici";
import {
  createOneBotAdapter,
  loadOneBotConfigFromEnv,
} from "../infra/channels/onebotBot.js";
import { __resetProxyForTests, initGlobalProxy } from "../infra/proxyDispatcher.js";

const httpUrl = (process.env.ONEBOT_HTTP_URL || "http://127.0.0.1:3001").replace(/\/$/, "");
const owner = (process.env.ONEBOT_QQ_OWNER || process.env.ONEBOT_ALLOWED_USERS || "2635495642")
  .split(",")[0]
  .trim();

describe("onebot 回发直连（代理开启）", () => {
  let napcatUp = false;

  beforeAll(async () => {
    process.env.ONEBOT_SEND_MIN_INTERVAL_MS = "0";
    process.env.KP_HTTPS_PROXY = "http://127.0.0.1:7890";
    __resetProxyForTests();
    initGlobalProxy();
    try {
      const r = await undiciFetch(`${httpUrl}/get_login_info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
        dispatcher: new Agent(),
      });
      napcatUp = r.status === 200;
    } catch {
      napcatUp = false;
    }
  });

  afterAll(() => {
    __resetProxyForTests();
  });

  it("负向：Node 全局 fetch 塞 undici Agent → fetch failed", async () => {
    if (!napcatUp) return;
    await expect(
      fetch(`${httpUrl}/get_login_info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
        // @ts-expect-error 复现错误用法
        dispatcher: new Agent(),
      }),
    ).rejects.toThrow(/fetch failed/);
  });

  it("adapter.sendOneBotApi get_login_info 成功", async () => {
    if (!napcatUp) {
      console.warn("[skip] NapCat 未在线");
      return;
    }
    const cfg = {
      ...loadOneBotConfigFromEnv(),
      httpUrl,
      enabled: true,
      allowedUsers: [owner],
      qqAccount: process.env.ONEBOT_QQ_ACCOUNT || "2871732121",
    };
    const adapter = createOneBotAdapter(cfg) as ReturnType<typeof createOneBotAdapter> & {
      sendOneBotApi: (ep: string, p: Record<string, unknown>) => Promise<{ data?: { user_id?: number }; retcode?: number }>;
    };
    await adapter.start();
    const info = await adapter.sendOneBotApi("/get_login_info", {});
    expect(info.retcode ?? 0).toBe(0);
    expect(String(info.data?.user_id || "")).toMatch(/^\d+$/);
    await adapter.stop();
  }, 20_000);

  it("adapter.sendOneBotApi send_private_msg 成功（真实回发）", async () => {
    if (!napcatUp) {
      console.warn("[skip] NapCat 未在线");
      return;
    }
    const cfg = {
      ...loadOneBotConfigFromEnv(),
      httpUrl,
      enabled: true,
      allowedUsers: [owner],
      qqAccount: process.env.ONEBOT_QQ_ACCOUNT || "2871732121",
    };
    const adapter = createOneBotAdapter(cfg) as ReturnType<typeof createOneBotAdapter> & {
      sendOneBotApi: (ep: string, p: Record<string, unknown>) => Promise<{ data?: { message_id?: number }; retcode?: number; status?: string }>;
      reply: (
        msg: {
          envelope: { channel: "onebot"; peerId: string; chatId?: string; timestamp: string };
          payload: { text: string };
          meta: { eventId: string };
        },
        chunk: { text: string; finish: boolean },
      ) => Promise<void>;
    };
    await adapter.start();

    const probe = `[OasisMind] e2e reply probe ${new Date().toISOString()}`;
    const raw = await adapter.sendOneBotApi("/send_private_msg", {
      user_id: Number(owner),
      message: probe,
    });
    expect(raw.retcode ?? 0).toBe(0);
    expect(raw.data?.message_id).toBeTruthy();

    // 再走 reply() 完整路径（finish 才发）
    await adapter.reply(
      {
        envelope: {
          channel: "onebot",
          peerId: owner,
          timestamp: new Date().toISOString(),
        },
        payload: { text: "ping" },
        meta: { eventId: `e2e-${Date.now()}` },
      },
      { text: `[OasisMind] reply() path ok ${new Date().toISOString()}`, finish: true },
    );
    await adapter.stop();
  }, 30_000);
});
