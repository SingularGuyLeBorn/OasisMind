import { describe, it, expect } from "vitest";
import { buildToolResultMetadata } from "../infra/toolResultMetadata.js";

describe("toolResultMetadata", () => {
  it("网页类结果抽出 contentType / shortFields / urls / topics", () => {
    const result = {
      title: "PyTorch 2.4 Release Notes",
      url: "https://pytorch.org/blog/pytorch-2-4/",
      platform: "web",
      content: "noise ".repeat(200) + "torch.compile improves by 30%. " + "tail ".repeat(200),
    };
    const meta = buildToolResultMetadata(result, {
      toolName: "read_article",
      originalChars: JSON.stringify(result).length,
      keywords: ["torch.compile", "missing"],
    });
    expect(meta.contentType).toBe("web_page");
    expect(meta.title).toContain("PyTorch");
    expect(meta.url).toContain("pytorch.org");
    expect(meta.shortFields.title).toBeTruthy();
    expect(meta.fieldSizes.content).toBeGreaterThan(100);
    expect(meta.hitCount).toBeGreaterThanOrEqual(1);
    expect(meta.missedKeywords).toContain("missing");
    expect(meta.hitOffsets[0]?.keyword).toContain("torch.compile");
    expect(meta.topics.some((t) => /torch|PyTorch|compile/i.test(t))).toBe(true);
    expect(meta.recommendedRead.length).toBeGreaterThan(0);
    // metadata 不含正文片段
    expect(JSON.stringify(meta)).not.toContain("improves by 30%");
  });

  it("错误结果标 contentType=error", () => {
    const meta = buildToolResultMetadata(
      { error: "TIMEOUT", message: "tool timed out" },
      { toolName: "web_search", originalChars: 40 },
    );
    expect(meta.contentType).toBe("error");
    expect(meta.hasError).toBe(true);
    expect(meta.shortFields.error).toBe("TIMEOUT");
  });

  it("error 对象抽出 message；error:false / 成功 message 不是 hasError", () => {
    const nested = buildToolResultMetadata(
      { error: { message: "ENOENT: foo.md", code: "ENOENT" } },
      { toolName: "read_file", originalChars: 40 },
    );
    expect(metaHasErrorAndMessage(nested, "ENOENT: foo.md")).toBe(true);

    const notErr = buildToolResultMetadata(
      { error: false, title: "ok", content: "x" },
      { toolName: "x", originalChars: 20 },
    );
    expect(notErr.hasError).toBe(false);

    const okMsg = buildToolResultMetadata(
      { success: true, message: "Agent 被创建", total: 1 },
      { toolName: "agent_create", originalChars: 40 },
    );
    expect(okMsg.hasError).toBe(false);

    const failReason = buildToolResultMetadata(
      { success: false, reason: "花园不存在" },
      { toolName: "post_list", originalChars: 20 },
    );
    expect(failReason.hasError).toBe(true);
    expect(failReason.shortFields.reason).toBe("花园不存在");
  });

  it("顶层数组写入 fieldSizes.items", () => {
    const meta = buildToolResultMetadata([{ id: 1 }, { id: 2 }], {
      toolName: "x",
      originalChars: 10,
    });
    expect(meta.fieldSizes.items).toBe(2);
  });

  it("嵌套 data.total 抬到 shortFields.total", () => {
    const meta = buildToolResultMetadata(
      {
        data: { total: 61, items: [{ id: "1" }, { id: "2" }] },
      },
      { toolName: "post_list", originalChars: 40 },
    );
    expect(meta.shortFields.total).toBe("61");
    expect(meta.fieldSizes.items).toBe(2);
  });
});

function metaHasErrorAndMessage(
  meta: { hasError: boolean; shortFields: Record<string, string> },
  msg: string,
): boolean {
  expect(meta.hasError).toBe(true);
  expect(meta.shortFields.error).toBe(msg);
  expect(meta.shortFields.error).not.toBe("{…}");
  return true;
}
