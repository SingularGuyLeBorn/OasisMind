import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../infra/config.js", () => ({
  getAppConfig: () => ({
    llm: { defaultModel: "deepseek-v4-flash" },
  }),
}));

const completeSpy = vi.fn();
vi.mock("../infra/resilientLlmClient.js", () => ({
  resilientChatCompletion: (...args: unknown[]) => completeSpy(...args),
}));

const execToolSpy = vi.fn();
vi.mock("../infra/nativeTools.js", () => ({
  executeNativeTool: (...args: unknown[]) => execToolSpy(...args),
}));

import {
  __buildEditorCompleteUserPromptForTests,
  completeEditorWithAgent,
  stripFormulaCopilotLatex,
} from "../infra/editorAgentComplete.js";

describe("editorAgentComplete", () => {
  beforeEach(() => {
    completeSpy.mockReset();
    execToolSpy.mockReset();
    completeSpy.mockResolvedValue({ content: "## 示例\n\n内容。", toolCalls: [] });
  });

  it("prompt 含指令与前后文与当前段落", () => {
    const p = __buildEditorCompleteUserPromptForTests({
      agentId: "x",
      instruction: "在这里写一个 LoRA 例子",
      before: "前文AAA",
      after: "后文BBB",
      paragraph: "这里应该是例子",
      title: "持续学习",
      garden: "llm-guide",
      slug: "4.7",
    });
    expect(p).toContain("在这里写一个 LoRA 例子");
    expect(p).toContain("前文AAA");
    expect(p).toContain("后文BBB");
    expect(p).toContain("这里应该是例子");
    expect(p).toContain("当前段落");
    expect(p).toContain("持续学习");
  });

  it("注入 Agent systemPrompt 并返回片段", async () => {
    const services = {
      agent: {
        getById: vi.fn().mockResolvedValue({
          id: "clagent00000000000000000001",
          name: "写作助手",
          status: "active",
          systemPrompt: "你是严谨的技术写作者。",
        }),
      },
    };

    const res = await completeEditorWithAgent(services as never, {
      agentId: "clagent00000000000000000001",
      instruction: "写一段简介",
      before: "# 标题\n\n",
      after: "",
      model: "deepseek-v4-flash",
    });

    expect(res.content).toContain("示例");
    expect(res.model).toBe("deepseek-v4-flash");
    expect(res.agentName).toBe("写作助手");
    const args = completeSpy.mock.calls[0]![0] as {
      model: string;
      enableReasoning: boolean;
      messages: Array<{ role: string; content: string }>;
      tools?: Array<{ function: { name: string } }>;
    };
    expect(args.model).toBe("deepseek-v4-flash");
    expect(args.enableReasoning).toBe(false);
    expect(args.messages[0]!.content).toContain("你是严谨的技术写作者");
    expect(args.messages[0]!.content).toContain("输出格式铁律");
    expect(args.messages[0]!.content).toContain("公式");
    expect(args.messages[0]!.content).toContain("表格");
    expect(args.messages[0]!.content).toContain("svg");
    expect(args.messages[1]!.content).toContain("写一段简介");
    expect(args.tools?.[0]?.function.name).toBe("generate_illustration");
  });

  it("模型调 generate_illustration 后把工具结果回灌再出 Markdown", async () => {
    completeSpy
      .mockResolvedValueOnce({
        content: "",
        toolCalls: [
          {
            id: "call_1",
            type: "function",
            function: {
              name: "generate_illustration",
              arguments: JSON.stringify({ prompt: "linear attention figure" }),
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        content: "![线性注意力](/uploads/g/p/fig-001.png)",
        toolCalls: [],
      });
    execToolSpy.mockResolvedValue({
      url: "/uploads/g/p/fig-001.png",
      markdown: "![线性注意力](/uploads/g/p/fig-001.png)",
    });

    const services = {
      agent: {
        getById: vi.fn().mockResolvedValue({
          id: "clagent00000000000000000001",
          name: "写作助手",
          status: "active",
          systemPrompt: "sp",
        }),
      },
    };
    const res = await completeEditorWithAgent(services as never, {
      agentId: "clagent00000000000000000001",
      instruction: "加一张图",
      garden: "llm-guide",
      postId: "clxxxxxxxxxxxxxxxxxxxxxxxx",
    });
    expect(res.content).toContain("fig-001.png");
    expect(execToolSpy).toHaveBeenCalledWith(
      "generate_illustration",
      expect.objectContaining({
        prompt: "linear attention figure",
        garden: "llm-guide",
        postId: "clxxxxxxxxxxxxxxxxxxxxxxxx",
      }),
      expect.anything(),
    );
    expect(completeSpy).toHaveBeenCalledTimes(2);
  });

  it("剥掉整篇 markdown 围栏", async () => {
    completeSpy.mockResolvedValue({
      content: "```markdown\nhello\n```",
    });
    const services = {
      agent: {
        getById: vi.fn().mockResolvedValue({
          id: "clagent00000000000000000001",
          name: "a",
          status: "active",
          systemPrompt: "sp",
        }),
      },
    };
    const res = await completeEditorWithAgent(services as never, {
      agentId: "clagent00000000000000000001",
      instruction: "写",
    });
    expect(res.content).toBe("hello");
  });

  it("stripFormulaCopilotLatex 剥 $$ 与围栏", () => {
    expect(stripFormulaCopilotLatex("$$E=mc^2$$")).toBe("E=mc^2");
    expect(stripFormulaCopilotLatex("```latex\n\\frac{a}{b}\n```")).toBe("\\frac{a}{b}");
    expect(stripFormulaCopilotLatex("\\[ x + y \\]")).toBe("x + y");
  });
});

describe("extractFormulaContext lines", () => {
  it("截取末尾/开头 N 行", async () => {
    const { FORMULA_COPILOT_CONTEXT_LINES } = await import("@oasismind/shared");
    expect(FORMULA_COPILOT_CONTEXT_LINES).toBe(10);
  });
});
