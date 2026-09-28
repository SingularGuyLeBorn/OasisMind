/**
 * WP2 三通道结果负向测试。旧实现（loop 内二次 JSON.stringify+slice）必须红。
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { AGENT_TOOL_RESULT_MAX_CHARS } from "@oasismind/shared";
import { OM_RESULT_PATH_KEY } from "../infra/toolResultOffload.js";
import { materializeToolEnvelope } from "../infra/tools/toolPipeline.js";
import { formatAsyncToolDelivery } from "../infra/asyncToolDeliveryFormat.js";
import { listNativeTools } from "../infra/nativeTools.js";
import { createTestConfig } from "./helpers/toolTestFixtures.js";

describe("toolEnvelopeLoop", () => {
  let root: string;

  beforeEach(() => {
    listNativeTools();
    root = fs.mkdtempSync(path.join(os.tmpdir(), "om-env-loop-"));
    fs.mkdirSync(path.join(root, "data", "tool-results"), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("read_article 20k content + 大 metadata → LLM 消息 ≤ 硬顶，title/url/nextOffset 完整，磁盘 value 含全文", () => {
    const config = createTestConfig(root);
    const value = {
      title: "完整标题",
      url: "https://example.com/p/1",
      nextOffset: 20000,
      contentChars: 20000,
      totalChars: 40000,
      metadata: { author: "甲", extra: "y".repeat(8000) },
      content: "正文".repeat(10_000),
    };
    const envelope = materializeToolEnvelope(value, {
      toolName: "read_article",
      args: { url: value.url },
      maxChars: AGENT_TOOL_RESULT_MAX_CHARS,
      config,
      sessionId: "sess-long",
      toolCallId: "call-article",
      thresholdChars: 1_000_000,
    });
    const llm = JSON.stringify(envelope.content);
    expect(llm.length).toBeLessThanOrEqual(AGENT_TOOL_RESULT_MAX_CHARS + 800);
    const parsed = envelope.content as Record<string, unknown>;
    expect(parsed.title).toBe("完整标题");
    expect(parsed.url).toBe(value.url);
    expect(parsed.nextOffset).toBe(20000);
    expect(envelope.persist?.path).toBeTruthy();
    const disk = JSON.parse(fs.readFileSync(path.join(root, envelope.persist!.path), "utf8")) as {
      content: string;
    };
    expect(disk.content.length).toBe(value.content.length);
  });

  it("无长文本大 JSON → LLM 看到 keys+path，JSON.parse 成功且无半截 key", () => {
    const config = createTestConfig(root);
    const value: Record<string, unknown> = {};
    for (let i = 0; i < 2000; i++) value[`key_${i}_complete`] = `v${i}`;
    const envelope = materializeToolEnvelope(value, {
      toolName: "web_search",
      args: {},
      maxChars: AGENT_TOOL_RESULT_MAX_CHARS,
      config,
      sessionId: "sess-keys",
      toolCallId: "call-keys",
    });
    const serialized = JSON.stringify(envelope.content);
    const parsed = JSON.parse(serialized) as Record<string, unknown>;
    expect(serialized.includes("key_0_compl\"")).toBe(false);
    if (parsed.truncated === true) {
      expect(Array.isArray(parsed.keys)).toBe(true);
      expect((parsed.keys as string[])[0]).toBe("key_0_complete");
    }
    expect(parsed[OM_RESULT_PATH_KEY] ?? envelope.persist?.path).toBeTruthy();
  });

  it("offload 后 executedTools 是瘦卡且含 _om_result_path", () => {
    const config = createTestConfig(root);
    const value = { title: "t", content: "x".repeat(8000) };
    const envelope = materializeToolEnvelope(value, {
      toolName: "read_article",
      args: {},
      config,
      sessionId: "sess-card",
      toolCallId: "call-card",
    });
    const card = envelope.content as Record<string, unknown>;
    expect(card[OM_RESULT_PATH_KEY]).toBeTruthy();
    expect(JSON.stringify(card)).not.toContain("x".repeat(500));
  });

  it("waitForResult=true 的同步 spawn 返回值是 content/摘要不是残 JSON", () => {
    const formatted = formatAsyncToolDelivery(
      "read_article",
      {
        title: "一篇",
        url: "https://ex.com",
        content: "正文".repeat(200),
      },
      { taskLabel: "同步抓取" },
    );
    expect(formatted.textForLlm).toContain("一篇");
    expect(formatted.textForLlm).not.toMatch(/"content":\s*"正文正文/);
    expect(formatted.structured.title).toBe("一篇");
    expect(formatted.structured.kind).toBe("read_article");
  });
});
