/**
 * 异步投递对账契约表
 *
 * | 规则 | 旧称 | 契约 | 负向（旧实现） |
 * |---|---|---|---|
 * | R-exempt | B1 | 失败轻量任务 deliveryExempt 对账不循环 | 每轮 reconciler 回滚豁免任务 |
 * | R-soft-claim | B2 | superior drain 软认领 claimedAt，崩溃不丢 | consume 物理删除导致行消失 |
 * | R-wait-outside-pool | B3 | autoConsume 不得在池槽内等 hub | waitFor 占 runningGlobal |
 * | R-restart-failed | B4 | 僵尸标 failed、零入池；二次 recover 幂等 | resume 再入池 / retryCount+1 |
 * | R-depth-server | B5 | depth 服务端物化，LLM 传 depth 无效 | args.depth 绕过防循环 |
 * | R-queue-unique | B7 | (sessionId, agentMessageId) 唯一 + P2002 幂等 | 并发双行 |
 *
 * 不存在 B6，不补造。
 */
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { SWARM_MAX_DEPTH } from "@oasismind/shared";
import { prisma } from "../db.js";
import { createContextInner } from "../trpc/context.js";
import {
  reconcileAsyncDeliveries,
  recoverStaleAsyncJobs,
  runStartupRecovery,
  enqueueSuperiorQueueDrain,
  autoConsumeAsyncDelivery,
} from "../infra/asyncJobs/index.js";
import {
  getAsyncJobOrchestrator,
  resetAsyncJobOrchestratorForTests,
} from "../infra/asyncJobOrchestrator.js";
import { setStreamHub, getStreamHub, SessionStreamHub } from "../infra/sessionStreamHub.js";
import { SESSION_QUEUE_CLAIM_STALE_MS } from "../infra/entityServices/sessionQueueItemService.js";
import { getSwarmBus, resetSwarmBus } from "../infra/swarmBus.js";
import { checkToolPermission } from "../infra/swarmPermissionGuard.js";
import * as agentRuntime from "../infra/agentRuntime.js";

type Ctx = Awaited<ReturnType<typeof createContextInner>>;


{
const RUN_ID = `b1${Date.now().toString(36)}`;

async function createFailedLightweight(opts: {
  ctx: Ctx;
  sourceType: "sleep" | "async_task_tool";
  deliveryExempt?: boolean;
}): Promise<{ agentId: string; sessionId: string; taskId: string }> {
  const agent = await opts.ctx.services.agent.create({
    name: `B1-Agent-${RUN_ID}-${Math.random().toString(36).slice(2, 6)}`,
    model: "deepseek-chat",
    systemPrompt: "test",
    tools: [],
  });
  const agentId = (agent.data as { id: string }).id;
  const session = await opts.ctx.services.session.create({
    title: "B1 豁免对账会话",
    model: "deepseek-chat",
    agentId,
  } as any);
  const sessionId = (session.data as { id: string }).id;
  const task = await prisma.task.create({
    data: {
      name: "[async] B1 轻量失败",
      type: "async_agent",
      status: "failed",
      sessionId,
      delivered: true,
      deliveredAt: new Date(Date.now() - 10 * 60_000),
      input: {
        kind: "async_agent",
        sessionId,
        task: "B1 轻量失败",
        taskLabel: "B1 轻量失败",
        agentSnapshot: { id: agentId, model: "m", systemPrompt: "", tools: [], tier: "sub", parentId: null },
        sourceType: opts.sourceType,
      },
      output: {
        error: "轻量失败",
        ...(opts.deliveryExempt ? { deliveryExempt: true } : {}),
      },
    },
  });
  return { agentId, sessionId, taskId: task.id };
}

async function cleanup(fx: { agentId: string; sessionId: string; taskId: string }) {
  await prisma.task.deleteMany({ where: { sessionId: fx.sessionId } }).catch(() => {});
  await prisma.chatMessage.deleteMany({ where: { sessionId: fx.sessionId } }).catch(() => {});
  await prisma.chatSession.deleteMany({ where: { id: fx.sessionId } }).catch(() => {});
  await prisma.agent.deleteMany({ where: { id: fx.agentId } }).catch(() => {});
}

describe("R-exempt 失败轻量任务 deliveryExempt 对账不循环（旧称 B1）", () => {
  beforeEach(async () => {
    resetAsyncJobOrchestratorForTests();
    setStreamHub(new SessionStreamHub({ ringSize: 100, persist: false, eventTtlMs: 1000, cleanupIntervalMs: 0 }));
    await prisma.task.deleteMany({ where: { delivered: true, status: { in: ["success", "failed"] } } });
  });

  afterEach(() => {
    setStreamHub(null);
    vi.restoreAllMocks();
  });

  it("有 deliveryExempt 台账：两轮 reconciler 零回滚零补投（旧实现每轮回滚 → 旧实现即红）", async () => {
    const ctx = await createContextInner();
    const fx = await createFailedLightweight({ ctx, sourceType: "sleep", deliveryExempt: true });
    try {
      const r1 = await reconcileAsyncDeliveries({
        services: ctx.services,
        config: ctx.config,
        minDeliveredAgeMs: 0,
      });
      expect(r1.rolledBack).toBe(0);
      expect(r1.renotified).toBe(0);

      const r2 = await reconcileAsyncDeliveries({
        services: ctx.services,
        config: ctx.config,
        minDeliveredAgeMs: 0,
      });
      expect(r2.rolledBack).toBe(0);
      expect(r2.renotified).toBe(0);

      const row = await prisma.task.findUnique({ where: { id: fx.taskId } });
      expect(row?.delivered).toBe(true);
    } finally {
      await cleanup(fx);
    }
  });

  it("豁免标记缺失：仍按孤儿回滚（台账是唯一豁免门）", async () => {
    const ctx = await createContextInner();
    const fx = await createFailedLightweight({ ctx, sourceType: "async_task_tool" });
    try {
      const r1 = await reconcileAsyncDeliveries({
        services: ctx.services,
        config: ctx.config,
        minDeliveredAgeMs: 0,
      });
      expect(r1.rolledBack).toBe(1);
      expect(r1.renotified).toBe(1);
    } finally {
      await cleanup(fx);
    }
  });
});


}

{
const RUN_ID = `b2${Date.now().toString(36)}`;

async function mkFixture(ctx: Ctx) {
  const agent = await ctx.services.agent.create({
    name: `B2-Agent-${RUN_ID}-${Math.random().toString(36).slice(2, 6)}`,
    model: "deepseek-chat",
    systemPrompt: "test",
    tools: [],
    tier: "sub",
  });
  const agentId = (agent.data as { id: string }).id;
  const session = await ctx.services.session.create({
    title: "B2 软认领会话",
    model: "deepseek-chat",
    agentId,
    kind: "subagent",
    isMainSession: true,
  } as any);
  const sessionId = (session.data as { id: string }).id;
  const agentMsg = await prisma.agentMessage.create({
    data: {
      fromAgentId: agentId,
      toAgentId: agentId,
      content: "B2 上级指令",
      messageType: "command",
      source: "manager",
      status: "pending",
      depth: 1,
    },
  });
  const created = await ctx.services.sessionQueueItem.create({
    sessionId,
    kind: "superior",
    content: "B2 上级指令",
    source: agentId,
    agentMessageId: agentMsg.id,
  });
  const itemId = (created.data as { id: string }).id;
  return { agentId, sessionId, itemId, agentMsgId: agentMsg.id };
}

async function cleanup(fx: { agentId: string; sessionId: string }) {
  await prisma.sessionQueueItem.deleteMany({ where: { sessionId: fx.sessionId } }).catch(() => {});
  await prisma.agentMessage.deleteMany({ where: { OR: [{ fromAgentId: fx.agentId }, { toAgentId: fx.agentId }] } }).catch(() => {});
  await prisma.chatMessage.deleteMany({ where: { sessionId: fx.sessionId } }).catch(() => {});
  await prisma.chatSession.deleteMany({ where: { id: fx.sessionId } }).catch(() => {});
  await prisma.agent.deleteMany({ where: { id: fx.agentId } }).catch(() => {});
}

describe("R-soft-claim superior drain 软认领 claimedAt，崩溃不丢（旧称 B2）", () => {
  beforeEach(() => {
    resetAsyncJobOrchestratorForTests();
    setStreamHub(new SessionStreamHub({ ringSize: 100, persist: false, eventTtlMs: 1000, cleanupIntervalMs: 0 }));
  });

  afterEach(() => {
    setStreamHub(null);
    vi.restoreAllMocks();
  });

  it("runItem 抛错：item 保留（claimedAt 置位），AgentMessage 仍 pending（旧实现行消失 → 旧实现即红）", async () => {
    const ctx = await createContextInner();
    const fx = await mkFixture(ctx);
    try {
      await enqueueSuperiorQueueDrain({
        sessionId: fx.sessionId,
        config: ctx.config,
        services: ctx.services,
        runItem: async () => {
          throw new Error("B2 模拟 prepareAgentRun 崩溃");
        },
      });

      await vi.waitFor(
        async () => {
          const row = await prisma.sessionQueueItem.findUnique({ where: { id: fx.itemId } });
          expect(row).toBeTruthy();
          expect(row!.claimedAt).toBeTruthy();
        },
        { timeout: 5000, interval: 30 },
      );

      // listBySession 对已认领项不可见
      expect(await ctx.services.sessionQueueItem.listBySession(fx.sessionId)).toHaveLength(0);

      const msg = await prisma.agentMessage.findUnique({ where: { id: fx.agentMsgId } });
      expect(msg?.status).toBe("pending");
    } finally {
      await cleanup(fx);
    }
  });

  it("正常路径：consume→落地→finalize 删行，AgentMessage consumed", async () => {
    const ctx = await createContextInner();
    const fx = await mkFixture(ctx);
    try {
      await enqueueSuperiorQueueDrain({
        sessionId: fx.sessionId,
        config: ctx.config,
        services: ctx.services,
        runItem: async (item) => {
          await ctx.services.message.create({
            sessionId: fx.sessionId,
            role: "user",
            content: item.content,
            source: "manager",
          } as any);
        },
      });

      await vi.waitFor(
        async () => {
          expect(await prisma.sessionQueueItem.findUnique({ where: { id: fx.itemId } })).toBeNull();
        },
        { timeout: 5000, interval: 30 },
      );

      const bubble = await prisma.chatMessage.findFirst({
        where: { sessionId: fx.sessionId, content: "B2 上级指令" },
      });
      expect(bubble).toBeTruthy();
      const msg = await prisma.agentMessage.findUnique({ where: { id: fx.agentMsgId } });
      expect(msg?.status).toBe("consumed");
    } finally {
      await cleanup(fx);
    }
  });

  it("超龄 claimedAt：releaseStaleClaims / 启动恢复后可重投", async () => {
    const ctx = await createContextInner();
    const fx = await mkFixture(ctx);
    try {
      const claim = await ctx.services.sessionQueueItem.consume(fx.itemId);
      expect(claim.claimed).toBe(true);
      await prisma.sessionQueueItem.update({
        where: { id: fx.itemId },
        data: { claimedAt: new Date(Date.now() - SESSION_QUEUE_CLAIM_STALE_MS - 1000) },
      });

      const released = await ctx.services.sessionQueueItem.releaseStaleClaims();
      expect(released).toBeGreaterThanOrEqual(1);

      const row = await prisma.sessionQueueItem.findUnique({ where: { id: fx.itemId } });
      expect(row?.claimedAt).toBeNull();
      expect(await ctx.services.sessionQueueItem.listBySession(fx.sessionId)).toHaveLength(1);

      // 再置超龄，走启动恢复入口。摘掉 hub，避免 release 后 superior drain 立刻重认领干扰断言。
      setStreamHub(null);
      await ctx.services.sessionQueueItem.consume(fx.itemId);
      await prisma.sessionQueueItem.update({
        where: { id: fx.itemId },
        data: { claimedAt: new Date(Date.now() - SESSION_QUEUE_CLAIM_STALE_MS - 1000) },
      });
      const recovery = await runStartupRecovery({ config: ctx.config, services: ctx.services });
      expect(recovery.staleQueueClaimsReleased).toBeGreaterThanOrEqual(1);
      expect((await prisma.sessionQueueItem.findUnique({ where: { id: fx.itemId } }))?.claimedAt).toBeNull();
    } finally {
      await cleanup(fx);
    }
  });

  it("超龄 claimedAt 且已有同 content ChatMessage：finalize 删行，禁止 release 回待发", async () => {
    const ctx = await createContextInner();
    const agent = await ctx.services.agent.create({
      name: `B2-UserQ-${RUN_ID}-${Math.random().toString(36).slice(2, 6)}`,
      model: "deepseek-chat",
      systemPrompt: "test",
      tools: [],
      tier: "sub",
    });
    const agentId = (agent.data as { id: string }).id;
    const session = await ctx.services.session.create({
      title: "B2 user queue",
      model: "deepseek-chat",
      agentId,
      kind: "chat",
      isMainSession: true,
    } as any);
    const sessionId = (session.data as { id: string }).id;
    try {
      const created = await ctx.services.sessionQueueItem.create({
        sessionId,
        kind: "user",
        content: "刚发出去的消息",
        source: "user",
      });
      const itemId = (created.data as { id: string }).id;
      await ctx.services.sessionQueueItem.consume(itemId);
      await ctx.services.message.create({
        sessionId,
        role: "user",
        content: "刚发出去的消息",
        source: "user",
      } as any);
      await prisma.sessionQueueItem.update({
        where: { id: itemId },
        data: { claimedAt: new Date(Date.now() - SESSION_QUEUE_CLAIM_STALE_MS - 1000) },
      });

      const touched = await ctx.services.sessionQueueItem.releaseStaleClaims();
      expect(touched).toBeGreaterThanOrEqual(1);
      expect(await prisma.sessionQueueItem.findUnique({ where: { id: itemId } })).toBeNull();
      expect(await ctx.services.sessionQueueItem.listBySession(sessionId)).toHaveLength(0);
    } finally {
      await prisma.sessionQueueItem.deleteMany({ where: { sessionId } }).catch(() => {});
      await prisma.chatMessage.deleteMany({ where: { sessionId } }).catch(() => {});
      await prisma.chatSession.deleteMany({ where: { id: sessionId } }).catch(() => {});
      await prisma.agent.deleteMany({ where: { id: agentId } }).catch(() => {});
    }
  });

  it("竞态双 consume：恰一胜；落选 claimed:false", async () => {
    const ctx = await createContextInner();
    const fx = await mkFixture(ctx);
    try {
      const [r1, r2] = await Promise.all([
        ctx.services.sessionQueueItem.consume(fx.itemId),
        ctx.services.sessionQueueItem.consume(fx.itemId),
      ]);
      expect([r1, r2].filter((r) => r.claimed)).toHaveLength(1);
      expect([r1, r2].every((r) => r.success)).toBe(true);
      expect(await ctx.services.sessionQueueItem.listBySession(fx.sessionId)).toHaveLength(0);
      expect((await prisma.sessionQueueItem.findUnique({ where: { id: fx.itemId } }))?.claimedAt).toBeTruthy();
    } finally {
      await cleanup(fx);
    }
  });

  it("unclaim / reconcileClaimsAfterRun：无消息则释放认领；有消息则 finalize", async () => {
    const ctx = await createContextInner();
    const fx = await mkFixture(ctx);
    const content = "B2 上级指令";
    try {
      expect((await ctx.services.sessionQueueItem.consume(fx.itemId)).claimed).toBe(true);
      expect(await ctx.services.sessionQueueItem.unclaim(fx.itemId)).toBe(true);
      expect((await prisma.sessionQueueItem.findUnique({ where: { id: fx.itemId } }))?.claimedAt).toBeNull();
      expect(await ctx.services.sessionQueueItem.listBySession(fx.sessionId)).toHaveLength(1);

      expect((await ctx.services.sessionQueueItem.consume(fx.itemId)).claimed).toBe(true);
      // 无 ChatMessage：reconcile 应 unclaim
      expect(await ctx.services.sessionQueueItem.reconcileClaimsAfterRun(fx.sessionId)).toBeGreaterThanOrEqual(1);
      expect((await prisma.sessionQueueItem.findUnique({ where: { id: fx.itemId } }))?.claimedAt).toBeNull();

      expect((await ctx.services.sessionQueueItem.consume(fx.itemId)).claimed).toBe(true);
      const claimedAt = (await prisma.sessionQueueItem.findUnique({ where: { id: fx.itemId } }))!.claimedAt!;
      await prisma.chatMessage.create({
        data: {
          sessionId: fx.sessionId,
          role: "user",
          content,
          createdAt: new Date(claimedAt.getTime() + 1),
        },
      });
      expect(await ctx.services.sessionQueueItem.reconcileClaimsAfterRun(fx.sessionId)).toBeGreaterThanOrEqual(1);
      expect(await prisma.sessionQueueItem.findUnique({ where: { id: fx.itemId } })).toBeNull();
    } finally {
      await cleanup(fx);
    }
  });
});


}

{
const RUN_ID = `b3${Date.now().toString(36)}`;

describe("R-wait-outside-pool autoConsume 不得在池槽内等 hub（旧称 B3）", () => {
  beforeEach(() => {
    resetAsyncJobOrchestratorForTests();
    setStreamHub(new SessionStreamHub({ ringSize: 100, persist: false, eventTtlMs: 1000, cleanupIntervalMs: 0 }));
  });

  afterEach(() => {
    setStreamHub(null);
    vi.restoreAllMocks();
  });

  it("hub 长占用期间：consume 等待不持池槽（runningGlobal=0；旧实现槽内等 → 旧实现即红）", async () => {
    const ctx = await createContextInner();
    const agent = await ctx.services.agent.create({
      name: `B3-Agent-${RUN_ID}`,
      model: "deepseek-chat",
      systemPrompt: "t",
      tools: [],
    });
    const agentId = (agent.data as { id: string }).id;
    const session = await ctx.services.session.create({
      title: "B3",
      model: "deepseek-chat",
      agentId,
    } as any);
    const sessionId = (session.data as { id: string }).id;
    const task = await prisma.task.create({
      data: {
        name: "[async] B3",
        type: "async_agent",
        status: "success",
        sessionId,
        delivered: false,
        input: {
          kind: "async_agent",
          sessionId,
          task: "B3",
          taskLabel: "B3",
          agentSnapshot: { id: agentId, model: "m", systemPrompt: "", tools: [] },
          sourceType: "subagent",
        },
        output: { asyncResult: "B3 ok" },
      },
    });

    const hub = getStreamHub()!;
    let release!: () => void;
    const gate = new Promise<void>((r) => {
      release = r;
    });
    await hub.start(sessionId, { sessionId, agentId, message: "占用" }, async (emit) => {
      await gate;
      emit({
        type: "done",
        sessionId,
        agentId,
        content: "done",
        toolCalls: [],
        model: "m",
        provider: "p",
        roundsUsed: 1,
      });
    });

    const orch = getAsyncJobOrchestrator(ctx.config);
    const r = await autoConsumeAsyncDelivery({
      sessionId,
      jobId: task.id,
      status: "done",
      taskLabel: "B3",
      services: ctx.services,
      config: ctx.config,
    });
    expect(r).toBe("started");

    // 等待中采样：旧实现已获槽 runningGlobal>=1；新实现槽外等 = 0
    await new Promise((r) => setTimeout(r, 80));
    expect(orch.getStats().runningGlobal).toBe(0);

    release();
    await hub.waitFor(sessionId);

    await prisma.task.deleteMany({ where: { id: task.id } }).catch(() => {});
    await prisma.chatMessage.deleteMany({ where: { sessionId } }).catch(() => {});
    await prisma.chatSession.deleteMany({ where: { id: sessionId } }).catch(() => {});
    await prisma.agent.deleteMany({ where: { id: agentId } }).catch(() => {});
  });
});


}

{
const SID = `b4${Date.now().toString(36)}`;

describe("R-restart-failed 僵尸标 failed、零入池；二次 recover 幂等（旧称 B4）", () => {
  beforeEach(() => {
    resetAsyncJobOrchestratorForTests();
    setStreamHub(new SessionStreamHub({ ringSize: 50, persist: false, eventTtlMs: 1000, cleanupIntervalMs: 0 }));
    vi.spyOn(agentRuntime, "runAgentLoop").mockResolvedValue({
      content: "B4 ok",
      toolCalls: [],
      tokenUsage: { prompt: 1, completion: 1, total: 2 },
      model: "m",
      provider: "p",
      roundsUsed: 1,
    });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    setStreamHub(null);
    await prisma.task.deleteMany({ where: { sessionId: { startsWith: SID } } });
    await prisma.chatSession.deleteMany({ where: { id: { startsWith: SID } } }).catch(() => {});
  });

  it("服务重启不自动续跑：僵尸统一 failed，二次 recover 幂等", async () => {
    const ctx = await createContextInner();
    const sessionId = `${SID}-s1`;
    const task = await prisma.task.create({
      data: {
        name: "[async] B4 resume",
        type: "async_agent",
        status: "running",
        sessionId,
        startedAt: new Date(),
        input: {
          kind: "async_agent",
          sessionId,
          task: "B4",
          taskLabel: "B4",
          agentSnapshot: { id: "t", model: "m", systemPrompt: "", tools: [] },
          sourceType: "async_task_llm",
          deliverToQueue: false,
        },
      },
    });

    const r1 = await recoverStaleAsyncJobs(ctx.config, ctx.services);
    expect(r1.failed).toBe(1);
    const after1 = await prisma.task.findUnique({ where: { id: task.id } });
    expect(after1?.status).toBe("failed");
    expect((after1?.output as { error?: string })?.error).toContain("服务重启，任务中断");

    // 二次 recover：已 failed，条件写认领落选
    const r2 = await recoverStaleAsyncJobs(ctx.config, ctx.services);
    expect(r2.failed).toBe(0);
    const after2 = await prisma.task.findUnique({ where: { id: task.id } });
    expect(after2?.status).toBe("failed");

    // 零入池
    const orch = getAsyncJobOrchestrator(ctx.config);
    expect(orch.getStats().runningGlobal).toBe(0);
  });

  it("动作顺序：先 paused 僵尸会话，再 Task resume（resume 起的 running 不被误伤）", async () => {
    const ctx = await createContextInner();
    const agent = await ctx.services.agent.create({
      name: `B4-Agent-${SID}`,
      model: "deepseek-chat",
      systemPrompt: "t",
      tools: [],
      tier: "sub",
    });
    const agentId = (agent.data as { id: string }).id;
    // 僵尸会话（应被 paused）
    const zombie = await prisma.chatSession.create({
      data: {
        id: `${SID}-zombie`,
        title: "zombie",
        model: "m",
        agentId,
        status: "running",
        kind: "chat",
      },
    });
    // 子会话挂在续跑 Task 上：resume 执行体可能把它置 running——若先 resume 再全量 paused 会误伤
    const subSid = `${SID}-sub`;
    await prisma.chatSession.create({
      data: {
        id: subSid,
        title: "sub",
        model: "m",
        agentId,
        status: "paused",
        kind: "subagent",
        isMainSession: true,
      },
    });
    const sessionId = `${SID}-parent`;
    await prisma.task.create({
      data: {
        name: "[async] B4 order",
        type: "async_agent",
        status: "running",
        sessionId,
        startedAt: new Date(),
        input: {
          kind: "async_agent",
          sessionId,
          task: "B4 order",
          taskLabel: "B4 order",
          agentSnapshot: { id: agentId, model: "m", systemPrompt: "", tools: [] },
          sourceType: "async_task_llm",
          subagentSessionId: subSid,
          deliverToQueue: false,
        },
      },
    });

    const result = await runStartupRecovery({ config: ctx.config, services: ctx.services });
    expect(result.zombieSessionsInterrupted).toBeGreaterThanOrEqual(1);
    expect((await prisma.chatSession.findUnique({ where: { id: zombie.id } }))?.status).toBe("interrupted");

    await prisma.agent.deleteMany({ where: { id: agentId } }).catch(() => {});
  });
});


}

{
const RUN_ID = `b5${Date.now().toString(36)}`;

describe("R-depth-server depth 服务端物化，LLM 传 depth 无效（旧称 B5）", () => {
  beforeEach(() => {
    resetSwarmBus();
  });

  afterEach(async () => {
    resetSwarmBus();
    await prisma.agentMessage.deleteMany({ where: { content: { startsWith: "B5-" } } }).catch(() => {});
    await prisma.agent.deleteMany({ where: { name: { startsWith: `B5-${RUN_ID}` } } }).catch(() => {});
  });

  it("LLM 显式传 depth:1 的深层派生：guard/bus 按服务端物化 depth 拦截（旧实现放行 → 旧实现即红）", async () => {
    const ctx = await createContextInner();
    const a = await ctx.services.agent.create({
      name: `B5-${RUN_ID}-A`,
      model: "deepseek-chat",
      systemPrompt: "t",
      tools: [],
      tier: "manager",
    });
    const b = await ctx.services.agent.create({
      name: `B5-${RUN_ID}-B`,
      model: "deepseek-chat",
      systemPrompt: "t",
      tools: [],
      tier: "sub",
      parentId: (a.data as { id: string }).id,
    });
    const agentA = (a.data as { id: string }).id;
    const agentB = (b.data as { id: string }).id;

    // 模拟 A 已处于最大深度入站（派生链末端）
    await prisma.agentMessage.create({
      data: {
        fromAgentId: agentB,
        toAgentId: agentA,
        content: "B5-seed",
        messageType: "command",
        source: "sub",
        depth: SWARM_MAX_DEPTH,
        status: "pending",
      },
    });

    // guard 不再信任 args.depth（即使传 1 也不在本层放行/拦截——交 bus）
    expect(
      checkToolPermission(
        "agent_send_message",
        { toAgentId: agentB, content: "B5-bypass", depth: 1 },
        { agentTier: "manager", agentId: agentA, agentWorkspaceId: null, inToolRound: true },
      ),
    ).toBeNull();

    const bus = getSwarmBus(prisma, ctx.services);
    // 调用方若仍塞 depth:1（类型已移除；运行时多传无效）——物化 = MAX+1 → 拒绝
    const sent = await bus.send(
      {
        fromAgentId: agentA,
        toAgentId: agentB,
        content: "B5-bypass",
        messageType: "command",
        source: "manager",
        // @ts-expect-error B5：depth 已移出 AgentMessageInput，运行时也应被忽略
        depth: 1,
      },
      "manager",
      null,
      true,
    );
    expect(sent.success).toBe(false);
    expect(sent.error?.code).toBe("DELEGATION_DEPTH_EXCEEDED");
  });

  it("无入站时 depth=1；有入站时 depth=父+1", async () => {
    const ctx = await createContextInner();
    // 不用 tier=super：库内已有唯一超级 Agent 时 create 会返回 SUPER_AGENT_UNIQUE（全量并行易红）
    const a = await ctx.services.agent.create({
      name: `B5-${RUN_ID}-root`,
      model: "deepseek-chat",
      systemPrompt: "t",
      tools: [],
      tier: "manager",
    });
    expect(a.data).toBeTruthy();
    const b = await ctx.services.agent.create({
      name: `B5-${RUN_ID}-child`,
      model: "deepseek-chat",
      systemPrompt: "t",
      tools: [],
      tier: "sub",
      parentId: (a.data as { id: string }).id,
    });
    expect(b.data).toBeTruthy();
    const agentA = (a.data as { id: string }).id;
    const agentB = (b.data as { id: string }).id;
    const bus = getSwarmBus(prisma, ctx.services);

    const r1 = await bus.send(
      { fromAgentId: agentA, toAgentId: agentB, content: "B5-first", source: "manager" },
      "manager",
      null,
      true,
    );
    expect(r1.success).toBe(true);
    const m1 = await prisma.agentMessage.findUnique({ where: { id: r1.messageId! } });
    expect(m1?.depth).toBe(1);

    const r2 = await bus.send(
      { fromAgentId: agentB, toAgentId: agentA, content: "B5-second", messageType: "report", source: "sub" },
      "sub",
      null,
      false,
    );
    expect(r2.success).toBe(true);
    const m2 = await prisma.agentMessage.findUnique({ where: { id: r2.messageId! } });
    expect(m2?.depth).toBe(2);
  });
});


}

{
const RUN_ID = `b7${Date.now().toString(36)}`;

describe("R-queue-unique (sessionId, agentMessageId) 唯一 + P2002 幂等（旧称 B7）", () => {
  beforeEach(() => {
    setStreamHub(new SessionStreamHub({ ringSize: 50, persist: false, eventTtlMs: 1000, cleanupIntervalMs: 0 }));
  });

  afterEach(async () => {
    setStreamHub(null);
    await prisma.sessionQueueItem.deleteMany({ where: { content: { startsWith: "B7-" } } }).catch(() => {});
    await prisma.agentMessage.deleteMany({ where: { content: { startsWith: "B7-" } } }).catch(() => {});
    await prisma.chatSession.deleteMany({ where: { title: { startsWith: `B7-${RUN_ID}` } } }).catch(() => {});
    await prisma.agent.deleteMany({ where: { name: { startsWith: `B7-${RUN_ID}` } } }).catch(() => {});
  });

  it("并发双写同 (sessionId, agentMessageId) → 单行（旧实现可双行 → 旧实现即红）", async () => {
    const ctx = await createContextInner();
    const agent = await ctx.services.agent.create({
      name: `B7-${RUN_ID}-a`,
      model: "deepseek-chat",
      systemPrompt: "t",
      tools: [],
      tier: "sub",
    });
    const agentId = (agent.data as { id: string }).id;
    const main = await prisma.chatSession.findFirst({
      where: { agentId, isMainSession: true },
    });
    if (!main) throw new Error("缺主会话");
    const sessionId = main.id;
    await prisma.chatSession.update({ where: { id: sessionId }, data: { title: `B7-${RUN_ID}` } });

    const agentMsg = await prisma.agentMessage.create({
      data: {
        fromAgentId: agentId,
        toAgentId: agentId,
        content: "B7-msg",
        messageType: "command",
        source: "manager",
        status: "pending",
        depth: 1,
      },
    });

    const [r1, r2] = await Promise.all([
      ctx.services.sessionQueueItem.create({
        sessionId,
        kind: "superior",
        content: "B7-dup",
        source: agentId,
        agentMessageId: agentMsg.id,
      }),
      ctx.services.sessionQueueItem.create({
        sessionId,
        kind: "superior",
        content: "B7-dup",
        source: agentId,
        agentMessageId: agentMsg.id,
      }),
    ]);

    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
    const rows = await prisma.sessionQueueItem.findMany({
      where: { sessionId, agentMessageId: agentMsg.id },
    });
    expect(rows).toHaveLength(1);
    expect(r1.data?.id).toBe(rows[0].id);
    expect(r2.data?.id).toBe(rows[0].id);
  });
});
}
