import { describe, it, expect, beforeEach } from "vitest";
import {
  classifyIntent,
  applyRevisionToGoalText,
  buildSupersededCompactHint,
  assertSummaryOmitsSuperseded,
  applyIntentFromUserText,
} from "../infra/intentContract.js";
import { __resetGoalLoopHookForTests, __setGoalStateStoreForTests } from "../infra/goalLoop.js";
import { createTestConfig } from "./helpers/toolTestFixtures.js";
import type { SessionGoalState } from "@oasismind/shared";
import { enterInProcessMockLlm, MOCK_BRANCH_SUMMARY_BODY, getInProcessMockHits, resetInProcessMockHits } from "@oasismind/mock-llm-core";
import { prisma } from "../db.js";
import { createContextInner } from "../trpc/context.js";
import { BRANCH_SUMMARY_KIND } from "../infra/chatTree.js";

describe("IntentContract", () => {
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

  it("setGoal 后 arguments 为空：首次 revision 仍把旧 goal 正文钉进 tombstone", async () => {
    mem.set("s1", {
      ...mem.get("s1")!,
      status: "paused",
      intent: {
        function: "写一篇关于猫的文章",
        arguments: {},
        kind: "reveal",
        superseded: [],
      },
    });
    const next = await applyIntentFromUserText({
      sessionId: "s1",
      userText: "改成狗，不要猫",
      config: createTestConfig("/tmp/intent"),
      services: {} as never,
    });
    expect(next?.intent?.superseded?.[0]?.oldArguments).toEqual({ goal: "写一篇关于猫的文章" });
    expect(next?.status).toBe("active");
    expect(next?.intent?.arguments).not.toHaveProperty("goal");
    const hint = buildSupersededCompactHint(next);
    expect(hint).toContain("tombstone");
    expect(hint).toContain("猫");
  });

  it("无 prisma / 无锚点时不换叶", async () => {
    await applyIntentFromUserText({
      sessionId: "s1",
      userText: "改成狗，不要猫",
      config: createTestConfig("/tmp/intent"),
      services: {} as never,
    });
  });

  it("revision 真走 switchBranch + MOCK_LLM 摘要，compactHint 进系统提示", async () => {
    const restore = enterInProcessMockLlm();
    resetInProcessMockHits();
    const sessionIds: string[] = [];
    try {
      const ctx = await createContextInner();
      const session = await ctx.services.session.create({
        title: `intent-rev-${Date.now().toString(36)}`,
        model: "deepseek-v4-flash",
      } as never);
      const sid = (session.data as { id: string }).id;
      sessionIds.push(sid);
      const u1 = await ctx.services.message.create({
        sessionId: sid,
        role: "user",
        content: "U1 原问",
      });
      await ctx.services.message.create({
        sessionId: sid,
        role: "assistant",
        content: "A1 原答",
      });
      mem.set(sid, {
        mode: "goal",
        text: "写一篇关于猫的文章",
        status: "active",
        turnsUsed: 1,
        maxTurns: 20,
        judgeModel: "auto",
        pendingContinue: { reason: "继续写猫" },
        verifiedProgress: [],
        anchorLeafId: u1.data!.id,
        intent: {
          function: "写一篇关于猫的文章",
          arguments: { topic: "猫" },
          kind: "reveal",
          superseded: [
            {
              at: new Date().toISOString(),
              oldArguments: { audience: "专家" },
              reason: "改受众",
            },
          ],
        },
      });

      const next = await applyIntentFromUserText({
        sessionId: sid,
        userText: "改成狗，不要猫",
        config: ctx.config,
        services: ctx.services,
      });
      expect(next?.text).toContain("狗");
      expect(next?.text).not.toContain("猫");
      const leaf = await prisma.chatSession.findUnique({
        where: { id: sid },
        select: { activeLeafId: true },
      });
      expect(leaf?.activeLeafId).toBe(u1.data!.id);

      const summaries = await prisma.chatMessage.findMany({
        where: { sessionId: sid, kind: BRANCH_SUMMARY_KIND },
      });
      expect(summaries).toHaveLength(1);
      expect(summaries[0]!.content).toContain(MOCK_BRANCH_SUMMARY_BODY);

      const hit = getInProcessMockHits().find((h) => h.scenario === "branch_summary");
      expect(hit).toBeTruthy();
      expect(hit!.lastSystemText).toContain("tombstone");
      expect(hit!.lastSystemText).toContain("专家");
      expect(hit!.lastUserText).toContain("请摘要以下被切换离开的对话分支");
    } finally {
      restore();
      await prisma.chatMessage.deleteMany({ where: { sessionId: { in: sessionIds } } }).catch(() => {});
      await prisma.chatSession.deleteMany({ where: { id: { in: sessionIds } } }).catch(() => {});
    }
  });

  it("首次 revision（arguments 空、未预种 superseded）：离开锚点后再改目标，摘要系统提示含 tombstone+旧 goal", async () => {
    const restore = enterInProcessMockLlm();
    resetInProcessMockHits();
    const sessionIds: string[] = [];
    try {
      const ctx = await createContextInner();
      const session = await ctx.services.session.create({
        title: `intent-first-rev-${Date.now().toString(36)}`,
        model: "deepseek-v4-flash",
      } as never);
      const sid = (session.data as { id: string }).id;
      sessionIds.push(sid);
      await ctx.services.message.create({
        sessionId: sid,
        role: "user",
        content: "U1 问候",
      });
      const a1 = await ctx.services.message.create({
        sessionId: sid,
        role: "assistant",
        content: "A1 问候答",
      });
      await ctx.services.message.create({
        sessionId: sid,
        role: "user",
        content: "U2 追问",
      });
      await ctx.services.message.create({
        sessionId: sid,
        role: "assistant",
        content: "A2 追问答",
      });
      mem.set(sid, {
        mode: "goal",
        text: "写一篇关于猫的文章",
        status: "active",
        turnsUsed: 1,
        maxTurns: 20,
        judgeModel: "auto",
        pendingContinue: { reason: "继续写猫" },
        verifiedProgress: [],
        anchorLeafId: a1.data!.id,
        intent: {
          function: "写一篇关于猫的文章",
          arguments: {},
          kind: "reveal",
          superseded: [],
        },
      });

      const next = await applyIntentFromUserText({
        sessionId: sid,
        userText: "改成狗，不要猫",
        config: ctx.config,
        services: ctx.services,
      });
      expect(next?.text).toContain("狗");
      expect(next?.text).not.toContain("猫");
      expect(next?.intent?.superseded?.[0]?.oldArguments).toEqual({ goal: "写一篇关于猫的文章" });
      const leaf = await prisma.chatSession.findUnique({
        where: { id: sid },
        select: { activeLeafId: true },
      });
      expect(leaf?.activeLeafId).toBe(a1.data!.id);

      const summaries = await prisma.chatMessage.findMany({
        where: { sessionId: sid, kind: BRANCH_SUMMARY_KIND },
      });
      expect(summaries).toHaveLength(1);
      expect(summaries[0]!.content).toContain(MOCK_BRANCH_SUMMARY_BODY);

      const hit = getInProcessMockHits().find((h) => h.scenario === "branch_summary");
      expect(hit).toBeTruthy();
      expect(hit!.lastSystemText).toContain("tombstone");
      expect(hit!.lastSystemText).toContain("写一篇关于猫的文章");
      expect(hit!.transcriptText).toContain("U2 追问");

      const revUser = await ctx.services.message.create({
        sessionId: sid,
        role: "user",
        content: "改成狗，不要猫",
      });
      expect(revUser.data?.parentId).toBe(a1.data!.id);
      const path = await ctx.services.message.listForChat({ sessionId: sid, limit: 50 });
      const texts = path.items.map((m: { content: string }) => m.content);
      expect(texts.some((c) => c.includes("A1 问候答"))).toBe(true);
      expect(texts.some((c) => c.includes("U2 追问"))).toBe(false);
      expect(texts.some((c) => c.includes("改成狗，不要猫"))).toBe(true);
    } finally {
      restore();
      await prisma.chatMessage.deleteMany({ where: { sessionId: { in: sessionIds } } }).catch(() => {});
      await prisma.chatSession.deleteMany({ where: { id: { in: sessionIds } } }).catch(() => {});
    }
  });

  it("switch 真走 switchBranch + MOCK_LLM 摘要，tombstone 进系统提示", async () => {
    const restore = enterInProcessMockLlm();
    resetInProcessMockHits();
    const sessionIds: string[] = [];
    try {
      const ctx = await createContextInner();
      const session = await ctx.services.session.create({
        title: `intent-sw-${Date.now().toString(36)}`,
        model: "deepseek-v4-flash",
      } as never);
      const sid = (session.data as { id: string }).id;
      sessionIds.push(sid);
      await ctx.services.message.create({
        sessionId: sid,
        role: "user",
        content: "U1 问候",
      });
      const a1 = await ctx.services.message.create({
        sessionId: sid,
        role: "assistant",
        content: "A1 问候答",
      });
      await ctx.services.message.create({
        sessionId: sid,
        role: "user",
        content: "U2 追问",
      });
      await ctx.services.message.create({
        sessionId: sid,
        role: "assistant",
        content: "A2 追问答",
      });
      mem.set(sid, {
        mode: "goal",
        text: "写一篇关于猫的文章",
        status: "active",
        turnsUsed: 1,
        maxTurns: 20,
        judgeModel: "auto",
        pendingContinue: { reason: "继续写猫" },
        verifiedProgress: [],
        anchorLeafId: a1.data!.id,
        intent: {
          function: "写一篇关于猫的文章",
          arguments: {},
          kind: "reveal",
          superseded: [],
        },
      });

      const next = await applyIntentFromUserText({
        sessionId: sid,
        userText: "另外做一个周报",
        config: ctx.config,
        services: ctx.services,
      });
      expect(next?.text).toMatch(/周报/);
      expect(next?.intent?.kind).toBe("switch");
      const leaf = await prisma.chatSession.findUnique({
        where: { id: sid },
        select: { activeLeafId: true },
      });
      expect(leaf?.activeLeafId).toBe(a1.data!.id);
      const summaries = await prisma.chatMessage.findMany({
        where: { sessionId: sid, kind: BRANCH_SUMMARY_KIND },
      });
      expect(summaries).toHaveLength(1);
      expect(summaries[0]!.content).toContain(MOCK_BRANCH_SUMMARY_BODY);
      const hit = getInProcessMockHits().find((h) => h.scenario === "branch_summary");
      expect(hit).toBeTruthy();
      expect(hit!.lastSystemText).toContain("tombstone");
      expect(hit!.lastSystemText).toContain("写一篇关于猫的文章");
    } finally {
      restore();
      await prisma.chatMessage.deleteMany({ where: { sessionId: { in: sessionIds } } }).catch(() => {});
      await prisma.chatSession.deleteMany({ where: { id: { in: sessionIds } } }).catch(() => {});
    }
  });
});
