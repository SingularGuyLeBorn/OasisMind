/**
 * prd-chat-goal.md 第 5 节：Goal 暂停/继续/清除 状态×事件表。
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetGoalLoopHookForTests,
  __setGoalStateStoreForTests,
  isAllowedGoalControl,
  pauseSessionGoal,
  resumeSessionGoal,
  clearSessionGoal,
  evaluateGoalAfterTurn,
  writeGoalStateRaw,
} from "../infra/goalLoop.js";
import type { SessionGoalState } from "@oasismind/shared";
import { createTestConfig } from "./helpers/toolTestFixtures.js";

function goal(partial: Partial<SessionGoalState> & { status: SessionGoalState["status"] }): SessionGoalState {
  return {
    mode: "goal",
    text: "把测试修绿至少八字",
    turnsUsed: 3,
    maxTurns: 20,
    judgeModel: "auto",
    pendingContinue: { reason: "next" },
    ...partial,
  };
}

describe("PRD Goal 控制转移函数", () => {
  it("R2/R4 可暂停/恢复；R6 done 不可", () => {
    expect(isAllowedGoalControl("active", "pause")).toBe(true);
    expect(isAllowedGoalControl("paused", "resume")).toBe(true);
    expect(isAllowedGoalControl("done", "pause")).toBe(false);
    expect(isAllowedGoalControl("exhausted", "resume")).toBe(false);
  });
});

describe("PRD Chat Goal 状态×事件表", () => {
  let mem: Map<string, SessionGoalState | null>;
  const SID = "prd-goal-sess";

  beforeEach(() => {
    __resetGoalLoopHookForTests();
    mem = new Map();
    __setGoalStateStoreForTests({
      read: async (id) => mem.get(id) ?? null,
      write: async (id, g) => {
        mem.set(id, g);
      },
    });
  });

  it("R1 无 goal pause/resume 返回 null", async () => {
    expect(await pauseSessionGoal({} as never, SID)).toBeNull();
    expect(await resumeSessionGoal({} as never, SID)).toBeNull();
  });

  it("R2/R3/R4 暂停清 pendingContinue；再暂停幂等；继续清 turnsUsed", async () => {
    await writeGoalStateRaw(SID, goal({ status: "active" }), { replaceVerified: true });
    const paused = await pauseSessionGoal({} as never, SID);
    expect(paused?.status).toBe("paused");
    expect(paused?.pendingContinue).toBeNull();
    const again = await pauseSessionGoal({} as never, SID);
    expect(again?.status).toBe("paused");
    const resumed = await resumeSessionGoal({} as never, SID);
    expect(resumed?.status).toBe("active");
    expect(resumed?.turnsUsed).toBe(0);
  });

  it("R5 active 再 resume 不把 turnsUsed 清零", async () => {
    await writeGoalStateRaw(SID, goal({ status: "active", turnsUsed: 7 }), { replaceVerified: true });
    const r = await resumeSessionGoal({} as never, SID);
    expect(r?.status).toBe("active");
    expect(r?.turnsUsed).toBe(7);
  });

  it("R6 done 上 pause/resume 抛错且不改状态", async () => {
    await writeGoalStateRaw(SID, goal({ status: "done" }), { replaceVerified: true });
    await expect(pauseSessionGoal({} as never, SID)).rejects.toThrow(/无法暂停/);
    await expect(resumeSessionGoal({} as never, SID)).rejects.toThrow(/无法恢复/);
    expect(mem.get(SID)?.status).toBe("done");
  });

  it("R7 clear 后读空", async () => {
    await writeGoalStateRaw(SID, goal({ status: "paused" }), { replaceVerified: true });
    await clearSessionGoal({} as never, SID);
    expect(mem.get(SID)).toBeNull();
  });

  it("R8 paused 时 evaluate 跳过不续跑", async () => {
    await writeGoalStateRaw(SID, goal({ status: "paused" }), { replaceVerified: true });
    const r = await evaluateGoalAfterTurn({
      services: {} as never,
      config: createTestConfig(process.cwd()),
      sessionId: SID,
      lastAssistantText: "已完成",
      mainModel: "test",
    });
    expect(r.action).toBe("skip");
    expect(r.goal?.status).toBe("paused");
  });
});
