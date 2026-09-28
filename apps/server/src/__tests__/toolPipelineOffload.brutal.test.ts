/**
 * toolPipeline persistValue × 落盘信封惨无人道测试。
 * 锁：压缩卡可 parse 且无原文；未压缩保业务字段+path；关 offload 不写盘；
 * hint 禁止假装已读；循环引用 content 可 stringify；micro-compact 不切断落盘卡。
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { formatToolResultHint, isToolResultFailed } from "@oasismind/shared";
import { wrapRawAsEnvelope, TOOL_ENVELOPE_BRAND } from "../infra/tools/toolEnvelope.js";
import { persistValue, materializeToolEnvelope } from "../infra/tools/toolPipeline.js";
import { OM_PERSISTED_KEY, OM_RESULT_PATH_KEY } from "../infra/toolResultOffload.js";
import { microCompactMessages } from "../infra/autoCompact.js";
import { createTestConfig } from "./helpers/toolTestFixtures.js";

const BODY_MARKER = "BODYMARKER" + "z".repeat(3000);

function parseContent(content: unknown): Record<string, unknown> {
  const text = typeof content === "string" ? content : JSON.stringify(content);
  return JSON.parse(text) as Record<string, unknown>;
}

function countFiles(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) n += countFiles(p);
    else n += 1;
  }
  return n;
}

describe("惨无人道：toolPipeline 信封 × 落盘", () => {
  let root: string;
  let resultsDir: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "om-pipe-offload-"));
    resultsDir = path.join(root, "data", "tool-results");
    fs.mkdirSync(resultsDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("createTestConfig 默认 toolResultOffload.enabled", () => {
    const config = createTestConfig(root);
    expect(config.compact.toolResultOffload.enabled).toBe(true);
    expect(config.compact.toolResultOffload.thresholdChars).toBe(4000);
  });

  it("compacted content 可 JSON.parse、offloaded:true、不含原文 marker", () => {
    const config = createTestConfig(root);
    const payload = { title: "长文", content: BODY_MARKER };
    const envelope = persistValue(config, wrapRawAsEnvelope(payload), {
      sessionId: "sess-compact",
      toolCallId: "call-compact",
      toolName: "read_article",
      thresholdChars: 200,
    });
    expect(envelope.persist?.path).toBeTruthy();
    const parsed = parseContent(envelope.content);
    expect(parsed.offloaded).toBe(true);
    expect(JSON.stringify(envelope.content)).not.toContain(BODY_MARKER);
    expect(JSON.stringify(envelope.value)).toContain(BODY_MARKER);
    const disk = fs.readFileSync(path.join(root, envelope.persist!.path), "utf8");
    expect(disk).toContain(BODY_MARKER);

    const viaMat = materializeToolEnvelope(payload, {
      toolName: "read_article",
      config,
      sessionId: "sess-compact-m",
      toolCallId: "call-compact-m",
      thresholdChars: 200,
    });
    const parsedM = parseContent(viaMat.content);
    expect(parsedM.offloaded).toBe(true);
    expect(JSON.stringify(viaMat.content)).not.toContain(BODY_MARKER);
  });

  it("未压缩 content 保 total/items + _om_result_path，hint 是 61 条不是全文已存", () => {
    const config = createTestConfig(root);
    const payload = {
      total: 61,
      page: 1,
      pageSize: 2,
      items: [{ id: "1", title: "alpha" }, { id: "2", title: "bravo" }],
    };
    const envelope = persistValue(config, wrapRawAsEnvelope(payload), {
      sessionId: "sess-small",
      toolCallId: "call-small",
      toolName: "post_list",
      thresholdChars: 10_000,
    });
    expect(envelope.persist?.path).toBeTruthy();
    const content = envelope.content as Record<string, unknown>;
    expect(content.total).toBe(61);
    expect(Array.isArray(content.items)).toBe(true);
    expect((content.items as unknown[]).length).toBe(2);
    expect(content[OM_RESULT_PATH_KEY]).toBe(envelope.persist!.path);
    expect(content[OM_PERSISTED_KEY]).toBe(true);
    expect(content.offloaded).not.toBe(true);
    expect(formatToolResultHint(content)).toBe("61 条");
    expect(formatToolResultHint(content)).not.toContain("全文已存");
    expect(isToolResultFailed(content)).toBe(false);

    const viaMat = materializeToolEnvelope(payload, {
      toolName: "post_list",
      config,
      sessionId: "sess-small-m",
      toolCallId: "call-small-m",
      thresholdChars: 10_000,
    });
    const c2 = viaMat.content as Record<string, unknown>;
    expect(c2.total).toBe(61);
    expect(c2[OM_RESULT_PATH_KEY]).toBeTruthy();
    expect(formatToolResultHint(c2)).toBe("61 条");
    expect(formatToolResultHint(c2)).not.toContain("全文已存");
  });

  it("offload enabled:false 时 envelope 原样、不写盘", () => {
    const config = createTestConfig(root);
    config.compact.toolResultOffload.enabled = false;
    const payload = { title: "t", content: BODY_MARKER, total: 61, items: [{ id: "1" }] };
    const incoming = wrapRawAsEnvelope(payload);
    const out = persistValue(config, incoming, {
      sessionId: "sess-off",
      toolCallId: "call-off",
      toolName: "read_article",
      thresholdChars: 200,
    });
    expect(out).toBe(incoming);
    expect(out.persist).toBeUndefined();
    expect((out.content as Record<string, unknown>)[OM_RESULT_PATH_KEY]).toBeUndefined();
    expect(countFiles(resultsDir)).toBe(0);

    const viaMat = materializeToolEnvelope(payload, {
      toolName: "read_article",
      config,
      sessionId: "sess-off-m",
      toolCallId: "call-off-m",
      thresholdChars: 200,
    });
    expect(viaMat.persist).toBeUndefined();
    expect((viaMat.content as Record<string, unknown>).offloaded).not.toBe(true);
    expect((viaMat.content as Record<string, unknown>)[OM_RESULT_PATH_KEY]).toBeUndefined();
    expect(countFiles(resultsDir)).toBe(0);
  });

  it("compacted content.hint 含禁止假装已读全文，不含记录平面", () => {
    const config = createTestConfig(root);
    const payload = { title: "线性注意力", content: BODY_MARKER, total: 61, items: [{ id: "1" }] };
    const fromPersist = persistValue(config, wrapRawAsEnvelope(payload), {
      sessionId: "sess-hint",
      toolCallId: "call-hint",
      toolName: "post_list",
      thresholdChars: 200,
    });
    const hint = (fromPersist.content as { hint?: unknown }).hint;
    expect(typeof hint).toBe("string");
    expect(hint).toContain("禁止假装已读全文");
    expect(hint).not.toContain("记录平面");

    const fromMat = materializeToolEnvelope(payload, {
      toolName: "post_list",
      config,
      sessionId: "sess-hint-m",
      toolCallId: "call-hint-m",
      thresholdChars: 200,
    });
    const hintM = (fromMat.content as { hint?: unknown }).hint;
    expect(typeof hintM).toBe("string");
    expect(hintM).toContain("禁止假装已读全文");
    expect(hintM).not.toContain("记录平面");
  });

  it("循环引用 raw 经 materializeToolEnvelope 后 content 可 stringify", () => {
    const config = createTestConfig(root);
    const raw: Record<string, unknown> = { foo: 1, total: 3 };
    raw.self = raw;
    const envelope = materializeToolEnvelope(raw, {
      toolName: "web_search",
      config,
      sessionId: "sess-cycle",
      toolCallId: "call-cycle",
    });
    expect(() => JSON.stringify(envelope.content)).not.toThrow();
    const parsed = parseContent(envelope.content);
    expect(parsed).toEqual(expect.any(Object));

    const branded: Record<string, unknown> = {
      [TOOL_ENVELOPE_BRAND]: true,
      value: raw,
      content: raw,
    };
    const fromBrand = materializeToolEnvelope(branded, {
      toolName: "web_search",
      config,
      sessionId: "sess-cycle-brand",
      toolCallId: "call-cycle-brand",
    });
    expect(() => JSON.stringify(fromBrand.content)).not.toThrow();
  });

  it("microCompact 不得切断 persistValue 卡字符串，纯长字符串仍截断", () => {
    const config = createTestConfig(root);
    const uncompressed = persistValue(
      config,
      wrapRawAsEnvelope({
        total: 61,
        items: [{ id: "1" }, { id: "2" }],
        excerpt: "e".repeat(600),
      }),
      {
        sessionId: "sess-mc",
        toolCallId: "call-mc-plain",
        toolName: "post_list",
        thresholdChars: 10_000,
      },
    );
    const plainCard = JSON.stringify(uncompressed.content);
    expect(plainCard.length).toBeGreaterThan(500);
    expect(plainCard).toContain(OM_RESULT_PATH_KEY);
    const keptPlain = microCompactMessages(
      [{ role: "tool", tool_call_id: "p", name: "post_list", content: plainCard }],
      500,
    );
    expect(keptPlain[0]!.content).toBe(plainCard);
    expect(String(keptPlain[0]!.content)).not.toContain("micro-compact");

    const compacted = persistValue(
      config,
      wrapRawAsEnvelope({ title: "长文", content: BODY_MARKER }),
      {
        sessionId: "sess-mc",
        toolCallId: "call-mc-card",
        toolName: "read_article",
        thresholdChars: 200,
      },
    );
    const slimCard = JSON.stringify(compacted.content);
    expect(slimCard.length).toBeGreaterThan(500);
    const keptSlim = microCompactMessages(
      [{ role: "tool", tool_call_id: "c", name: "read_article", content: slimCard }],
      500,
    );
    expect(keptSlim[0]!.content).toBe(slimCard);
    expect(() => JSON.parse(String(keptSlim[0]!.content))).not.toThrow();

    const truncated = microCompactMessages(
      [{ role: "tool", tool_call_id: "x", name: "raw", content: "x".repeat(2000) }],
      500,
    );
    expect(String(truncated[0]!.content).length).toBeLessThan(2000);
    expect(String(truncated[0]!.content)).toContain("micro-compact");
  });
});
