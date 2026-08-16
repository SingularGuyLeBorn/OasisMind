/**
 * 工具落盘全文 → 文章：抽正文 + 拒绝越界路径。
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { extractPostBodyFromToolResult } from "../infra/entityServices/postService.js";
import { offloadToolResultIfNeeded, readToolResultPayload } from "../infra/toolResultOffload.js";
import { createTestConfig } from "./helpers/toolTestFixtures.js";

describe("extractPostBodyFromToolResult", () => {
  it("JSON 优先取 content/markdown/text/transcript", () => {
    expect(extractPostBodyFromToolResult(JSON.stringify({ title: "t", content: "# 正文" }))).toBe("# 正文");
    expect(extractPostBodyFromToolResult(JSON.stringify({ markdown: "## md" }))).toBe("## md");
    expect(extractPostBodyFromToolResult(JSON.stringify({ text: "纯文本" }))).toBe("纯文本");
    expect(extractPostBodyFromToolResult(JSON.stringify({ transcript: "逐字稿" }))).toBe("逐字稿");
  });

  it("非 JSON 当纯文本；空串返回空", () => {
    expect(extractPostBodyFromToolResult("  就是一段话  ")).toBe("就是一段话");
    expect(extractPostBodyFromToolResult("   ")).toBe("");
  });
});

describe("createFromToolResult 路径守卫", () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "kp-post-tool-"));
    fs.mkdirSync(path.join(root, "data", "tool-results"), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("读落盘卡能抽出 content", () => {
    const config = createTestConfig(root);
    const off = offloadToolResultIfNeeded(
      config,
      { content: "落盘全文应进知识库", title: "t" },
      { sessionId: "sess", toolCallId: "c1", toolName: "read_article", thresholdChars: 10 },
    );
    expect(off).not.toBeNull();
    const page = readToolResultPayload(config, off!.path, { offset: 0, maxChars: 10_000 });
    expect(extractPostBodyFromToolResult(page.content)).toBe("落盘全文应进知识库");
  });

  it("越界路径拒绝", () => {
    const config = createTestConfig(root);
    expect(() => readToolResultPayload(config, "../secret.txt")).toThrow(/tool-results/);
    expect(() => readToolResultPayload(config, "data/workspace/x.json")).toThrow(/tool-results/);
  });
});
