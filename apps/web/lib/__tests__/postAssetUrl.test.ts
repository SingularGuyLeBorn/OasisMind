import { beforeEach, describe, expect, it } from "vitest";
import { resolvePostAssetUrl } from "../postAssetUrl";

describe("resolvePostAssetUrl", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    delete process.env.NEXT_PUBLIC_R2_CDN_ENABLED;
  });
  it("花园文章相对配图带上 garden 前缀", () => {
    expect(
      resolvePostAssetUrl("images/llm_evolution_timeline.png", {
        slug: "1-导论与基础/1.3-发展历程与趋势展望/1.3-发展历程与趋势展望",
        garden: "LargeLanguageModelGuide",
      }),
    ).toBe(
      "/api/posts/assets/LargeLanguageModelGuide/1-导论与基础/1.3-发展历程与趋势展望/images/llm_evolution_timeline.png",
    );
  });

  it("花园首页 _garden 配图落在花园根目录", () => {
    expect(
      resolvePostAssetUrl("images/cover.png", {
        slug: "LargeLanguageModelGuide/_garden",
        garden: "LargeLanguageModelGuide",
      }),
    ).toBe("/api/posts/assets/LargeLanguageModelGuide/images/cover.png");
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
        garden: "ClassicPapers",
      }),
    ).toBe(
      "/api/posts/assets/ClassicPapers/ilya-30/12-understanding-lstm-networks/images/00_abstract.png",
    );
  });

  it("./images 前缀与 images 解析到同一篇文章目录", () => {
    expect(
      resolvePostAssetUrl("./images/fig-rsi-four-terms.png", {
        slug: "1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析",
        garden: "RecursiveSelfImprovement",
      }),
    ).toBe(
      "/api/posts/assets/RecursiveSelfImprovement/1-坐标系与术语/01-RSI-术语辨析/images/fig-rsi-four-terms.png",
    );
  });

  it("uploads 与绝对/外链保持可访问形式", () => {
    expect(resolvePostAssetUrl("content/uploads/a.png")).toBe("/uploads/a.png");
    expect(resolvePostAssetUrl("/uploads/a.png")).toBe("/uploads/a.png");
    expect(resolvePostAssetUrl("https://ex.com/a.png")).toBe("https://ex.com/a.png");
    expect(resolvePostAssetUrl("blob:http://localhost/x")).toBe("blob:http://localhost/x");
  });

  it("R2 启用时文章配图走 CDN", () => {
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL = "https://cdn.example.com";
    process.env.NEXT_PUBLIC_R2_CDN_ENABLED = "true";
    expect(
      resolvePostAssetUrl("images/foo.png", {
        slug: "1-导论/1.1-路线/1.1-路线",
        garden: "LargeLanguageModelGuide",
      }),
    ).toBe("https://cdn.example.com/LargeLanguageModelGuide/1-导论/1.1-路线/images/foo.png");
  });

  it("R2 启用时 uploads 走 CDN", () => {
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL = "https://cdn.example.com";
    process.env.NEXT_PUBLIC_R2_CDN_ENABLED = "true";
    expect(resolvePostAssetUrl("content/uploads/a.png")).toBe("https://cdn.example.com/uploads/a.png");
  });

  it("R2 未启用或仅配了 URL 未开开关时保持本地", () => {
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL = "https://cdn.example.com";
    expect(
      resolvePostAssetUrl("images/foo.png", {
        slug: "hello/hello",
        garden: "posts",
      }),
    ).toBe("/api/posts/assets/posts/hello/images/foo.png");
  });
});
