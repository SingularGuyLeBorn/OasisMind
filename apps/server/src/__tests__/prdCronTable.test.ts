/**
 * prd-cron.md 第 5 节：节律 enabled × lastRunStatus × 占用 状态×事件表。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../db.js";
import { appRouter } from "../router.js";
import { createContextInner } from "../trpc/context.js";
import {
  __resetAgentCronEngineForTests,
  getAgentCronEngine,
} from "../infra/agentCronEngine.js";
import {
  deleteCronJob,
  ensureAgentCronJobTable,
  listCronJobs,
  markCronJobRun,
  recoverStaleCronJobRuns,
  upsertCronJob,
} from "../infra/agentCronStore.js";
import { getAppConfig } from "../infra/config.js";
import { emitHubRunSettled, setStreamHub } from "../infra/sessionStreamHub.js";
import { resetSwarmOrchestratorForTests } from "../infra/swarmOrchestrator.js";
import { resetAsyncJobOrchestratorForTests } from "../infra/asyncJobOrchestrator.js";

const FAKE_JOB_ID = "cron-ghost-job-id-does-not-exist";

async function createManager(name: string): Promise<{ id: string }> {
  const ctx = await createContextInner();
  const result = await ctx.services.agent.create({
    name,
    model: "deepseek-chat",
    systemPrompt: "test",
    tools: ["native:agent_cron_set"],
    tier: "manager",
  });
  if (!result.success) throw new Error(result.error?.message ?? "create agent failed");
  return { id: (result.data as { id: string }).id };
}

async function cleanup(agentId: string) {
  await prisma.$executeRawUnsafe(`DELETE FROM AgentCronJob WHERE agentId = ?`, agentId).catch(() => {});
  await prisma.chatSession.deleteMany({ where: { agentId: agentId } });
  await prisma.agent.deleteMany({ where: { id: agentId, tier: { not: "super" } } });
}

function mockHub(startResult: "started" | "busy" | "duplicate" = "started") {
  const startIfNotRunning = vi.fn().mockResolvedValue(startResult);
  const pushExternalEvent = vi.fn();
  setStreamHub({
    startIfNotRunning,
    pushExternalEvent,
    isRunning: () => false,
    stop: vi.fn(),
  } as never);
  return { startIfNotRunning, pushExternalEvent };
}

describe("PRD 定时节律 状态×事件表", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(async () => {
    await ensureAgentCronJobTable(prisma);
    __resetAgentCronEngineForTests();
    resetSwarmOrchestratorForTests();
    resetAsyncJobOrchestratorForTests();
    const ctx = await createContextInner();
    caller = appRouter.createCaller(ctx);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setStreamHub(null);
    __resetAgentCronEngineForTests();
    resetSwarmOrchestratorForTests();
  });

  it("R1/R14 upsert 合法建行；非法 5 段不建行", async () => {
    const mgr = await createManager(`prd-cron-r1-${Date.now()}`);
    try {
      const ok = await caller.agentCron.upsert({
        agentId: mgr.id,
        name: "r1-ok",
        cron: "0 8 * * *",
        prompt: "合法 briefing 至少八字",
        enabled: true,
      });
      expect(ok.success).toBe(true);
      expect(ok.job.name).toBe("r1-ok");
      expect(ok.job.lastRunStatus).toBeNull();

      await expect(
        caller.agentCron.upsert({
          agentId: mgr.id,
          name: "r14-bad",
          cron: "99 99 * * *",
          prompt: "非法表达式至少八字",
          enabled: true,
        }),
      ).rejects.toThrow(/非法 cron/);
      const listed = await listCronJobs(prisma, { agentId: mgr.id });
      expect(listed.some((j) => j.name === "r14-bad")).toBe(false);
    } finally {
      await cleanup(mgr.id);
    }
  });

  it("R2/R3/R6 暂停后 tRPC fire 拒绝；启用后可 fire；钮语义=disabled 当 !enabled", async () => {
    const mgr = await createManager(`prd-cron-r2-${Date.now()}`);
    mockHub();
    try {
      const row = await upsertCronJob(prisma, {
        agentId: mgr.id,
        name: "r2-pause",
        cron: "0 9 * * *",
        prompt: "暂停后再触发至少八字",
        enabled: true,
      });
      const paused = await caller.agentCron.setEnabled({ id: row.id, enabled: false });
      expect(paused.job.enabled).toBe(false);

      await expect(caller.agentCron.fire({ id: row.id })).rejects.toThrow(/已暂停/);
      const afterPause = await listCronJobs(prisma, { agentId: mgr.id });
      expect(afterPause.find((j) => j.id === row.id)?.lastRunStatus).toBeNull();

      await caller.agentCron.setEnabled({ id: row.id, enabled: true });
      const fired = await caller.agentCron.fire({ id: row.id });
      expect(fired.success).toBe(true);
      expect(fired.sessionId).toBeTruthy();
    } finally {
      await cleanup(mgr.id);
    }
  });

  it("R4/R5/R9/R16 占用中重叠拒绝；settled 后可再 fire 新会话", async () => {
    const mgr = await createManager(`prd-cron-r4-${Date.now()}`);
    mockHub();
    try {
      const row = await upsertCronJob(prisma, {
        agentId: mgr.id,
        name: "r4-fire",
        cron: "0 9 * * *",
        prompt: "重叠锁至少八个字 briefing",
        enabled: true,
      });
      const ctx = await createContextInner();
      const engine = getAgentCronEngine(prisma, ctx.services, getAppConfig());
      const r1 = await engine.fire(row.id);
      expect(r1.error).toBeUndefined();
      expect(r1.sessionId).toBeTruthy();
      const running = (await listCronJobs(prisma, { agentId: mgr.id })).find((j) => j.id === row.id);
      expect(running?.lastRunStatus).toBe("running");

      const overlap = await engine.fire(row.id);
      expect(overlap.error).toMatch(/同任务仍在执行/);
      expect(overlap.sessionId).toBeUndefined();
      const sessions = await prisma.chatSession.findMany({ where: { agentId: mgr.id, kind: "cron" } });
      expect(sessions).toHaveLength(1);

      emitHubRunSettled(r1.sessionId!);
      await vi.waitFor(async () => {
        const after = (await listCronJobs(prisma, { agentId: mgr.id })).find((j) => j.id === row.id);
        expect(after?.lastRunStatus).toBe("success");
      });

      const r2 = await engine.fire(row.id);
      expect(r2.sessionId).toBeTruthy();
      expect(r2.sessionId).not.toBe(r1.sessionId);
    } finally {
      await cleanup(mgr.id);
    }
  });

  it("R7 幽灵 fire 不写库", async () => {
    const before = await prisma.chatSession.count({ where: { kind: "cron" } });
    await expect(caller.agentCron.fire({ id: FAKE_JOB_ID })).rejects.toThrow(/不存在/);
    expect(await prisma.chatSession.count({ where: { kind: "cron" } })).toBe(before);
  });

  it("R8 Hub 未就绪 → lastRun failed，不假装成功", async () => {
    const mgr = await createManager(`prd-cron-r8-${Date.now()}`);
    setStreamHub(null);
    try {
      const row = await upsertCronJob(prisma, {
        agentId: mgr.id,
        name: "r8-nohub",
        cron: "0 9 * * *",
        prompt: "无 hub 应失败至少八字",
        enabled: true,
      });
      const ctx = await createContextInner();
      const engine = getAgentCronEngine(prisma, ctx.services, getAppConfig());
      const r = await engine.fire(row.id);
      expect(r.error).toMatch(/StreamHub 未就绪/);
      expect(r.sessionId).toBeTruthy();
      const marked = (await listCronJobs(prisma, { agentId: mgr.id })).find((j) => j.id === row.id);
      expect(marked?.lastRunStatus).toBe("failed");
    } finally {
      await cleanup(mgr.id);
    }
  });

  it("R10/R11 settled 按会话状态回写 failed / cancelled", async () => {
    const mgr = await createManager(`prd-cron-r10-${Date.now()}`);
    mockHub();
    try {
      const failedJob = await upsertCronJob(prisma, {
        agentId: mgr.id,
        name: "r10-fail",
        cron: "0 9 * * *",
        prompt: "会话失败回写 failed 八字",
        enabled: true,
      });
      const cancelJob = await upsertCronJob(prisma, {
        agentId: mgr.id,
        name: "r11-cancel",
        cron: "0 10 * * *",
        prompt: "会话归档回写 cancelled 八字",
        enabled: true,
      });
      const ctx = await createContextInner();
      const engine = getAgentCronEngine(prisma, ctx.services, getAppConfig());
      const f1 = await engine.fire(failedJob.id);
      const f2 = await engine.fire(cancelJob.id);
      await prisma.chatSession.update({ where: { id: f1.sessionId! }, data: { status: "failed" } });
      await prisma.chatSession.update({ where: { id: f2.sessionId! }, data: { status: "archived" } });
      emitHubRunSettled(f1.sessionId!);
      emitHubRunSettled(f2.sessionId!);
      await vi.waitFor(async () => {
        const rows = await listCronJobs(prisma, { agentId: mgr.id });
        expect(rows.find((j) => j.id === failedJob.id)?.lastRunStatus).toBe("failed");
        expect(rows.find((j) => j.id === cancelJob.id)?.lastRunStatus).toBe("cancelled");
      });
    } finally {
      await cleanup(mgr.id);
    }
  });

  it("R12 startIfNotRunning=busy → lastRun failed", async () => {
    const mgr = await createManager(`prd-cron-r12-${Date.now()}`);
    mockHub("busy");
    try {
      const row = await upsertCronJob(prisma, {
        agentId: mgr.id,
        name: "r12-busy",
        cron: "0 9 * * *",
        prompt: "占线起流应失败至少八字",
        enabled: true,
      });
      const ctx = await createContextInner();
      const engine = getAgentCronEngine(prisma, ctx.services, getAppConfig());
      const r = await engine.fire(row.id);
      expect(r.error).toMatch(/占线/);
      const marked = (await listCronJobs(prisma, { agentId: mgr.id })).find((j) => j.id === row.id);
      expect(marked?.lastRunStatus).toBe("failed");
    } finally {
      await cleanup(mgr.id);
    }
  });

  it("R13 重启遗留 running → failed，不自动 fire", async () => {
    const mgr = await createManager(`prd-cron-r13-${Date.now()}`);
    const { startIfNotRunning } = mockHub();
    try {
      const row = await upsertCronJob(prisma, {
        agentId: mgr.id,
        name: "r13-zombie",
        cron: "0 9 * * *",
        prompt: "僵尸 running 不续跑至少八字",
        enabled: true,
      });
      await markCronJobRun(prisma, row.id, "running", null);
      startIfNotRunning.mockClear();
      const n = await recoverStaleCronJobRuns(prisma);
      expect(n).toBeGreaterThanOrEqual(1);
      const marked = (await listCronJobs(prisma, { agentId: mgr.id })).find((j) => j.id === row.id);
      expect(marked?.lastRunStatus).toBe("failed");
      expect(startIfNotRunning).not.toHaveBeenCalled();
      await recoverStaleCronJobRuns(prisma);
      const still = (await listCronJobs(prisma, { agentId: mgr.id })).find((j) => j.id === row.id);
      expect(still?.lastRunStatus).toBe("failed");
    } finally {
      await cleanup(mgr.id);
    }
  });

  it("R15 clear 后 list 无此行", async () => {
    const mgr = await createManager(`prd-cron-r15-${Date.now()}`);
    try {
      const row = await upsertCronJob(prisma, {
        agentId: mgr.id,
        name: "r15-del",
        cron: "0 9 * * *",
        prompt: "删除节律至少八个字",
        enabled: true,
      });
      const cleared = await caller.agentCron.clear({ id: row.id });
      expect(cleared.deleted).toBeGreaterThanOrEqual(1);
      const listed = await listCronJobs(prisma, { agentId: mgr.id });
      expect(listed.find((j) => j.id === row.id)).toBeUndefined();
    } finally {
      await deleteCronJob(prisma, { agentId: mgr.id, name: "r15-del" }).catch(() => {});
      await cleanup(mgr.id);
    }
  });
});
