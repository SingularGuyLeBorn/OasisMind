/** 公开目录纯函数测试：不读取文件，锁定重复标题和层级的稳定输出。 */
import { describe, expect, it } from "vitest";
import { extractArticleHeadings } from "../headings";

describe("extractArticleHeadings", () => {
  it("只提取二三级标题并为重复标题生成稳定 id", () => {
    expect(extractArticleHeadings("# 标题\n## 第一节\n### 细节\n## 第一节\n正文")).toEqual([
      { depth: 2, text: "第一节", id: "第一节" },
      { depth: 3, text: "细节", id: "细节" },
      { depth: 2, text: "第一节", id: "第一节-1" },
    ]);
  });

  it("忽略代码块中的伪标题，并正确处理 Setext 与链接标题", () => {
    expect(extractArticleHeadings("```md\n## 假标题\n```\n标题 [链接](https://example.com)\n---\n### **细节** 与 `代码`" )).toEqual([
      { depth: 2, text: "标题 链接", id: "标题-链接" },
      { depth: 3, text: "细节 与 代码", id: "细节-与-代码" },
    ]);
  });

  it("目录消歧计数也包含一级标题", () => {
    expect(extractArticleHeadings("# 重复\n## 重复\n### 重复")).toEqual([
      { depth: 2, text: "重复", id: "重复-1" },
      { depth: 3, text: "重复", id: "重复-2" },
    ]);
  });
});
