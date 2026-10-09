import { describe, expect, it } from "vitest";
import { buildReadingTree } from "../readingTree";

describe("共享阅读树", () => {
  it("合并同名章节首页、保留第三层叶子并按数值排序", () => {
    const tree = buildReadingTree([
      { id: "a", garden: "g", slug: "1-基础/1-基础", title: "基础首页" },
      { id: "b", garden: "g", slug: "1-基础/1.1-概率/1.1-概率", title: "概率首页" },
      { id: "d", garden: "g", slug: "1-基础/1.1-概率/1.1.10-期望", title: "期望" },
      { id: "c", garden: "g", slug: "1-基础/1.1-概率/1.1.2-分布", title: "分布" },
    ]);
    expect(tree[0].id).toBe("a");
    expect(tree[0].children[0].id).toBe("b");
    expect(tree[0].children[0].children.map((node) => node.id)).toEqual(["c", "d"]);
  });

  it("相同花园显示名、相同子目录名不会造成 key 或分组碰撞", () => {
    const tree = buildReadingTree([
      { id: "a", garden: "g1", slug: "1/共同/叶子", title: "甲" },
      { id: "b", garden: "g2", slug: "1/共同/叶子", title: "乙" },
    ], { gardenLabels: { g1: "同名", g2: "同名" } });
    expect(tree).toHaveLength(2);
    expect(tree[0].children[0].children[0].key).not.toBe(tree[1].children[0].children[0].key);
  });

  it("保留工作台置顶排序，不把权限带入树生成器", () => {
    const tree = buildReadingTree([
      { id: "a", garden: "g", slug: "1", title: "一" },
      { id: "b", garden: "g", slug: "2", title: "二" },
    ], { isPinned: (_garden, slug) => slug === "2" });
    expect(tree.map((node) => node.id)).toEqual(["b", "a"]);
  });
});
