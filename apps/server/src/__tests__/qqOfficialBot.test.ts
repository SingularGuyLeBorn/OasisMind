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
  resolveQqNumberForOpenId,
  shouldDispatchQqInbound,
} from "../infra/channels/qqOfficialBot.js";
import {
  __resetQqGroupHistoryForTests,
  peekQqGroupHistory,
} from "../infra/channels/qqGroupContext.js";
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

  it("parseQqInboundPayload：username / eventType / mentionsBot", () => {
    const at = parseQqInboundPayload({
      t: "GROUP_AT_MESSAGE_CREATE",
      d: {
        author: { member_openid: "u2", username: "希卡利粉" },
        content: "帮我看看",
        id: "m-at",
        group_openid: "g9",
      },
    });
    expect(at).toMatchObject({
      openid: "u2",
      username: "希卡利粉",
      eventType: "GROUP_AT_MESSAGE_CREATE",
      mentionsBot: true,
      groupOpenid: "g9",
    });

    const full = parseQqInboundPayload({
      t: "GROUP_MESSAGE_CREATE",
      d: {
        author: { member_openid: "u3", username: "路人" },
        content: "闲聊一句",
        id: "m-full",
        group_openid: "g9",
      },
    });
    expect(full).toMatchObject({
      eventType: "GROUP_MESSAGE_CREATE",
      mentionsBot: false,
      username: "路人",
    });
    expect(shouldDispatchQqInbound("error" in full ? {} : full)).toBe(false);

    const fullAt = parseQqInboundPayload({
      t: "GROUP_MESSAGE_CREATE",
      d: {
        author: { member_openid: "u4" },
        content: "也算艾特",
        id: "m-m",
        group_openid: "g9",
        mentions: [{ bot: true }],
      },
    });
    expect(shouldDispatchQqInbound("error" in fullAt ? {} : fullAt)).toBe(true);
  });

  it("resolveQqNumberForOpenId 反查 MAP", () => {
    const map = parseQqIdOpenIdMap("2251061018=OIDABC");
    expect(resolveQqNumberForOpenId("OIDABC", map)).toBe("2251061018");
    expect(resolveQqNumberForOpenId("other", map)).toBeUndefined();
  });

  it("同一 QQ 号可映射私聊+群聊两串 openid", () => {
    const map = parseQqIdOpenIdMap(
      "2251061018=14A17D731DD2B1A0CC57FC8EDBFFC50B|6ACA11C154D5B9A578F916EB1BBF5E10,2251061018=14A17D731DD2B1A0CC57FC8EDBFFC50B",
    );
    expect(map.get("2251061018")).toBe(
      "14A17D731DD2B1A0CC57FC8EDBFFC50B|6ACA11C154D5B9A578F916EB1BBF5E10",
    );
    expect(resolveQqNumberForOpenId("6ACA11C154D5B9A578F916EB1BBF5E10", map)).toBe("2251061018");
    const users = expandAllowedIds(["2251061018"], map, "OPENIDS");
    expect(users).toContain("14A17D731DD2B1A0CC57FC8EDBFFC50B");
    expect(users).toContain("6ACA11C154D5B9A578F916EB1BBF5E10");
    expect(
      isQqInboundAllowed(
        { allowedOpenIds: users, allowedGroups: ["*"] },
        { openid: "6ACA11C154D5B9A578F916EB1BBF5E10", groupOpenid: "g1" },
      ).ok,
    ).toBe(true);
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
    __resetQqGroupHistoryForTests();
    process.env.QQ_BOT_GROUP_HISTORY_LIMIT = "40";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    __resetQqGroupHistoryForTests();
    delete process.env.QQ_BOT_GROUP_HISTORY_LIMIT;
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

  it("GROUP_MESSAGE_CREATE 只累计；GROUP_AT 起流并带近况+昵称", async () => {
    const spy = vi
      .spyOn(messageGateway, "handleIncomingMessage")
      .mockResolvedValue({ ok: true, sessionId: "s1" });

    const adapter = createQqOfficialBotAdapter({
      appId: "app",
      secret: "sec",
      enabled: true,
      allowedOpenIds: ["owner"],
      allowedGroups: ["g1"],
      useWs: false,
    });
    const ingest = (
      adapter as typeof adapter & {
        ingestWebhookPayload: (b: unknown) => { ok: boolean };
      }
    ).ingestWebhookPayload;

    expect(
      ingest({
        t: "GROUP_MESSAGE_CREATE",
        d: {
          author: { member_openid: "stranger", username: "路人甲" },
          content: "刚才那事咋办",
          id: "h1",
          group_openid: "g1",
        },
      }),
    ).toEqual({ ok: true });
    expect(spy).not.toHaveBeenCalled();
    expect(peekQqGroupHistory("g1")).toHaveLength(1);

    expect(
      ingest({
        t: "GROUP_AT_MESSAGE_CREATE",
        d: {
          author: { member_openid: "owner", username: "主人" },
          content: "你怎么看",
          id: "a1",
          group_openid: "g1",
        },
      }),
    ).toEqual({ ok: true });
    await vi.waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    const msg = spy.mock.calls[0]![0] as UnifiedMessage;
    expect(msg.meta.speakerLabel).toBe("主人");
    expect(msg.payload.text).toContain("群聊近况");
    expect(msg.payload.text).toContain("路人甲 openid=stranger:");
    expect(msg.payload.text).toContain("你怎么看");
    expect(peekQqGroupHistory("g1")).toHaveLength(0);
  });

  it("reply：中间片不 fetch；终稿主动消息一次（无 msg_id，长任务可回）", async () => {
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const u = String(url);
      if (u.includes("getAppAccessToken")) {
        return new Response(JSON.stringify({ access_token: "at", expires_in: 7200 }), {
          status: 200,
        });
      }
      return new Response(
        JSON.stringify({ id: "out", ext_info: { ref_idx: "REF" } }),
        { status: 200 },
      );
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
      msg_id?: string;
      msg_type: number;
      msg_seq?: number;
      message_reference?: { message_id: string; ignore_get_message_error?: boolean };
    };
    // 默认主动：无 msg_id、不艾特；被动窗口过期后长任务仍能回
    expect(body.msg_id).toBeUndefined();
    expect(body.msg_type).toBe(0);
    expect(body.content).toBe("完成了");
    expect(body.message_reference).toBeUndefined();
  });

  it("reply：群聊默认主动消息（无 msg_id / 无引用）；quoteInbound 才引用", async () => {
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      void init;
      if (String(url).includes("getAppAccessToken")) {
        return new Response(JSON.stringify({ access_token: "at", expires_in: 7200 }), {
          status: 200,
        });
      }
      return new Response(
        JSON.stringify({ id: "out", ext_info: { ref_idx: "REF" } }),
        { status: 200 },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const adapter = createQqOfficialBotAdapter({
      appId: "appid",
      secret: "secret",
      enabled: true,
      allowedOpenIds: ["*"],
      allowedGroups: ["*"],
      useWs: false,
    });
    const baseMsg: UnifiedMessage = {
      envelope: {
        channel: "qq",
        peerId: "user-openid",
        chatId: "group-openid",
        timestamp: new Date().toISOString(),
      },
      payload: { text: "q" },
      meta: { eventId: "g-evt-1", replyTo: "g-evt-1" },
    };

    await adapter.reply(baseMsg, { text: "普通回复", finish: true });
    const plainBody = JSON.parse(
      String(
        fetchMock.mock.calls.find((c) => String(c[0]).includes("/groups/"))?.[1]?.body ?? "{}",
      ),
    ) as { content?: string; msg_id?: string; message_reference?: unknown };
    expect(plainBody.content).toBe("普通回复");
    expect(plainBody.msg_id).toBeUndefined();
    expect(plainBody.message_reference).toBeUndefined();

    fetchMock.mockClear();
    await adapter.reply(
      { ...baseMsg, meta: { ...baseMsg.meta, eventId: "g-evt-2", replyTo: "g-evt-2", quoteInbound: true } },
      { text: "引用回复", finish: true },
    );
    const quoteBody = JSON.parse(
      String(
        fetchMock.mock.calls.find((c) => String(c[0]).includes("/messages"))?.[1]?.body ?? "{}",
      ),
    ) as {
      content?: string;
      msg_id?: string;
      message_reference?: { message_id: string };
    };
    expect(quoteBody.content).toBe("引用回复");
    expect(quoteBody.msg_id).toBe("g-evt-2");
    expect(quoteBody.message_reference).toEqual({ message_id: "g-evt-2" });
  });

  it("reply：imStatus 状态条与终稿均为主动消息（无 msg_id）", async () => {
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      void init;
      if (String(url).includes("getAppAccessToken")) {
        return new Response(JSON.stringify({ access_token: "at", expires_in: 7200 }), {
          status: 200,
        });
      }
      return new Response(
        JSON.stringify({ id: "out", ext_info: { ref_idx: "REF" } }),
        { status: 200 },
      );
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
        return JSON.parse(String(init?.body ?? "{}")) as {
          content: string;
          msg_id?: string;
          msg_seq?: number;
        };
      });
    expect(bodies).toHaveLength(2);
    expect(bodies[0]!.content).toContain("正在处理");
    expect(bodies[0]!.msg_id).toBeUndefined();
    expect(bodies[1]!.content).toContain("终稿");
    expect(bodies[1]!.msg_id).toBeUndefined();
  });

  it("reply：群聊状态条主动失败也不降级 msg_id（避免平台自动艾特）", async () => {
    let textCalls = 0;
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      void init;
      if (String(url).includes("getAppAccessToken")) {
        return new Response(JSON.stringify({ access_token: "at", expires_in: 7200 }), {
          status: 200,
        });
      }
      if (String(url).includes("/messages")) {
        textCalls += 1;
        // 第一次（状态条）失败；若错误降级被动会再打带 msg_id 的第二次
        if (textCalls === 1) {
          return new Response(JSON.stringify({ message: "active denied" }), { status: 400 });
        }
        return new Response(JSON.stringify({ id: "out" }), { status: 200 });
      }
      return new Response(JSON.stringify({ id: "out" }), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const adapter = createQqOfficialBotAdapter({
      appId: "appid",
      secret: "secret",
      enabled: true,
      allowedOpenIds: ["*"],
      allowedGroups: ["*"],
      useWs: false,
    });
    const msg: UnifiedMessage = {
      envelope: {
        channel: "qq",
        peerId: "user-openid",
        chatId: "group-openid",
        timestamp: new Date().toISOString(),
      },
      payload: { text: "q" },
      meta: { eventId: "g-evt-status-fail", replyTo: "g-evt-status-fail" },
    };

    await adapter.reply(msg, {
      text: "收到，正在处理…",
      finish: false,
      imStatus: "working",
      imQuote: false,
    });

    const messageBodies = fetchMock.mock.calls
      .filter((c) => String(c[0]).includes("/messages"))
      .map((c) => JSON.parse(String((c[1] as RequestInit | undefined)?.body ?? "{}")) as {
        content?: string;
        msg_id?: string;
      });
    expect(messageBodies).toHaveLength(1);
    expect(messageBodies[0]!.msg_id).toBeUndefined();
    expect(messageBodies[0]!.content).toContain("正在处理");
  });

  it("reply：正式答案优先于短思考（两条主动消息）", async () => {
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      void init;
      if (String(url).includes("getAppAccessToken")) {
        return new Response(JSON.stringify({ access_token: "at", expires_in: 7200 }), {
          status: 200,
        });
      }
      return new Response(
        JSON.stringify({ id: "out", ext_info: { ref_idx: "REF" } }),
        { status: 200 },
      );
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
        msg_id?: string;
      },
    );
    expect(bodies[0]!.content).toContain("最终答案");
    expect(bodies[0]!.msg_id).toBeUndefined();
    expect(bodies[1]!.content).toContain("思考过程");
    expect(bodies[1]!.content).toContain("先分析再回答");
    expect(bodies[1]!.msg_id).toBeUndefined();
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
      return new Response(JSON.stringify({ id: "out", ext_info: { ref_idx: "REF" } }));
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
