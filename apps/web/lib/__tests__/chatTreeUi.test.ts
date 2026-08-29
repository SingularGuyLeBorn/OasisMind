import { describe, it, expect } from "vitest";
import {
  branchIndicatorLabel,
  collectBookmarks,
  countBranches,
  isAncestorOfLeaf,
  isBranchSummaryMessage,
  listBranchChildren,
  subtreeTipId,
} from "../chatTreeUi";

describe("chatTreeUi", () => {
  it("分支指示：≥2 个子节点才显示", () => {
    const children = { m1: ["c1", "c2"], m2: ["c3"] };
    expect(countBranches(children, "m1")).toBe(2);
    expect(branchIndicatorLabel(countBranches(children, "m1"))).toBe("2 个分支");
    expect(branchIndicatorLabel(countBranches(children, "m2"))).toBeNull();
  });

  it("分支指示：排除 branch_summary 子节点", () => {
    const children = { fork: ["a", "b", "sum"] };
    const kinds = { a: null, b: null, sum: "branch_summary" };
    expect(countBranches(children, "fork", kinds)).toBe(2);
  });

  it("书签收集与摘要卡判定", () => {
    const bookmarks = collectBookmarks([
      { id: "1", label: "重要", content: "hello world" },
      { id: "2", label: null, content: "skip" },
      { id: "3", label: "  ", content: "blank" },
    ]);
    expect(bookmarks).toEqual([{ id: "1", label: "重要", contentPreview: "hello world" }]);
    expect(isBranchSummaryMessage({ kind: "branch_summary", content: "x" })).toBe(true);
    expect(isBranchSummaryMessage({ content: "[om-branch-summary]\n摘要" })).toBe(true);
    expect(isBranchSummaryMessage({ kind: null, content: "普通" })).toBe(false);
  });

  it("listBranchChildren 供切换菜单", () => {
    const nodes = [
      { id: "a", kind: null, contentPreview: "分支A", role: "assistant" },
      { id: "b", kind: null, contentPreview: "分支B", role: "assistant" },
      { id: "s", kind: "branch_summary", contentPreview: "摘要", role: "system" },
    ];
    const kids = listBranchChildren({ fork: ["a", "b", "s"] }, "fork", nodes);
    expect(kids.map((k) => k.id)).toEqual(["a", "b"]);
  });

  it("isAncestorOfLeaf：叶自身、祖先为真，旁路为假；环不会死循环", () => {
    const tree = {
      activeLeafId: "u2",
      nodes: [
        { id: "u1", parentId: null },
        { id: "a1", parentId: "u1" },
        { id: "u2", parentId: "a1" },
        { id: "a2", parentId: "u1" },
      ],
    };
    expect(isAncestorOfLeaf(tree, "u2")).toBe(true);
    expect(isAncestorOfLeaf(tree, "a1")).toBe(true);
    expect(isAncestorOfLeaf(tree, "u1")).toBe(true);
    expect(isAncestorOfLeaf(tree, "a2")).toBe(false);
    expect(isAncestorOfLeaf({ ...tree, activeLeafId: null }, "a1")).toBe(false);

    const cyclic = {
      activeLeafId: "x",
      nodes: [
        { id: "x", parentId: "y" },
        { id: "y", parentId: "x" },
      ],
    };
    expect(isAncestorOfLeaf(cyclic, "x")).toBe(true);
    expect(isAncestorOfLeaf(cyclic, "y")).toBe(true);
    expect(isAncestorOfLeaf(cyclic, "z")).toBe(false);
  });

  it("subtreeTipId：线性子树切到叶；摘要不算子；多叉取更晚的叶", () => {
    const nodes = [
      { id: "u2", kind: null, createdAt: "2026-01-01T00:00:02Z" },
      { id: "a2", kind: null, createdAt: "2026-01-01T00:00:03Z" },
      { id: "sum", kind: "branch_summary", createdAt: "2026-01-01T00:00:04Z" },
      { id: "u3", kind: null, createdAt: "2026-01-01T00:00:05Z" },
      { id: "a3", kind: null, createdAt: "2026-01-01T00:00:06Z" },
    ];
    expect(
      subtreeTipId({ u2: ["a2"] }, "u2", [
        { id: "u2", kind: null, createdAt: "2026-01-01T00:00:02Z" },
        { id: "a2", kind: null, createdAt: "2026-01-01T00:00:03Z" },
      ]),
    ).toBe("a2");
    expect(subtreeTipId({ a1: ["sum"] }, "a1", [{ id: "a1" }, { id: "sum", kind: "branch_summary" }])).toBe(
      "a1",
    );
    expect(subtreeTipId({ u2: ["a2", "u3"], u3: ["a3"] }, "u2", nodes)).toBe("a3");
    expect(subtreeTipId({ a1: [] }, "a1", [{ id: "a1" }])).toBe("a1");
  });
});
