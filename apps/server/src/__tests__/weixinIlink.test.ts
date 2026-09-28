import { describe, expect, it, vi } from "vitest";
import {
  extractWeixinText,
  fetchWeixinQr,
  isWeixinUserAllowed,
  isWeixinUserMessage,
  parseWeixinMediaItems,
  sendWeixinText,
  splitWeixinText,
  type WeixinInboundMessage,
} from "../infra/channels/weixinIlink.js";
import {
  decodeWeixinAesKey,
  decryptWeixinAesEcb,
  encryptWeixinAesEcb,
  extraOutboundMedia,
  weixinChatImageAttachment,
  WEIXIN_VISION_INLINE_MAX_BYTES,
} from "../infra/channels/weixinMedia.js";
import { nextWeixinPollGap, WEIXIN_POLL_GAP_MS } from "../infra/channels/weixinClawBot.js";

describe("weixinIlink helpers", () => {
  it("extractWeixinText reads text_item list", () => {
    const msg: WeixinInboundMessage = {
      message_type: 1,
      item_list: [{ type: 1, text_item: { text: "hello" } }],
    };
    expect(extractWeixinText(msg)).toBe("hello");
    expect(isWeixinUserMessage(msg)).toBe(true);
  });

  it("空名单且未绑定 → 拒入站；有 boundUserId 才只放行该人", () => {
    const empty = isWeixinUserAllowed({ allowedUserIds: [], boundUserId: "", fromUserId: "u1" });
    expect(empty.ok).toBe(false);
    expect(empty).toMatchObject({ reason: "allowlist_empty" });
    const boundOk = isWeixinUserAllowed({ allowedUserIds: [], boundUserId: "u1", fromUserId: "u1" });
    expect(boundOk.ok).toBe(true);
    const boundOther = isWeixinUserAllowed({ allowedUserIds: [], boundUserId: "u1", fromUserId: "u2" });
    expect(boundOther.ok).toBe(false);
  });

  it("isWeixinUserAllowed star allowlist", () => {
    expect(isWeixinUserAllowed({ allowedUserIds: ["*"], boundUserId: "", fromUserId: "anyone" }).ok).toBe(true);
  });

  it("splitWeixinText chunks long replies", () => {
    const parts = splitWeixinText("a".repeat(2500), 1800);
    expect(parts).toHaveLength(2);
    expect(parts.join("").length).toBe(2500);
  });

  it("fetchWeixinQr parses ilink json", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ ret: 0, qrcode: "k1", qrcode_img_content: "https://example.com/q" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    ) as unknown as typeof fetch;
    const qr = await fetchWeixinQr({ fetchImpl });
    expect(qr.qrcode).toBe("k1");
    expect(qr.qrcodeImgContent).toContain("example.com");
  });

  it("parseWeixinMediaItems reads image/voice/video items", () => {
    const msg: WeixinInboundMessage = {
      message_type: 1,
      item_list: [
        { type: 2, image_item: { url: "https://cdn.example/a.jpg", aeskey: "aa".repeat(16) } },
        { type: 3, voice_item: { text: "下午见", playtime: 1200 } },
        { type: 5, video_item: { play_length: 3000 } },
      ],
    };
    const items = parseWeixinMediaItems(msg);
    expect(items.map((i) => i.kind)).toEqual(["image", "voice", "video"]);
    expect(items[0]?.url).toContain("cdn.example");
    expect(items[1]?.asrText).toBe("下午见");
  });

  it("extractWeixinText includes voice ASR", () => {
    const msg: WeixinInboundMessage = {
      message_type: 1,
      item_list: [{ type: 3, voice_item: { text: "你好" } }],
    };
    expect(extractWeixinText(msg)).toBe("你好");
  });

  it("sendWeixinText includes from_user_id, client_id and base_info", async () => {
    let body: Record<string, unknown> | undefined;
    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
      body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
      return new Response(JSON.stringify({ ret: 0 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as unknown as typeof fetch;
    await sendWeixinText({
      session: {
        botToken: "t",
        baseUrl: "https://ilinkai.weixin.qq.com",
        getUpdatesBuf: "",
        boundUserId: "u1",
        accountId: "a1",
      },
      toUserId: "u1",
      contextToken: "ctx-1",
      text: "hi",
      fetchImpl,
    });
    const msg = body?.msg as Record<string, unknown>;
    const base = body?.base_info as Record<string, unknown>;
    expect(msg.from_user_id).toBe("");
    expect(String(msg.client_id || "")).toBeTruthy();
    expect(msg.context_token).toBe("ctx-1");
    expect(msg.to_user_id).toBe("u1");
    expect(base.channel_version).toBeTruthy();
  });
});

describe("weixinMedia crypto", () => {
  it("decodeWeixinAesKey accepts hex and base64(hex)", () => {
    const hex = "00112233445566778899aabbccddeeff";
    expect(decodeWeixinAesKey(hex).length).toBe(16);
    const b64raw = Buffer.from(hex, "hex").toString("base64");
    expect(decodeWeixinAesKey(b64raw).equals(Buffer.from(hex, "hex"))).toBe(true);
    const b64hex = Buffer.from(hex, "utf8").toString("base64");
    expect(decodeWeixinAesKey(b64hex).equals(Buffer.from(hex, "hex"))).toBe(true);
  });

  it("encrypt/decrypt roundtrip", () => {
    const key = Buffer.from("00112233445566778899aabbccddeeff", "hex");
    const plain = Buffer.from("hello weixin media");
    const cipher = encryptWeixinAesEcb(plain, key);
    expect(decryptWeixinAesEcb(cipher, key).equals(plain)).toBe(true);
  });

  it("extraOutboundMedia picks video/voice/file and skips images", () => {
    const items = extraOutboundMedia(
      [
        "见图 ![封面](/uploads/cover.png)",
        "视频 [demo](content/uploads/weixin/a.mp4)",
        "语音 [v](content/uploads/weixin/b.silk)",
        "裸路径 content/uploads/weixin/c.wav",
      ].join("\n"),
    );
    expect(items.map((i) => `${i.kind}:${i.url}`)).toEqual([
      "video:content/uploads/weixin/a.mp4",
      "voice:content/uploads/weixin/b.silk",
      "voice:content/uploads/weixin/c.wav",
    ]);
  });

  it("weixinChatImageAttachment skips oversized buffers", () => {
    const tiny = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
    const att = weixinChatImageAttachment({ fileName: "a.jpg", relPath: "content/uploads/weixin/a.jpg", bytes: tiny });
    expect(att && att.type !== "post" && att.previewUrl.startsWith("data:image/jpeg")).toBe(true);
    const huge = Buffer.alloc(WEIXIN_VISION_INLINE_MAX_BYTES + 1, 1);
    expect(weixinChatImageAttachment({ fileName: "b.jpg", relPath: "x", bytes: huge })).toBeNull();
  });
});

describe("weixinClawBot poll backoff", () => {
  it("nextWeixinPollGap resets on success and doubles on failure", () => {
    expect(nextWeixinPollGap(true, 3200)).toBe(WEIXIN_POLL_GAP_MS);
    expect(nextWeixinPollGap(false, WEIXIN_POLL_GAP_MS)).toBe(WEIXIN_POLL_GAP_MS * 2);
    expect(nextWeixinPollGap(false, 5000)).toBe(8000);
  });
});
