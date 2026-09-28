import { describe, expect, it } from "vitest";
import { relatedPostsViewState, relatedPostHref } from "../relatedPostsView";

describe("relatedPostsViewState", () => {
  it("loading 优先于空数据", () => {
    expect(relatedPostsViewState({ isLoading: true, isError: false, items: [] }).kind).toBe(
      "loading",
    );
  });

  it("错误与空列表分态，空不得伪装成 list", () => {
    expect(
      relatedPostsViewState({ isLoading: false, isError: true, errorMessage: "boom" }),
    ).toEqual({ kind: "error", message: "boom" });
    expect(relatedPostsViewState({ isLoading: false, isError: false, items: [] }).kind).toBe(
      "empty",
    );
    expect(relatedPostsViewState({ isLoading: false, isError: false, items: null }).kind).toBe(
      "empty",
    );
  });

  it("有条目才是 list", () => {
    const item = {
      id: "1",
      slug: "a",
      garden: "posts",
      title: "t",
      score: 1,
      tags: [],
      reasons: ["tag"],
    };
    const v = relatedPostsViewState({ isLoading: false, isError: false, items: [item] });
    expect(v.kind).toBe("list");
    if (v.kind === "list") expect(v.items[0]!.id).toBe("1");
  });

  it("相关笔记 href 走 postDetailHref，其它花园带 garden 查询", () => {
    expect(relatedPostHref({ slug: "ddpm", garden: "posts" })).toBe("/posts/ddpm");
    expect(relatedPostHref({ slug: "ddpm", garden: "knowledge" })).toBe(
      "/posts/ddpm?garden=knowledge",
    );
  });
});
