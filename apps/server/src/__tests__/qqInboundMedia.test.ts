/**
 * QQ 入站引用附件：收集 / 拼文案（下载用 mock fetch）。
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { isChannelAttachment } from "@oasismind/shared";
import {
  collectQqRawAttachments,
  composeQqUserText,
  extractQqQuotedText,
  materializeQqInboundMedia,
} from "../infra/channels/qqInboundMedia.js";

describe("qqInboundMedia", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("collect：本条 attachments + msg_elements 引用附件去重", () => {
    const raws = collectQqRawAttachments({
      attachments: [{ url: "https://cdn.example/a.jpg", content_type: "image/jpeg" }],
      msg_elements: [
        {
          content: "旧图",
          attachments: [
            { url: "https://cdn.example/a.jpg", content_type: "image/jpeg" },
            { url: "//cdn.example/b.mp4", content_type: "video/mp4", filename: "clip.mp4" },
          ],
        },
      ],
    });
    expect(raws).toHaveLength(2);
    expect(raws[0]!.url).toBe("https://cdn.example/a.jpg");
    expect(raws[1]!.url).toBe("https://cdn.example/b.mp4");
    expect(raws[1]!.filename).toBe("clip.mp4");
  });

  it("extractQqQuotedText：message_reference / msg_elements", () => {
    expect(
      extractQqQuotedText({
        message_reference: { content: "被引用的一句" },
      }),
    ).toBe("被引用的一句");
    expect(
      extractQqQuotedText({
        message_type: 103,
        msg_elements: [{ content: "元素里的原文" }],
      }),
    ).toBe("元素里的原文");
  });

  it("composeQqUserText：引用 + 附件 + 正文", () => {
    const t = composeQqUserText({
      content: "帮我看看",
      quotedText: "原图配文",
      mediaLines: ["图片: content/uploads/qq/x.jpg", "视频: content/uploads/qq/y.mp4"],
    });
    expect(t).toContain("【引用消息】");
    expect(t).toContain("原图配文");
    expect(t).toContain("【附件】");
    expect(t).toContain("帮我看看");
  });

  it("materialize：图片/视频/音频/文件全部下载为统一 ChannelAttachment", async () => {
    const fixtures = new Map<string, { bytes: Buffer; mimeType: string }>([
      ["tiny.jpg", { bytes: Buffer.from([0xff, 0xd8, 0xff, 0xd9]), mimeType: "image/jpeg" }],
      [
        "clip.mp4",
        {
          bytes: Buffer.from([0, 0, 0, 16, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]),
          mimeType: "video/mp4",
        },
      ],
      ["voice.mp3", { bytes: Buffer.from("ID3voice-fixture"), mimeType: "audio/mpeg" }],
      ["report.pdf", { bytes: Buffer.from("%PDF-1.7 fixture"), mimeType: "application/pdf" }],
    ]);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL) => {
        const name = new URL(String(url)).pathname.split("/").pop() ?? "";
        const fixture = fixtures.get(name);
        if (!fixture) throw new Error(`QQ 入站测试出现未知附件：${name}`);
        return new Response(fixture.bytes, {
          status: 200,
          headers: { "content-type": fixture.mimeType },
        });
      }),
    );

    const result = await materializeQqInboundMedia({
      content: "看看",
      attachments: [
        { url: "https://cdn.example/tiny.jpg", content_type: "image/jpeg", filename: "tiny.jpg" },
        { url: "https://cdn.example/clip.mp4", content_type: "video/mp4", filename: "clip.mp4" },
        { url: "https://cdn.example/voice.mp3", content_type: "audio/mpeg", filename: "voice.mp3" },
        { url: "https://cdn.example/report.pdf", content_type: "application/pdf", filename: "report.pdf" },
      ],
      message_reference: { content: "上一张图" },
    });
    expect(result.quotedText).toBe("上一张图");
    expect(result.attachments).toHaveLength(4);
    expect(result.attachments.map((attachment) => attachment.kind)).toEqual([
      "image",
      "video",
      "audio",
      "file",
    ]);
    for (const attachment of result.attachments) {
      expect(isChannelAttachment(attachment)).toBe(true);
      expect(attachment.status).toBe("ready");
      expect(attachment.localPath).toContain("content/uploads/channels/qq/");
      expect(attachment.sha256).toMatch(/^[a-f0-9]{64}$/);
    }
    expect(result.attachments[0]?.previewUrl?.startsWith("data:image/jpeg;base64,")).toBe(true);
    expect(result.mediaLines).toHaveLength(4);
  });

  it("materialize：错误 MIME 作为失败附件保留，不静默吞掉", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response("<html>login</html>", {
          status: 200,
          headers: { "content-type": "text/html" },
        }),
      ),
    );
    const result = await materializeQqInboundMedia({
      attachments: [{ url: "https://cdn.example/fake.jpg", content_type: "image/jpeg", filename: "fake.jpg" }],
    });
    expect(result.attachments).toHaveLength(1);
    expect(result.attachments[0]).toMatchObject({ kind: "image", status: "failed" });
    expect(result.attachments[0]?.error).toMatch(/MIME|验证/);
  });
});
