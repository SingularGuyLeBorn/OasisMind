/**
 * QQ 官方 Bot Adapter：ingest / 白名单 / 终稿回发 / Identify intents。
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  QQ_GROUP_AND_C2C_INTENT,
  buildQqIdentifyPayload,
  createQqOfficialBotAdapter,
  expandAllowedIds,
  isQqInboundAllowed,
  parseQqIdOpenIdMap,
  parseQqInboundPayload,
  qqReplyPlainText,
} from "../infra/channels/qqOfficialBot.js";
import type { UnifiedMessage } from "../infra/messageGateway.js";
import * as messageGateway from "../infra/messageGateway.js";

describe("qqOfficialBot helpers", () => {
  it("GROUP_AND_C2C intent 为 1<<25", () => {
    expect(QQ_GROUP_AND_C2C_INTENT).toBe(1 << 25);
    expect(QQ_GROUP_AND_C2C_INTENT).toBe(33_554_432);
  });

  it("buildQqIdentifyPayload 含正确 intents 与 token 前缀", () => {
    const frame = buildQqIdentifyPayload("tok-abc");
    expect(frame.op).toBe(2);
    expect(frame.d.intents).toBe(QQ_GROUP_AND_C2C_INTENT);
    expect(frame.d.token).toBe("QQBot tok-abc");
    expect(frame.d.shard).toEqual([0, 1]);
  });

  it("parseQqInboundPayload：扁平与 d 包装", () => {
    const flat = parseQqInboundPayload({
      author: { user_openid: "u1" },
      content: "你好 <@!123>",
      id: "m1",
    });
    expect(flat).toMatchObject({
      openid: "u1",
      content: "你好",
      msgId: "m1",
      groupOpenid: undefined,
      hasMediaHint: false,
    });
    expect("error" in flat ? null : flat.rawD).toBeTruthy();

    const wrapped = parseQqInboundPayload({
      d: {
        author: { member_openid: "u2" },
        content: "群消息",
        id: "m2",
        group_openid: "g9",
      },
    });
    expect(wrapped).toMatchObject({
      openid: "u2",
      content: "群消息",
      msgId: "m2",
      groupOpenid: "g9",
      hasMediaHint: false,
    });
  });

  it("parseQqInboundPayload：纯图/引用附件可无文字", () => {
    const imgOnly = parseQqInboundPayload({
      author: { user_openid: "u1" },
      content: "",
      id: "m-img",
      attachments: [{ url: "https://example.com/a.jpg", content_type: "image/jpeg" }],
    });
    expect(imgOnly).toMatchObject({
      openid: "u1",
      content: "",
      msgId: "m-img",
      hasMediaHint: true,
    });

    const quoted = parseQqInboundPayload({
      d: {
        author: { member_openid: "u2" },
        content: "看看这张",
        id: "m-q",
        group_openid: "g9",
        msg_elements: [
          {
            content: "原图说明",
            attachments: [{ url: "https://example.com/b.png", content_type: "image/png" }],
          },
        ],
      },
    });
    expect(quoted).toMatchObject({
      openid: "u2",
      content: "看看这张",
      hasMediaHint: true,
      groupOpenid: "g9",
    });
  });

  it("parseQqInboundPayload：缺字段报错", () => {
    expect(parseQqInboundPayload({ content: "x" })).toEqual({ error: "缺 openid" });
    expect(parseQqInboundPayload({ author: { user_openid: "u" } })).toEqual({
      error: "缺 openid/content",
    });
  });

  it("qqReplyPlainText 去 Markdown 并截断", () => {
    expect(qqReplyPlainText("**粗体** 与 `code`")).toBe("粗体 与 code");
    expect(qqReplyPlainText("a".repeat(5000)).length).toBe(4000);
  });

  it("isQqInboundAllowed：指定人×指定群", () => {
    const cfg = {
      allowedOpenIds: ["u1"],
      allowedGroups: ["g1"],
    };
    expect(isQqInboundAllowed(cfg, { openid: "u1" }).ok).toBe(true);
    expect(isQqInboundAllowed(cfg, { openid: "u2" }).ok).toBe(false);
    expect(isQqInboundAllowed(cfg, { openid: "u1", groupOpenid: "g1" }).ok).toBe(true);
    expect(isQqInboundAllowed(cfg, { openid: "u1", groupOpenid: "g2" }).ok).toBe(false);
    expect(isQqInboundAllowed(cfg, { openid: "u2", groupOpenid: "g1" }).ok).toBe(false);
    expect(
      isQqInboundAllowed({ allowedOpenIds: ["u1"], allowedGroups: [] }, { openid: "u1", groupOpenid: "g1" })
        .ok,
    ).toBe(false);
    expect(
      isQqInboundAllowed({ allowedOpenIds: ["u1"], allowedGroups: ["*"] }, { openid: "u1", groupOpenid: "any" })
        .ok,
    ).toBe(true);
  });

  it("QQ 号 / 群号经 MAP 展开后白名单命中", () => {
    const userMap = parseQqIdOpenIdMap("2251061018=14A17D731DD2B1A0CC57FC8EDBFFC50B");
    const users = expandAllowedIds(["2251061018"], userMap, "OPENIDS");
    expect(users).toContain("14A17D731DD2B1A0CC57FC8EDBFFC50B");
    expect(users).toContain("2251061018");

    const groupMap = parseQqIdOpenIdMap("1098299609=2FE7E7758E29000B46A733B8761EB887");
    const groups = expandAllowedIds(["1098299609"], groupMap, "GROUPS");
    expect(
      isQqInboundAllowed(
        { allowedOpenIds: users, allowedGroups: groups },
        {
          openid: "14A17D731DD2B1A0CC57FC8EDBFFC50B",
          groupOpenid: "2FE7E7758E29000B46A733B8761EB887",
        },
      ).ok,
    ).toBe(true);
    expect(
      isQqInboundAllowed(
        { allowedOpenIds: users, allowedGroups: groups },
        { openid: "14A17D731DD2B1A0CC57FC8EDBFFC50B", groupOpenid: "OTHER" },
      ).ok,
    ).toBe(false);
  });
});

describe("qqOfficialBot adapter", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("白名单拒绝时不调用 handleIncomingMessage；允许时调用", async () => {
    const spy = vi
      .spyOn(messageGateway, "handleIncomingMessage")
      .mockResolvedValue({ ok: true, sessionId: "s1" });

    const denied = createQqOfficialBotAdapter({
      appId: "app",
      secret: "sec",
      enabled: true,
      allowedOpenIds: ["only-me"],
      allowedGroups: [],
      useWs: false,
    });
    const ingestDenied = (
      denied as typeof denied & {
        ingestWebhookPayload: (b: unknown) => { ok: boolean };
      }
    ).ingestWebhookPayload;
    expect(ingestDenied({ author: { user_openid: "stranger" }, content: "hi", id: "1" })).toEqual({
      ok: true,
    });
    expect(spy).not.toHaveBeenCalled();

    const allowed = createQqOfficialBotAdapter({
      appId: "app",
      secret: "sec",
      enabled: true,
      allowedOpenIds: ["*"],
      allowedGroups: [],
      useWs: false,
    });
    const ingestOk = (
      allowed as typeof allowed & {
        ingestWebhookPayload: (b: unknown) => { ok: boolean };
      }
    ).ingestWebhookPayload;
    expect(ingestOk({ author: { user_openid: "anyone" }, content: "指令", id: "2" })).toEqual({
      ok: true,
    });
    await vi.waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    const msg = spy.mock.calls[0]![0] as UnifiedMessage;
    expect(msg.envelope.peerId).toBe("anyone");
    expect(msg.payload.text).toBe("指令");
  });

  it("reply：中间片不 fetch；终稿调用一次且带 msg_id", async () => {
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const u = String(url);
      if (u.includes("getAppAccessToken")) {
        return new Response(JSON.stringify({ access_token: "at", expires_in: 7200 }), {
          status: 200,
        });
      }
      return new Response(JSON.stringify({ id: "out" }), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const adapter = createQqOfficialBotAdapter({
      appId: "appid",
      secret: "secret",
      enabled: true,
      allowedOpenIds: ["*"],
      allowedGroups: [],
      useWs: false,
    });

    const msg: UnifiedMessage = {
      envelope: {
        channel: "qq",
        peerId: "user-openid",
        timestamp: new Date().toISOString(),
      },
      payload: { text: "q" },
      meta: { eventId: "evt-msg-1", replyTo: "evt-msg-1" },
    };

    await adapter.reply(msg, { text: "a".repeat(100), finish: false });
    const sendCallsMid = fetchMock.mock.calls.filter((c) =>
      String(c[0]).includes("/v2/users/"),
    );
    expect(sendCallsMid).toHaveLength(0);

    await adapter.reply(msg, { text: "**完成**了", finish: true });
    const sendCalls = fetchMock.mock.calls.filter((c) =>
      String(c[0]).includes("/v2/users/") && String(c[0]).includes("/messages"),
    );
    expect(sendCalls).toHaveLength(1);
    const body = JSON.parse(String(sendCalls[0]![1]?.body ?? "{}")) as {
      content: string;
      msg_id: string;
      msg_type: number;
      msg_seq?: number;
      message_reference?: { message_id: string; ignore_get_message_error?: boolean };
    };
    expect(body.msg_id).toBe("evt-msg-1");
    expect(body.msg_type).toBe(0);
    expect(body.content).toBe("完成了");
    expect(body.msg_seq).toBe(1);
    expect(body.message_reference).toEqual({
      message_id: "evt-msg-1",
      ignore_get_message_error: true,
    });
  });

  it("reply：imStatus 状态条带引用且占用 msg_seq，终稿递增", async () => {
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      void init;
      if (String(url).includes("getAppAccessToken")) {
        return new Response(JSON.stringify({ access_token: "at", expires_in: 7200 }), {
          status: 200,
        });
      }
      return new Response(JSON.stringify({ id: "out" }), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const adapter = createQqOfficialBotAdapter({
      appId: "appid",
      secret: "secret",
      enabled: true,
      allowedOpenIds: ["*"],
      allowedGroups: [],
      useWs: false,
    });
    const msg: UnifiedMessage = {
      envelope: {
        channel: "qq",
        peerId: "user-openid",
        timestamp: new Date().toISOString(),
      },
      payload: { text: "q" },
      meta: { eventId: "evt-status-1", replyTo: "evt-status-1" },
    };

    await adapter.reply(msg, {
      text: "收到，正在处理…",
      finish: false,
      imStatus: "working",
    });
    await adapter.reply(msg, { text: "终稿", finish: true });

    const bodies = fetchMock.mock.calls
      .filter((c) => String(c[0]).includes("/messages"))
      .map((c) => {
        const init = c[1] as RequestInit | undefined;
        return JSON.parse(String(init?.body ?? "{}")) as { content: string; msg_seq: number };
      });
    expect(bodies).toHaveLength(2);
    expect(bodies[0]!.content).toContain("正在处理");
    expect(bodies[0]!.msg_seq).toBe(1);
    expect(bodies[1]!.content).toContain("终稿");
    expect(bodies[1]!.msg_seq).toBe(2);
  });

  it("reply：短思考先发再发终稿（两条 msg_seq）", async () => {
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      void init;
      if (String(url).includes("getAppAccessToken")) {
        return new Response(JSON.stringify({ access_token: "at", expires_in: 7200 }), {
          status: 200,
        });
      }
      return new Response(JSON.stringify({ id: "out" }), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const adapter = createQqOfficialBotAdapter({
      appId: "appid",
      secret: "secret",
      enabled: true,
      allowedOpenIds: ["*"],
      allowedGroups: [],
      useWs: false,
    });
    const msg: UnifiedMessage = {
      envelope: {
        channel: "qq",
        peerId: "user-openid",
        timestamp: new Date().toISOString(),
      },
      payload: { text: "q" },
      meta: { eventId: "evt-think-1", replyTo: "evt-think-1" },
    };

    await adapter.reply(msg, {
      text: "最终答案",
      finish: true,
      reasoning: "先分析再回答",
    });

    const sendCalls = fetchMock.mock.calls.filter((c) =>
      String(c[0]).includes("/messages"),
    );
    expect(sendCalls.length).toBeGreaterThanOrEqual(2);
    const bodies = sendCalls.map((c) =>
      JSON.parse(String(c[1]?.body ?? "{}")) as {
        content: string;
        msg_seq: number;
      },
    );
    expect(bodies[0]!.content).toContain("思考过程");
    expect(bodies[0]!.content).toContain("先分析再回答");
    expect(bodies[0]!.msg_seq).toBe(1);
    expect(bodies[1]!.content).toContain("最终答案");
    expect(bodies[1]!.msg_seq).toBe(2);
  });

  it("reply：终稿 Markdown 配图会走 /files 上传", async () => {
    const fs = await import("node:fs");
    const os = await import("node:os");
    const path = await import("node:path");
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "qq-reply-img-"));
    const img = path.join(dir, "shot.png");
    fs.writeFileSync(img, Buffer.from([9, 8, 7]));

    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const u = String(url);
      if (u.includes("getAppAccessToken")) {
        return new Response(JSON.stringify({ access_token: "at", expires_in: 7200 }));
      }
      if (u.includes("/files")) {
        return new Response(JSON.stringify({ file_info: "IMG-FI" }));
      }
      return new Response(JSON.stringify({ id: "out" }));
    });
    vi.stubGlobal("fetch", fetchMock);

    const adapter = createQqOfficialBotAdapter({
      appId: "appid",
      secret: "secret",
      enabled: true,
      allowedOpenIds: ["*"],
      allowedGroups: [],
      useWs: false,
    });
    const msg: UnifiedMessage = {
      envelope: {
        channel: "qq",
        peerId: "user-openid",
        timestamp: new Date().toISOString(),
      },
      payload: { text: "q" },
      meta: { eventId: "evt-img-1", replyTo: "evt-img-1" },
    };

    await adapter.reply(msg, {
      text: `看图\n![截图](${img.replace(/\\/g, "/")})`,
      finish: true,
    });

    const fileCalls = fetchMock.mock.calls.filter((c) => String(c[0]).includes("/files"));
    expect(fileCalls.length).toBeGreaterThanOrEqual(1);
    const mediaMsgs = fetchMock.mock.calls
      .filter((c) => String(c[0]).includes("/messages"))
      .map((c) => JSON.parse(String(c[1]?.body ?? "{}")) as { msg_type?: number });
    expect(mediaMsgs.some((b) => b.msg_type === 7)).toBe(true);
  });

  it("getStatus 在 webhook 模式可读", () => {
    const adapter = createQqOfficialBotAdapter({
      appId: "abcdef123",
      secret: "s",
      enabled: true,
      allowedOpenIds: [],
      allowedGroups: [],
      useWs: false,
    });
    const st = adapter.getStatus();
    expect(st.state).toBe("disconnected");
    expect(st.detail).toContain("webhook");
    expect(st.detail).toContain("app=abcdef");
  });
});
