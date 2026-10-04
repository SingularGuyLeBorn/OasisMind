import { describe, expect, it } from "vitest";
import { markdownSanitizeSchema, safeMarkdownUrlTransform } from "../index.js";

describe("Markdown 共享安全边界", () => {
  it("只放行明确允许的 URL 协议", () => {
    expect(safeMarkdownUrlTransform("https://example.com/a")).toBe("https://example.com/a");
    expect(safeMarkdownUrlTransform("../asset.png")).toBe("../asset.png");
    expect(safeMarkdownUrlTransform("javascript:alert(1)")).toBe("");
  });

  it("保留手写 mark 所需属性但不允许事件属性", () => {
    const markAttributes = markdownSanitizeSchema.attributes?.mark ?? [];
    expect(markAttributes).toContain("dataAnnotation");
    expect(markAttributes).not.toContain("onClick");
    expect(markdownSanitizeSchema.tagNames).not.toContain("script");
  });
});
