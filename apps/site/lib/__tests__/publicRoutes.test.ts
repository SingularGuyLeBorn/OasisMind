import { describe, expect, it } from "vitest";
import { isUnpublishedMarkdownReference } from "../publicRoutes";

describe("未公开 Markdown 引用", () => {
  it("本地源文件链接不能伪装成可用的公开文章地址", () => {
    expect(isUnpublishedMarkdownReference("../draft.md#推导")).toBe(true);
    expect(isUnpublishedMarkdownReference("/content/notes/draft.md")).toBe(true);
  });

  it("保留已转换的文章、公开 Markdown 下载、外链与本页锚点", () => {
    for (const href of ["/OasisMind/articles/notes/a", "/OasisMind/api/v1/posts/notes/a.md",
      "https://example.com/report.md", "//example.com/report.md", "#推导", undefined]) {
      expect(isUnpublishedMarkdownReference(href)).toBe(false);
    }
  });
});
