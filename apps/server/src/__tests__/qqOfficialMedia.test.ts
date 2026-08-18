import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  __resetQqOfficialMediaForTests,
  allocateQqPassiveMsgSeq,
  isQqActiveMessageDenied,
  isQqMsgSeqDeduped,
  loadQqOfficialMediaBytes,
  rememberQqOfficialInbound,
  peekQqOfficialPassiveMsgId,
  sendQqOfficialMedia,
  sendQqOfficialText,
} from "../infra/channels/qqOfficialMedia.js";

describe("qqOfficialMedia", () => {
  afterEach(() => {
    __resetQqOfficialMediaForTests();
    vi.unstubAllGlobals();
  });

  it("allocateQqPassiveMsgSeq 同 msg_id 递增，preferred 不回退", () => {
    expect(allocateQqPassiveMsgSeq("m1")).toBe(1);
    expect(allocateQqPassiveMsgSeq("m1")).toBe(2);
    expect(allocateQqPassiveMsgSeq("m1", 1)).toBe(3);
    expect(allocateQqPassiveMsgSeq("m2", 5)).toBe(5);
    expect(allocateQqPassiveMsgSeq("m2")).toBe(6);
  });

  it("isQqActiveMessageDenied / isQqMsgSeqDeduped 识别平台码", () => {
    expect(isQqActiveMessageDenied(new Error("HTTP 400: 主动消息失败, 无权限 code 40034105"))).toBe(true);
    expect(isQqActiveMessageDenied(new Error("ok"))).toBe(false);
    expect(isQqMsgSeqDeduped(new Error('{"message":"消息被去重，请检查请求msgseq","code":40054005}'))).toBe(true);
    expect(isQqMsgSeqDeduped(new Error("40034105"))).toBe(false);
  });

  it("remember/peek：本地 24h 缓存 vs 平台被动窗（群 5min）", async () => {
    const {
      isQqPassiveWindowFresh,
      peekQqOfficialFreshPassiveMsgId,
    } = await import("../infra/channels/qqOfficialMedia.js");
    vi.useFakeTimers();
    try {
      rememberQqOfficialInbound({ openid: "U1", msgId: "m-private" });
      expect(peekQqOfficialPassiveMsgId({ openid: "U1" })).toBe("m-private");
      expect(isQqPassiveWindowFresh({ openid: "U1" })).toBe(true);

      rememberQqOfficialInbound({ openid: "U1", groupOpenid: "G9", msgId: "m-group" });
      expect(peekQqOfficialFreshPassiveMsgId({ openid: "U1", groupOpenid: "G9" })).toBe("m-group");

      // 群平台窗 5min：6min 后 fresh 为空，但本地缓存仍在（长任务改走主动，无需重启）
      vi.advanceTimersByTime(6 * 60 * 1000);
      expect(isQqPassiveWindowFresh({ openid: "U1", groupOpenid: "G9" })).toBe(false);
      expect(peekQqOfficialFreshPassiveMsgId({ openid: "U1", groupOpenid: "G9" })).toBeUndefined();
      expect(peekQqOfficialPassiveMsgId({ openid: "U1", groupOpenid: "G9" })).toBe("m-group");

      vi.advanceTimersByTime(24 * 60 * 60 * 1000);
      expect(peekQqOfficialPassiveMsgId({ openid: "U1", groupOpenid: "G9" })).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });

  it("loadQqOfficialMediaBytes 读本地文件", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "qq-media-"));
    const file = path.join(dir, "a.txt");
    fs.writeFileSync(file, "hello-qq", "utf8");
    const loaded = await loadQqOfficialMediaBytes(file);
    expect(loaded.buf.toString("utf8")).toBe("hello-qq");
    expect(loaded.fileName).toBe("a.txt");
  });

  it("sendQqOfficialText：主动无权限时自动降级被动 msg_id", async () => {
    process.env.QQ_BOT_APP_ID = "app";
    process.env.QQ_BOT_SECRET = "sec";
    rememberQqOfficialInbound({
      openid: "OPEN1",
      groupOpenid: "G1",
      msgId: "inbound-fresh",
    });
    let n = 0;
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const u = String(url);
      if (u.includes("getAppAccessToken")) {
        return new Response(JSON.stringify({ access_token: "tok", expires_in: 7200 }));
      }
      if (u.includes("/messages")) {
        n += 1;
        const body = JSON.parse(String(init?.body ?? "{}")) as { msg_id?: string };
        if (n === 1) {
          expect(body.msg_id).toBeUndefined();
          return new Response(
            JSON.stringify({
              message: "主动消息失败, 无权限",
              code: 40034105,
            }),
            { status: 400 },
          );
        }
        expect(body.msg_id).toBe("inbound-fresh");
        return new Response(JSON.stringify({ id: "out" }));
      }
      return new Response("nope", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const r = await sendQqOfficialText({
      openid: "OPEN1",
      groupOpenid: "G1",
      text: "终稿",
    });
    expect(r.usedMsgId).toBe("inbound-fresh");
    expect(n).toBe(2);
  });

  it("被动降级同一 msg_id 递增 msg_seq，避免 40054005", async () => {
    process.env.QQ_BOT_APP_ID = "app";
    process.env.QQ_BOT_SECRET = "sec";
    rememberQqOfficialInbound({
      openid: "OPEN1",
      groupOpenid: "G1",
      msgId: "inbound-seq",
    });
    const seqs: number[] = [];
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const u = String(url);
      if (u.includes("getAppAccessToken")) {
        return new Response(JSON.stringify({ access_token: "tok", expires_in: 7200 }));
      }
      if (u.includes("/messages")) {
        const body = JSON.parse(String(init?.body ?? "{}")) as { msg_id?: string; msg_seq?: number };
        if (!body.msg_id) {
          return new Response(
            JSON.stringify({ message: "主动消息失败, 无权限", code: 40034105 }),
            { status: 400 },
          );
        }
        seqs.push(body.msg_seq ?? 0);
        return new Response(JSON.stringify({ id: "out" }));
      }
      return new Response("nope", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);

    await sendQqOfficialText({ openid: "OPEN1", groupOpenid: "G1", text: "一" });
    await sendQqOfficialText({ openid: "OPEN1", groupOpenid: "G1", text: "二" });
    expect(seqs).toEqual([1, 2]);
  });

  it("被动窗口 40054005 自动换下一个 msg_seq 重试", async () => {
    process.env.QQ_BOT_APP_ID = "app";
    process.env.QQ_BOT_SECRET = "sec";
    rememberQqOfficialInbound({
      openid: "OPEN1",
      groupOpenid: "G1",
      msgId: "inbound-dedup",
    });
    const seqs: number[] = [];
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const u = String(url);
      if (u.includes("getAppAccessToken")) {
        return new Response(JSON.stringify({ access_token: "tok", expires_in: 7200 }));
      }
      if (u.includes("/messages")) {
        const body = JSON.parse(String(init?.body ?? "{}")) as { msg_id?: string; msg_seq?: number };
        if (!body.msg_id) {
          return new Response(
            JSON.stringify({ message: "主动消息失败, 无权限", code: 40034105 }),
            { status: 400 },
          );
        }
        seqs.push(body.msg_seq ?? 0);
        if (body.msg_seq === 1) {
          return new Response(
            JSON.stringify({ message: "消息被去重，请检查请求msgseq", code: 40054005 }),
            { status: 400 },
          );
        }
        return new Response(JSON.stringify({ id: "out" }));
      }
      return new Response("nope", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const r = await sendQqOfficialText({
      openid: "OPEN1",
      groupOpenid: "G1",
      text: "终稿",
    });
    expect(r.usedMsgId).toBe("inbound-dedup");
    expect(r.msgSeq).toBe(2);
    expect(seqs).toEqual([1, 2]);
  });

  it("sendQqOfficialText / Media 走上传与发消息", async () => {
    process.env.QQ_BOT_APP_ID = "app";
    process.env.QQ_BOT_SECRET = "sec";
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const u = String(url);
      if (u.includes("getAppAccessToken")) {
        return new Response(JSON.stringify({ access_token: "tok", expires_in: 7200 }));
      }
      if (u.includes("/files")) {
        const body = JSON.parse(String(init?.body ?? "{}")) as { file_type?: number };
        expect(body.file_type).toBe(1);
        return new Response(JSON.stringify({ file_info: "FI-1" }));
      }
      if (u.includes("/messages")) {
        return new Response(JSON.stringify({ id: "out", ext_info: { ref_idx: "REF" } }));
      }
      return new Response("nope", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);

    await sendQqOfficialText({
      openid: "OPEN1",
      text: "hi",
      msgId: "mid",
      msgSeq: 1,
      messageReference: { messageId: "mid" },
    });
    const textBody = JSON.parse(
      String(
        fetchMock.mock.calls.find((c) => String(c[0]).includes("/messages"))?.[1]?.body ?? "{}",
      ),
    ) as { message_reference?: { message_id: string } };
    expect(textBody.message_reference?.message_id).toBe("mid");
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "qq-img-"));
    const img = path.join(dir, "x.png");
    fs.writeFileSync(img, Buffer.from([1, 2, 3, 4]));
    await sendQqOfficialMedia({
      openid: "OPEN1",
      kind: "image",
      file: img,
      msgId: "mid",
      msgSeq: 2,
    });

    const messages = fetchMock.mock.calls.filter((c) => String(c[0]).includes("/messages"));
    expect(messages.length).toBeGreaterThanOrEqual(2);
    const mediaBody = JSON.parse(String(messages[1]![1]?.body ?? "{}")) as {
      msg_type: number;
      media: { file_info: string };
    };
    expect(mediaBody.msg_type).toBe(7);
    expect(mediaBody.media.file_info).toBe("FI-1");
  });

  it("被动媒体 40054005 自动换下一个 msg_seq 重试", async () => {
    process.env.QQ_BOT_APP_ID = "app";
    process.env.QQ_BOT_SECRET = "sec";
    rememberQqOfficialInbound({
      openid: "OPEN1",
      groupOpenid: "G1",
      msgId: "inbound-media-dedup",
    });
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "qq-img-"));
    const img = path.join(dir, "x.png");
    fs.writeFileSync(img, Buffer.from([1, 2, 3, 4]));
    const seqs: number[] = [];
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const u = String(url);
      if (u.includes("getAppAccessToken")) {
        return new Response(JSON.stringify({ access_token: "tok", expires_in: 7200 }));
      }
      if (u.includes("/files")) {
        return new Response(JSON.stringify({ file_info: "FI-2" }));
      }
      if (u.includes("/messages")) {
        const body = JSON.parse(String(init?.body ?? "{}")) as { msg_id?: string; msg_seq?: number };
        if (!body.msg_id) {
          return new Response(
            JSON.stringify({ message: "主动消息失败, 无权限", code: 40034105 }),
            { status: 400 },
          );
        }
        seqs.push(body.msg_seq ?? 0);
        if (body.msg_seq === 1) {
          return new Response(
            JSON.stringify({ message: "消息被去重，请检查请求msgseq", code: 40054005 }),
            { status: 400 },
          );
        }
        return new Response(JSON.stringify({ id: "out" }));
      }
      return new Response("nope", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const r = await sendQqOfficialMedia({
      openid: "OPEN1",
      groupOpenid: "G1",
      kind: "image",
      file: img,
    });
    expect(r.usedMsgId).toBe("inbound-media-dedup");
    expect(r.msgSeq).toBe(2);
    expect(seqs).toEqual([1, 2]);
  });
});
