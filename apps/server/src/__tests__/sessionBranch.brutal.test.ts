/**
 * 同会话对话分支（switchBranch）产品闭环。
 * 不是 session.fork。摘要走 MOCK_LLM 场景 branch_summary，禁止 spy llmClient。
 *
 * 锁：从这里另写 → 兄弟枝、session.tree、listForChat 只含活跃路径、
 * 真正换叶才 PUSH、摘要失败仍换叶、preview 截断。
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  enterInProcessMockLlm,
  MOCK_BRANCH_SUMMARY_BODY,
  MOCK_BRANCH_SUMMARY_FAIL_TOKEN,
} from "@oasismind/mock-llm-core";
import { prisma } from "../db.js";
import { createContextInner } from "../trpc/context.js";
import { appRouter } from "../router.js";
import { BRANCH_SUMMARY_KIND, BRANCH_SUMMARY_MARKER, appendChatMessage } from "../infra/chatTree.js";
import * as uiStateNotify from "../infra/uiStateNotify.js";
import {
  allocateCuid,
  persistAbortedAssistant,
  persistAssistantSuccess,
  persistUserMessage,
} from "../infra/agentStream/persist.js";
import { resolveAsyncDeliveryAnchor } from "../infra/asyncJobs/delivery.js";
import { SessionStreamHub, setStreamHub } from "../infra/sessionStreamHub.js";
import type { PrepareResult } from "../infra/agentStream/prepareMessage.js";

const RUN = `br${Date.now().toString(36)}`;

async function cleanup(sessionIds: string[]) {
  await prisma.chatMessage.deleteMany({ where: { sessionId: { in: sessionIds } } }).catch(() => {});
  await prisma.chatSession.deleteMany({ where: { id: { in: sessionIds } } }).catch(() => {});
}

function nonSummaryKids(
  children: Record<string, string[]>,
  parentId: string,
  nodes: Array<{ id: string; kind: string | null }>,
): string[] {
  const kinds = new Map(nodes.map((n) => [n.id, n.kind]));
  return (children[parentId] ?? []).filter((id) => kinds.get(id) !== BRANCH_SUMMARY_KIND);
}

describe("同会话对话分支产品闭环（MOCK_LLM）", () => {
  const sessionIds: string[] = [];
  let restoreMock: () => void;

  beforeEach(() => {
    restoreMock = enterInProcessMockLlm();
  });

  afterEach(async () => {
    restoreMock?.();
    await cleanup(sessionIds.splice(0));
    vi.restoreAllMocks();
  });

  it("从用户消息另写：换叶到 U1 再发消息，U1 下出现兄弟枝；摘要来自 mock-llm", async () => {
    const notifySpy = vi.spyOn(uiStateNotify, "notifySessionTreeUpdated");

    const ctx = await createContextInner();
    const caller = appRouter.createCaller(ctx);
    const session = await ctx.services.session.create({
      title: `br-fork-user-${RUN}`,
      model: "deepseek-v4-flash",
    } as any);
    const sid = (session.data as { id: string }).id;
    sessionIds.push(sid);

    const u1 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "U1 原问" });
    const a1 = await ctx.services.message.create({
      sessionId: sid,
      role: "assistant",
      content: "A1 原答",
    });
    expect(a1.data?.parentId).toBe(u1.data!.id);

    const sw = await caller.session.switchBranch({ sessionId: sid, messageId: u1.data!.id });
    expect(sw.switched).toBe(true);
    expect(sw.summaryGenerated).toBe(true);
    expect(sw.activeLeafId).toBe(u1.data!.id);
    expect(notifySpy).toHaveBeenCalledWith(sid, u1.data!.id);

    const summaries = await prisma.chatMessage.findMany({
      where: { sessionId: sid, kind: BRANCH_SUMMARY_KIND },
    });
    expect(summaries).toHaveLength(1);
    expect(summaries[0]!.content).toContain(BRANCH_SUMMARY_MARKER);
    expect(summaries[0]!.content).toContain(MOCK_BRANCH_SUMMARY_BODY);
    expect(summaries[0]!.parentId).toBe(u1.data!.id);
    expect(summaries[0]!.role).toBe("system");
    const leafAfterSummary = await prisma.chatSession.findUnique({
      where: { id: sid },
      select: { activeLeafId: true },
    });
    expect(leafAfterSummary?.activeLeafId).toBe(u1.data!.id);

    const u2 = await ctx.services.message.create({
      sessionId: sid,
      role: "user",
      content: "U2 另写问法",
    });
    expect(u2.data?.parentId).toBe(u1.data!.id);

    expect(await prisma.chatSession.count({ where: { id: sid } })).toBe(1);
    expect(await prisma.chatSession.count({ where: { title: `br-fork-user-${RUN}` } })).toBe(1);

    const tree = await caller.session.tree({ sessionId: sid });
    expect(tree.sessionId).toBe(sid);
    expect(tree.activeLeafId).toBe(u2.data!.id);
    expect(nonSummaryKids(tree.children, u1.data!.id, tree.nodes).sort()).toEqual(
      [a1.data!.id, u2.data!.id].sort(),
    );

    const chat = await caller.message.listForChat({ sessionId: sid, limit: 50 });
    const chatContents = chat.items.map((m: { content: string }) => m.content);
    expect(chatContents).toContain("U1 原问");
    expect(chatContents).toContain("U2 另写问法");
    expect(chatContents).not.toContain("A1 原答");
    expect(chat.items.some((m: { kind?: string | null }) => m.kind === BRANCH_SUMMARY_KIND)).toBe(
      true,
    );

    const llm = await ctx.services.message.listForLlmContext({ sessionId: sid });
    const llmContents = llm.map((m) => m.content);
    expect(llmContents).toContain("U1 原问");
    expect(llmContents).toContain("U2 另写问法");
    expect(llmContents).not.toContain("A1 原答");
    expect(llmContents.some((c) => c.includes(BRANCH_SUMMARY_MARKER))).toBe(false);
    expect(llmContents.some((c) => c.includes(MOCK_BRANCH_SUMMARY_BODY))).toBe(false);

    const inspect = await caller.session.inspectTurn({ sessionId: sid });
    expect(inspect.activeLeafId).toBe(u2.data!.id);
    expect(inspect.lastUserPreview).toContain("U2");
    expect(inspect.pathMessageCount).toBeGreaterThanOrEqual(2);

    const all = await caller.message.listForChat({ sessionId: sid, limit: 50, tree: true });
    const allContents = all.items.map((m: { content: string }) => m.content);
    expect(allContents).toContain("A1 原答");
    expect(allContents).toContain("U2 另写问法");
  });

  it("从助手消息另写：换叶到 A1 再发追问，A1 下出现兄弟用户枝", async () => {
    const ctx = await createContextInner();
    const caller = appRouter.createCaller(ctx);
    const session = await ctx.services.session.create({
      title: `br-fork-asst-${RUN}`,
      model: "deepseek-v4-flash",
    } as any);
    const sid = (session.data as { id: string }).id;
    sessionIds.push(sid);

    await ctx.services.message.create({ sessionId: sid, role: "user", content: "U1" });
    const a1 = await ctx.services.message.create({ sessionId: sid, role: "assistant", content: "A1" });
    const u2 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "U2 追问" });
    await ctx.services.message.create({ sessionId: sid, role: "assistant", content: "A2" });

    const sw = await caller.session.switchBranch({ sessionId: sid, messageId: a1.data!.id });
    expect(sw.switched).toBe(true);
    expect(sw.summaryGenerated).toBe(true);

    const u3 = await ctx.services.message.create({
      sessionId: sid,
      role: "user",
      content: "U3 另写追问",
    });
    expect(u3.data?.parentId).toBe(a1.data!.id);

    const tree = await caller.session.tree({ sessionId: sid });
    expect(nonSummaryKids(tree.children, a1.data!.id, tree.nodes).sort()).toEqual(
      [u2.data!.id, u3.data!.id].sort(),
    );

    const chat = await caller.message.listForChat({ sessionId: sid, limit: 50 });
    const contents = chat.items.map((m: { content: string }) => m.content);
    expect(contents).toContain("A1");
    expect(contents).toContain("U3 另写追问");
    expect(contents).not.toContain("U2 追问");
    expect(contents).not.toContain("A2");
  });

  it("嵌套分叉：两处 parent 各有 ≥2 非摘要子", async () => {
    const ctx = await createContextInner();
    const caller = appRouter.createCaller(ctx);
    const session = await ctx.services.session.create({
      title: `br-nested-${RUN}`,
      model: "deepseek-v4-flash",
    } as any);
    const sid = (session.data as { id: string }).id;
    sessionIds.push(sid);

    const u1 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "U1" });
    const a1 = await ctx.services.message.create({ sessionId: sid, role: "assistant", content: "A1" });
    await caller.session.switchBranch({ sessionId: sid, messageId: u1.data!.id });
    await ctx.services.message.create({ sessionId: sid, role: "user", content: "U2" });
    await caller.session.switchBranch({ sessionId: sid, messageId: a1.data!.id });
    const u3 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "U3" });
    await ctx.services.message.create({ sessionId: sid, role: "assistant", content: "A3" });
    await caller.session.switchBranch({ sessionId: sid, messageId: a1.data!.id });
    const u4 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "U4" });
    expect(u4.data?.parentId).toBe(a1.data!.id);

    const tree = await caller.session.tree({ sessionId: sid });
    const forkParents = Object.keys(tree.children).filter(
      (pid) => nonSummaryKids(tree.children, pid, tree.nodes).length >= 2,
    );
    expect(forkParents.sort()).toEqual([a1.data!.id, u1.data!.id].sort());
    expect(nonSummaryKids(tree.children, a1.data!.id, tree.nodes).sort()).toEqual(
      [u3.data!.id, u4.data!.id].sort(),
    );
  });

  it("同一父节点三叉：非摘要子为 3，仍是同一会话", async () => {
    const ctx = await createContextInner();
    const caller = appRouter.createCaller(ctx);
    const session = await ctx.services.session.create({
      title: `br-triple-${RUN}`,
      model: "deepseek-v4-flash",
    } as any);
    const sid = (session.data as { id: string }).id;
    sessionIds.push(sid);

    const u1 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "U1" });
    const a1 = await ctx.services.message.create({ sessionId: sid, role: "assistant", content: "A1" });
    await caller.session.switchBranch({ sessionId: sid, messageId: u1.data!.id });
    const u2 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "U2" });
    await caller.session.switchBranch({ sessionId: sid, messageId: a1.data!.id });
    await caller.session.switchBranch({ sessionId: sid, messageId: u1.data!.id });
    const u3 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "U3" });

    expect(await prisma.chatSession.count({ where: { title: `br-triple-${RUN}` } })).toBe(1);
    const tree = await caller.session.tree({ sessionId: sid });
    expect(nonSummaryKids(tree.children, u1.data!.id, tree.nodes).sort()).toEqual(
      [a1.data!.id, u2.data!.id, u3.data!.id].sort(),
    );
    expect(tree.activeLeafId).toBe(u3.data!.id);
  });

  it("session.tree：邻接表、activeLeaf、preview 截到 120；线性链没有 ≥2 非摘要子", async () => {
    const ctx = await createContextInner();
    const caller = appRouter.createCaller(ctx);
    const session = await ctx.services.session.create({
      title: `br-tree-shape-${RUN}`,
      model: "deepseek-v4-flash",
    } as any);
    const sid = (session.data as { id: string }).id;
    sessionIds.push(sid);

    const long = "预".repeat(200);
    const u1 = await ctx.services.message.create({ sessionId: sid, role: "user", content: long });
    const a1 = await ctx.services.message.create({
      sessionId: sid,
      role: "assistant",
      content: "线性答",
    });

    const tree = await caller.session.tree({ sessionId: sid });
    expect(tree.activeLeafId).toBe(a1.data!.id);
    expect(tree.children[""]).toEqual([u1.data!.id]);
    expect(tree.children[u1.data!.id]).toEqual([a1.data!.id]);
    const uNode = tree.nodes.find((n) => n.id === u1.data!.id);
    expect(uNode?.contentPreview).toBe(long.slice(0, 120));
    expect(uNode?.contentPreview).toHaveLength(120);

    const forkParents = Object.keys(tree.children).filter(
      (pid) => nonSummaryKids(tree.children, pid, tree.nodes).length >= 2,
    );
    expect(forkParents).toEqual([]);
  });

  it("真正换叶才 PUSH；幂等换叶不推；mock-llm 摘要失败仍换叶并推", async () => {
    const notifySpy = vi.spyOn(uiStateNotify, "notifySessionTreeUpdated");

    const ctx = await createContextInner();
    const caller = appRouter.createCaller(ctx);
    const session = await ctx.services.session.create({
      title: `br-push-${RUN}`,
      model: "deepseek-v4-flash",
    } as any);
    const sid = (session.data as { id: string }).id;
    sessionIds.push(sid);

    const u1 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "Q" });
    const a1 = await ctx.services.message.create({ sessionId: sid, role: "assistant", content: "A1" });
    await prisma.chatSession.update({ where: { id: sid }, data: { activeLeafId: u1.data!.id } });
    const a2 = await ctx.services.message.create({
      sessionId: sid,
      role: "assistant",
      content: `A2 ${MOCK_BRANCH_SUMMARY_FAIL_TOKEN}`,
    });

    notifySpy.mockClear();
    const sw = await caller.session.switchBranch({ sessionId: sid, messageId: a1.data!.id });
    expect(sw.switched).toBe(true);
    expect(sw.summaryGenerated).toBe(false);
    expect(notifySpy).toHaveBeenCalledTimes(1);
    expect(notifySpy).toHaveBeenCalledWith(sid, a1.data!.id);

    const leaf = await prisma.chatSession.findUnique({
      where: { id: sid },
      select: { activeLeafId: true },
    });
    expect(leaf?.activeLeafId).toBe(a1.data!.id);
    const summaries = await prisma.chatMessage.count({
      where: { sessionId: sid, kind: BRANCH_SUMMARY_KIND },
    });
    expect(summaries).toBe(0);

    notifySpy.mockClear();
    const noop = await caller.session.switchBranch({ sessionId: sid, messageId: a1.data!.id });
    expect(noop.switched).toBe(false);
    expect(notifySpy).not.toHaveBeenCalled();

    const all = await caller.message.listForChat({ sessionId: sid, limit: 50, tree: true });
    expect(all.items.some((m: { id: string }) => m.id === a2.data!.id)).toBe(true);
  });

  it("会话不存在 / 空放弃路径：不生成摘要；摘要只挂当前活跃路径", async () => {
    const ctx = await createContextInner();
    const caller = appRouter.createCaller(ctx);
    const ghost = await ctx.services.session.create({
      title: `br-ghost-${RUN}`,
      model: "deepseek-v4-flash",
    } as any);
    const gid = (ghost.data as { id: string }).id;
    sessionIds.push(gid);
    const live = await ctx.services.session.create({
      title: `br-live-${RUN}`,
      model: "deepseek-v4-flash",
    } as any);
    const sid = (live.data as { id: string }).id;
    sessionIds.push(sid);
    const u1 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "Q" });
    await prisma.chatSession.delete({ where: { id: gid } });

    await expect(
      caller.session.switchBranch({ sessionId: gid, messageId: u1.data!.id }),
    ).rejects.toThrow(/会话不存在/);

    const noopEmpty = await caller.session.switchBranch({
      sessionId: sid,
      messageId: u1.data!.id,
    });
    expect(noopEmpty.switched).toBe(false);
    expect(noopEmpty.summaryGenerated).toBe(false);

    const a1 = await ctx.services.message.create({
      sessionId: sid,
      role: "assistant",
      content: "A-main",
    });
    await prisma.chatSession.update({ where: { id: sid }, data: { activeLeafId: u1.data!.id } });
    await ctx.services.message.create({
      sessionId: sid,
      role: "assistant",
      content: "A-fork",
    });
    await caller.session.switchBranch({ sessionId: sid, messageId: a1.data!.id });

    const path = await caller.message.listForChat({ sessionId: sid, limit: 50 });
    const kinds = path.items.map((m: { kind?: string | null; content: string }) => m.kind);
    expect(kinds).toContain(BRANCH_SUMMARY_KIND);
    expect(path.items.some((m: { content: string }) => m.content.includes("A-fork"))).toBe(false);
    expect(path.items.some((m: { content: string }) => m.content.includes("A-main"))).toBe(true);
  });

  it("switchBranch notify:false：叶已切但不 PUSH", async () => {
    const notifySpy = vi.spyOn(uiStateNotify, "notifySessionTreeUpdated");
    const ctx = await createContextInner();
    const session = await ctx.services.session.create({
      title: `br-silent-${RUN}`,
      model: "deepseek-v4-flash",
    } as any);
    const sid = (session.data as { id: string }).id;
    sessionIds.push(sid);
    const u1 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "U1" });
    const a1 = await ctx.services.message.create({
      sessionId: sid,
      role: "assistant",
      content: "A1",
    });
    await prisma.chatSession.update({ where: { id: sid }, data: { activeLeafId: u1.data!.id } });
    await ctx.services.message.create({
      sessionId: sid,
      role: "assistant",
      content: "A2",
    });
    notifySpy.mockClear();
    const { switchBranch } = await import("../infra/chatTree.js");
    const sw = await switchBranch(prisma, ctx.config, {
      sessionId: sid,
      messageId: a1.data!.id,
      notify: false,
    });
    expect(sw.switched).toBe(true);
    expect(notifySpy).not.toHaveBeenCalled();
    const leaf = await prisma.chatSession.findUnique({
      where: { id: sid },
      select: { activeLeafId: true },
    });
    expect(leaf?.activeLeafId).toBe(a1.data!.id);
  });

  it("并发换叶：最后写入赢，仍是同一会话", async () => {
    const ctx = await createContextInner();
    const caller = appRouter.createCaller(ctx);
    const session = await ctx.services.session.create({
      title: `br-race-${RUN}`,
      model: "deepseek-v4-flash",
    } as any);
    const sid = (session.data as { id: string }).id;
    sessionIds.push(sid);
    const u1 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "U-race" });
    const a1 = await ctx.services.message.create({
      sessionId: sid,
      role: "assistant",
      content: "A-left",
    });
    await prisma.chatSession.update({ where: { id: sid }, data: { activeLeafId: u1.data!.id } });
    const a2 = await ctx.services.message.create({
      sessionId: sid,
      role: "assistant",
      content: "A-right",
    });

    const [left, right] = await Promise.all([
      caller.session.switchBranch({ sessionId: sid, messageId: a1.data!.id }),
      caller.session.switchBranch({ sessionId: sid, messageId: a2.data!.id }),
    ]);
    expect(left.activeLeafId === a1.data!.id || left.activeLeafId === a2.data!.id).toBe(true);
    expect(right.activeLeafId === a1.data!.id || right.activeLeafId === a2.data!.id).toBe(true);

    const leaf = await prisma.chatSession.findUnique({
      where: { id: sid },
      select: { activeLeafId: true },
    });
    expect([a1.data!.id, a2.data!.id]).toContain(leaf?.activeLeafId);
    expect(await prisma.chatSession.count({ where: { id: sid } })).toBe(1);
  });

  it("API 换到用户节点：叶就是该用户，不自动进到后面的助手", async () => {
    const ctx = await createContextInner();
    const caller = appRouter.createCaller(ctx);
    const session = await ctx.services.session.create({
      title: `br-user-leaf-${RUN}`,
      model: "deepseek-v4-flash",
    } as any);
    const sid = (session.data as { id: string }).id;
    sessionIds.push(sid);

    const u1 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "U-mid" });
    const a1 = await ctx.services.message.create({
      sessionId: sid,
      role: "assistant",
      content: "A-keep",
    });
    const u2 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "U-fork" });
    const a2 = await ctx.services.message.create({
      sessionId: sid,
      role: "assistant",
      content: "A-child",
    });

    const sw = await caller.session.switchBranch({ sessionId: sid, messageId: u2.data!.id });
    expect(sw.switched).toBe(true);
    expect(sw.activeLeafId).toBe(u2.data!.id);

    const path = await caller.message.listForChat({ sessionId: sid, limit: 50 });
    expect(path.items.some((m: { content: string }) => m.content.includes("A-keep"))).toBe(true);
    expect(path.items.some((m: { content: string }) => m.content.includes("A-child"))).toBe(false);
    expect(path.items.some((m: { content: string }) => m.content.includes("U-fork"))).toBe(true);

    const treeAll = await caller.message.listForChat({ sessionId: sid, limit: 50, tree: true });
    expect(treeAll.items.some((m: { content: string }) => m.content.includes("A-child"))).toBe(true);
    expect(a1.data!.id).toBeTruthy();
  });

  it("压缩边界挂在当前叶：切回旁路仍在，压缩卡不跟过去", async () => {
    const ctx = await createContextInner();
    const caller = appRouter.createCaller(ctx);
    const session = await ctx.services.session.create({
      title: `br-compact-${RUN}`,
      model: "deepseek-v4-flash",
    } as any);
    const sid = (session.data as { id: string }).id;
    sessionIds.push(sid);

    const u1 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "U1" });
    const a1 = await ctx.services.message.create({
      sessionId: sid,
      role: "assistant",
      content: "A-greet",
    });
    await caller.session.switchBranch({ sessionId: sid, messageId: u1.data!.id });
    const u2 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "U2" });
    const a2 = await ctx.services.message.create({
      sessionId: sid,
      role: "assistant",
      content: "A-search",
    });
    expect(a2.data?.id).toBeTruthy();
    await appendChatMessage(prisma, {
      sessionId: sid,
      role: "assistant",
      content: "[om-compact-boundary:v1]",
      kind: "compact",
      source: "system",
    });

    await caller.session.switchBranch({ sessionId: sid, messageId: a1.data!.id });
    const path = await caller.message.listForChat({ sessionId: sid, limit: 50 });
    expect(path.items.some((m: { content: string }) => m.content.includes("A-greet"))).toBe(true);
    expect(path.items.some((m: { content: string }) => m.content.includes("A-search"))).toBe(false);
    expect(path.items.some((m: { content: string; kind?: string | null }) => m.kind === "compact")).toBe(
      false,
    );

    const all = await caller.message.listForChat({ sessionId: sid, limit: 50, tree: true });
    expect(all.items.some((m: { content: string }) => m.content.includes("A-search"))).toBe(true);
    expect(all.items.some((m: { kind?: string | null }) => m.kind === "compact")).toBe(true);
  });

  it("switchBranch 不新建会话；session.fork 才复制出另一条", async () => {
    const ctx = await createContextInner();
    const caller = appRouter.createCaller(ctx);
    const session = await ctx.services.session.create({
      title: `br-not-copy-${RUN}`,
      model: "deepseek-v4-flash",
    } as any);
    const sid = (session.data as { id: string }).id;
    sessionIds.push(sid);

    const u1 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "U1" });
    const a1 = await ctx.services.message.create({
      sessionId: sid,
      role: "assistant",
      content: "A1",
    });
    await prisma.chatSession.update({ where: { id: sid }, data: { activeLeafId: u1.data!.id } });
    await ctx.services.message.create({
      sessionId: sid,
      role: "assistant",
      content: "A2",
    });
    await caller.session.switchBranch({ sessionId: sid, messageId: a1.data!.id });
    expect(await prisma.chatSession.count({ where: { title: `br-not-copy-${RUN}` } })).toBe(1);

    const forked = await caller.session.fork({
      sourceSessionId: sid,
      title: `br-copied-${RUN}`,
      includeMessages: 50,
    });
    sessionIds.push(forked.id);
    expect(forked.id).not.toBe(sid);
    expect(forked.sourceSessionId).toBe(sid);
    expect(await prisma.chatSession.count({ where: { id: { in: [sid, forked.id] } } })).toBe(2);

    const srcTree = await caller.session.tree({ sessionId: sid });
    expect(srcTree.activeLeafId).toBe(a1.data!.id);
    const copied = await caller.message.listForChat({ sessionId: forked.id, limit: 50, tree: true });
    expect(copied.items.some((m: { content: string }) => m.content.includes("A1"))).toBe(true);
    expect(copied.items.some((m: { content: string }) => m.content.includes("A2"))).toBe(true);
  });

  it("persistUserMessage 把本轮 user 钉到 prepared.anchorUserMessageId", async () => {
    const ctx = await createContextInner();
    const session = await ctx.services.session.create({
      title: `br-anchor-${RUN}`,
      model: "deepseek-v4-flash",
    } as any);
    const sid = (session.data as { id: string }).id;
    sessionIds.push(sid);

    const prepared: PrepareResult = { messageText: "U-anchor-new", skipUserCreate: false };
    await persistUserMessage({
      services: ctx.services,
      config: ctx.config,
      sessionId: sid,
      input: { message: "U-anchor-new", sessionId: sid },
      prepared,
      agentId: sid,
      effectiveModel: "deepseek-v4-flash",
      emit: (() => {}) as never,
    });
    const created = await prisma.chatMessage.findFirst({
      where: { sessionId: sid, content: "U-anchor-new" },
    });
    expect(created?.id).toBeTruthy();
    expect(prepared.anchorUserMessageId).toBe(created!.id);
  });

  it("skipUserCreate 时 anchor 钉当前叶（重试）", async () => {
    const ctx = await createContextInner();
    const session = await ctx.services.session.create({
      title: `br-anchor-skip-${RUN}`,
      model: "deepseek-v4-flash",
    } as any);
    const sid = (session.data as { id: string }).id;
    sessionIds.push(sid);
    const u1 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "U-retry" });
    const prepared: PrepareResult = { messageText: "U-retry", skipUserCreate: true };
    await persistUserMessage({
      services: ctx.services,
      config: ctx.config,
      sessionId: sid,
      input: { message: "U-retry", sessionId: sid },
      prepared,
      agentId: sid,
      effectiveModel: "deepseek-v4-flash",
      emit: (() => {}) as never,
    });
    expect(prepared.anchorUserMessageId).toBe(u1.data!.id);
  });

  it("助手落库钉本轮 user：activeLeaf 切走后仍挂对该 user", async () => {
    const ctx = await createContextInner();
    const session = await ctx.services.session.create({
      title: `br-pin-parent-${RUN}`,
      model: "deepseek-v4-flash",
    } as any);
    const sid = (session.data as { id: string }).id;
    sessionIds.push(sid);

    const u1 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "U1" });
    await ctx.services.message.create({ sessionId: sid, role: "assistant", content: "A1" });
    const u2 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "U2-slow" });
    const a1 = await prisma.chatMessage.findFirst({
      where: { sessionId: sid, content: "A1" },
    });
    expect(u2.data?.id).toBeTruthy();
    expect(a1?.id).toBeTruthy();
    await prisma.chatSession.update({
      where: { id: sid },
      data: { activeLeafId: a1!.id },
    });

    const prepared: PrepareResult = {
      messageText: "U2-slow",
      skipUserCreate: true,
      anchorUserMessageId: u2.data!.id,
    };
    await persistAssistantSuccess({
      services: ctx.services,
      sessionId: sid,
      prepared,
      pendingAssistantId: allocateCuid(),
      historyItems: [],
      result: { content: "A2-pinned", toolCalls: [], model: "deepseek-v4-flash" },
      effectiveModel: "deepseek-v4-flash",
    });
    const a2 = await prisma.chatMessage.findFirst({
      where: { sessionId: sid, content: "A2-pinned" },
    });
    expect(a2?.parentId).toBe(u2.data!.id);
    expect(a2?.parentId).not.toBe(a1!.id);
    expect(u1.data?.id).toBeTruthy();
  });

  it("中断助手也钉本轮 user，不跟事后的叶", async () => {
    const ctx = await createContextInner();
    const session = await ctx.services.session.create({
      title: `br-abort-pin-${RUN}`,
      model: "deepseek-v4-flash",
    } as any);
    const sid = (session.data as { id: string }).id;
    sessionIds.push(sid);
    const u1 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "U1" });
    await ctx.services.message.create({ sessionId: sid, role: "assistant", content: "A1" });
    const u2 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "U2-stop" });
    const a1 = await prisma.chatMessage.findFirst({
      where: { sessionId: sid, content: "A1" },
    });
    await prisma.chatSession.update({
      where: { id: sid },
      data: { activeLeafId: a1!.id },
    });

    await persistAbortedAssistant({
      services: ctx.services,
      sessionId: sid,
      prepared: {
        messageText: "U2-stop",
        skipUserCreate: true,
        anchorUserMessageId: u2.data!.id,
      },
      pendingAssistantId: allocateCuid(),
      partialContent: "半截停在慢流枝",
      partialToolCalls: [],
    });
    const aborted = await prisma.chatMessage.findFirst({
      where: { sessionId: sid, content: "半截停在慢流枝" },
    });
    expect(aborted?.parentId).toBe(u2.data!.id);
    expect(aborted?.finishReason).toBe("aborted");
    expect(u1.data?.id).toBeTruthy();
  });

  it("正在回复时 tRPC 拒绝换叶；内核 switchBranch 仍可换（Goal 同栈）", async () => {
    const ctx = await createContextInner();
    const session = await ctx.services.session.create({
      title: `br-busy-switch-${RUN}`,
      model: "deepseek-v4-flash",
    } as any);
    const sid = (session.data as { id: string }).id;
    sessionIds.push(sid);
    const u1 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "U1" });
    const a1 = await ctx.services.message.create({
      sessionId: sid,
      role: "assistant",
      content: "A1",
    });

    const hub = new SessionStreamHub({
      ringSize: 8,
      persist: false,
      eventTtlMs: 1000,
      cleanupIntervalMs: 0,
    });
    setStreamHub(hub);
    try {
      vi.spyOn(hub, "isRunning").mockImplementation((id) => id === sid);
      const caller = appRouter.createCaller(await createContextInner());
      await expect(
        caller.session.switchBranch({ sessionId: sid, messageId: u1.data!.id }),
      ).rejects.toThrow(/正在回复/);

      const { switchBranch } = await import("../infra/chatTree.js");
      const sw = await switchBranch(ctx.prisma, ctx.config, {
        sessionId: sid,
        messageId: u1.data!.id,
        notify: false,
      });
      expect(sw.switched).toBe(true);
      expect(sw.activeLeafId).toBe(u1.data!.id);
      expect(a1.data?.id).toBeTruthy();
    } finally {
      vi.restoreAllMocks();
      await hub.dispose();
      setStreamHub(null);
    }
  });

  it("别的会话占线不挡本会话换叶", async () => {
    const ctx = await createContextInner();
    const session = await ctx.services.session.create({
      title: `br-peer-busy-${RUN}`,
      model: "deepseek-v4-flash",
    } as any);
    const sid = (session.data as { id: string }).id;
    sessionIds.push(sid);
    const peer = await ctx.services.session.create({
      title: `br-peer-busy-other-${RUN}`,
      model: "deepseek-v4-flash",
    } as any);
    const oid = (peer.data as { id: string }).id;
    sessionIds.push(oid);

    const u1 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "U1" });
    const a1 = await ctx.services.message.create({
      sessionId: sid,
      role: "assistant",
      content: "A1",
    });
    await prisma.chatSession.update({ where: { id: sid }, data: { activeLeafId: u1.data!.id } });
    await ctx.services.message.create({
      sessionId: sid,
      role: "assistant",
      content: "A2",
    });

    const hub = new SessionStreamHub({
      ringSize: 8,
      persist: false,
      eventTtlMs: 1000,
      cleanupIntervalMs: 0,
    });
    setStreamHub(hub);
    try {
      vi.spyOn(hub, "isRunning").mockImplementation((id) => id === oid);
      const liveCaller = appRouter.createCaller(await createContextInner());
      const sw = await liveCaller.session.switchBranch({ sessionId: sid, messageId: a1.data!.id });
      expect(sw.switched).toBe(true);
      expect(sw.activeLeafId).toBe(a1.data!.id);
    } finally {
      vi.restoreAllMocks();
      await hub.dispose();
      setStreamHub(null);
    }
  });

  it("旁路 persist 钉 parentMessageId 且不偷叶", async () => {
    const ctx = await createContextInner();
    const session = await ctx.services.session.create({
      title: `br-offpath-persist-${RUN}`,
      model: "deepseek-v4-flash",
    } as any);
    const sid = (session.data as { id: string }).id;
    sessionIds.push(sid);
    const u1 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "U1" });
    const a1 = await ctx.services.message.create({
      sessionId: sid,
      role: "assistant",
      content: "A1-spawn",
    });
    await prisma.chatSession.update({ where: { id: sid }, data: { activeLeafId: u1.data!.id } });
    const u2 = await ctx.services.message.create({ sessionId: sid, role: "user", content: "U2-search" });
    const a2 = await ctx.services.message.create({
      sessionId: sid,
      role: "assistant",
      content: "A2-search",
    });
    expect(a2.data?.parentId).toBe(u2.data!.id);

    const prepared: PrepareResult = { messageText: "子结果投递", skipUserCreate: false };
    await persistUserMessage({
      services: ctx.services,
      config: ctx.config,
      sessionId: sid,
      input: {
        message: "子结果投递",
        sessionId: sid,
        parentMessageId: a1.data!.id,
        advanceLeaf: false,
      },
      prepared,
      agentId: sid,
      effectiveModel: "deepseek-v4-flash",
      emit: (() => {}) as never,
    });
    const injected = await prisma.chatMessage.findFirst({
      where: { sessionId: sid, content: "子结果投递" },
    });
    expect(injected?.parentId).toBe(a1.data!.id);
    expect(prepared.anchorUserMessageId).toBe(injected!.id);
    const leafAfterUser = await prisma.chatSession.findUnique({
      where: { id: sid },
      select: { activeLeafId: true },
    });
    expect(leafAfterUser?.activeLeafId).toBe(a2.data!.id);

    await persistAssistantSuccess({
      services: ctx.services,
      sessionId: sid,
      prepared,
      pendingAssistantId: allocateCuid(),
      historyItems: [],
      result: { content: "根据子 Agent 回报", toolCalls: [], model: "deepseek-v4-flash" },
      effectiveModel: "deepseek-v4-flash",
    });
    const follow = await prisma.chatMessage.findFirst({
      where: { sessionId: sid, content: "根据子 Agent 回报" },
    });
    expect(follow?.parentId).toBe(injected!.id);
    const leafAfterAsst = await prisma.chatSession.findUnique({
      where: { id: sid },
      select: { activeLeafId: true },
    });
    expect(leafAfterAsst?.activeLeafId).toBe(a2.data!.id);
  });

  it("resolveAsyncDeliveryAnchor：切走后钉 spawn 助手且不推进叶", async () => {
    const ctx = await createContextInner();
    const session = await ctx.services.session.create({
      title: `br-anchor-job-${RUN}`,
      model: "deepseek-v4-flash",
    } as any);
    const sid = (session.data as { id: string }).id;
    sessionIds.push(sid);
    const jobId = allocateCuid();
    const spawnUser = await ctx.services.message.create({ sessionId: sid, role: "user", content: "派子" });
    const spawnAsst = await ctx.services.message.create({
      sessionId: sid,
      role: "assistant",
      content: "已派",
      toolCalls: [{ id: "tc1", name: "spawn_subagent", args: {}, result: { jobId } }],
    });
    await prisma.chatSession.update({
      where: { id: sid },
      data: { activeLeafId: spawnUser.data!.id },
    });
    await ctx.services.message.create({ sessionId: sid, role: "user", content: "搜索枝" });
    const searchAsst = await ctx.services.message.create({
      sessionId: sid,
      role: "assistant",
      content: "搜索答",
    });
    await prisma.chatSession.update({
      where: { id: sid },
      data: { activeLeafId: searchAsst.data!.id },
    });

    const onSpawn = await resolveAsyncDeliveryAnchor(sid, jobId);
    expect(onSpawn.parentMessageId).toBe(spawnAsst.data!.id);
    expect(onSpawn.advanceLeaf).toBe(false);

    await prisma.chatSession.update({
      where: { id: sid },
      data: { activeLeafId: spawnAsst.data!.id },
    });
    const stillThere = await resolveAsyncDeliveryAnchor(sid, jobId);
    expect(stillThere.parentMessageId).toBeUndefined();
    expect(stillThere.advanceLeaf).toBeUndefined();
  });

  it("重命名非主会话：session_list_changed 走 notifySessionListChanged", async () => {
    const notifySpy = vi.spyOn(uiStateNotify, "notifySessionListChanged");
    const ctx = await createContextInner();
    const session = await ctx.services.session.create({
      title: `br-rename-${RUN}`,
      model: "deepseek-v4-flash",
    } as any);
    const sid = (session.data as { id: string }).id;
    sessionIds.push(sid);
    notifySpy.mockClear();

    const updated = await ctx.services.session.update({ id: sid, autoName: "分支改名测" });
    expect(updated.success).toBe(true);
    expect(notifySpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ sessionId: sid, reason: "update" }),
    );
  });
});
