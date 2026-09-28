import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import {
  OM_META_PATH_KEY,
  OM_RESULT_PATH_KEY,
  cleanupExpiredToolResults,
  listToolResultIndex,
  offloadToolResultIfNeeded,
  readToolResultMeta,
  readToolResultPayload,
  startToolResultTtlCleanup,
  stopToolResultTtlCleanup,
} from "../infra/toolResultOffload.js";
import { createTempProjectDir, createTestConfig } from "./helpers/toolTestFixtures.js";
import { appRouter } from "../router.js";
import { createContextInner } from "../trpc/context.js";
import { runReactLoop } from "../infra/loop/reactLoop.js";
import type { LlmMessage, LlmToolCall } from "../infra/llmClient.js";
import type { ServiceContainer } from "../infra/serviceContainer.js";
import { listNativeTools } from "../infra/nativeTools.js";

describe("toolResultOffload", () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "om-offload-"));
    fs.mkdirSync(path.join(root, "data", "tool-results"), { recursive: true });
  });

  afterEach(() => {
    stopToolResultTtlCleanup();
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("超阈值落盘并返回 metadata 索引卡（无 preview 正文）", () => {
    const config = createTestConfig(root);
    const title = "线性注意力机制";
    const big = { content: "x".repeat(5000), title };
    const off = offloadToolResultIfNeeded(config, big, {
      sessionId: "sess1",
      toolCallId: "call-1",
      toolName: "read_article",
      thresholdChars: 1000,
    });
    expect(off).not.toBeNull();
    expect(off!.compacted).toBe(true);
    expect(fs.existsSync(path.join(root, off!.path))).toBe(true);
    expect(fs.existsSync(path.join(root, off!.metaPath))).toBe(true);
    const card = off!.llmResult as {
      offloaded: boolean;
      preview?: string;
      hint: string;
      metadata: { contentType: string; title?: string };
      keywords: string[];
    };
    expect(card.offloaded).toBe(true);
    expect(card.preview).toBeUndefined();
    expect(card.metadata.contentType).toBeTruthy();
    expect(JSON.stringify(card)).not.toContain("x".repeat(200));
    expect(card.hint).toContain("结论：");
    expect(card.hint).toContain(title);
    expect(card.hint).not.toContain("web_page");
    expect(card.hint).toMatch(/read_file\(path="[^"]+", offset=\d+, maxChars=\d+\)/);
    expect(card.hint).toContain("禁止假装已读全文");
    expect(card.hint).not.toContain("记录平面");
    expect(card.hint).not.toContain("metadata+keywords");
    expect(card.hint).not.toContain("0 命中");
    expect(card.hint).not.toContain("tool_results_list");
  });

  it("分页列表 hint 用 total 条数，不用本页条数或 contentType 枚举", () => {
    const config = createTestConfig(root);
    const items = [
      { id: "1", title: "alpha" },
      { id: "2", title: "bravo" },
      { id: "3", title: "charlie" },
      { id: "4", title: "delta" },
      { id: "5", title: "echo" },
    ];
    const payload = {
      total: 61,
      page: 1,
      pageSize: 5,
      items,
      excerpt: "pad-".repeat(400),
    };
    const off = offloadToolResultIfNeeded(config, payload, {
      sessionId: "sess-page",
      toolCallId: "call-page",
      toolName: "post_list",
      thresholdChars: 200,
    });
    expect(off).not.toBeNull();
    expect(off!.compacted).toBe(true);
    const card = off!.llmResult as { hint: string };
    expect(card.hint).toContain("61 条");
    expect(card.hint).not.toContain("5 条");
    expect(card.hint).not.toContain("data_table");
    expect(card.hint).not.toContain("api_response");
    expect(card.hint).toContain("禁止假装已读全文");
    expect(card.hint).not.toContain("记录平面");
    expect(card.hint).not.toContain("metadata+keywords");
  });

  it("错误结果 hint 写可读失败文案，不用 error= 前缀", () => {
    const config = createTestConfig(root);
    const errText = "文件不存在: foo.md";
    const off = offloadToolResultIfNeeded(
      config,
      { error: errText, content: "x".repeat(2000) },
      {
        sessionId: "sess-err",
        toolCallId: "call-err",
        toolName: "read_file",
        thresholdChars: 200,
      },
    );
    expect(off).not.toBeNull();
    expect(off!.compacted).toBe(true);
    const card = off!.llmResult as { hint: string };
    expect(card.hint).toContain(errText);
    expect(card.hint).not.toContain("error=");
    expect(card.hint).toContain("禁止假装已读全文");
    expect(card.hint).not.toContain("记录平面");
    expect(card.hint).not.toContain("metadata+keywords");
  });

  it("未超阈值也落盘+meta，LLM 仍拿原文并带 path 注解", () => {
    const config = createTestConfig(root);
    const off = offloadToolResultIfNeeded(config, { content: "hi", title: "t" }, {
      sessionId: "sess-small",
      toolCallId: "c-small",
      toolName: "x",
      thresholdChars: 4000,
    });
    expect(off).not.toBeNull();
    expect(off!.compacted).toBe(false);
    expect(fs.existsSync(path.join(root, off!.path))).toBe(true);
    expect(fs.existsSync(path.join(root, off!.metaPath))).toBe(true);
    const llm = off!.llmResult as Record<string, unknown>;
    expect(llm.content).toBe("hi");
    expect(llm[OM_RESULT_PATH_KEY]).toBe(off!.path);
    expect(llm[OM_META_PATH_KEY]).toBe(off!.metaPath);
    const index = listToolResultIndex(config, "sess-small");
    expect(index).toHaveLength(1);
    expect(index[0]!.contentType).toBeTruthy();
    expect(index[0]!.hitCount).toBe(0);
  });

  it("带 expect_keywords 时厚 meta 含 hitOffsets，注入卡不含导航堆", () => {
    const config = createTestConfig(root);
    const needle = "CRITICAL_SIGNAL_TORCH_COMPILE";
    const content =
      "noise ".repeat(800) +
      `Here is ${needle} with important detail 42%. ` +
      "noise ".repeat(800);
    const off = offloadToolResultIfNeeded(
      config,
      { content, title: "release notes", url: "https://example.com/rel" },
      {
        sessionId: "sess-kw",
        toolCallId: "call-kw",
        toolName: "read_article",
        thresholdChars: 500,
        expectKeywords: [needle, "missing-word"],
        expectPatterns: [String.raw`\d+%`],
        contextWindow: 60,
      },
    );
    expect(off).not.toBeNull();
    expect(off!.compacted).toBe(true);
    const card = off!.llmResult as {
      hitCount: number;
      missedKeywords: string[];
      hint: string;
      metadata: { contentType: string };
      path: string;
    };
    expect(card.hitCount).toBeGreaterThanOrEqual(1);
    expect(card.missedKeywords).toContain("missing-word");
    const thick = readToolResultMeta(config, off!.metaPath)!;
    expect(thick.hitOffsets.some((h) => h.keyword.includes(needle))).toBe(true);
    expect(thick.recommendedRead[0]?.reason).toMatch(/keyword/);
    expect(card.hint).toContain(`offset=${thick.recommendedRead[0]!.offset}`);
    expect(card.metadata).not.toHaveProperty("hitOffsets");
    expect(card.metadata).not.toHaveProperty("recommendedRead");
    expect(card.metadata).not.toHaveProperty("sampleOffsets");
    const cardStr = JSON.stringify(card);
    expect(cardStr).not.toContain("sampleOffsets");
    expect(cardStr).not.toContain("hitOffsets");
    expect(cardStr).not.toContain("recommendedRead");
    expect(card.hint).not.toContain("keyword:");
    expect(card.hint).not.toContain("记录平面");
    expect(card.hint).not.toContain("web_page");
    expect(card.metadata.contentType).toBe("web_page");
    expect(cardStr).not.toContain("important detail 42%");
    const raw = fs.readFileSync(path.join(root, card.path), "utf8");
    expect(raw).toContain(needle);
    const index = listToolResultIndex(config, "sess-kw");
    expect(index[0]!.topics.length).toBeGreaterThan(0);
    expect(index[0]!.hitCount).toBeGreaterThanOrEqual(1);
  });

  it("注入卡禁止含导航堆：sampleOffsets/hitOffsets/recommendedRead/urls/entities/topics", () => {
    const config = createTestConfig(root);
    const needle = "SLIM_CARD_NEEDLE_TORCH";
    const content =
      "https://example.com/page1 https://pytorch.org/blog/x " +
      "noise ".repeat(1200) +
      `Here is ${needle} CUDA v2.4.0 ` +
      "noise ".repeat(1200);
    const off = offloadToolResultIfNeeded(
      config,
      {
        content,
        title: "PyTorch release notes",
        url: "https://example.com/rel",
        total: 12,
        items: [{ id: "1" }, { id: "2" }],
      },
      {
        sessionId: "sess-slim",
        toolCallId: "call-slim",
        toolName: "read_article",
        thresholdChars: 500,
        expectKeywords: [needle, "missing-word"],
      },
    );
    expect(off).not.toBeNull();
    expect(off!.compacted).toBe(true);
    const card = off!.llmResult as Record<string, unknown>;
    const cardStr = JSON.stringify(card);
    expect(cardStr).not.toContain("sampleOffsets");
    expect(cardStr).not.toContain("hitOffsets");
    expect(cardStr).not.toContain("recommendedRead");
    const meta = card.metadata as Record<string, unknown>;
    expect(meta).not.toHaveProperty("urls");
    expect(meta).not.toHaveProperty("entities");
    expect(meta).not.toHaveProperty("topics");
    expect(meta).not.toHaveProperty("topKeys");
    expect(meta).not.toHaveProperty("searchTextChars");
    expect(meta.contentType).toBe("web_page");
    expect(meta.hasError).toBe(false);
    expect(meta.shortFields).toBeDefined();
    const sizes = meta.fieldSizes as Record<string, number>;
    expect(sizes.items).toBe(2);
    expect(sizes).not.toHaveProperty("content");
    expect(sizes).not.toHaveProperty("excerpt");
    const allowed = new Set(["title", "hasError", "contentType", "shortFields", "fieldSizes", "language"]);
    for (const k of Object.keys(meta)) {
      expect(allowed.has(k), `薄 metadata 多了键 ${k}`).toBe(true);
    }

    const thick = readToolResultMeta(config, off!.metaPath)!;
    expect(thick.sampleOffsets.length).toBeGreaterThan(1);
    expect(thick.hitOffsets.some((h) => h.keyword.includes(needle))).toBe(true);
    expect(thick.recommendedRead[0]?.reason).toMatch(/keyword/);
    expect(thick.urls.length).toBeGreaterThan(0);
    expect(thick.entities.length).toBeGreaterThan(0);
    expect(thick.topics.length).toBeGreaterThan(0);
    expect(card.hint).toContain(`offset=${thick.recommendedRead[0]!.offset}`);
    expect(card.hint).toMatch(/read_file\(path="[^"]+", offset=\d+, maxChars=\d+\)/);
    expect(card.hint).toContain("禁止假装已读全文");
    expect(card.hint).not.toContain("web_page");
    expect(card.hint).not.toContain("keyword:");
  });

  it("同 toolCallId 冲突时改名落盘，不覆盖旧文件", () => {
    const config = createTestConfig(root);
    const a = offloadToolResultIfNeeded(config, { content: "first-" + "a".repeat(50) }, {
      sessionId: "sess-collide",
      toolCallId: "same-id",
      toolName: "t",
      thresholdChars: 10_000,
    });
    const b = offloadToolResultIfNeeded(config, { content: "second-" + "b".repeat(50) }, {
      sessionId: "sess-collide",
      toolCallId: "same-id",
      toolName: "t",
      thresholdChars: 10_000,
    });
    expect(a!.path).not.toBe(b!.path);
    expect(fs.existsSync(path.join(root, a!.path))).toBe(true);
    expect(fs.existsSync(path.join(root, b!.path))).toBe(true);
    expect(fs.readFileSync(path.join(root, a!.path), "utf8")).toContain("first-");
    expect(fs.readFileSync(path.join(root, b!.path), "utf8")).toContain("second-");
    expect(listToolResultIndex(config, "sess-collide")).toHaveLength(2);
  });

  it("readToolResultMeta 可查厚 metadata，且拒绝越界路径", () => {
    const config = createTestConfig(root);
    const off = offloadToolResultIfNeeded(config, { content: "meta-body", title: "T" }, {
      sessionId: "sess-meta",
      toolCallId: "c-meta",
      toolName: "x",
      thresholdChars: 4000,
    });
    const meta = readToolResultMeta(config, off!.metaPath);
    expect(meta).not.toBeNull();
    expect(meta!.title).toBe("T");
    expect(() => readToolResultMeta(config, "config/agents/assistant.md")).toThrow(/tool-results/);
  });

  it("TTL cleanup 删除过期文件并重写 index，list 跳过孤儿行", () => {
    const config = createTestConfig(root);
    const off = offloadToolResultIfNeeded(config, { content: "old-payload" }, {
      sessionId: "sess-ttl",
      toolCallId: "c-ttl",
      toolName: "x",
      thresholdChars: 4000,
    });
    const abs = path.join(root, off!.path);
    const metaAbs = path.join(root, off!.metaPath);
    const past = Date.now() - 20 * 24 * 60 * 60 * 1000;
    fs.utimesSync(abs, new Date(past), new Date(past));
    fs.utimesSync(metaAbs, new Date(past), new Date(past));

    const cleaned = cleanupExpiredToolResults(config, { retentionDays: 14, now: Date.now() });
    expect(cleaned.removedFiles).toBeGreaterThanOrEqual(2);
    expect(fs.existsSync(abs)).toBe(false);
    expect(listToolResultIndex(config, "sess-ttl")).toHaveLength(0);
  });

  it("readToolResultPayload 按需分段读原文并拒绝越界", () => {
    const config = createTestConfig(root);
    const body = { content: "ABCDEFGHIJ".repeat(200), title: "seg" };
    const off = offloadToolResultIfNeeded(config, body, {
      sessionId: "sess-read",
      toolCallId: "c-read",
      toolName: "x",
      thresholdChars: 10,
    });
    expect(off!.compacted).toBe(true);
    const page1 = readToolResultPayload(config, off!.path, { offset: 0, maxChars: 200 });
    expect(page1.content.length).toBe(200);
    expect(page1.totalChars).toBeGreaterThan(200);
    expect(page1.nextOffset).toBe(200);
    const page2 = readToolResultPayload(config, off!.path, {
      offset: page1.nextOffset!,
      maxChars: 200,
    });
    expect(page2.offset).toBe(200);
    expect(page2.content.length).toBeGreaterThan(0);
    expect(() => readToolResultPayload(config, "config/agents/assistant.md")).toThrow(/tool-results/);
  });

  it("startToolResultTtlCleanup 启动即清过期；retentionDays≤0 不挂定时器", () => {
    const config = createTestConfig(root);
    const off = offloadToolResultIfNeeded(config, { content: "ttl-start" }, {
      sessionId: "sess-ttl-start",
      toolCallId: "c-ttl-start",
      toolName: "x",
      thresholdChars: 4000,
    });
    const abs = path.join(root, off!.path);
    const past = Date.now() - 30 * 24 * 60 * 60 * 1000;
    fs.utimesSync(abs, new Date(past), new Date(past));
    fs.utimesSync(path.join(root, off!.metaPath), new Date(past), new Date(past));

    const stop = startToolResultTtlCleanup({
      ...config,
      compact: {
        ...config.compact,
        toolResultOffload: { ...config.compact.toolResultOffload, retentionDays: 14 },
      },
      stream: { ...config.stream, cleanupIntervalMs: 60_000 },
    });
    expect(fs.existsSync(abs)).toBe(false);
    stop();

    const noTimer = startToolResultTtlCleanup({
      ...config,
      compact: {
        ...config.compact,
        toolResultOffload: { ...config.compact.toolResultOffload, retentionDays: 0 },
      },
    });
    noTimer();
  });

  it("session.readToolResult：落盘→tRPC 读原文（Chat「查看原文」数据路径）", async () => {
    const ctx = await createContextInner();
    const caller = appRouter.createCaller(ctx);
    const marker = `SMOKE_TOOL_RESULT_${Date.now()}`;
    const off = offloadToolResultIfNeeded(
      ctx.config,
      { content: `${marker} ` + "body-".repeat(800), title: "smoke" },
      {
        sessionId: `sess-smoke-${Date.now()}`,
        toolCallId: `call-smoke-${Date.now()}`,
        toolName: "read_article",
        thresholdChars: 200,
      },
    );
    expect(off).not.toBeNull();
    expect(off!.compacted).toBe(true);
    const page = await caller.session.readToolResult({
      path: off!.path,
      offset: 0,
      maxChars: 4000,
    });
    expect(page.content).toContain(marker);
    expect(page.totalChars).toBeGreaterThan(page.content.length);
    await expect(
      caller.session.readToolResult({ path: "config/agents/assistant.md" }),
    ).rejects.toThrow(/tool-results/);
  });
});

describe("Chat 内核冒烟：工具结果 offload", () => {
  let root: string;

  beforeEach(() => {
    root = createTempProjectDir();
    fs.mkdirSync(path.join(root, "data/workspace"), { recursive: true });
    listNativeTools();
  });

  afterEach(() => {
    stopToolResultTtlCleanup();
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("大 read_file 结果落盘后，第二轮 LLM 只见索引卡；原文可按需读回", async () => {
    const marker = `CHAT_KERNEL_SMOKE_${Date.now()}`;
    const big = `${marker}\n${"z".repeat(6000)}`;
    fs.writeFileSync(path.join(root, "data/workspace/smoke-big.txt"), big, "utf8");

    const config = createTestConfig(root);
    config.compact.toolResultOffload.thresholdChars = 500;

    const calls: LlmMessage[][] = [];
    let step = 0;
    const tc = (id: string, name: string, args: Record<string, unknown>): LlmToolCall => ({
      id,
      type: "function",
      function: { name, arguments: JSON.stringify(args) },
    });

    const runCreate = vi.fn(async () => ({ success: true, data: { id: "run-smoke" } }));
    const runUpdate = vi.fn(async () => ({ success: true, data: { id: "run-smoke" } }));
    const services = { run: { create: runCreate, update: runUpdate } } as unknown as ServiceContainer;

    const result = await runReactLoop({
      config,
      services,
      agent: { model: "test-model", systemPrompt: "", tools: ["native:read_file"] },
      messages: [{ role: "user", content: "读大文件并摘要" }],
      invokeTrpc: async () => ({}),
      sessionId: `sess-chat-kernel-${Date.now()}`,
      transport: {
        async complete({ messages }) {
          calls.push(messages.map((m) => ({ ...m })));
          if (step++ === 0) {
            return {
              content: "",
              toolCalls: [tc("c-smoke", "read_file", { path: "smoke-big.txt" })],
              model: "test-model",
              provider: "test",
            };
          }
          return { content: "已摘要", toolCalls: [], model: "test-model", provider: "test" };
        },
      },
      runOrigin: "user",
    });

    expect(result.content).toBe("已摘要");
    expect(calls.length).toBeGreaterThanOrEqual(2);
    const toolMsg = calls[1]!.find((m) => m.role === "tool");
    expect(toolMsg).toBeDefined();
    const toolText = typeof toolMsg!.content === "string" ? toolMsg!.content : JSON.stringify(toolMsg!.content);
    expect(toolText).toContain("offloaded");
    expect(toolText).not.toContain(marker);
    expect(toolText).not.toContain("z".repeat(200));
    expect(toolText).not.toContain("sampleOffsets");
    expect(toolText).not.toContain("hitOffsets");
    expect(toolText).not.toContain("recommendedRead");
    expect(toolText).toContain("禁止假装已读全文");
    expect(toolText).not.toContain("记录平面");

    const card = JSON.parse(toolText) as { path: string; offloaded: boolean };
    expect(card.offloaded).toBe(true);
    const page = readToolResultPayload(config, card.path, { maxChars: 500 });
    expect(page.content).toContain(marker);
  });
});
