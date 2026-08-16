/**
 * QQ 入站引用附件：收集 / 拼文案（下载用 mock fetch）。
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { isChatPostAttachment } from "@oasismind/shared";
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

  it("materialize：下载图 → ChatAttachment + mediaLines", async () => {
    const png1x1 = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    );
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(png1x1, {
          status: 200,
          headers: { "content-type": "image/png" },
        }),
      ),
    );

    const result = await materializeQqInboundMedia({
      content: "看看",
      attachments: [{ url: "https://cdn.example/tiny.png", content_type: "image/png", filename: "tiny.png" }],
      message_reference: { content: "上一张图" },
    });
    expect(result.quotedText).toBe("上一张图");
    expect(result.chatAttachments).toHaveLength(1);
    const att = result.chatAttachments[0]!;
    expect(isChatPostAttachment(att)).toBe(false);
    if (isChatPostAttachment(att)) throw new Error("expected image");
    expect(att.previewUrl.startsWith("data:image/png;base64,")).toBe(true);
    expect(result.mediaLines.some((l) => l.includes("content/uploads/qq/"))).toBe(true);
  });
});
