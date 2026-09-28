/**
 * W5 晨间简报聚合：Inbox 未消化 + 今日看板未完成 + 进行中 Goal 计数。
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../db.js";
import { buildMorningBrief } from "../infra/morningBrief.js";

const RUN = `w5mb-${Date.now().toString(36)}`;

function dayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

describe("W5 晨间简报聚合", () => {
  const inboxIds: string[] = [];
  const flowIds: string[] = [];
  const sessionIds: string[] = [];

  beforeEach(() => {
    // 每测独立 RUN 后缀避免撞唯一
  });

  afterEach(async () => {
    if (inboxIds.length) await prisma.inboxItem.deleteMany({ where: { id: { in: inboxIds.splice(0) } } }).catch(() => {});
    if (flowIds.length) await prisma.dailyFlowItem.deleteMany({ where: { id: { in: flowIds.splice(0) } } }).catch(() => {});
    if (sessionIds.length) await prisma.chatSession.deleteMany({ where: { id: { in: sessionIds.splice(0) } } }).catch(() => {});
  });

  it("聚合 Inbox fetched + 今日 todo/doing + 进行中 Goal", async () => {
    const dk = dayKey();
    // Inbox：2 条 fetched
    for (let i = 0; i < 2; i++) {
      const it = await prisma.inboxItem.create({
        data: {
          source: "url",
          externalId: `${RUN}-inbox-${i}`,
          title: `${RUN} 收藏 ${i}`,
          url: `https://example.com/${RUN}-${i}`,
          excerpt: "x",
          content: "正文",
          status: "fetched",
          tags: "prd",
        },
      });
      inboxIds.push(it.id);
    }
    // 1 条 distilled（不计入 fetched）
    const distilled = await prisma.inboxItem.create({
      data: {
        source: "url",
        externalId: `${RUN}-distilled`,
        title: `${RUN} 已蒸馏`,
        url: "https://example.com/d",
        excerpt: "x",
        content: "正文",
        status: "distilled",
        tags: "prd",
      },
    });
    inboxIds.push(distilled.id);

    // 今日看板：1 todo + 1 doing + 1 done
    for (const [status, idx] of [["todo", 0], ["doing", 1], ["done", 2]] as const) {
      const f = await prisma.dailyFlowItem.create({
        data: { dayKey: dk, title: `${RUN} 看板 ${status}`, status, sortOrder: idx },
      });
      flowIds.push(f.id);
    }

    // 1 个 active Goal 会话 + 1 个 done Goal 会话（不计入）
    const activeGoal = await prisma.chatSession.create({
      data: {
        title: `${RUN} goal-active`,
        model: "deepseek-v4-flash",
        goalState: {
          mode: "goal",
          text: `${RUN} 过夜目标`,
          status: "active",
          turnsUsed: 0,
          maxTurns: 10,
          judgeModel: "auto",
          verifiedProgress: [
            { id: "v1", claim: "已核实步骤一", evidenceRefs: ["e1"], auditedAt: "2026-08-29T00:00:00.000Z", auditor: "system" },
          ],
        },
      },
    });
    sessionIds.push(activeGoal.id);
    const doneGoal = await prisma.chatSession.create({
      data: {
        title: `${RUN} goal-done`,
        model: "deepseek-v4-flash",
        goalState: { mode: "goal", text: "已完", status: "done", turnsUsed: 0, maxTurns: 10, judgeModel: "auto" },
      },
    });
    sessionIds.push(doneGoal.id);

    const brief = await buildMorningBrief(prisma, dk);

    // Inbox：fetched 计数 ≥2，items 含两条 fetched（不含 distilled）
    expect(brief.inbox.fetched).toBeGreaterThanOrEqual(2);
    expect(brief.inbox.items.some((i) => i.title.includes(`${RUN} 收藏 0`))).toBe(true);
    expect(brief.inbox.items.some((i) => i.title.includes(`${RUN} 已蒸馏`))).toBe(false);

    // Daily：todo=1 doing=1，titles 含 todo/doing 不含 done
    expect(brief.daily.todo).toBe(1);
    expect(brief.daily.doing).toBe(1);
    expect(brief.daily.titles.some((t) => t.includes("看板 todo"))).toBe(true);
    expect(brief.daily.titles.some((t) => t.includes("看板 doing"))).toBe(true);
    expect(brief.daily.titles.some((t) => t.includes("看板 done"))).toBe(false);

    // Goal：含 active，不含 done；verifiedCount=1
    expect(brief.goals.some((g) => g.sessionId === activeGoal.id && g.status === "active" && g.verifiedCount === 1)).toBe(true);
    expect(brief.goals.some((g) => g.sessionId === doneGoal.id)).toBe(false);
  });
});
