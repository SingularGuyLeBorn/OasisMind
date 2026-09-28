import { describe, it, expect } from "vitest";
import { flattenVisibleTree } from "../postTreeFlatten";

describe("flattenVisibleTree", () => {
  const tree = [
    {
      key: "a",
      children: [
        { key: "a1", children: [] },
        { key: "a2", children: [{ key: "a2x", children: [] }] },
      ],
    },
    { key: "b", children: [{ key: "b1", children: [] }] },
  ];

  it("折叠时只露出根", () => {
    const rows = flattenVisibleTree(tree, new Set());
    expect(rows.map((r) => r.node.key)).toEqual(["a", "b"]);
    expect(rows.map((r) => r.depth)).toEqual([0, 0]);
  });

  it("只展开标记过的分支", () => {
    const rows = flattenVisibleTree(tree, new Set(["a", "a2"]));
    expect(rows.map((r) => `${r.depth}:${r.node.key}`)).toEqual([
      "0:a",
      "1:a1",
      "1:a2",
      "2:a2x",
      "0:b",
    ]);
  });
});
