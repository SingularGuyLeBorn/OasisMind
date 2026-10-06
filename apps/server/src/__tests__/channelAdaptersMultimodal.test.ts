/**
 * QQ / 微信顶层通道适配器的五类消息契约。
 *
 * 这里故意从 `ChannelAdapter.sendAttachment` 入口发起，而不是只测底层上传 helper：
 * 统一模型里的 `audio` 必须在这一层映射成各平台的 voice 类型；若只测 helper，
 * 很容易出现能力矩阵写着支持音频、实际适配器却把类型传错的假绿。
 * 网络桩只接受真实协议会访问的端点，任何额外或降级成路径文字的请求都会失败。
 */

import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { ChannelAttachment } from "@oasismind/shared";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createQqOfficialBotAdapter } from "../infra/channels/qqOfficialBot.js";
import { __resetQqOfficialMediaForTests } from "../infra/channels/qqOfficialMedia.js";
import {
  __resetWeixinClawBotControllerForTests,
  createWeixinClawBotAdapter,
} from "../infra/channels/weixinClawBot.js";
import { writeWeixinClawBotSession } from "../infra/channels/weixinSession.js";

const MEDIA_CASES = [
  { kind: "image", fileName: "photo.jpg", mimeType: "image/jpeg" },
  { kind: "video", fileName: "clip.mp4", mimeType: "video/mp4" },
  { kind: "audio", fileName: "voice.mp3", mimeType: "audio/mpeg" },
  { kind: "file", fileName: "report.pdf", mimeType: "application/pdf" },
] as const;

function createReadyAttachment(
  kind: ChannelAttachment["kind"],
  fileName: string,
  mimeType: string,
  remoteUrl?: string,
): ChannelAttachment {
  const payload = kind === "text" ? "五类消息测试" : `fixture:${kind}`;
  return {
    type: "channel",
    id: randomUUID(),
    kind,
    fileName,
    mimeType,
    size: Buffer.byteLength(payload),
    sha256: createHash("sha256").update(payload).digest("hex"),
    source: "agent",
    remoteUrl,
    caption: kind === "text" ? payload : undefined,
    status: "ready",
  };
}

describe("QQ / 微信顶层适配器五类消息", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    __resetQqOfficialMediaForTests();
    __resetWeixinClawBotControllerForTests();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    for (const dir of tempDirs.splice(0)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("QQ：text/image/video/audio/file 全部由顶层适配器映射到官方协议", async () => {
    const uploads: Array<{ file_type?: number; file_name?: string }> = [];
    const messages: Array<Record<string, unknown>> = [];
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const target = String(url);
      if (target.includes("getAppAccessToken")) {
        return new Response(JSON.stringify({ access_token: "token", expires_in: 7200 }));
      }
      if (target.startsWith("https://fixtures.example/")) {
        return new Response(Buffer.from(`remote:${path.basename(new URL(target).pathname)}`), {
          status: 200,
        });
      }
      if (target.includes("/files")) {
        const body = JSON.parse(String(init?.body ?? "{}")) as {
          file_type?: number;
          file_name?: string;
        };
        uploads.push(body);
        return new Response(JSON.stringify({ file_info: `file-${uploads.length}` }));
      }
      if (target.includes("/messages")) {
        messages.push(JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>);
        return new Response(JSON.stringify({ id: `message-${messages.length}` }));
      }
      throw new Error(`QQ 测试出现未声明网络请求：${target}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const adapter = createQqOfficialBotAdapter({
      appId: "app-id",
      secret: "app-secret",
      enabled: true,
      allowedOpenIds: ["owner-openid"],
      allowedGroups: [],
      useWs: false,
    });
    expect(adapter.sendAttachment).toBeTypeOf("function");

    await adapter.sendAttachment!(
      { peerId: "owner-openid" },
      createReadyAttachment("text", "message.txt", "text/plain"),
    );
    for (const item of MEDIA_CASES) {
      await adapter.sendAttachment!(
        { peerId: "owner-openid" },
        createReadyAttachment(
          item.kind,
          item.fileName,
          item.mimeType,
          `https://fixtures.example/${item.fileName}`,
        ),
      );
    }

    expect(uploads.map((body) => body.file_type)).toEqual([1, 2, 3, 4]);
    expect(uploads.map((body) => body.file_name)).toEqual(MEDIA_CASES.map((item) => item.fileName));
    expect(messages).toHaveLength(5);
    expect(messages[0]).toMatchObject({ msg_type: 0, content: "五类消息测试" });
    expect(messages.slice(1).map((body) => body.msg_type)).toEqual([7, 7, 7, 7]);
  });

  it("微信：text/image/video/audio/file 全部由顶层适配器映射到 iLink 协议", async () => {
    const sessionDir = fs.mkdtempSync(path.join(os.tmpdir(), "weixin-adapter-five-kinds-"));
    tempDirs.push(sessionDir);
    writeWeixinClawBotSession(sessionDir, {
      botToken: "bot-token",
      baseUrl: "https://ilink.example",
      getUpdatesBuf: "",
      boundUserId: "owner-weixin-id",
      accountId: "account-id",
      lastContextToken: "context-token",
    });

    const uploadRequests: Array<Record<string, unknown>> = [];
    const sentItems: Array<Record<string, unknown>> = [];
    const fetchImpl = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const target = String(url);
      if (target.startsWith("https://fixtures.example/")) {
        return new Response(Buffer.from(`remote:${path.basename(new URL(target).pathname)}`), {
          status: 200,
        });
      }
      if (target.includes("getuploadurl")) {
        uploadRequests.push(JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>);
        return new Response(JSON.stringify({ ret: 0, upload_param: `upload-${uploadRequests.length}` }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (target.includes("/upload?")) {
        expect(init?.method).toBe("POST");
        expect(init?.body).toBeInstanceOf(Uint8Array);
        return new Response("", {
          status: 200,
          headers: { "x-encrypted-param": `encrypted-${uploadRequests.length}` },
        });
      }
      if (target.includes("sendmessage")) {
        const body = JSON.parse(String(init?.body ?? "{}")) as {
          msg?: { item_list?: Array<Record<string, unknown>> };
        };
        sentItems.push(body.msg?.item_list?.[0] ?? {});
        return new Response(JSON.stringify({ ret: 0 }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      throw new Error(`微信测试出现未声明网络请求：${target}`);
    }) as unknown as typeof fetch;

    const adapter = createWeixinClawBotAdapter(
      {
        enabled: true,
        allowedUserIds: ["owner-weixin-id"],
        baseUrl: "https://ilink.example",
        sessionDir,
      },
      { fetchImpl },
    );
    expect(adapter.sendAttachment).toBeTypeOf("function");

    await adapter.sendAttachment!(
      { peerId: "owner-weixin-id" },
      createReadyAttachment("text", "message.txt", "text/plain"),
    );
    for (const item of MEDIA_CASES) {
      await adapter.sendAttachment!(
        { peerId: "owner-weixin-id" },
        createReadyAttachment(
          item.kind,
          item.fileName,
          item.mimeType,
          `https://fixtures.example/${item.fileName}`,
        ),
      );
    }

    // 统一 `audio` 在 iLink 协议里是 voice（上传 media_type=4、消息 type=3）。
    expect(uploadRequests.map((body) => body.media_type)).toEqual([1, 2, 4, 3]);
    expect(sentItems.map((item) => item.type)).toEqual([1, 2, 5, 3, 4]);
    expect(sentItems[0]).toMatchObject({ text_item: { text: "五类消息测试" } });
    expect(sentItems[4]).toMatchObject({ file_item: { file_name: "report.pdf" } });
  });
});
