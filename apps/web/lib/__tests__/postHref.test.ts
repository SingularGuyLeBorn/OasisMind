import { describe, expect, it } from "vitest";
import { findPostByHref, resolvePostLinkTarget } from "../postHref";

const posts = [
  { slug: "ilya-30/15-attention-is-all-you-need", title: "Attention", garden: "classic-papers" },
  { slug: "hippo-最优多项式投影记忆", title: "HiPPO", garden: "classic-papers" },
];

describe("findPostByHref", () => {
  it("ASCII 子路径靠 basename 命中", () => {
    expect(findPostByHref("ilya-30/15-attention-is-all-you-need", posts)?.slug).toBe(
      "ilya-30/15-attention-is-all-you-need",
    );
  });

  it("中文 slug 不被 URL.pathname 百分号编码挡掉", () => {
    expect(findPostByHref("hippo-最优多项式投影记忆", posts)?.slug).toBe(
      "hippo-最优多项式投影记忆",
    );
  });
});

describe("resolvePostLinkTarget", () => {
  it("花园首页 classic-papers/_garden 能链到同库中文 slug", () => {
    expect(
      resolvePostLinkTarget(
        "hippo-最优多项式投影记忆",
        posts,
        "classic-papers/_garden",
        "classic-papers",
      )?.slug,
    ).toBe("hippo-最优多项式投影记忆");
  });
});
