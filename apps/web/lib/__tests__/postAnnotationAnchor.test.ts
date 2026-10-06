/** 批注锚点纯函数测试：不接触私人文件，覆盖正文漂移后的重定位与显式失配。 */
import { describe, expect, it } from "vitest";
import {
  createPostAnnotationAnchor,
  createRangeFromPostAnnotationAnchor,
  resolvePostAnnotationAnchor,
} from "@/lib/postAnnotationAnchor";

describe("postAnnotationAnchor", () => {
  it("原文未变化时直接使用精确 offset", () => {
    const result = resolvePostAnnotationAnchor("甲乙丙丁", {
      exact: "乙丙",
      prefix: "甲",
      suffix: "丁",
      startOffset: 1,
      endOffset: 3,
    });
    expect(result).toEqual({ startOffset: 1, endOffset: 3, matchedBy: "offset" });
  });

  it("正文前方插入文字后利用上下文重新定位", () => {
    const result = resolvePostAnnotationAnchor("新增：甲乙丙丁", {
      exact: "乙丙",
      prefix: "甲",
      suffix: "丁",
      startOffset: 1,
      endOffset: 3,
    });
    expect(result).toEqual({ startOffset: 4, endOffset: 6, matchedBy: "context" });
  });

  it("重复引文按两侧上下文选择正确位置", () => {
    const text = "第一段：相同句子。第二段：相同句子！";
    const startOffset = text.lastIndexOf("相同句子");
    const result = resolvePostAnnotationAnchor(text, {
      exact: "相同句子",
      prefix: "第二段：",
      suffix: "！",
      startOffset: 0,
      endOffset: 4,
    });
    expect(result?.startOffset).toBe(startOffset);
    expect(result?.matchedBy).toBe("context");
  });

  it("引文已被删除时明确返回无法定位", () => {
    expect(
      resolvePostAnnotationAnchor("完全不同的正文", {
        exact: "旧引文",
        prefix: "",
        suffix: "",
        startOffset: 2,
        endOffset: 5,
      }),
    ).toBeNull();
  });

  it("能在跨文本节点选区和重建后的 Range 之间往返", () => {
    const root = document.createElement("div");
    root.innerHTML = "<p>前缀<strong>重点</strong>后缀</p>";
    const strongText = root.querySelector("strong")?.firstChild;
    expect(strongText).toBeInstanceOf(Text);

    const selected = document.createRange();
    selected.setStart(strongText!, 0);
    selected.setEnd(strongText!, 2);
    const anchor = createPostAnnotationAnchor(root, selected);
    expect(anchor).toMatchObject({ exact: "重点", startOffset: 2, endOffset: 4 });

    const rebuilt = createRangeFromPostAnnotationAnchor(root, anchor!);
    expect(rebuilt?.toString()).toBe("重点");
  });
});
