/**
 * IM 入站排队元数据：attachments ↔ UnifiedMessage 往返。
 */

import { describe, expect, it } from "vitest";
import { isChatPostAttachment } from "@oasismind/shared";
import {
  buildImInboundAttachment,
  parseImInboundAttachment,
  unifiedMessageFromImInbound,
  type UnifiedMessage,
} from "../infra/messageGateway.js";

describe("im inbound queue meta", () => {
  it("build → parse → unified 保持引用字段", () => {
    const msg: UnifiedMessage = {
      envelope: {
        channel: "qq",
        peerId: "U1",
        chatId: "G9",
        timestamp: "2026-08-10T00:00:00.000Z",
      },
      payload: { text: "第二条想法" },
      meta: { eventId: "m-b", replyTo: "m-b" },
    };
    const att = buildImInboundAttachment(msg);
    expect(att).toMatchObject({
      v: 1,
      channel: "qq",
      peerId: "U1",
      chatId: "G9",
      eventId: "m-b",
      replyTo: "m-b",
    });
    const parsed = parseImInboundAttachment(att);
    expect(parsed).not.toBeNull();
    const rebuilt = unifiedMessageFromImInbound("第二条想法", parsed!);
    expect(rebuilt.envelope.peerId).toBe("U1");
    expect(rebuilt.envelope.chatId).toBe("G9");
    expect(rebuilt.meta.eventId).toBe("m-b");
    expect(rebuilt.meta.replyTo).toBe("m-b");
    expect(rebuilt.payload.text).toBe("第二条想法");
  });

  it("非法 attachments 返回 null", () => {
    expect(parseImInboundAttachment(null)).toBeNull();
    expect(parseImInboundAttachment({ channel: "qq" })).toBeNull();
    expect(parseImInboundAttachment({ channel: "web", peerId: "x", eventId: "y" })).toBeNull();
  });

  it("chatAttachments 随排队元数据往返", () => {
    const msg: UnifiedMessage = {
      envelope: {
        channel: "qq",
        peerId: "U1",
        timestamp: "2026-08-10T00:00:00.000Z",
      },
      payload: {
        text: "结合图看",
        attachments: [
          {
            type: "image",
            name: "a.jpg",
            mimeType: "image/jpeg",
            previewUrl: "data:image/jpeg;base64,abc",
            extractedText: "图片已保存到 content/uploads/qq/a.jpg",
            source: "user",
          },
        ],
      },
      meta: { eventId: "m-img", replyTo: "m-img" },
    };
    const att = buildImInboundAttachment(msg);
    expect(att.chatAttachments).toHaveLength(1);
    const parsed = parseImInboundAttachment(att);
    const rebuilt = unifiedMessageFromImInbound("结合图看", parsed!);
    const img = rebuilt.payload.attachments?.[0];
    expect(img && !isChatPostAttachment(img) ? img.name : "").toBe("a.jpg");
    expect(img && !isChatPostAttachment(img) ? img.previewUrl : "").toContain("base64");
  });
});
