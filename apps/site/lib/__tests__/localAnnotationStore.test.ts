import { describe, expect, it } from "vitest";
import {
  MAX_BACKUP_BYTES,
  parseLocalAnnotationBackup,
  serializeLocalAnnotationBackup,
  type LocalAnnotation,
} from "../localAnnotationStore";

const sample: LocalAnnotation = {
  id: "b7b5fd4a-a9c6-46f0-8d3c-96b6fc68a416",
  articleId: "garden/1.1-article",
  contentHash: "a".repeat(64),
  anchor: { exact: "一句话", prefix: "前文", suffix: "后文", startOffset: 10, endOffset: 13, headingId: "section" },
  style: "highlight",
  comment: "我自己的理解",
  createdAt: "2026-10-11T00:00:00.000Z",
  updatedAt: "2026-10-11T00:00:00.000Z",
};

function backup(annotations: unknown[] = [sample]): string {
  return JSON.stringify({ format: "oasismind.local-annotations", version: 1, exportedAt: "2026-10-11T00:00:00.000Z", annotations });
}

describe("静态站本地批注备份", () => {
  it("全库导出可原样解析，文章 ID 与引文坐标保留", () => {
    const restored = parseLocalAnnotationBackup(serializeLocalAnnotationBackup([sample]));
    expect(restored.annotations).toEqual([sample]);
  });

  it("拒绝额外字段、无效坐标、重复 ID，且不宽松猜测旧格式", () => {
    expect(() => parseLocalAnnotationBackup(backup([{ ...sample, extra: true }]))).toThrow();
    expect(() => parseLocalAnnotationBackup(backup([{ ...sample, anchor: { ...sample.anchor, endOffset: 99 } }]))).toThrow();
    expect(() => parseLocalAnnotationBackup(backup([sample, sample]))).toThrow();
    expect(() => parseLocalAnnotationBackup(JSON.stringify({ annotations: [sample] }))).toThrow();
  });

  it("拒绝过大的 JSON 和脚本化字段", () => {
    expect(() => parseLocalAnnotationBackup("x".repeat(MAX_BACKUP_BYTES + 1))).toThrow(/过大/);
    expect(() => parseLocalAnnotationBackup(backup([{ ...sample, articleId: "bad\npath" }]))).toThrow();
  });
});
