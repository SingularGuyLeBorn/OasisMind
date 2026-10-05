/** 文章导出发布边界：生成的 Markdown 必须逐字保留来源文章的发布状态。 */
import { describe, expect, it } from "vitest";
import { serializePostMarkdown, type PostExportInput } from "../postExport";

function post(published: boolean): PostExportInput {
  return {
    title: "边界测试",
    slug: "draft-boundary",
    garden: "notes",
    content: "正文",
    published,
  };
}

describe("serializePostMarkdown", () => {
  it("草稿导出后仍是草稿", () => {
    const markdown = serializePostMarkdown(post(false));
    expect(markdown).toContain("\npublished: false\n");
    expect(markdown).not.toContain("\npublished: true\n");
  });

  it("只有事实源明确发布时才导出 published=true", () => {
    expect(serializePostMarkdown(post(true))).toContain("\npublished: true\n");
  });
});
