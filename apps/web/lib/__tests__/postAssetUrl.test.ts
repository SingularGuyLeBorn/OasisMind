import { describe, expect, it } from "vitest";
import { resolvePostAssetUrl } from "../postAssetUrl";

describe("resolvePostAssetUrl", () => {
  it("花园文章相对配图带上 garden 前缀", () => {
    expect(
      resolvePostAssetUrl("images/llm_evolution_timeline.png", {
        slug: "1-导论与基础/1.3-发展历程与趋势展望/1.3-发展历程与趋势展望",
        garden: "llm-guide",
      }),
    ).toBe(
      "/api/posts/assets/llm-guide/1-导论与基础/1.3-发展历程与趋势展望/images/llm_evolution_timeline.png",
    );
  });

  it("花园首页 _garden 配图落在花园根目录", () => {
    expect(
      resolvePostAssetUrl("images/cover.png", {
        slug: "llm-guide/_garden",
        garden: "llm-guide",
      }),
    ).toBe("/api/posts/assets/llm-guide/images/cover.png");
  });

  it("缺 garden 时回退 posts", () => {
    expect(
      resolvePostAssetUrl("images/a.png", { slug: "hello/hello" }),
    ).toBe("/api/posts/assets/posts/hello/images/a.png");
  });

  it("Ilya 一文一目录：配图落在该篇 images/ 而不是兄弟文章共用目录", () => {
    expect(
      resolvePostAssetUrl("images/00_abstract.png", {
        slug: "ilya-30/12-understanding-lstm-networks/12-understanding-lstm-networks",
        garden: "classic-papers",
      }),
    ).toBe(
      "/api/posts/assets/classic-papers/ilya-30/12-understanding-lstm-networks/images/00_abstract.png",
    );
  });

  it("uploads 与绝对/外链保持可访问形式", () => {
    expect(resolvePostAssetUrl("content/uploads/a.png")).toBe("/uploads/a.png");
    expect(resolvePostAssetUrl("/uploads/a.png")).toBe("/uploads/a.png");
    expect(resolvePostAssetUrl("https://ex.com/a.png")).toBe("https://ex.com/a.png");
    expect(resolvePostAssetUrl("blob:http://localhost/x")).toBe("blob:http://localhost/x");
  });
});
