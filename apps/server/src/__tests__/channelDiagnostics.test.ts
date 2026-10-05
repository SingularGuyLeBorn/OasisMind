/**
 * 通道体检使用严格 HTTP fixture：验证真实请求形状、无消息发送，以及报告不泄露凭据。
 */
import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTempProjectDir } from "./helpers/toolTestFixtures.js";
import {
  probeChannel,
  type ChannelProbeReport,
} from "../infra/channels/channelDiagnostics.js";
import { __resetQqOfficialMediaForTests } from "../infra/channels/qqOfficialMedia.js";
import { parseChannelProbeArgs } from "../scripts/channel-probe.js";

const tempDirs: string[] = [];

afterEach(() => {
  __resetQqOfficialMediaForTests();
  for (const dir of tempDirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

function qqConfig() {
  return {
    appId: "app-id-secret-looking",
    secret: "super-secret-value",
    enabled: true,
    allowedOpenIds: ["owner-openid"],
    allowedGroups: [],
    useWs: true,
  };
}

function expectNoSecret(report: ChannelProbeReport): void {
  const serialized = JSON.stringify(report);
  expect(serialized).not.toContain("super-secret-value");
  expect(serialized).not.toContain("real-access-token");
  expect(serialized).not.toContain("bot-token-private");
  expect(serialized).not.toContain("upload-param-private");
}

describe("channelDiagnostics", () => {
  it("QQ 本地体检不访问网络，只报告配置和五类附件能力", async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    const report = await probeChannel("qq", {
      live: false,
      qqConfig: qqConfig(),
      fetchImpl,
    });

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(report).toMatchObject({ channel: "qq", live: false, configured: true, authenticated: null });
    expect(report.capabilities.inbound).toEqual(["text", "image", "video", "audio", "file"]);
    expect(report.capabilities.outbound).toEqual(report.capabilities.inbound);
    expectNoSecret(report);
  });

  it("QQ 真实体检只取 token 和 gateway，不发送消息", async () => {
    const calls: Array<{ url: string; method: string; body: string }> = [];
    const fetchImpl = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      calls.push({ url, method: String(init?.method || "GET"), body: String(init?.body || "") });
      if (url.includes("getAppAccessToken")) {
        return new Response(JSON.stringify({ access_token: "real-access-token", expires_in: 7200 }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (url.endsWith("/gateway")) {
        expect((init?.headers as Record<string, string>).Authorization).toBe("QQBot real-access-token");
        return new Response(JSON.stringify({ url: "wss://gateway.example/ws" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      return new Response("not found", { status: 404 });
    }) as unknown as typeof fetch;

    const report = await probeChannel("qq", {
      live: true,
      qqConfig: qqConfig(),
      fetchImpl,
    });

    expect(report).toMatchObject({ ok: true, authenticated: true });
    expect(calls.map((call) => call.url)).toEqual([
      expect.stringContaining("getAppAccessToken"),
      expect.stringMatching(/\/gateway$/),
    ]);
    expect(calls.some((call) => /messages|send/i.test(call.url))).toBe(false);
    expectNoSecret(report);
  });

  it("微信有会话时只申请测试上传槽，不上传也不发消息", async () => {
    const root = createTempProjectDir();
    tempDirs.push(root);
    const sessionDir = path.join(root, "weixin-clawbot");
    fs.mkdirSync(sessionDir, { recursive: true });
    fs.writeFileSync(
      path.join(sessionDir, "session.json"),
      JSON.stringify({
        botToken: "bot-token-private",
        baseUrl: "https://ilink.example",
        getUpdatesBuf: "cursor-private",
        boundUserId: "owner-user",
        accountId: "account-private",
        lastContextToken: "context-private",
      }),
      "utf8",
    );
    const calls: string[] = [];
    const fetchImpl = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      calls.push(url);
      expect(url).toContain("getuploadurl");
      const body = JSON.parse(String(init?.body || "{}")) as Record<string, unknown>;
      expect(body).toMatchObject({ to_user_id: "owner-user", rawsize: 1, filesize: 16 });
      return new Response(JSON.stringify({ ret: 0, upload_param: "upload-param-private" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as unknown as typeof fetch;

    const report = await probeChannel("weixin", {
      live: true,
      weixinConfig: {
        enabled: true,
        allowedUserIds: [],
        baseUrl: "https://ilink.example",
        sessionDir,
      },
      fetchImpl,
    });

    expect(report).toMatchObject({ ok: true, configured: true, authenticated: true });
    expect(calls).toHaveLength(1);
    expect(calls[0]).not.toContain("sendmessage");
    expect(calls[0]).not.toContain("/upload?");
    expectNoSecret(report);
  });

  it("微信无会话时真实体检只验证二维码端点，并明确要求扫码", async () => {
    const root = createTempProjectDir();
    tempDirs.push(root);
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      expect(String(input)).toContain("get_bot_qrcode");
      return new Response(JSON.stringify({ ret: 0, qrcode: "temporary-qr" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as unknown as typeof fetch;

    const report = await probeChannel("weixin", {
      live: true,
      weixinConfig: {
        enabled: true,
        allowedUserIds: [],
        baseUrl: "https://ilink.example",
        sessionDir: path.join(root, "weixin-clawbot"),
      },
      fetchImpl,
    });

    expect(report).toMatchObject({ ok: false, configured: false, authenticated: false });
    expect(report.nextAction).toMatch(/扫码/);
    expect(JSON.stringify(report)).not.toContain("temporary-qr");
  });
});

describe("channel-probe CLI 参数", () => {
  it("支持单通道、真实探测和 JSON 输出", () => {
    expect(parseChannelProbeArgs(["--channel", "qq", "--live", "--json"])).toEqual({
      channel: "qq",
      live: true,
      json: true,
      help: false,
    });
  });

  it("非法通道和未知参数直接报错", () => {
    expect(() => parseChannelProbeArgs(["--channel", "telegram"])).toThrow(/qq、weixin/);
    expect(() => parseChannelProbeArgs(["--send"])).toThrow(/未知参数/);
  });
});

