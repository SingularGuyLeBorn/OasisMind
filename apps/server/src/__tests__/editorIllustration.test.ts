import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../infra/config.js", () => ({
  getAppConfig: () => ({
    llm: {
      defaultModel: "deepseek-v4-flash",
      providers: { openrouter: { apiKey: "", baseUrl: "", model: "" } },
    },
  }),
}));

const completeSpy = vi.fn();
vi.mock("../infra/resilientLlmClient.js", () => ({
  resilientChatCompletion: (...args: unknown[]) => completeSpy(...args),
}));

const genBytesSpy = vi.fn();
vi.mock("../infra/imageGen.js", () => ({
  generateImageBytes: (...args: unknown[]) => genBytesSpy(...args),
}));

import {
  generateEditorIllustration,
  pickIllustrationPromptSource,
  nextFigSerial,
  formatFigFileName,
  __buildIllustrationPromptUserForTests,
} from "../infra/editorIllustration.js";

describe("generateEditorIllustration", () => {
  beforeEach(() => {
    completeSpy.mockReset();
    genBytesSpy.mockReset();
    completeSpy.mockResolvedValue({
      content: "Create a research-paper figure of linear attention.",
    });
    genBytesSpy.mockResolvedValue({
      bytes: Buffer.from("png"),
      mimeType: "image/png",
      modelId: "pollinations/flux",
    });
  });

  it("现成围栏 prompt 不调 LLM，生图后落盘返回 url", async () => {
    const upload = vi.fn().mockResolvedValue({
      success: true,
      data: { url: "/uploads/llm-guide/abc/illustration-x.png" },
    });
    const res = await generateEditorIllustration(
      { file: { upload } } as never,
      {
        before:
          "```text\nCreate a technical educational figure about linear attention in four panels.\n```\n",
        after: "",
        title: "线性注意力",
        garden: "llm-guide",
        postId: "clxxxxxxxxxxxxxxxxxxxxxxxx",
      },
    );
    expect(completeSpy).not.toHaveBeenCalled();
    expect(genBytesSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining("linear attention"),
      undefined,
    );
    expect(upload).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "fig-001.png",
        unique: false,
        mimeType: "image/png",
        garden: "llm-guide",
        postId: "clxxxxxxxxxxxxxxxxxxxxxxxx",
      }),
    );
    expect(res.url).toBe("/uploads/llm-guide/abc/illustration-x.png");
    expect(res.model).toBe("pollinations/flux");
    expect(res.alt.length).toBeGreaterThan(0);
  });

  it("无现成 prompt 时用 LLM 写再送生图", async () => {
    const upload = vi.fn().mockResolvedValue({
      success: true,
      data: { url: "/uploads/x.png" },
    });
    await generateEditorIllustration({ file: { upload } } as never, {
      before: "线性注意力把 QK 矩阵消掉",
      after: "",
      paragraph: "Performer 用随机特征",
      instruction: "画特征映射",
    });
    expect(completeSpy).toHaveBeenCalled();
    const args = completeSpy.mock.calls[0]![0] as {
      messages: Array<{ content: string }>;
    };
    expect(args.messages[1]!.content).toContain("画特征映射");
    expect(args.messages[1]!.content).toContain("Performer");
    expect(genBytesSpy.mock.calls[0]![1]).toContain("research-paper figure");
  });

  it("prompt 用户消息含标题与前后文", () => {
    const p = __buildIllustrationPromptUserForTests({
      title: "线性注意力",
      before: "前文",
      after: "后文",
      instruction: "画对比图",
    });
    expect(p).toContain("线性注意力");
    expect(p).toContain("前文");
    expect(p).toContain("后文");
    expect(p).toContain("画对比图");
  });

  it("短选区不当成现成 prompt", () => {
    expect(pickIllustrationPromptSource({ selected: "见图" }).source).toBe("llm");
  });

  it("fig 编号取同目录最大号 + 1", () => {
    expect(nextFigSerial([])).toBe(1);
    expect(nextFigSerial(["fig-001.png", "fig-003.webp"])).toBe(4);
    expect(formatFigFileName(12, ".png")).toBe("fig-012.png");
  });
});
