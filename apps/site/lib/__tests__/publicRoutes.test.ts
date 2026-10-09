import { describe, expect, it } from "vitest";
import { isUnpublishedMarkdownReference, readingLocation } from "../publicRoutes";
import type { PublicPostSummary } from "@oasismind/shared";

const post = (id: string, slug: string, title: string) => ({ id, slug, title, garden: "测试库" } as PublicPostSummary);

describe("知识树返回入口", () => {
  const posts = [post("chapter", "1-章/1-章", "1 · 章"), post("route", "1-章/1.1-路线/1.1-路线", "1.1 · 路线"),
    post("leaf", "1-章/1.1-路线/1.1.1-论文", "1.1.1 · 论文")];
  it("叶子返回路线首页，路线返回章首页，章返回知识库首页", () => {
    expect(readingLocation(posts, "测试库", "测试", "leaf").parent.href).toContain(encodeURIComponent("1.1-路线"));
    expect(readingLocation(posts, "测试库", "测试", "route").parent.title).toBe("1 · 章");
    expect(readingLocation(posts, "测试库", "测试", "chapter").parent.href).toBe(`/gardens/${encodeURIComponent("测试库")}`);
    expect(readingLocation(posts, "测试库", "测试", "leaf").breadcrumbs.map(item => item.title)).toEqual(["测试", "1 · 章", "1.1 · 路线"]);
  });
  it("无首页的分组只显示路径，返回最近有公开首页的祖先", () => {
    const missingIndex = posts.filter(item => item.id !== "route");
    const location = readingLocation(missingIndex, "测试库", "测试", "leaf");
    expect(location.parent.title).toBe("1 · 章");
    expect(location.breadcrumbs.at(-1)?.href).toBeUndefined();
  });
  it("支持 index 首页；外链直达与没有祖先的页面仍有明确返回目标", () => {
    const index = [post("index", "基础/index", "基础"), post("leaf", "基础/论文", "论文")];
    expect(readingLocation(index, "测试库", "测试", "leaf").parent.title).toBe("基础");
    expect(readingLocation(posts, "测试库", "测试", "不存在").parent.href).toContain("/gardens/");
    expect(readingLocation(posts, "测试库", "测试").parent.href).toBe("/knowledge");
  });
});

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
