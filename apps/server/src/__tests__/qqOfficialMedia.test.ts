import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  __resetQqOfficialMediaForTests,
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

  it("remember/peek 被动 msg_id", () => {
    rememberQqOfficialInbound({ openid: "U1", msgId: "m-private" });
    expect(peekQqOfficialPassiveMsgId({ openid: "U1" })).toBe("m-private");
    rememberQqOfficialInbound({ openid: "U1", groupOpenid: "G9", msgId: "m-group" });
    expect(peekQqOfficialPassiveMsgId({ openid: "U1", groupOpenid: "G9" })).toBe("m-group");
  });

  it("loadQqOfficialMediaBytes 读本地文件", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "qq-media-"));
    const file = path.join(dir, "a.txt");
    fs.writeFileSync(file, "hello-qq", "utf8");
    const loaded = await loadQqOfficialMediaBytes(file);
    expect(loaded.buf.toString("utf8")).toBe("hello-qq");
    expect(loaded.fileName).toBe("a.txt");
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
        return new Response(JSON.stringify({ id: "out" }));
      }
      return new Response("nope", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);

    await sendQqOfficialText({ openid: "OPEN1", text: "hi", msgId: "mid", msgSeq: 1 });
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
});
