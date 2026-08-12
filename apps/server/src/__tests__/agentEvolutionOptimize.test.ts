/**
 * P2-3：经验蒸馏失败归因（IVE）+ 人工 review 闸（ESE）
 *
 * - attributeFailure：工具错误签名 → implementation；无签名 → unknown
 * - accumulateExperience：失败经验写入 failureKind/failureReason + keywords 带 failure:* 标签
 * - optimizeAgentPrompt：提案制——创建 pending Approval（agent.update），禁止直接写回 prompt
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

const writeMock = vi.hoisted(() => vi.fn());
const readMock = vi.hoisted(() => vi.fn());

vi.mock("../infra/memoryRepository.js", () => ({
  createMemoryRepository: () => ({
    write: writeMock,
    read: readMock,
  }),
}));

import {
  accumulateExperience,
  attributeFailure,
  optimizeAgentPrompt,
  type ExperienceSummary,
} from "../infra/agentEvolution.js";
import type { StoredToolCall } from "../infra/chatHistory.js";

function toolCall(name: string, result: unknown): StoredToolCall {
  return { id: `c_${name}`, name, args: {}, result, kind: "tool" };
}

describe("attributeFailure（IVE 规则归因）", () => {
  it("工具结果含 error 字段 → implementation", () => {
    const r = attributeFailure([
      toolCall("read_article", { error: "HTTP 403 被反爬拦截" }),
    ]);
    expect(r.failureKind).toBe("implementation");
    expect(r.failureReason).toContain("read_article");
    expect(r.failureReason).toContain("403");
  });

  it("工具结果 success=false → implementation", () => {
    const r = attributeFailure([
      toolCall("write_file", { success: false, message: "输出验证未通过" }),
    ]);
    expect(r.failureKind).toBe("implementation");
    expect(r.failureReason).toContain("输出验证未通过");
  });

  it("无工具错误签名 → unknown", () => {
    const r = attributeFailure([
      toolCall("web_search", { results: [] }),
      toolCall("read_file", { content: "ok" }),
    ]);
    expect(r.failureKind).toBe("unknown");
    expect(r.failureReason).toBeUndefined();
  });

  it("thinking/content 条目不参与归因", () => {
    const r = attributeFailure([
      { id: "t1", name: "__thinking__", args: {}, result: { error: "x" }, kind: "thinking" },
    ]);
    expect(r.failureKind).toBe("unknown");
  });
});

describe("accumulateExperience 失败归因写入", () => {
  beforeEach(() => {
    writeMock.mockReset();
    readMock.mockReset();
  });

  const baseInput = { message: "做个任务", trigger: "chat" };

  function makePrisma() {
    return {
      agent: { update: vi.fn(async () => ({})) },
    } as any;
  }

  it("成功经验不写 failureKind", async () => {
    const prisma = makePrisma();
    const r = await accumulateExperience(
      prisma,
      {} as any,
      "a1",
      "s1",
      {
        content: "完成了",
        toolCalls: [toolCall("web_search", { results: [1] })],
        tokenUsage: null,
        roundsUsed: 1,
      },
      baseInput,
      1000,
    );
    expect(r.written).toBe(true);
    const written = JSON.parse(writeMock.mock.calls[0]![0].content) as ExperienceSummary;
    expect(written.success).toBe(true);
    expect(written.failureKind).toBeUndefined();
  });

  it("失败经验带 implementation 归因 + keywords 标签", async () => {
    const prisma = makePrisma();
    const r = await accumulateExperience(
      prisma,
      {} as any,
      "a1",
      "s1",
      {
        content: "",
        toolCalls: [toolCall("read_article", { error: "HTTP 403" })],
        tokenUsage: null,
        roundsUsed: 1,
      },
      baseInput,
      1000,
    );
    expect(r.written).toBe(true);
    const arg = writeMock.mock.calls[0]![0];
    const written = JSON.parse(arg.content) as ExperienceSummary;
    expect(written.success).toBe(false);
    expect(written.failureKind).toBe("implementation");
    expect(written.failureReason).toContain("403");
    expect(arg.keywords).toContain("failure:implementation");
  });

  it("失败但无工具错误签名 → unknown 归因", async () => {
    const prisma = makePrisma();
    await accumulateExperience(
      prisma,
      {} as any,
      "a1",
      "s1",
      {
        content: "  ",
        toolCalls: [toolCall("web_search", { results: [] })],
        tokenUsage: null,
        roundsUsed: 1,
      },
      baseInput,
      1000,
    );
    const written = JSON.parse(writeMock.mock.calls[0]![0].content) as ExperienceSummary;
    expect(written.failureKind).toBe("unknown");
  });
});

describe("optimizeAgentPrompt（ESE 人工 review 闸）", () => {
  beforeEach(() => {
    writeMock.mockReset();
    readMock.mockReset();
  });

  function exp(partial: Partial<ExperienceSummary>): { content: string } {
    return {
      content: JSON.stringify({
        taskDescription: "t",
        toolsUsed: ["native:web_search"],
        success: true,
        durationMs: 1,
        tokenUsage: null,
        keyLearnings: "ok",
        ...partial,
      } satisfies ExperienceSummary),
    };
  }

  function makeHarness(opts: { agentTier?: string } = {}) {
    const approvalCreate = vi.fn(async (input: any) => ({
      success: true,
      data: { id: "appr-1", ...input },
    }));
    const agentUpdate = vi.fn(async () => ({}));
    const prisma = {
      agent: {
        findUnique: vi.fn(async () => ({
          id: "a1",
          name: "工人甲",
          status: "active",
          tier: opts.agentTier ?? "sub",
          systemPrompt: "原 prompt",
        })),
      },
      log: { create: vi.fn(async () => ({})) },
    } as any;
    const services = {
      approval: { create: approvalCreate },
      agent: { update: agentUpdate },
    } as any;
    return { prisma, services, approvalCreate, agentUpdate };
  }

  it("经验不足 5 条 → 失败且不建审批", async () => {
    readMock.mockResolvedValue([exp({}), exp({})]);
    const { prisma, services, approvalCreate } = makeHarness();
    const r = await optimizeAgentPrompt(prisma, services, "a1", "mgr");
    expect(r.success).toBe(false);
    expect(r.reason).toMatch(/经验不足/);
    expect(approvalCreate).not.toHaveBeenCalled();
  });

  it("super Agent → 拒绝", async () => {
    const { prisma, services } = makeHarness({ agentTier: "super" });
    const r = await optimizeAgentPrompt(prisma, services, "a1", "mgr");
    expect(r.success).toBe(false);
    expect(r.reason).toMatch(/超级 Agent/);
  });

  it("正常路径：创建 pending Approval（agent.update），禁止直接写回 prompt", async () => {
    readMock.mockResolvedValue([
      exp({ success: true }),
      exp({ success: true }),
      exp({ success: false, failureKind: "implementation", failureReason: "工具 read_article 报错：HTTP 403" }),
      exp({ success: false, failureKind: "direction" }),
      exp({ success: true }),
    ]);
    const { prisma, services, approvalCreate, agentUpdate } = makeHarness();
    const r = await optimizeAgentPrompt(prisma, services, "a1", "mgr");

    expect(r.success).toBe(true);
    expect(r.pendingApproval).toBe(true);
    expect(r.approvalId).toBe("appr-1");
    // 铁律：不直接改 prompt
    expect(agentUpdate).not.toHaveBeenCalled();

    expect(approvalCreate).toHaveBeenCalledOnce();
    const arg = approvalCreate.mock.calls[0]![0];
    expect(arg.toolName).toBe("agent.update");
    expect(arg.status).toBe("pending");
    expect(arg.decisionScope).toBe("agent:update:a1");
    expect(arg.args.id).toBe("a1");
    expect(arg.args.systemPrompt).toContain("原 prompt");
    // 提案文案：成功率 + 失败归因分层
    expect(arg.args.systemPrompt).toContain("近期成功率：60%");
    expect(arg.args.systemPrompt).toContain("实现失败 1 / 方向失败 1");
    expect(arg.args.systemPrompt).toContain("实现层");
    expect(arg.args.systemPrompt).toContain("方向层");
    expect(r.proposal).toContain("自动优化提案");
  });

  it("审批创建失败 → 返回失败", async () => {
    readMock.mockResolvedValue([exp({}), exp({}), exp({}), exp({}), exp({})]);
    const { prisma, services, approvalCreate } = makeHarness();
    approvalCreate.mockResolvedValue({ success: false, error: { message: "db down" } } as any);
    const r = await optimizeAgentPrompt(prisma, services, "a1", "mgr");
    expect(r.success).toBe(false);
    expect(r.reason).toMatch(/审批/);
  });
});
