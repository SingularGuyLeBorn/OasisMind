import { describe, expect, it } from "vitest";
import {
  buildPollinationsUrl,
  listBuiltinImageGenModels,
  resolveDefaultImageGenModel,
  resolveImageGenModel,
  generateImageBytes,
  MOCK_PNG_1X1,
} from "../infra/imageGen.js";
import { pickIllustrationPromptSource } from "../infra/editorIllustration.js";

function cfg(openrouterKey = "") {
  return {
    llm: {
      providers: {
        openrouter: { apiKey: openrouterKey, baseUrl: "https://openrouter.ai/api/v1", model: "" },
      },
    },
  } as never;
}

describe("imageGen catalog", () => {
  it("无 key 时默认最强免费是 pollinations/flux", () => {
    const models = listBuiltinImageGenModels(cfg());
    expect(resolveDefaultImageGenModel(models)).toBe("pollinations/flux");
    expect(models.filter((m) => m.provider === "pollinations").every((m) => m.available)).toBe(true);
    expect(models.filter((m) => m.provider === "openrouter").every((m) => !m.available)).toBe(true);
  });

  it("有 OpenRouter key 时付费模型标为可用，默认仍走免费 FLUX", () => {
    const models = listBuiltinImageGenModels(cfg("sk-or-test"));
    expect(models.some((m) => m.provider === "openrouter" && m.available)).toBe(true);
    expect(resolveDefaultImageGenModel(models)).toBe("pollinations/flux");
  });

  it("未选模型 resolve 到默认免费档", () => {
    expect(resolveImageGenModel(cfg()).id).toBe("pollinations/flux");
  });

  it("无 key 时点名 OpenRouter 模型直接报错", () => {
    expect(() => resolveImageGenModel(cfg(), "black-forest-labs/flux.2-pro")).toThrow(/OpenRouter/);
  });
});

describe("pollinations url", () => {
  it("编码 prompt 并带 flux 参数", () => {
    const url = buildPollinationsUrl("linear attention diagram", "flux");
    expect(url).toContain("image.pollinations.ai/prompt/");
    expect(url).toContain(encodeURIComponent("linear attention diagram"));
    expect(url).toContain("model=flux");
    expect(url).toContain("nologo=true");
  });
});

describe("pickIllustrationPromptSource", () => {
  it("优先用选区长文本，不走 LLM", () => {
    const pick = pickIllustrationPromptSource({
      selected: "Create a technical educational figure about linear attention with four panels.",
    });
    expect(pick.source).toBe("selected");
    expect(pick.prompt).toContain("linear attention");
  });

  it("正文 ```text 围栏当作现成 prompt", () => {
    const pick = pickIllustrationPromptSource({
      before: "可直接给生图模型的 prompt:\n\n```text\nCreate a technical educational figure about linear attention.\n```\n",
      after: "",
    });
    expect(pick.source).toBe("fence");
    expect(pick.prompt).toContain("technical educational figure");
  });

  it("用户写了补充说明则交给 LLM 融合", () => {
    const pick = pickIllustrationPromptSource({
      selected: "Create a technical educational figure about linear attention with four panels.",
      instruction: "只要 Performer 那一格",
    });
    expect(pick.source).toBe("llm");
    expect(pick.prompt).toBeNull();
  });
});

describe("generateImageBytes retry", () => {
  it("首次失败会再试一次", async () => {
    const prev = process.env.MOCK_LLM;
    delete process.env.MOCK_LLM;
    let n = 0;
    const png = MOCK_PNG_1X1;
    try {
      const img = await generateImageBytes(cfg(), "a diagram", "pollinations/flux", async () => {
        n += 1;
        if (n === 1) {
          return new Response("busy", { status: 503, headers: { "content-type": "text/plain" } });
        }
        return new Response(png, { status: 200, headers: { "content-type": "image/png" } });
      });
      expect(n).toBe(2);
      expect(img.bytes.equals(png)).toBe(true);
    } finally {
      if (prev === undefined) delete process.env.MOCK_LLM;
      else process.env.MOCK_LLM = prev;
    }
  });
});

describe("generateImageBytes mock", () => {
  it("MOCK_LLM 返回 1x1 png 且不发网", async () => {
    const prev = process.env.MOCK_LLM;
    process.env.MOCK_LLM = "true";
    try {
      const img = await generateImageBytes(cfg(), "a diagram", undefined, async () => {
        throw new Error("不应发网");
      });
      expect(img.bytes.equals(MOCK_PNG_1X1)).toBe(true);
      expect(img.modelId).toBe("pollinations/flux");
    } finally {
      if (prev === undefined) delete process.env.MOCK_LLM;
      else process.env.MOCK_LLM = prev;
    }
  });
});
