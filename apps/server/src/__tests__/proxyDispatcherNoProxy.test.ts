/**
 * 负向：全局代理不得劫持 loopback（否则本机 webhook / 健康检查会 502）。
 * 用临时 HTTP 服务代替已退役的 NapCat/OneBot，CI 不再永久 skip。
 */

import { createServer, type Server } from "node:http";
import { describe, it, expect, afterEach, beforeAll, afterAll } from "vitest";
import { fetch as undiciFetch, Agent, EnvHttpProxyAgent } from "undici";
import {
  __resetProxyForTests,
  getDirectDispatcher,
  initGlobalProxy,
  isLoopbackUrl,
} from "../infra/proxyDispatcher.js";

function listenLoopback(): Promise<{ server: Server; url: string }> {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, path: req.url }));
    });
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") {
        reject(new Error("loopback server 未拿到端口"));
        return;
      }
      resolve({ server, url: `http://127.0.0.1:${addr.port}/health` });
    });
    server.on("error", reject);
  });
}

describe("proxyDispatcher loopback 绕过", () => {
  let loopback: { server: Server; url: string };

  beforeAll(async () => {
    loopback = await listenLoopback();
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => loopback.server.close(() => resolve()));
  });

  afterEach(() => {
    delete process.env.OM_HTTPS_PROXY;
    delete process.env.HTTPS_PROXY;
    delete process.env.HTTP_PROXY;
    delete process.env.OM_HTTP_PROXY;
    __resetProxyForTests();
  });

  it("isLoopbackUrl 识别本机", () => {
    expect(isLoopbackUrl("http://127.0.0.1:3001/send_private_msg")).toBe(true);
    expect(isLoopbackUrl("http://localhost:3001/x")).toBe(true);
    expect(isLoopbackUrl("https://api.deepseek.com/v1")).toBe(false);
  });

  it("直连 Agent 能打到本机 loopback", async () => {
    const direct = await undiciFetch(loopback.url, { dispatcher: new Agent() });
    expect(direct.status).toBe(200);
    const json = (await direct.json()) as { ok?: boolean };
    expect(json.ok).toBe(true);
  });

  it("initGlobalProxy 把 loopback 写进 NO_PROXY，直连 dispatcher 仍通", async () => {
    process.env.OM_HTTPS_PROXY = "http://127.0.0.1:9";
    __resetProxyForTests();
    const { proxyUrl } = initGlobalProxy();
    expect(proxyUrl).toBe("http://127.0.0.1:9");
    expect(process.env.NO_PROXY || "").toMatch(/127\.0\.0\.1/);

    const res = await undiciFetch(loopback.url, { dispatcher: getDirectDispatcher() });
    expect(res.status).toBe(200);
  });

  it("EnvHttpProxyAgent noProxy 对本机不走代理", async () => {
    const d = new EnvHttpProxyAgent({
      httpProxy: "http://127.0.0.1:9",
      httpsProxy: "http://127.0.0.1:9",
      noProxy: "localhost,127.0.0.1,::1",
    });
    const res = await undiciFetch(loopback.url, { dispatcher: d });
    expect(res.status).toBe(200);
  });
});
