/**
 * 负向：全局代理不得劫持 loopback（否则 OneBot 回发 502、QQ 只进不出）。
 */

import { describe, it, expect, afterEach, beforeAll } from "vitest";
import { ProxyAgent, fetch as undiciFetch, Agent, EnvHttpProxyAgent } from "undici";
import {
  __resetProxyForTests,
  getDirectDispatcher,
  initGlobalProxy,
  isLoopbackUrl,
} from "../infra/proxyDispatcher.js";

describe("proxyDispatcher loopback 绕过", () => {
  // 集成用例依赖本机 OneBot @ 127.0.0.1:3001（QQ bot 服务）；服务不在时跳过而非报错
  let onebotUp = false;
  beforeAll(async () => {
    try {
      const res = await undiciFetch("http://127.0.0.1:3001/get_login_info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
        signal: AbortSignal.timeout(2000),
      });
      onebotUp = res.status === 200;
    } catch {
      onebotUp = false;
    }
    if (!onebotUp) {
      console.warn("[proxyDispatcherNoProxy] OneBot @ 127.0.0.1:3001 不可达，跳过集成用例");
    }
  });

  afterEach(() => {
    delete process.env.KP_HTTPS_PROXY;
    delete process.env.HTTPS_PROXY;
    delete process.env.HTTP_PROXY;
    delete process.env.KP_HTTP_PROXY;
    __resetProxyForTests();
  });

  it("isLoopbackUrl 识别本机", () => {
    expect(isLoopbackUrl("http://127.0.0.1:3001/send_private_msg")).toBe(true);
    expect(isLoopbackUrl("http://localhost:3001/x")).toBe(true);
    expect(isLoopbackUrl("https://api.deepseek.com/v1")).toBe(false);
  });

  it("ProxyAgent 走 Clash 打本机 OneBot → 502；直连 Agent → 200", async (ctx) => {
    if (!onebotUp) return ctx.skip();
    const url = "http://127.0.0.1:3001/get_login_info";
    const body = "{}";
    const headers = { "Content-Type": "application/json" };

    let viaProxyStatus: number | null = null;
    try {
      const viaProxy = await undiciFetch(url, {
        method: "POST",
        headers,
        body,
        dispatcher: new ProxyAgent("http://127.0.0.1:7890"),
      });
      viaProxyStatus = viaProxy.status;
    } catch {
      viaProxyStatus = -1; // 代理挂了也算「不能当本机通道」
    }
    // Clash 对本机转发常见 502；若本机没开 Clash 则可能连接失败(-1)
    expect(viaProxyStatus === 502 || viaProxyStatus === -1 || viaProxyStatus === 503).toBe(true);

    const direct = await undiciFetch(url, {
      method: "POST",
      headers,
      body,
      dispatcher: new Agent(),
    });
    expect(direct.status).toBe(200);
    const json = (await direct.json()) as { retcode?: number };
    expect(json.retcode).toBe(0);
  }, 15_000);

  it("initGlobalProxy + EnvHttpProxyAgent 对本机 get_login_info 直连成功", async (ctx) => {
    if (!onebotUp) return ctx.skip();
    process.env.KP_HTTPS_PROXY = "http://127.0.0.1:7890";
    __resetProxyForTests();
    const { proxyUrl } = initGlobalProxy();
    expect(proxyUrl).toBe("http://127.0.0.1:7890");
    expect(process.env.NO_PROXY || "").toMatch(/127\.0\.0\.1/);

    // 全局 fetch（无错误 dispatcher）应绕过代理直连本机
    const res = await fetch("http://127.0.0.1:3001/get_login_info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    expect(res.status).toBe(200);

    // undici.fetch + 直连 Agent（OneBot 正式路径）
    const res2 = await undiciFetch("http://127.0.0.1:3001/get_login_info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      dispatcher: getDirectDispatcher(),
    });
    expect(res2.status).toBe(200);

    // 负向：Node fetch + dispatcher:Agent 必炸（曾导致 QQ 只进不出）
    await expect(
      fetch("http://127.0.0.1:3001/get_login_info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
        // @ts-expect-error 错误用法
        dispatcher: getDirectDispatcher(),
      }),
    ).rejects.toThrow(/fetch failed/);
  }, 15_000);

  it("EnvHttpProxyAgent noProxy 对本机不走代理", async (ctx) => {
    if (!onebotUp) return ctx.skip();
    const d = new EnvHttpProxyAgent({
      httpProxy: "http://127.0.0.1:7890",
      httpsProxy: "http://127.0.0.1:7890",
      noProxy: "localhost,127.0.0.1,::1",
    });
    const res = await undiciFetch("http://127.0.0.1:3001/get_login_info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      dispatcher: d,
    });
    expect(res.status).toBe(200);
  }, 15_000);
});
