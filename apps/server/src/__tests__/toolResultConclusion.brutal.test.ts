/**
 * 瘦卡结论 / 人看摘要契约：故意用真实工具返回形砸。
 * 过关标准：模型 hint 与 formatToolResultHint(card) 都不撒谎。
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { formatToolResultHint, isToolResultFailed } from "@oasismind/shared";
import {
  offloadToolResultIfNeeded,
  readToolResultPayload,
  stopToolResultTtlCleanup,
} from "../infra/toolResultOffload.js";
import { createTestConfig } from "./helpers/toolTestFixtures.js";

const PAD = { excerpt: "PAD-".repeat(500) };

function compact(
  root: string,
  payload: unknown,
  toolName = "x",
  extra?: { thresholdChars?: number; toolCallId?: string },
) {
  const config = createTestConfig(root);
  const off = offloadToolResultIfNeeded(config, payload, {
    sessionId: "sess-brutal",
    toolCallId: extra?.toolCallId ?? `c-${Math.random().toString(36).slice(2, 10)}`,
    toolName,
    thresholdChars: extra?.thresholdChars ?? 200,
  });
  expect(off).not.toBeNull();
  return { config, off: off!, card: off!.llmResult as Record<string, unknown> };
}

function llmHint(card: Record<string, unknown>): string {
  expect(typeof card.hint).toBe("string");
  return card.hint as string;
}

describe("惨无人道：工具结果结论", () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "om-brutal-"));
    fs.mkdirSync(path.join(root, "data", "tool-results"), { recursive: true });
  });

  afterEach(() => {
    stopToolResultTtlCleanup();
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("分页 PostList：全集 61，不是本页 5，也不是 pageSize", () => {
    const { card } = compact(
      root,
      {
        ...PAD,
        total: 61,
        page: 1,
        pageSize: 5,
        count: 5,
        items: [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }, { id: "5" }],
      },
      "post_list",
    );
    const hint = llmHint(card);
    expect(hint).toContain("61 条");
    expect(hint).not.toContain("5 条");
    expect(hint).not.toMatch(/\bpageSize\b/);
    expect(hint).not.toContain("data_table");
    expect(formatToolResultHint(card)).toContain("61 条");
    expect(formatToolResultHint(card)).not.toContain("5 条");
  });

  it("itemCount 优先于本页长；无 total 时用 itemCount", () => {
    const { card } = compact(root, {
      ...PAD,
      itemCount: 88,
      items: [{ id: "a" }, { id: "b" }, { id: "c" }],
    });
    expect(llmHint(card)).toContain("88 条");
    expect(llmHint(card)).not.toContain("3 条");
    expect(formatToolResultHint(card)).toContain("88 条");
  });

  it("arxiv 形 { count, papers }：条数走 count，不是把 count 当字数丢掉", () => {
    const papers = Array.from({ length: 10 }, (_, i) => ({ id: `p${i}`, title: `paper ${i}` }));
    const { card } = compact(root, { ...PAD, query: "mamba", count: 10, papers }, "search_arxiv");
    expect(llmHint(card)).toContain("10 条");
    expect(formatToolResultHint(card)).toContain("10 条");
  });

  it("grep 形 { total, results }：用人看摘要也能读到全集条数", () => {
    const raw = {
      pattern: "TODO",
      total: 8,
      results: [{ path: "a.ts" }, { path: "b.ts" }],
    };
    expect(formatToolResultHint(raw)).toContain("8 条");
    const { card } = compact(root, { ...PAD, ...raw }, "grep");
    expect(llmHint(card)).toContain("8 条");
    expect(llmHint(card)).not.toContain("2 条");
  });

  it("长文 { count: 字数, content } 禁止写成「N 条」", () => {
    const { card } = compact(
      root,
      { count: 3842, title: "线性注意力机制", content: "x".repeat(5000) },
      "read_article",
    );
    const hint = llmHint(card);
    expect(hint).toContain("线性注意力机制");
    expect(hint).not.toContain("3842 条");
    expect(formatToolResultHint(card)).not.toContain("3842 条");
  });

  it("total=0 空列表是「0 条」，不是「全文已存文件」也不是「无任务」", () => {
    const { card } = compact(root, { ...PAD, total: 0, page: 1, items: [] }, "post_list");
    expect(llmHint(card)).toContain("0 条");
    expect(llmHint(card)).not.toContain("全文已存文件");
    expect(formatToolResultHint(card)).toContain("0 条");
    expect(formatToolResultHint(card)).not.toBe("无任务");
  });

  it("total 键存在但不是整数：不回落到本页 5 条", () => {
    const { card } = compact(root, {
      ...PAD,
      total: "很多",
      items: [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }, { id: "5" }],
    });
    expect(llmHint(card)).not.toContain("5 条");
  });

  it("成功结果带 message 禁止标成失败", () => {
    const { card } = compact(
      root,
      {
        ...PAD,
        success: true,
        message: "Agent 被创建（tier: sub）",
        total: 61,
        items: [{ id: "1" }],
      },
      "agent_create",
    );
    const hint = llmHint(card);
    expect(hint).not.toContain("失败");
    expect(hint).not.toContain("有错误");
    expect(hint).toContain("61 条");
    expect(formatToolResultHint(card)).not.toContain("失败");
    expect(isToolResultFailed(card)).toBe(false);
  });

  it("success:false + reason 是失败，读 reason 不读空 error", () => {
    const { card } = compact(root, {
      ...PAD,
      success: false,
      reason: "花园 llm-guide 不存在",
    });
    const hint = llmHint(card);
    expect(hint).toContain("失败");
    expect(hint).toContain("花园 llm-guide 不存在");
    expect(hint).not.toContain("error=");
    expect(formatToolResultHint(card)).toContain("失败");
    expect(formatToolResultHint(card)).toContain("花园 llm-guide 不存在");
    expect(formatToolResultHint(card)).not.toContain("全文已存");
    expect(isToolResultFailed(card)).toBe(true);
  });

  it("error 为对象时抽出 message，禁止「失败 · {…}」", () => {
    const { card } = compact(root, {
      error: { message: "ENOENT: no such file foo.md", code: "ENOENT" },
      content: "x".repeat(2000),
    });
    const hint = llmHint(card);
    expect(hint).toContain("ENOENT: no such file foo.md");
    expect(hint).not.toContain("{…}");
    expect(formatToolResultHint(card)).toContain("no such file foo.md");
    expect(isToolResultFailed(card)).toBe(true);
  });

  it("error:false / error:null 不当失败", () => {
    const { card } = compact(root, {
      error: false,
      title: "还行",
      content: "x".repeat(2000),
    });
    expect(llmHint(card)).not.toMatch(/失败|有错误/);
    expect(isToolResultFailed(card)).toBe(false);
  });

  it("压缩失败卡：人看摘要是失败，不是「全文已存」", () => {
    const { card } = compact(
      root,
      { error: "文件不存在: foo.md", content: "x".repeat(2000) },
      "read_file",
    );
    const human = formatToolResultHint(card);
    expect(human).toContain("失败");
    expect(human).toContain("文件不存在: foo.md");
    expect(human).not.toContain("全文已存");
    expect(isToolResultFailed(card)).toBe(true);
  });

  it("阈值正好等于不压缩；多 1 字才压缩", () => {
    const config = createTestConfig(root);
    const payload = { v: "a".repeat(50) };
    const n = JSON.stringify(payload).length;
    const eq = offloadToolResultIfNeeded(config, payload, {
      sessionId: "sess-eq",
      toolCallId: "c-eq",
      toolName: "x",
      thresholdChars: n,
    });
    expect(eq!.compacted).toBe(false);
    const over = offloadToolResultIfNeeded(config, payload, {
      sessionId: "sess-eq",
      toolCallId: "c-over",
      toolName: "x",
      thresholdChars: n - 1,
    });
    expect(over!.compacted).toBe(true);
  });

  it("循环引用：落盘可序列化，LLM 结果可 JSON.stringify，且标失败", () => {
    const cyclic: Record<string, unknown> = { title: "boom" };
    cyclic.self = cyclic;
    const { card, off } = compact(root, cyclic, "x", { thresholdChars: 1, toolCallId: "c-cyc" });
    expect(() => JSON.stringify(card)).not.toThrow();
    expect(fs.readFileSync(path.join(root, off.path), "utf8")).toContain("tool_result_not_serializable");
    expect(isToolResultFailed(card) || llmHint(card).includes("失败")).toBe(true);
  });

  it("readToolResultPayload 拒绝跳出 tool-results（含 .. 与绝对路径）", () => {
    const { config, off } = compact(root, { content: "ABCDEFGH".repeat(20) }, "x", {
      thresholdChars: 10,
    });
    const secret = path.join(root, "secret.txt");
    fs.writeFileSync(secret, "TOP_SECRET", "utf8");
    expect(() =>
      readToolResultPayload(config, path.join("data", "tool-results", "..", "..", "secret.txt")),
    ).toThrow(/tool-results/);
    expect(() => readToolResultPayload(config, secret)).toThrow(/tool-results/);
    const ok = readToolResultPayload(config, off.path, { offset: 0, maxChars: 20 });
    expect(ok.content.length).toBeGreaterThan(0);
  });

  it("hint 里的 path 与卡上 path 一致，且可原样分段读回", () => {
    const { config, card } = compact(root, { title: "线性注意力机制", content: "BODYMARKER" + "z".repeat(3000) });
    const hint = llmHint(card);
    const m = hint.match(/read_file\(path="([^"]+)"/);
    expect(m?.[1]).toBe(card.path);
    const page = readToolResultPayload(config, m![1]!, { offset: 0, maxChars: 40 });
    expect(page.content).toContain("BODYMARKER");
  });

  it("顶层数组结果：条数是数组长", () => {
    const arr = Array.from({ length: 7 }, (_, i) => ({ id: i, note: "n".repeat(80) }));
    const { card } = compact(root, arr, "custom_list");
    expect(llmHint(card)).toContain("7 条");
    expect(formatToolResultHint(card)).toContain("7 条");
  });

  it("压缩卡 hint/metadata 不得夹带 excerpt 正文或 contentType 枚举", () => {
    const { card } = compact(
      root,
      {
        ...PAD,
        total: 61,
        items: [{ id: "1", title: "alpha" }],
      },
      "post_list",
    );
    const hint = llmHint(card);
    expect(hint).not.toContain("PAD-");
    expect(hint).not.toContain("web_page");
    expect(hint).not.toContain("data_table");
    expect(hint).not.toContain("api_response");
    expect(JSON.stringify(card.metadata)).not.toContain("PAD-PAD");
    expect(formatToolResultHint(card)).not.toContain("PAD-");
  });

  it("status:failed 与 ok:false 都当失败", () => {
    const failed = compact(root, { ...PAD, status: "failed", message: "上游超时" });
    expect(llmHint(failed.card)).toContain("失败");
    expect(llmHint(failed.card)).toContain("上游超时");
    expect(isToolResultFailed(failed.card)).toBe(true);

    const okFalse = compact(root, { ...PAD, ok: false, message: "权限不足" });
    expect(llmHint(okFalse.card)).toContain("失败");
    expect(llmHint(okFalse.card)).toContain("权限不足");
    expect(isToolResultFailed(okFalse.card)).toBe(true);
  });

  it("嵌套 data.total 仍读全集，不读本页", () => {
    const { card } = compact(
      root,
      {
        ...PAD,
        data: {
          total: 61,
          page: 1,
          items: [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }, { id: "5" }],
        },
      },
      "post_list",
    );
    expect(llmHint(card)).toContain("61 条");
    expect(llmHint(card)).not.toContain("5 条");
    expect(formatToolResultHint(card)).toContain("61 条");
  });

  it("offset 超过全文长度：空切片、truncated=false", () => {
    const { config, off } = compact(root, { content: "short-body" }, "x", { thresholdChars: 5 });
    const page = readToolResultPayload(config, off.path, { offset: 50_000, maxChars: 100 });
    expect(page.content).toBe("");
    expect(page.truncated).toBe(false);
    expect(page.nextOffset).toBeNull();
  });

  it("BigInt 与循环引用一样：落盘可序列化、LLM 卡可 stringify", () => {
    const payload = { title: "n", n: 1n, pad: "x".repeat(200) };
    const { card } = compact(root, payload, "x", { thresholdChars: 1, toolCallId: "c-bigint" });
    expect(() => JSON.stringify(card)).not.toThrow();
    expect(isToolResultFailed(card)).toBe(true);
  });

  it("肥 payload 压缩后卡远小于原文且不含 sampleOffsets", () => {
    const payload = {
      title: "肥文档",
      total: 61,
      items: Array.from({ length: 8 }, (_, i) => ({ id: String(i), title: `row-${i}` })),
      excerpt: "PAD-".repeat(500),
      content: "BODY-".repeat(4000) + " https://example.com/a https://example.com/b ",
      url: "https://example.com/fat",
    };
    const { card, off } = compact(root, payload, "read_article");
    const cardStr = JSON.stringify(card);
    // [OM-FREEPLAY] 1/5 是「远小于」的保守下限，防止正文或导航堆又塞回卡
    expect(cardStr.length).toBeLessThan(Math.floor(off.originalChars / 5));
    expect(cardStr).not.toContain("sampleOffsets");
    expect(cardStr).not.toContain("hitOffsets");
    expect(cardStr).not.toContain("recommendedRead");
    expect(cardStr).not.toContain("PAD-PAD");
    expect(cardStr).not.toContain("BODY-BODY");
    expect(llmHint(card)).toContain("61 条");
    expect(llmHint(card)).toContain("禁止假装已读全文");
    expect(llmHint(card)).not.toContain("web_page");
    expect(formatToolResultHint(card)).toContain("61 条");
  });
});
