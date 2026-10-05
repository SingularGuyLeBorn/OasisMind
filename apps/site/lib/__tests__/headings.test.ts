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
});
