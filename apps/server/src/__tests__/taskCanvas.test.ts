/**
 * 任务画布（TencentDB 符号化短期记忆思想落地）：
 * 1. 空态：无进行中任务 / 无 sessionId → 空串不注入
 * 2. 渲染：本会话 running + 子会话 queued → 状态/短 id/时长/子会话标记
 * 3. 血缘隔离：其他会话的任务不进画布
 * 4. 终态（success/failed）不进画布
 * 5. 钩子集成：runContextHooks 后 systemPrompt 含画布块
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createContextInner } from "../trpc/context.js";
import { buildTaskCanvasHint } from "../infra/taskCanvas.js";
import { runContextHooks, __resetContextHooksForTests } from "../infra/contextHooks.js";
import type { ContextHookInput } from "../infra/contextHooks.js";
import type { NativeToolContext } from "../infra/tools/native/types.js";
import type { ServiceContainer } from "../infra/serviceContainer.js";
import type { PrismaClient } from "@prisma/client";

describe("taskCanvas 任务画布", () => {
  const stamp = Date.now().toString(36);
  const sid = `tc-main-${stamp}`;
  const childSid = `tc-child-${stamp}`;
  const otherSid = `tc-other-${stamp}`;
  let prisma: PrismaClient;
  let services: ServiceContainer;

  beforeEach(async () => {
    const ctx = await createContextInner();
    prisma = ctx.prisma;
    services = ctx.services as ServiceContainer;
    await prisma.chatSession.createMany({
      data: [
        { id: sid, title: "主会话", kind: "chat" },
        { id: childSid, title: "子会话", kind: "subagent", parentSessionId: sid },
        { id: otherSid, title: "其他会话", kind: "chat" },
      ],
    });
  });

  afterEach(async () => {
    await prisma.task.deleteMany({ where: { sessionId: { in: [sid, childSid, otherSid] } } });
    await prisma.chatSession.deleteMany({ where: { id: { in: [sid, childSid, otherSid] } } });
    __resetContextHooksForTests();
  });

  async function seedTask(over: {
    id: string;
    sessionId: string;
    status: string;
    name?: string;
    queuedAt?: Date;
    startedAt?: Date;
  }) {
    await prisma.task.create({
      data: {
        id: over.id,
        name: over.name ?? `任务-${over.id}`,
        type: "async_agent",
        status: over.status,
        sessionId: over.sessionId,
        queuedAt: over.queuedAt,
        startedAt: over.startedAt,
      },
    });
  }

  it("空态：无任务 / 无 sessionId → 空串", async () => {
    expect(await buildTaskCanvasHint(prisma, { sessionId: sid })).toBe("");
    expect(await buildTaskCanvasHint(prisma, { sessionId: null })).toBe("");
    expect(await buildTaskCanvasHint(prisma, {})).toBe("");
  });

  it("渲染：本会话 running + 子会话 queued，含状态/短id/时长/子会话标记", async () => {
    await seedTask({
      id: `tc-t1-${stamp}`,
      sessionId: sid,
      status: "running",
      name: "整理知乎收藏夹",
      startedAt: new Date(Date.now() - 75_000),
    });
    await seedTask({
      id: `tc-t2-${stamp}`,
      sessionId: childSid,
      status: "queued",
      name: "抓取网页正文",
      queuedAt: new Date(Date.now() - 30_000),
    });

    const hint = await buildTaskCanvasHint(prisma, { sessionId: sid });
    expect(hint).toContain("后台任务画布");
    expect(hint).toContain("[running] 整理知乎收藏夹");
    expect(hint).toContain(`(${`tc-t1-${stamp}`.slice(0, 8)})`);
    expect(hint).toContain("已跑 1m15s");
    expect(hint).toContain("[queued] 抓取网页正文");
    expect(hint).toContain("子会话");
    expect(hint).toContain("排队 30s");
    expect(hint).toContain("无需轮询");
  });

  it("血缘隔离：其他会话的任务不进画布", async () => {
    await seedTask({ id: `tc-t3-${stamp}`, sessionId: otherSid, status: "running" });
    expect(await buildTaskCanvasHint(prisma, { sessionId: sid })).toBe("");
  });

  it("终态任务不进画布", async () => {
    await seedTask({ id: `tc-t4-${stamp}`, sessionId: sid, status: "success" });
    await seedTask({ id: `tc-t5-${stamp}`, sessionId: sid, status: "failed" });
    expect(await buildTaskCanvasHint(prisma, { sessionId: sid })).toBe("");
  });

  it("钩子集成：runContextHooks 后 systemPrompt 含画布块", async () => {
    await seedTask({
      id: `tc-t6-${stamp}`,
      sessionId: sid,
      status: "running",
      name: "钩子集成任务",
      startedAt: new Date(),
    });

    // agent 只需钩子实际读取的字段（id/name/tier/tools），其余按精简 mock 断言
    const input = {
      agent: { id: "agent-tc", name: "测试", tier: "sub", tools: [] },
      sessionId: sid,
      runId: "run-tc",
      round: 1,
      messages: [
        { role: "system" as const, content: "你是 OasisMind 助手。" },
        { role: "user" as const, content: "进度如何" },
      ],
      systemPrompt: "你是 OasisMind 助手。",
      ctx: { services } as unknown as NativeToolContext,
      scratch: {},
    } as unknown as ContextHookInput;

    const out = await runContextHooks(input);
    expect(out.systemPrompt).toContain("后台任务画布");
    expect(out.systemPrompt).toContain("钩子集成任务");
  });
});
