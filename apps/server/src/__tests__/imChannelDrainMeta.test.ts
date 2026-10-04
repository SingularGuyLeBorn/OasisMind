/**
 * IM 入站排队元数据：attachments ↔ UnifiedMessage 往返。
 */

import { describe, expect, it } from "vitest";
import { isChannelAttachment } from "@oasismind/shared";
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

  it("ChannelAttachment 随排队元数据往返，普通文件不会退化成路径文字", () => {
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
            type: "channel",
            id: "c4c462d4-f660-4a7e-a95a-823555673ed7",
            kind: "file",
            fileName: "report.pdf",
            mimeType: "application/pdf",
            size: 42,
            sha256: "a".repeat(64),
            source: "qq",
            localPath: "content/uploads/channels/qq/report.pdf",
            status: "ready",
          },
        ],
      },
      meta: { eventId: "m-img", replyTo: "m-img" },
    };
    const att = buildImInboundAttachment(msg);
    expect(att.attachments).toHaveLength(1);
    const parsed = parseImInboundAttachment(att);
    const rebuilt = unifiedMessageFromImInbound("结合图看", parsed!);
    const file = rebuilt.payload.attachments?.[0];
    expect(isChannelAttachment(file)).toBe(true);
    if (!isChannelAttachment(file)) throw new Error("expected channel attachment");
    expect(file.fileName).toBe("report.pdf");
    expect(file.kind).toBe("file");
  });
});
