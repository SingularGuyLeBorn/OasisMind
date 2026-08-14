/**
 * WP0 工具结果信封契约负向测试。
 * 旧实现（无 toolEnvelope.ts）必须红；实现落地后绿。
 */

import { describe, it, expect } from "vitest";
import {
  TOOL_ENVELOPE_BRAND,
  defaultProjectContent,
  freezeJson,
  isToolEnvelope,
  snapshotJsonValue,
} from "../infra/tools/toolEnvelope.js";

describe("toolEnvelope", () => {
  it("bigint 不可序列化则 throw", () => {
    expect(() => snapshotJsonValue(1n)).toThrow(/ToolEnvelope/);
  });

  it("function 不可序列化则 throw", () => {
    expect(() => snapshotJsonValue(() => 1)).toThrow(/ToolEnvelope/);
  });

  it("循环引用 throw", () => {
    const obj: Record<string, unknown> = { a: 1 };
    obj.self = obj;
    expect(() => snapshotJsonValue(obj)).toThrow(/ToolEnvelope/);
  });

  it("freezeJson 后 Object.assign 改属性 throw", () => {
    const frozen = freezeJson({ foo: 1, nested: { bar: 2 } });
    expect(() => Object.assign(frozen, { foo: 99 })).toThrow();
    expect(() => {
      frozen.nested.bar = 99;
    }).toThrow();
  });

  it("isToolEnvelope 只认品牌字段，普通 {value,content} 为 false", () => {
    expect(isToolEnvelope({ value: 1, content: 1 })).toBe(false);
    expect(
      isToolEnvelope({ [TOOL_ENVELOPE_BRAND]: true, value: 1, content: 1 }),
    ).toBe(true);
  });

  it("defaultProjectContent 只截最长文本字段并保留 title", () => {
    const title = "完整标题";
    const url = "https://example.com/p/1";
    const content = "x".repeat(20_000);
    const projected = defaultProjectContent({ title, url, content });
    expect(projected).toEqual(
      expect.objectContaining({ title, url }),
    );
    const text = (projected as { content: string }).content;
    expect(typeof text).toBe("string");
    expect(text.length).toBeLessThan(content.length);
    expect(text).toContain("content TRUNCATED");
    expect(text).toContain("original=20000");
    expect((projected as { title: string }).title).toBe(title);
  });

  it("无长文本大 JSON 不出现半截 key", () => {
    const obj: Record<string, unknown> = {};
    for (let i = 0; i < 2000; i++) {
      obj[`key_${i}_complete`] = `v${i}`;
    }
    const projected = defaultProjectContent(obj);
    const serialized = JSON.stringify(projected);
    const parsed = JSON.parse(serialized) as {
      truncated: boolean;
      keys: string[];
      hint: string;
    };
    expect(parsed.truncated).toBe(true);
    expect(Array.isArray(parsed.keys)).toBe(true);
    expect(parsed.keys[0]).toBe("key_0_complete");
    expect(parsed.keys[1999]).toBe("key_1999_complete");
    expect(parsed.keys.every((k) => /^key_\d+_complete$/.test(k))).toBe(true);
    expect(parsed.hint).toBe("full value persisted or use tool with offset");
    expect(serialized.includes("key_0_compl\"")).toBe(false);
  });
});
