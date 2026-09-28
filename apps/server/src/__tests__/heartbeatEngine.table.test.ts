/**
 * 心跳引擎契约表
 *
 * | 规则 | 旧称 | 契约 | 负向（旧实现） |
 * |---|---|---|---|
 * | 执行型僵尸心跳/cron/trigger 恢复标 failed | C1 | recover 扫心跳行，不再被闸永久跳过 | 只扫 [async] 导致心跳僵尸永久 running |
 * | refresh 串行链 + generation 令牌 | C2 | 并发 refresh 每 agent 一个 ScheduledTask | jobs.clear 与 schedule 交叠双发 |
 * | consecutiveFailures 原子化 | C4 | 并发失败计数不丢；清零不被陈旧 +1 覆写 | 读旧值整 blob 覆写 |
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import cron from "node-cron";
import { prisma } from "../db.js";
import { createContextInner } from "../trpc/context.js";
import { recoverStaleAsyncJobs } from "../infra/asyncJobs/index.js";
import {
  getAsyncJobOrchestrator,
  resetAsyncJobOrchestratorForTests,
} from "../infra/asyncJobOrchestrator.js";
import { getHeartbeatEngine, resetHeartbeatEngineForTests } from "../infra/heartbeatEngine.js";
import { resetSwarmOrchestratorForTests } from "../infra/swarmOrchestrator.js";
import { claimExclusiveSessionTaskRun } from "../infra/taskClaim.js";
import { setStreamHub } from "../infra/sessionStreamHub.js";
import * as agentRuntime from "../infra/agentRuntime.js";
import { createTestConfig } from "./helpers/toolTestFixtures.js";


{
const RUN = `c1hb-${Date.now().toString(36)}`;

describe("执行型僵尸心跳/cron/trigger 恢复标 failed（旧称 C1）", () => {
  beforeEach(() => {
    resetAsyncJobOrchestratorForTests();
    resetSwarmOrchestratorForTests();
    setStreamHub(null);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    resetHeartbeatEngineForTests();
    resetAsyncJobOrchestratorForTests();
    resetSwarmOrchestratorForTests();
    setStreamHub(null);
    await prisma.task.deleteMany({ where: { name: { contains: RUN } } });
  });

  it("心跳/cron/trigger（oneshot）僵尸 running → 恢复标 failed，心跳不再被闸跳过", async () => {
    const ctx = await createContextInner();
    const agent = await ctx.services.agent.create({
      name: `C1-Agent-${RUN}`,
      model: "deepseek-chat",
      systemPrompt: "test",
      tools: [],
      tier: "manager",
      heartbeat: { enabled: true, cron: "0 9 * * *", goal: "C1 恢复验证" } as any,
    });
    if (!agent.success) throw new Error(agent.error?.message);
    const agentId = (agent.data as { id: string }).id;

    const session = await prisma.chatSession.create({
      data: {
        title: `C1-hb-${RUN}`,
        model: "deepseek-chat",
        agentId,
        kind: "heartbeat",
        isMainSession: false,
        status: "active",
      },
    });

    const hbZombie = await prisma.task.create({
      data: {
        name: `[heartbeat] C1-Agent-${RUN}`,
        type: "oneshot",
        status: "running",
        sessionId: session.id,
        startedAt: new Date(),
        input: { kind: "heartbeat", agentId, sessionId: session.id, goal: "x" },
      },
    });
    const cronZombie = await prisma.task.create({
      data: {
        name: `C1-cron-${RUN}`,
        type: "cron",
        status: "running",
        cronExpression: "0 * * * *",
        startedAt: new Date(),
        input: { action: "noop" },
      },
    });
    const triggerZombie = await prisma.task.create({
      data: {
        name: `C1-trigger-${RUN}`,
        type: "oneshot",
        status: "running",
        startedAt: new Date(),
        input: { triggerEvent: { entity: "post", action: "created" } },
      },
    });

    const config = createTestConfig(ctx.config.projectRoot, {
      asyncJobs: { ...ctx.config.asyncJobs, maxConcurrent: 2, maxQueued: 10 },
    });
    const { failed } = await recoverStaleAsyncJobs(config, ctx.services);
    expect(failed).toBeGreaterThanOrEqual(3);

    for (const id of [hbZombie.id, cronZombie.id, triggerZombie.id]) {
      const row = await prisma.task.findUnique({ where: { id } });
      expect(row?.status).toBe("failed");
      expect((row?.output as { error?: string } | null)?.error).toBe("服务重启，任务中断");
    }

    // 僵尸已收尾 → 下次心跳不再被 running 闸跳过（能创建并起跑）
    vi.spyOn(agentRuntime, "runAgentLoop").mockResolvedValue({
      content: "ok",
      toolCalls: [],
      tokenUsage: { prompt: 1, completion: 1, total: 2 },
      model: "deepseek-chat",
      provider: "deepseek",
      roundsUsed: 1,
    } as any);

    const hbConfig = { ...ctx.config, llm: { ...ctx.config.llm, dailyBudget: 0 } };
    const engine = getHeartbeatEngine(prisma, ctx.services, hbConfig);
    await engine.start();
    await engine.triggerHeartbeat(agentId);

    await vi.waitFor(
      async () => {
        const success = await prisma.task.findFirst({
          where: {
            sessionId: session.id,
            name: { startsWith: "[heartbeat]" },
            status: "success",
            id: { not: hbZombie.id },
          },
        });
        expect(success).not.toBeNull();
      },
      { timeout: 5000, interval: 100 },
    );

    await prisma.chatSession.deleteMany({ where: { id: session.id } });
    await prisma.agent.deleteMany({ where: { id: agentId } });
  });

  it("池准入拒绝 → 已建心跳 Task 收尾 failed「队列满」并计入失败 streak", async () => {
    const ctx = await createContextInner();
    const agent = await ctx.services.agent.create({
      name: `C1-Queue-${RUN}`,
      model: "deepseek-chat",
      systemPrompt: "test",
      tools: [],
      tier: "manager",
      heartbeat: { enabled: true, cron: "0 9 * * *", goal: "C1 队列满" } as any,
    });
    if (!agent.success) throw new Error(agent.error?.message);
    const agentId = (agent.data as { id: string }).id;

    // maxQueued=1：先占满 running 槽，再占满排队位，使后续 enqueue 抛「队列已满」
    resetAsyncJobOrchestratorForTests();
    const narrow = createTestConfig(ctx.config.projectRoot, {
      asyncJobs: { ...ctx.config.asyncJobs, maxConcurrent: 1, maxQueued: 1, maxPerSession: 1 },
      llm: { ...ctx.config.llm, dailyBudget: 0 },
    });
    const pool = getAsyncJobOrchestrator(narrow);
    pool.enqueue({
      jobId: `blocker-${RUN}`,
      sessionId: `blocker-sess-${RUN}`,
      execute: async () => {
        await new Promise(() => {
          /* never settle */
        });
      },
    });
    pool.enqueue({
      jobId: `queued-${RUN}`,
      sessionId: `queued-sess-${RUN}`,
      execute: async () => {},
    });
    let saturated = false;
    try {
      pool.enqueue({
        jobId: `probe-${RUN}`,
        sessionId: `probe-sess-${RUN}`,
        execute: async () => {},
      });
    } catch {
      saturated = true;
    }
    expect(saturated).toBe(true);

    // 复用已饱和的 orchestrator 单例（getAsyncJobOrchestrator 首次 config 生效）
    const engine = getHeartbeatEngine(prisma, ctx.services, narrow);
    await engine.triggerHeartbeat(agentId);

    await vi.waitFor(
      async () => {
        const row = await prisma.task.findFirst({
          where: { name: `[heartbeat] C1-Queue-${RUN}` },
          orderBy: { createdAt: "desc" },
        });
        expect(row?.status).toBe("failed");
        expect((row?.output as { error?: string } | null)?.error).toBe("队列满");
      },
      { timeout: 5000, interval: 100 },
    );

    const hbRow = await prisma.agent.findUnique({ where: { id: agentId }, select: { heartbeat: true } });
    const streak = (hbRow?.heartbeat as { consecutiveFailures?: number } | null)?.consecutiveFailures ?? 0;
    expect(streak).toBeGreaterThanOrEqual(1);

    await prisma.task.deleteMany({ where: { name: { contains: "C1-Queue" } } });
    await prisma.chatSession.deleteMany({ where: { agentId } });
    await prisma.agent.deleteMany({ where: { id: agentId } });
  });

  it("重叠闸并发双触发 → 恰一个 claimed running", async () => {
    const session = await prisma.chatSession.create({
      data: {
        title: `C1-claim-${RUN}`,
        model: "deepseek-chat",
        kind: "heartbeat",
        isMainSession: false,
        status: "active",
      },
    });
    const a = await prisma.task.create({
      data: {
        name: `[heartbeat] claim-a-${RUN}`,
        type: "oneshot",
        status: "queued",
        sessionId: session.id,
        input: { kind: "heartbeat" },
      },
    });
    const b = await prisma.task.create({
      data: {
        name: `[heartbeat] claim-b-${RUN}`,
        type: "oneshot",
        status: "queued",
        sessionId: session.id,
        input: { kind: "heartbeat" },
      },
    });

    const [ca, cb] = await Promise.all([
      claimExclusiveSessionTaskRun(prisma, a.id, session.id),
      claimExclusiveSessionTaskRun(prisma, b.id, session.id),
    ]);
    expect([ca, cb].filter(Boolean)).toHaveLength(1);

    const rows = await prisma.task.findMany({ where: { id: { in: [a.id, b.id] } } });
    expect(rows.filter((r) => r.status === "running")).toHaveLength(1);
    expect(rows.filter((r) => r.status === "queued")).toHaveLength(1);

    await prisma.task.deleteMany({ where: { id: { in: [a.id, b.id] } } });
    await prisma.chatSession.delete({ where: { id: session.id } });
  });
});


}

{
const RUN = `c2rf-${Date.now().toString(36)}`;
/** 测试专用 cron，避开库内其它 Agent 常用的 0 9 / 0 10 */
const CRON_A = "17 7 * * *";
const CRON_B = "19 7 * * *";

describe("refresh 串行链 + generation 令牌（旧称 C2）", () => {
  beforeEach(() => {
    resetHeartbeatEngineForTests();
    resetAsyncJobOrchestratorForTests();
    resetSwarmOrchestratorForTests();
    setStreamHub(null);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    resetHeartbeatEngineForTests();
    await prisma.agent.deleteMany({ where: { name: { contains: RUN } } });
  });

  it("并发两次 refresh（人工注入交错点）→ 每个 agent 只有一个活跃 ScheduledTask", async () => {
    const ctx = await createContextInner();
    const created = await ctx.services.agent.create({
      name: `C2-Agent-${RUN}`,
      model: "deepseek-chat",
      systemPrompt: "test",
      tools: [],
      tier: "manager",
      heartbeat: { enabled: true, cron: CRON_A, goal: "C2 双发防护" } as any,
    });
    if (!created.success) throw new Error(created.error?.message);
    const agentId = (created.data as { id: string }).id;

    const liveByAgent = new Map<string, number>();
    vi.spyOn(cron, "schedule").mockImplementation(((expression: string, _fn: () => void) => {
      // 仅跟踪本用例 Agent 的 cron；维护任务与其它 Agent 不计入
      const track = expression === CRON_A;
      if (track) liveByAgent.set(agentId, (liveByAgent.get(agentId) ?? 0) + 1);
      return {
        stop: () => {
          if (track) liveByAgent.set(agentId, Math.max(0, (liveByAgent.get(agentId) ?? 0) - 1));
        },
        start: () => {},
      } as unknown as ReturnType<typeof cron.schedule>;
    }) as typeof cron.schedule);

    const engine = getHeartbeatEngine(prisma, ctx.services, {
      ...ctx.config,
      llm: { ...ctx.config.llm, dailyBudget: 0 },
    });

    await engine.start();
    expect(liveByAgent.get(agentId)).toBe(1);

    let releaseA: (() => void) | null = null;
    let yieldHits = 0;
    engine.__setRefreshYieldForTests(
      () =>
        new Promise<void>((resolve) => {
          yieldHits++;
          if (yieldHits === 1) {
            releaseA = resolve;
            return;
          }
          resolve();
        }),
    );

    const p1 = engine.refresh();
    await vi.waitFor(() => {
      expect(releaseA).not.toBeNull();
    });
    const p2 = engine.refresh();
    releaseA!();
    await Promise.all([p1, p2]);

    expect(liveByAgent.get(agentId)).toBe(1);
  });

  it("start→stop→start 交错无泄漏 cron job", async () => {
    const ctx = await createContextInner();
    const created = await ctx.services.agent.create({
      name: `C2-SS-${RUN}`,
      model: "deepseek-chat",
      systemPrompt: "test",
      tools: [],
      tier: "manager",
      heartbeat: { enabled: true, cron: CRON_B, goal: "C2 stop 交错" } as any,
    });
    if (!created.success) throw new Error(created.error?.message);
    const agentId = (created.data as { id: string }).id;

    let agentCronLive = 0;
    vi.spyOn(cron, "schedule").mockImplementation(((expression: string) => {
      const isAgent = expression === CRON_B;
      if (isAgent) agentCronLive++;
      return {
        stop: () => {
          if (isAgent) agentCronLive = Math.max(0, agentCronLive - 1);
        },
        start: () => {},
      } as unknown as ReturnType<typeof cron.schedule>;
    }) as typeof cron.schedule);

    const engine = getHeartbeatEngine(prisma, ctx.services, {
      ...ctx.config,
      llm: { ...ctx.config.llm, dailyBudget: 0 },
    });

    let release: (() => void) | null = null;
    engine.__setRefreshYieldForTests(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );

    const startP = engine.start();
    await vi.waitFor(() => {
      expect(release).not.toBeNull();
    });
    engine.stop();
    engine.__setRefreshYieldForTests(null);
    release!();
    await startP.catch(() => undefined);

    await engine.start();
    await vi.waitFor(() => {
      expect(agentCronLive).toBe(1);
    });
    void agentId;
  });
});


}

{
const RUN = `c4ct-${Date.now().toString(36)}`;

async function readStreak(agentId: string): Promise<number> {
  const row = await prisma.agent.findUnique({ where: { id: agentId }, select: { heartbeat: true } });
  return (row?.heartbeat as { consecutiveFailures?: number } | null)?.consecutiveFailures ?? 0;
}

async function readHb(agentId: string): Promise<Record<string, unknown>> {
  const row = await prisma.agent.findUnique({ where: { id: agentId }, select: { heartbeat: true } });
  return (row?.heartbeat as Record<string, unknown>) ?? {};
}

describe("consecutiveFailures 原子化（旧称 C4）", () => {
  beforeEach(() => {
    resetHeartbeatEngineForTests();
    resetAsyncJobOrchestratorForTests();
    resetSwarmOrchestratorForTests();
    setStreamHub(null);
  });

  afterEach(async () => {
    resetHeartbeatEngineForTests();
    await prisma.agent.deleteMany({ where: { name: { contains: RUN } } });
  });

  it("并发两个失败写回 → 计数不丢（0→2）", async () => {
    const ctx = await createContextInner();
    const created = await ctx.services.agent.create({
      name: `C4-Par-${RUN}`,
      model: "deepseek-chat",
      systemPrompt: "test",
      tools: [],
      tier: "manager",
      heartbeat: {
        enabled: true,
        cron: "0 9 * * *",
        goal: "C4 并发",
        consecutiveFailures: 0,
      } as any,
    });
    if (!created.success) throw new Error(created.error?.message);
    const agentId = (created.data as { id: string }).id;

    const engine = getHeartbeatEngine(prisma, ctx.services, {
      ...ctx.config,
      llm: { ...ctx.config.llm, dailyBudget: 0 },
    });

    const prevHb = {
      enabled: true,
      cron: "0 9 * * *",
      goal: "C4 并发",
      lastRunAt: null,
      lastRunStatus: null,
      consecutiveFailures: 0,
    };

    // 旧实现两路都读到 0 再写 1 → 终态 1；原子自增 → 2
    await Promise.all([
      engine.__updateHeartbeatStatusForTests(agentId, "failed", prevHb),
      engine.__updateHeartbeatStatusForTests(agentId, "failed", prevHb),
    ]);
    expect(await readStreak(agentId)).toBe(2);
  });

  it("中途配置变更清零不被在途失败的陈旧 +1 覆写", async () => {
    const ctx = await createContextInner();
    const created = await ctx.services.agent.create({
      name: `C4-Clr-${RUN}`,
      model: "deepseek-chat",
      systemPrompt: "test",
      tools: [],
      tier: "manager",
      heartbeat: {
        enabled: true,
        cron: "0 9 * * *",
        goal: "C4 清零",
        consecutiveFailures: 3,
      } as any,
    });
    if (!created.success) throw new Error(created.error?.message);
    const agentId = (created.data as { id: string }).id;
    expect(await readStreak(agentId)).toBe(3);

    // 模拟配置变更清零（人工修复信号）
    const cleared = await ctx.services.agent.update({
      id: agentId,
      heartbeat: {
        enabled: true,
        cron: "0 11 * * *",
        goal: "C4 清零",
        consecutiveFailures: 3,
      } as any,
    });
    if (!cleared.success) throw new Error(cleared.error?.message);
    expect(await readStreak(agentId)).toBe(0);
    expect((await readHb(agentId)).cron).toBe("0 11 * * *");

    const engine = getHeartbeatEngine(prisma, ctx.services, {
      ...ctx.config,
      llm: { ...ctx.config.llm, dailyBudget: 0 },
    });

    // 在途失败携带清零前的陈旧 prevHb（consecutiveFailures=3）
    // 旧实现会整 blob 写成 4，冲掉 cron=0 11 与清零；新实现 SQL 自增当前值 0→1，保留 cron
    await engine.__updateHeartbeatStatusForTests(agentId, "failed", {
      enabled: true,
      cron: "0 9 * * *",
      goal: "C4 清零",
      lastRunAt: null,
      lastRunStatus: null,
      consecutiveFailures: 3,
    });

    expect(await readStreak(agentId)).toBe(1);
    expect((await readHb(agentId)).cron).toBe("0 11 * * *");
    expect((await readHb(agentId)).goal).toBe("C4 清零");
  });

  it("persistLoopContract 与 status 交错不丢 lastRunAt / 失败计数", async () => {
    const ctx = await createContextInner();
    const created = await ctx.services.agent.create({
      name: `C4-Persist-${RUN}`,
      model: "deepseek-chat",
      systemPrompt: "test",
      tools: [],
      tier: "manager",
      heartbeat: {
        enabled: true,
        cron: "0 9 * * *",
        goal: "C4 persist",
        consecutiveFailures: 0,
      } as any,
    });
    if (!created.success) throw new Error(created.error?.message);
    const agentId = (created.data as { id: string }).id;
    const engine = getHeartbeatEngine(prisma, ctx.services, {
      ...ctx.config,
      llm: { ...ctx.config.llm, dailyBudget: 0 },
    });
    const prevHb = {
      enabled: true,
      cron: "0 9 * * *",
      goal: "C4 persist",
      lastRunAt: null,
      lastRunStatus: null,
      consecutiveFailures: 0,
    };
    await Promise.all([
      engine.__updateHeartbeatStatusForTests(agentId, "failed", prevHb),
      engine.__persistLoopContractForTests(agentId, {
        goal: "C4 persist",
        handoff: true,
        gateOpen: true,
        evidence: [],
        stopRule: { maxStaleRounds: 3 },
        staleRounds: 0,
        stoppedReason: null,
      }),
    ]);
    const hb = await readHb(agentId);
    expect(hb.consecutiveFailures).toBe(1);
    expect(typeof hb.lastRunAt).toBe("string");
    expect((hb.loopContract as { goal?: string } | undefined)?.goal).toBe("C4 persist");
    expect(hb.cron).toBe("0 9 * * *");
  });
});
}
