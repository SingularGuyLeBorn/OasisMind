/**
 * R-2 重启恢复四动作 — 集成测试（负向断言）
 *
 * 统一入口 runStartupRecovery（asyncJobManager.ts，启动序列一次性首扫；周期对账由
 * startAsyncDeliveryReconciler 负责，动作 2 与 R-1 孤儿共用 reconcileAsyncDeliveries 同一幂等入口）：
 * 1. 僵尸 running/queued async Task 统一标 failed「服务重启，任务中断」
 *    （服务重启一律不自动续跑；reentrant/maxRetries/retryCount 三列已删；retryAsyncJob 手动重试）；
 * 2. 僵尸 running ChatSession → interrupted（条件写；重启后 hub 无活跃流，running 皆尸体；
 *    interrupted 表示崩溃/重启遗留，恢复管道可自动接管；paused 保留给用户手停）；
 * 3. superior 孤儿 SessionQueueItem → 重新注册 drain（v7 W-E 机制，consume 删除即认领）；
 *    前置邮箱对账 reconcileAgentMessageLedger：纯邮箱路径（autoRun=false）滞留 pending 补
 *    superior 镜像（C5），同轮被 drain 接管，不再依赖前端打开子会话页才镜像；
 * 4. delivered=false 终态未投递 → 重新 notify（reconcileAsyncDeliveries Pass 2）。
 *
 * 负向断言（旧实现下必红的断言已逐条标注；旧实现 = 恢复函数不处理该项 / 函数不存在）：
 * - C1：僵尸会话永远停 running（无动作 2）、stale 子会话不被标 failed 之外的收口；
 * - C2：未投递终态 delivered 恒 false、气泡永不出现（无 Pass 2）；
 * - C3：孤儿队列项永久滞留（无 drain 重注册）、user 消息永不写入；
 * 负向验证方式：git stash 生产代码后跑本文件应红。
 */

import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { prisma } from "../db.js";
import * as agentStream from "../infra/agentStream/index.js";
import { createContextInner } from "../trpc/context.js";
import { runStartupRecovery, recoverStaleAsyncJobs, retryAsyncJob } from "../infra/asyncJobs/index.js";
import { getAsyncJobOrchestrator, resetAsyncJobOrchestratorForTests } from "../infra/asyncJobOrchestrator.js";
import { setStreamHub, SessionStreamHub } from "../infra/sessionStreamHub.js";
import { resetSwarmBus } from "../infra/swarmBus.js";
import * as agentRuntime from "../infra/agentRuntime.js";
import { registerNativeDomains } from "../infra/tools/native/index.js";
import { PACKS_FULL } from "@oasismind/shared";
import { createTestConfig } from "./helpers/toolTestFixtures.js";

type Ctx = Awaited<ReturnType<typeof createContextInner>>;

const RUN_ID = `r2${Date.now().toString(36)}`;

async function createAgent(ctx: Ctx, label: string, tier: string, parentId?: string): Promise<string> {
  const agent = await ctx.services.agent.create({
    name: `R2-${label}-${RUN_ID}-${Math.random().toString(36).slice(2, 6)}`,
    model: "deepseek-chat",
    systemPrompt: "test",
    tools: [],
    tier,
    ...(parentId ? { parentId } : {}),
  } as any);
  return (agent.data as { id: string }).id;
}

async function createSession(
  ctx: Ctx,
  agentId: string,
  opts?: { status?: string; isMainSession?: boolean; kind?: string; parentSessionId?: string },
): Promise<string> {
  const session = await ctx.services.session.create({
    title: "R2 会话",
    model: "deepseek-chat",
    agentId,
    ...(opts?.isMainSession ? { isMainSession: true } : {}),
    ...(opts?.kind ? { kind: opts.kind } : {}),
    ...(opts?.parentSessionId ? { parentSessionId: opts.parentSessionId } : {}),
  } as any);
  const id = (session.data as { id: string }).id;
  if (opts?.status) {
    await prisma.chatSession.update({ where: { id }, data: { status: opts.status } });
  }
  return id;
}

/** 终态 async 任务（deliverToQueue 缺省 true） */
async function createTerminalTask(data: {
  sessionId: string;
  agentId: string;
  status: "success" | "failed";
  delivered: boolean;
  agedFinishedAt?: boolean;
  deliverToQueue?: boolean;
  subagentSessionId?: string;
}) {
  return prisma.task.create({
    data: {
      name: "[async] R2 任务",
      type: "async_agent",
      status: data.status,
      sessionId: data.sessionId,
      delivered: data.delivered,
      ...(data.delivered ? { deliveredAt: new Date() } : {}),
      finishedAt: new Date(Date.now() - (data.agedFinishedAt ? 10 * 60_000 : 0)),
      input: {
        kind: "async_agent",
        sessionId: data.sessionId,
        task: "R2 任务",
        taskLabel: "R2 任务",
        agentSnapshot: { id: data.agentId, model: "m", systemPrompt: "", tools: [], tier: "sub", parentId: null },
        sourceType: "subagent",
        ...(data.deliverToQueue === false ? { deliverToQueue: false } : {}),
        ...(data.subagentSessionId ? { subagentSessionId: data.subagentSessionId } : {}),
      },
      output: data.status === "success" ? { asyncResult: "R2 结果文本" } : { error: "R2 失败" },
    },
  });
}

/** 僵尸（running/queued）async 任务 */
async function createStaleTask(data: {
  sessionId: string;
  agentId: string;
  status: "running" | "queued";
  subagentSessionId?: string;
}) {
  return prisma.task.create({
    data: {
      name: "[async] R2 僵尸任务",
      type: "async_agent",
      status: data.status,
      sessionId: data.sessionId,
      delivered: false,
      input: {
        kind: "async_agent",
        sessionId: data.sessionId,
        task: "R2 僵尸任务",
        taskLabel: "R2 僵尸任务",
        agentSnapshot: { id: data.agentId, model: "m", systemPrompt: "", tools: [], tier: "sub", parentId: null },
        sourceType: "subagent",
        ...(data.subagentSessionId ? { subagentSessionId: data.subagentSessionId } : {}),
      },
    },
  });
}

/** chatAgentStream 打桩：模拟真实注入（user 气泡携带 jobId 台账）+ assistant + 会话 completed，不触 LLM */
function mockChatAgentStreamWithBubble() {
  return vi.spyOn(agentStream, "chatAgentStream").mockImplementation(async (s, _c, input, _inv, emit) => {
    await s.message.create({
      sessionId: input.sessionId!,
      role: "user",
      content: input.message,
      toolResults: input.toolResults as never,
      source: input.source ?? "user",
    } as any);
    await s.message.create({
      sessionId: input.sessionId!,
      role: "assistant",
      content: "已消化",
      source: "system",
    } as any);
    await s.prisma.chatSession.update({
      where: { id: input.sessionId! },
      data: { status: "completed" },
    });
    emit({
      type: "done",
      sessionId: input.sessionId!,
      agentId: "r2-spy",
      content: "已消化",
      toolCalls: [],
      model: "m",
      provider: "p",
      roundsUsed: 1,
    });
  });
}

async function cleanupIds(ids: { agentIds: string[]; sessionIds: string[] }) {
  await prisma.sessionQueueItem.deleteMany({ where: { sessionId: { in: ids.sessionIds } } }).catch(() => {});
  await prisma.chatMessage.deleteMany({ where: { sessionId: { in: ids.sessionIds } } }).catch(() => {});
  await prisma.run.deleteMany({ where: { sessionId: { in: ids.sessionIds } } }).catch(() => {});
  await prisma.task.deleteMany({ where: { sessionId: { in: ids.sessionIds } } }).catch(() => {});
  await prisma.chatSession.deleteMany({ where: { id: { in: ids.sessionIds } } }).catch(() => {});
  await prisma.agent.deleteMany({ where: { id: { in: ids.agentIds } } }).catch(() => {});
}

describe("R-2 重启恢复四动作（runStartupRecovery 首扫）", () => {
  beforeEach(async () => {
    resetAsyncJobOrchestratorForTests();
    resetSwarmBus();
    setStreamHub(new SessionStreamHub({ ringSize: 100, persist: false, eventTtlMs: 1000, cleanupIntervalMs: 0 }));
    // 单 fork 串行下 test.db 跨文件共享：清掉前序文件遗留，保证 runStartupRecovery 扫描面
    // 只含本文件构造的数据（staleTasksFailed / zombieSessionsInterrupted / renotifiedUndelivered 计数确定性）
    await prisma.task.deleteMany({ where: { status: { in: ["running", "queued", "success", "failed"] } } });
    await prisma.chatSession.updateMany({ where: { status: "running" }, data: { status: "paused" } });
    await prisma.sessionQueueItem.deleteMany({ where: { kind: "superior" } });
  });

  afterEach(() => {
    setStreamHub(null);
    vi.restoreAllMocks();
    delete process.env.MOCK_LLM;
  });

  it("C1 动作 1+2：僵尸 Task 标 failed（文案正确、不自动重跑）+ 僵尸 running 会话标 interrupted；连跑两次幂等", async () => {
    const ctx = await createContextInner();
    const agentId = await createAgent(ctx, "C1", "manager");
    const zombieSessionId = await createSession(ctx, agentId, { status: "running" });
    const subSessionId = await createSession(ctx, agentId, { status: "running", kind: "subagent" });
    const staleRunning = await createStaleTask({ sessionId: zombieSessionId, agentId, status: "running", subagentSessionId: subSessionId });
    const staleQueued = await createStaleTask({ sessionId: zombieSessionId, agentId, status: "queued" });
    // 新鲜终态任务：不属于恢复范围（终态时间未超龄，Pass 2 在途保护跳过）
    const freshTerminal = await createTerminalTask({ sessionId: zombieSessionId, agentId, status: "success", delivered: false });

    try {
      const r1 = await runStartupRecovery({ config: ctx.config, services: ctx.services });

      // 动作 1：僵尸 running/queued → failed + error 文案
      expect(r1.staleTasksFailed).toBe(2);
      const rowRunning = await prisma.task.findUnique({ where: { id: staleRunning.id } });
      const rowQueued = await prisma.task.findUnique({ where: { id: staleQueued.id } });
      expect(rowRunning?.status).toBe("failed");
      expect(rowQueued?.status).toBe("failed");
      expect((rowRunning?.output as { error?: string })?.error).toContain("服务重启");
      // 不自动重跑：没有新 run/新任务被创建，任务只是被标 failed（重试走 retryAsyncJob 手动）
      expect(rowRunning?.startedAt).toBeNull();
      // B4：先 interrupted 全部 running 尸体（本例 zombie + sub 共 2），再 Task 恢复把 sub 覆写 failed
      expect(r1.zombieSessionsInterrupted).toBe(2);
      const zombieSession = await prisma.chatSession.findUnique({ where: { id: zombieSessionId } });
      expect(zombieSession?.status).toBe("interrupted");
      // stale 任务的 subagent 会话同步标 failed（既有 recoverStaleAsyncJobs 语义收拢）
      const subSession = await prisma.chatSession.findUnique({ where: { id: subSessionId } });
      expect(subSession?.status).toBe("failed");

      // 新鲜终态任务零误伤（旧实现无 Pass 2 时不红；防的是恢复函数误投在途交付）
      const freshRow = await prisma.task.findUnique({ where: { id: freshTerminal.id } });
      expect(freshRow?.status).toBe("success");
      expect(freshRow?.delivered).toBe(false);
      expect(r1.reconcile.renotifiedUndelivered).toBe(0);

      // 幂等：连跑第二次，状态不变、计数全零
      const r2 = await runStartupRecovery({ config: ctx.config, services: ctx.services });
      expect(r2.staleTasksFailed).toBe(0);
      expect(r2.zombieSessionsInterrupted).toBe(0);
      expect((await prisma.task.findUnique({ where: { id: staleRunning.id } }))?.status).toBe("failed");
      expect((await prisma.chatSession.findUnique({ where: { id: zombieSessionId } }))?.status).toBe("interrupted");
    } finally {
      await cleanupIds({ agentIds: [agentId], sessionIds: [zombieSessionId, subSessionId] });
    }
  }, 20_000);

  it("C2 动作 4：delivered=false 终态未投递 → 重新 notify → 管道认领 + 气泡注入；sync 任务不误投", async () => {
    const chatSpy = mockChatAgentStreamWithBubble();
    const ctx = await createContextInner();
    const agentId = await createAgent(ctx, "C2", "manager");
    const sessionId = await createSession(ctx, agentId);
    // 重启前完成但 notify 丢失的终态结果（delivered=false、终态时间超龄）
    const undelivered = await createTerminalTask({ sessionId, agentId, status: "success", delivered: false, agedFinishedAt: true });
    // 同步任务（deliverToQueue=false）：结果走 tool return，永不进队列——不属于补投范围
    const syncTask = await createTerminalTask({ sessionId, agentId, status: "success", delivered: false, agedFinishedAt: true, deliverToQueue: false });

    try {
      const r = await runStartupRecovery({ config: ctx.config, services: ctx.services });
      // 旧实现无 Pass 2：undelivered 恒 delivered=false、气泡永不出现，以下断言必红
      expect(r.reconcile.scannedUndelivered).toBe(2);
      expect(r.reconcile.renotifiedUndelivered).toBe(1);

      // 重新走正常 notify/autoConsume 管道：CLAIM → 气泡注入
      await vi.waitFor(
        async () => {
          expect((await prisma.task.findUnique({ where: { id: undelivered.id } }))?.delivered).toBe(true);
          expect(chatSpy).toHaveBeenCalled();
        },
        { timeout: 8000, interval: 50 },
      );
      const bubble = await prisma.chatMessage.findFirst({ where: { sessionId, role: "user" } });
      const toolResults = bubble?.toolResults as { subagentResult?: { jobId?: string } } | null;
      expect(toolResults?.subagentResult?.jobId).toBe(undelivered.id);

      // sync 任务零误投
      expect((await prisma.task.findUnique({ where: { id: syncTask.id } }))?.delivered).toBe(false);
    } finally {
      await cleanupIds({ agentIds: [agentId], sessionIds: [sessionId] });
    }
  }, 20_000);

  it("C3 动作 3：superior 孤儿队列项 → drain 重注册 → 项被消费 + AgentMessage 记账 consumed", async () => {
    // superior drain 走 prepareAgentRun → runAgentLoopStream，不经 chatAgentStream
    const loopSpy = vi.spyOn(agentStream, "runAgentLoopStream").mockImplementation(async () => ({
      content: "已消化",
      toolCalls: [],
      tokenUsage: { prompt: 0, completion: 0, total: 0 },
      model: "m",
      provider: "p",
      roundsUsed: 1,
    }));
    const ctx = await createContextInner();
    const parentAgentId = await createAgent(ctx, "C3父", "manager");
    const subAgentId = await createAgent(ctx, "C3子", "sub", parentAgentId);
    // Agent.create 已 ensureMainSession：复用该主会话挂队列（禁止第二条 isMainSession）
    const main = await prisma.chatSession.findFirst({
      where: { agentId: subAgentId, isMainSession: true, status: { not: "deleted" } },
    });
    if (!main) throw new Error("C3: 子 Agent 缺少自动主会话");
    const subSessionId = main.id;
    await prisma.chatSession.update({
      where: { id: subSessionId },
      data: { status: "running", kind: "subagent" },
    });
    const agentMsg = await prisma.agentMessage.create({
      data: {
        fromAgentId: parentAgentId,
        toAgentId: subAgentId,
        content: "R-2 遗留队列任务",
        messageType: "command",
        source: "manager",
        status: "pending",
      },
    });
    await prisma.sessionQueueItem.create({
      data: {
        sessionId: subSessionId,
        kind: "superior",
        content: "R-2 遗留队列任务",
        source: parentAgentId,
        agentMessageId: agentMsg.id,
      },
    });

    try {
      const r = await runStartupRecovery({ config: ctx.config, services: ctx.services });
      // 旧实现无重注册：孤儿队列项永久滞留（listBySession 恒 1）、user 消息永不写入，以下断言必红
      expect(r.superiorDrainsRegistered).toBe(1);

      // drain 自动处理：队列项被 consume（删除即认领）→ prepareAgentRun 写 user 消息并起流（spy）
      await vi.waitFor(
        async () => {
          expect(loopSpy).toHaveBeenCalled();
          const remaining = await ctx.services.sessionQueueItem.listBySession(subSessionId);
          expect(remaining).toHaveLength(0);
          const userMsg = await prisma.chatMessage.findFirst({
            where: { sessionId: subSessionId, role: "user", content: "R-2 遗留队列任务" },
          });
          expect(userMsg).toBeTruthy();
          const assistant = await prisma.chatMessage.findFirst({
            where: { sessionId: subSessionId, role: "assistant" },
          });
          expect(assistant).toBeTruthy();
        },
        { timeout: 10_000, interval: 50 },
      );

      // 账本：consume 事务内 pending → consumed
      const msgRow = await prisma.agentMessage.findUnique({ where: { id: agentMsg.id } });
      expect(msgRow?.status).toBe("consumed");
      // 会话生命周期：running（尸体）→ interrupted（动作 2）→ running（drain 起流）→ completed（跑完）
      const session = await prisma.chatSession.findUnique({ where: { id: subSessionId } });
      expect(session?.status).toBe("completed");
    } finally {
      await prisma.agentMessage.deleteMany({ where: { id: agentMsg.id } }).catch(() => {});
      await cleanupIds({ agentIds: [parentAgentId, subAgentId], sessionIds: [subSessionId] });
    }
  }, 25_000);

  it("C4 动作 3：status=paused 的用户手停会话，pending superior 项不被 drain 重注册/消费，仍 paused", async () => {
    const ctx = await createContextInner();
    const parentAgentId = await createAgent(ctx, "C4父", "manager");
    const subAgentId = await createAgent(ctx, "C4子", "sub", parentAgentId);
    const main = await prisma.chatSession.findFirst({
      where: { agentId: subAgentId, isMainSession: true, status: { not: "deleted" } },
    });
    if (!main) throw new Error("C4: 子 Agent 缺少自动主会话");
    const subSessionId = main.id;
    // 模拟用户手停：status=paused，并留一条 pending superior 队列项
    await prisma.chatSession.update({
      where: { id: subSessionId },
      data: { status: "paused", kind: "subagent" },
    });
    const agentMsg = await prisma.agentMessage.create({
      data: {
        fromAgentId: parentAgentId,
        toAgentId: subAgentId,
        content: "C4 用户手停保留项",
        messageType: "command",
        source: "manager",
        status: "pending",
      },
    });
    await prisma.sessionQueueItem.create({
      data: {
        sessionId: subSessionId,
        kind: "superior",
        content: "C4 用户手停保留项",
        source: parentAgentId,
        agentMessageId: agentMsg.id,
      },
    });

    try {
      const r = await runStartupRecovery({ config: ctx.config, services: ctx.services });
      // 不注册 drain、不消费、不写入 user 消息
      expect(r.superiorDrainsRegistered).toBe(0);
      const remaining = await ctx.services.sessionQueueItem.listBySession(subSessionId);
      expect(remaining).toHaveLength(1);
      const userMsg = await prisma.chatMessage.findFirst({
        where: { sessionId: subSessionId, role: "user" },
      });
      expect(userMsg).toBeFalsy();
      const session = await prisma.chatSession.findUnique({ where: { id: subSessionId } });
      expect(session?.status).toBe("paused");
      const msgRow = await prisma.agentMessage.findUnique({ where: { id: agentMsg.id } });
      expect(msgRow?.status).toBe("pending");
    } finally {
      await prisma.agentMessage.deleteMany({ where: { id: agentMsg.id } }).catch(() => {});
      await cleanupIds({ agentIds: [parentAgentId, subAgentId], sessionIds: [subSessionId] });
    }
  }, 15_000);

  it("C5 动作 3 前置邮箱对账：纯邮箱滞留 pending → 补 superior 镜像 → 同轮 drain 接管消费；连跑两次幂等", async () => {
    // superior drain 走 prepareAgentRun → runAgentLoopStream，不经 chatAgentStream
    const loopSpy = vi.spyOn(agentStream, "runAgentLoopStream").mockImplementation(async () => ({
      content: "已消化",
      toolCalls: [],
      tokenUsage: { prompt: 0, completion: 0, total: 0 },
      model: "m",
      provider: "p",
      roundsUsed: 1,
    }));
    const ctx = await createContextInner();
    const parentAgentId = await createAgent(ctx, "C5父", "manager");
    const subAgentId = await createAgent(ctx, "C5子", "sub", parentAgentId);
    // Agent.create 已 ensureMainSession：复用该主会话（禁止第二条 isMainSession）
    const main = await prisma.chatSession.findFirst({
      where: { agentId: subAgentId, isMainSession: true, status: { not: "deleted" } },
    });
    if (!main) throw new Error("C5: 子 Agent 缺少自动主会话");
    const subSessionId = main.id;
    await prisma.chatSession.update({
      where: { id: subSessionId },
      data: { status: "running", kind: "subagent" },
    });
    // 纯邮箱路径（agent_send_message autoRun=false）：只有 AgentMessage(pending)，无队列镜像；
    // createdAt 回拨超对账阈值（1h），模拟「没人打开子会话页」的永久滞留
    const agentMsg = await prisma.agentMessage.create({
      data: {
        fromAgentId: parentAgentId,
        toAgentId: subAgentId,
        content: "C5 纯邮箱遗留任务",
        messageType: "command",
        source: "manager",
        status: "pending",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    });

    try {
      const r = await runStartupRecovery({ config: ctx.config, services: ctx.services });
      // 旧实现（对账未接线 / 不补镜像）：mirrored 恒 0、队列恒空、user 消息永不写入，以下断言必红
      expect(r.mailboxLedger.mirrored).toBeGreaterThanOrEqual(1);
      expect(r.superiorDrainsRegistered).toBe(1);

      // 补镜像后服务端 drain 同轮接管：consume → prepareAgentRun 写 user 消息并起流（spy）→ finalize 删行
      await vi.waitFor(
        async () => {
          expect(loopSpy).toHaveBeenCalled();
          const remaining = await ctx.services.sessionQueueItem.listBySession(subSessionId);
          expect(remaining).toHaveLength(0);
          const userMsg = await prisma.chatMessage.findFirst({
            where: { sessionId: subSessionId, role: "user", content: "C5 纯邮箱遗留任务" },
          });
          expect(userMsg).toBeTruthy();
        },
        { timeout: 10_000, interval: 50 },
      );
      // 账本：drain finalize 把旁路邮箱回写 consumed（对账自身不越权改状态）
      const msgRow = await prisma.agentMessage.findUnique({ where: { id: agentMsg.id } });
      expect(msgRow?.status).toBe("consumed");

      // 幂等：第二次首扫不再补镜像（消息已 consumed 出扫描集），会话无重复 user 消息
      const r2 = await runStartupRecovery({ config: ctx.config, services: ctx.services });
      expect(r2.mailboxLedger.mirrored).toBe(0);
      const userMsgs = await prisma.chatMessage.findMany({
        where: { sessionId: subSessionId, role: "user", content: "C5 纯邮箱遗留任务" },
      });
      expect(userMsgs).toHaveLength(1);
    } finally {
      await prisma.agentMessage.deleteMany({ where: { id: agentMsg.id } }).catch(() => {});
      await cleanupIds({ agentIds: [parentAgentId, subAgentId], sessionIds: [subSessionId] });
    }
  }, 25_000);
});

/** 自 reentrantResume.test.ts 迁入：不与上方 C1 僵尸 failed 重复的 it（T3 手动重试、T4 风暴）。 */
const RR_SID = "clteststartuprr";
const RR_KIND = "async_agent";
const RR_MOCK_LOOP = {
  content: "续跑完成",
  toolCalls: [],
  tokenUsage: { prompt: 1, completion: 2, total: 3 },
  model: "deepseek-chat",
  provider: "deepseek",
  roundsUsed: 1,
};

describe("启动恢复：手动重试与风暴（旧称 reentrantResume T3/T4）", () => {
  beforeEach(() => {
    registerNativeDomains(PACKS_FULL);
    resetAsyncJobOrchestratorForTests();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await prisma.task.deleteMany({ where: { sessionId: { startsWith: RR_SID } } });
  });

  it("T3 手动 retryAsyncJob 仍可重试（人工最后一道闸）", async () => {
    const ctx = await createContextInner();
    const exhausted = await prisma.task.create({
      data: {
        name: "[async] T3 耗尽",
        type: "async_agent",
        status: "failed",
        sessionId: `${RR_SID}-t3`,
        input: {
          kind: RR_KIND,
          sessionId: `${RR_SID}-t3`,
          task: "等待 30ms",
          taskLabel: "T3 耗尽",
          agentSnapshot: { id: "t", model: "m", systemPrompt: "", tools: ["native:wait"] },
          sourceType: "async_task_tool",
          toolCall: { tool: "wait", args: { ms: 30 } },
          deliverToQueue: false,
        },
        output: { error: "服务重启，任务中断" },
      },
    });

    const retried = await retryAsyncJob(exhausted.id, ctx.config, ctx.services);
    await vi.waitFor(
      async () => {
        const r = await prisma.task.findUnique({ where: { id: retried.jobId } });
        expect(r?.status).toBe("success");
      },
      { timeout: 5000, interval: 50 },
    );
  });

  it(
    "T4 恢复风暴：50 个僵尸全部标 failed，不入池、零并发",
    async () => {
      const loopSpy = vi.spyOn(agentRuntime, "runAgentLoop").mockResolvedValue(RR_MOCK_LOOP);
      const ctx = await createContextInner();
      const narrow = createTestConfig(ctx.config.projectRoot, {
        ...ctx.config,
        asyncJobs: { ...ctx.config.asyncJobs, maxConcurrent: 3, maxPerSession: 100, maxQueued: 100 },
      });
      getAsyncJobOrchestrator(narrow);

      const COUNT = 50;
      const ids: string[] = [];
      for (let i = 0; i < COUNT; i++) {
        const t = await prisma.task.create({
          data: {
            name: `[async] T4-${i}`,
            type: "async_agent",
            status: "running",
            sessionId: `${RR_SID}-t4-${i}`,
            startedAt: new Date(),
            input: {
              kind: RR_KIND,
              sessionId: `${RR_SID}-t4-${i}`,
              task: `T4-${i}`,
              taskLabel: `T4-${i}`,
              agentSnapshot: { id: "t", model: "m", systemPrompt: "", tools: ["native:wait"] },
              sourceType: "async_task_tool",
              toolCall: { tool: "wait", args: { ms: 30 } },
              deliverToQueue: false,
            },
          },
        });
        ids.push(t.id);
      }

      const r = await recoverStaleAsyncJobs(narrow, ctx.services);
      expect(r.failed).toBe(COUNT);

      const rows = await prisma.task.findMany({ where: { id: { in: ids } }, select: { status: true } });
      expect(rows).toHaveLength(COUNT);
      expect(rows.every((x) => x.status === "failed")).toBe(true);
      expect(loopSpy).not.toHaveBeenCalled();
    },
    60_000,
  );
});
