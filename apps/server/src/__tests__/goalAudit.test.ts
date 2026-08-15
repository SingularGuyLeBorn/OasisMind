import { describe, it, expect, beforeEach } from "vitest";
import {
  assertEvidenceRefsExist,
  appendVerifiedProgress,
  GoalAuditError,
} from "../infra/goalAudit.js";
import {
  evaluateGoalAfterTurn,
  __resetGoalLoopHookForTests,
  __setGoalStateStoreForTests,
} from "../infra/goalLoop.js";
import { createTestConfig } from "./helpers/toolTestFixtures.js";
import type { SessionGoalState } from "@knowpilot/shared";

describe("goalAudit verifiedProgress 写入权", () => {
  let mem: Map<string, SessionGoalState | null>;

  beforeEach(() => {
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
      turnsUsed: 0,
      maxTurns: 20,
      judgeModel: "auto",
      verifiedProgress: [],
    });
  });

  it("无 evidenceRefs → BAD_REQUEST（负向）", async () => {
    expect(() => assertEvidenceRefsExist([])).toThrow(GoalAuditError);
    await expect(
      appendVerifiedProgress({ sessionId: "s1", claim: "写了", evidenceRefs: [] }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mem.get("s1")?.verifiedProgress ?? []).toHaveLength(0);
  });

  it("evidenceRefs 对不上磁盘 → 不写入", async () => {
    await expect(
      appendVerifiedProgress({
        sessionId: "s1",
        claim: "假证据",
        evidenceRefs: ["data/tool-results/missing.json"],
        existsFn: () => false,
      }),
    ).rejects.toThrow(/对不上/);
    expect(mem.get("s1")?.verifiedProgress ?? []).toHaveLength(0);
  });

  it("有证据才写入", async () => {
    const next = await appendVerifiedProgress({
      sessionId: "s1",
      claim: "落盘了长文",
      evidenceRefs: ["data/tool-results/s1/call.json"],
      existsFn: () => true,
    });
    expect(next.verifiedProgress).toHaveLength(1);
    expect(mem.get("s1")?.verifiedProgress?.[0]?.claim).toBe("落盘了长文");
  });

  it("writeGoalStateRaw 默认冻结核实进度：普通写点改不了 verifiedProgress", async () => {
    const { writeGoalStateRaw } = await import("../infra/goalLoop.js");
    await appendVerifiedProgress({
      sessionId: "s1",
      claim: "已核实",
      evidenceRefs: ["p"],
      existsFn: () => true,
    });
    await writeGoalStateRaw("s1", {
      ...mem.get("s1")!,
      verifiedProgress: [],
    });
    expect(mem.get("s1")?.verifiedProgress).toHaveLength(1);
  });

  it("自评 done 且本轮无 verifiedProgress → 不准标完成（负向）", async () => {
    const res = await evaluateGoalAfterTurn({
      services: {} as never,
      config: createTestConfig("/tmp/goal-audit"),
      sessionId: "s1",
      lastAssistantText: "我做完了",
      mainModel: "m",
      judgeFn: async () => ({ done: true, reason: "model self score" }),
    });
    expect(res.action).toBe("continue");
    expect(mem.get("s1")?.status).toBe("active");
    expect(mem.get("s1")?.lastVerdict?.reason).toMatch(/自评完成被拒/);
  });

  it("blocked/impossible 可停但 verifiedProgress 仍空", async () => {
    const res = await evaluateGoalAfterTurn({
      services: {} as never,
      config: createTestConfig("/tmp/goal-audit"),
      sessionId: "s1",
      lastAssistantText: "做不到",
      mainModel: "m",
      judgeFn: async () => ({ done: true, reason: "blocked: 缺少登录态" }),
    });
    expect(res.action).toBe("done");
    expect(mem.get("s1")?.verifiedProgress ?? []).toHaveLength(0);
  });
});
