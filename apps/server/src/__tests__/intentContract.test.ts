import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  classifyIntent,
  applyRevisionToGoalText,
  buildSupersededCompactHint,
  assertSummaryOmitsSuperseded,
  applyIntentFromUserText,
} from "../infra/intentContract.js";
import { __resetGoalLoopHookForTests, __setGoalStateStoreForTests } from "../infra/goalLoop.js";
import { createTestConfig } from "./helpers/toolTestFixtures.js";
import type { SessionGoalState } from "@knowpilot/shared";

const switchBranchMock = vi.hoisted(() => vi.fn().mockResolvedValue({ switched: true }));
vi.mock("../infra/chatTree.js", () => ({
  switchBranch: (...args: unknown[]) => switchBranchMock(...args),
}));

describe("IntentContract", () => {
  let mem: Map<string, SessionGoalState | null>;

  beforeEach(() => {
    switchBranchMock.mockClear();
    __resetGoalLoopHookForTests();
    mem = new Map();
    __setGoalStateStoreForTests({
      read: async (id) => mem.get(id) ?? null,
      write: async (id, g) => {
        mem.set(id, g);
      },
    });
    mem.set("s1", {
      mode: "goal",
      text: "写一篇关于猫的文章",
      status: "active",
      turnsUsed: 1,
      maxTurns: 20,
      judgeModel: "auto",
      pendingContinue: { reason: "继续写猫" },
      verifiedProgress: [],
      intent: {
        function: "写一篇关于猫的文章",
        arguments: { topic: "猫" },
        kind: "reveal",
        superseded: [],
      },
    });
  });

  it("规则：改成 → revision；另外做 → switch", () => {
    expect(classifyIntent("改成狗，不要猫").kind).toBe("revision");
    expect(classifyIntent("另外做一个周报").kind).toBe("switch");
    expect(classifyIntent("补充一下受众是新手").kind).toBe("reveal");
  });

  it("revision 把旧 arguments 推进 superseded tombstone", async () => {
    const next = await applyIntentFromUserText({
      sessionId: "s1",
      userText: "改成狗，不要猫",
      config: createTestConfig("/tmp/intent"),
      services: {} as never,
    });
    expect(next?.text).toContain("狗");
    expect(next?.text).not.toContain("猫");
    expect(next?.intent?.kind).toBe("revision");
    expect(next?.intent?.superseded?.[0]?.oldArguments).toEqual({ topic: "猫" });
    expect(next?.pendingContinue).toBeNull();
  });

  it("switch 停旧续跑并开新 goal", async () => {
    const next = await applyIntentFromUserText({
      sessionId: "s1",
      userText: "另外做一个周报",
      config: createTestConfig("/tmp/intent"),
      services: {
        session: {
          getByIdLite: async () => ({ id: "s1", kind: "chat", parentSessionId: null }),
          update: async () => ({}),
        },
        message: { list: async () => ({ items: [] }) },
      } as never,
    });
    expect(next?.status).toBe("active");
    expect(next?.text).toMatch(/周报/);
    expect(next?.pendingContinue).toBeNull();
    expect(next?.intent?.kind).toBe("switch");
    expect(next?.intent?.superseded?.some((s) => String(s.oldArguments.topic) === "猫")).toBe(true);
  });

  it("compact 摘要不得把 superseded 当现行约束（负向）", () => {
    const goal = mem.get("s1")!;
    const revised: SessionGoalState = {
      ...goal,
      text: "写一篇关于狗的文章",
      intent: {
        function: "写一篇关于狗的文章",
        arguments: { topic: "狗" },
        kind: "revision",
        superseded: [
          { at: new Date().toISOString(), oldArguments: { topic: "猫" }, reason: "改成狗" },
        ],
      },
    };
    const hint = buildSupersededCompactHint(revised);
    expect(hint).toContain("tombstone");
    expect(hint).toContain("猫");
    expect(() => assertSummaryOmitsSuperseded("现行目标仍是猫", revised)).toThrow(/superseded/);
    expect(() => assertSummaryOmitsSuperseded("现行目标是狗", revised)).not.toThrow();
  });

  it("applyRevisionToGoalText 替换主题", () => {
    expect(applyRevisionToGoalText("写一篇关于猫的文章", "改成狗，不要猫")).toBe("写一篇关于狗的文章");
  });

  it("无 prisma / 无锚点时不换叶（现有单测路径）", async () => {
    await applyIntentFromUserText({
      sessionId: "s1",
      userText: "改成狗，不要猫",
      config: createTestConfig("/tmp/intent"),
      services: {} as never,
    });
    expect(switchBranchMock).not.toHaveBeenCalled();
  });

  it("revision 有 anchorLeafId + prisma 时先 switchBranch", async () => {
    mem.set("s1", {
      ...mem.get("s1")!,
      anchorLeafId: "clxxxxxxxxxxxxxxxxxxxxxx1",
      intent: {
        function: "写一篇关于猫的文章",
        arguments: { topic: "猫" },
        kind: "reveal",
        superseded: [
          { at: new Date().toISOString(), oldArguments: { audience: "专家" }, reason: "改受众" },
        ],
      },
    });
    await applyIntentFromUserText({
      sessionId: "s1",
      userText: "改成狗，不要猫",
      config: createTestConfig("/tmp/intent"),
      services: { prisma: {} } as never,
    });
    expect(switchBranchMock).toHaveBeenCalledTimes(1);
    const input = switchBranchMock.mock.calls[0]![2] as {
      sessionId: string;
      messageId: string;
      compactHint?: string;
    };
    expect(input).toMatchObject({
      sessionId: "s1",
      messageId: "clxxxxxxxxxxxxxxxxxxxxxx1",
    });
    expect(input.compactHint).toContain("tombstone");
    expect(input.compactHint).toContain("专家");
  });
});
