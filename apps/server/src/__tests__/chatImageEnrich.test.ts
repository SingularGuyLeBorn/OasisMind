/**
 * W3 persist 前静默识图——进程内 Mock LLM 下，缺 extractedText 的图 enrich 后带【Mock 识图】。
 * 禁止 spy LLM；走 enterInProcessMockLlm 真路径（只换回复）。
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import {
  enterInProcessMockLlm,
  resetInProcessMockHits,
  getInProcessMockHits,
} from "@oasismind/mock-llm-core";
import { enrichImageAttachmentsForPersist } from "../infra/chatImageEnrich.js";
import { getAppConfig } from "../infra/config.js";
import type { AppConfig } from "../infra/config.js";
import { isChatImageAttachment, type ChatAttachment, type ChatImageAttachment } from "@oasismind/shared";

describe("W3 chatImageEnrich persist 前静默识图", () => {
  let restoreMock: () => void;
  let tmpRoot: string;
  let config: AppConfig;

  beforeEach(() => {
    restoreMock = enterInProcessMockLlm();
    resetInProcessMockHits();
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "om-w3enrich-"));
    fs.mkdirSync(path.join(tmpRoot, "content", "uploads"), { recursive: true });
    fs.writeFileSync(path.join(tmpRoot, "content", "uploads", "shot.png"), Buffer.from("fakepng"));
    // 复用真实 config 的 llm/providers（mock 仍需读 provider 解析），仅覆盖 projectRoot 指向临时根
    config = { ...getAppConfig(), projectRoot: tmpRoot };
  });

  afterEach(() => {
    restoreMock?.();
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it("缺 extractedText 的图 enrich 后带【Mock 识图】且 source=vision", async () => {
    const atts: ChatAttachment[] = [
      { name: "shot.png", mimeType: "image/png", previewUrl: "/uploads/shot.png" },
    ];
    const out = await enrichImageAttachmentsForPersist(atts, {
      config,
      mainModel: "deepseek-chat",
    });
    expect(out).toHaveLength(1);
    expect(isChatImageAttachment(out[0])).toBe(true);
    const img = out[0] as ChatImageAttachment;
    expect(img.extractedText).toContain("【Mock 识图】");
    expect(img.source).toBe("vision");
    const hit = getInProcessMockHits().find((h) => h.scenario === "vision_describe");
    expect(hit).toBeTruthy();
  });

  it("已有 extractedText 的图不重复识图（幂等）", async () => {
    const atts: ChatAttachment[] = [
      { name: "shot.png", mimeType: "image/png", previewUrl: "/uploads/shot.png", extractedText: "已有描述", source: "vision" },
    ];
    const out = await enrichImageAttachmentsForPersist(atts, {
      config,
      mainModel: "deepseek-chat",
    });
    const img = out[0] as ChatImageAttachment;
    expect(img.extractedText).toBe("已有描述");
    expect(getInProcessMockHits().some((h) => h.scenario === "vision_describe")).toBe(false);
  });

  it("非图片附件原样透传（同一对象引用）", async () => {
    const post: ChatAttachment = {
      type: "post",
      id: "c123456789012345678901234",
      garden: "g1",
      slug: "s",
      title: "t",
      excerpt: "e",
    };
    const out = await enrichImageAttachmentsForPersist([post], {
      config,
      mainModel: "deepseek-chat",
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toBe(post);
  });
});
