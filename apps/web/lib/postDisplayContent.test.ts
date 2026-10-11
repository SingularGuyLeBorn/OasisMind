import { describe, expect, it } from "vitest";
import { collapseMatchingLeadHeading } from "@/lib/postDisplayContent";

describe("collapseMatchingLeadHeading", () => {
  it("将同题首 H1 并入带章节号的页头，不改原始输入", () => {
    const original = "# 哈希与聚类: 用内容建立稀疏注意力邻域\n\n正文\n\n## 1. 从全量点积到内容桶";
    expect(collapseMatchingLeadHeading(original, "2.1.1 · 哈希与聚类: 用内容建立稀疏注意力邻域")).toEqual({
      content: "正文\n\n## 1. 从全量点积到内容桶",
      collapsedLeadHeading: true,
    });
    expect(original).toMatch(/^# 哈希与聚类/);
  });

  it("两个标题都有不同章节号时不误吞", () => {
    const content = "# 2.1.2 · 哈希与聚类\n\n正文";
    expect(collapseMatchingLeadHeading(content, "2.1.1 · 哈希与聚类")).toEqual({
      content,
      collapsedLeadHeading: false,
    });
  });

  it("副标题不同或标题不在开头时保留正文 H1", () => {
    const subtitle = "# 哈希与聚类：训练细节\n\n正文";
    const laterHeading = "引言\n\n# 哈希与聚类";
    expect(collapseMatchingLeadHeading(subtitle, "哈希与聚类：推理细节").collapsedLeadHeading).toBe(false);
    expect(collapseMatchingLeadHeading(laterHeading, "哈希与聚类").collapsedLeadHeading).toBe(false);
  });
});
