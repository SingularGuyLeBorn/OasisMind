/**
 * 晨间简报聚合（W5）——把 Inbox 未消化 + 今日看板未完成 + 进行中 Goal 合成一张卡。
 * 不新造调度器；只聚合现有权威源（DB）。tRPC briefing.morning 薄包装。
 */

import type { PrismaClient } from "@prisma/client";
import { parseGoalState } from "./goalLoop.js";

export interface MorningBriefInboxItem {
  id: string;
  title: string;
  source: string;
  url: string | null;
}

export interface MorningBriefGoal {
  sessionId: string;
  sessionTitle: string;
  status: string;
  text: string;
  verifiedCount: number;
}

export interface MorningBrief {
  dayKey: string;
  inbox: { fetched: number; items: MorningBriefInboxItem[] };
  daily: { todo: number; doing: number; titles: string[] };
  goals: MorningBriefGoal[];
}

/** 聚合今日晨间简报：Inbox fetched top 8 + 当天 todo/doing + 进行中 Goal top 12。 */
export async function buildMorningBrief(
  prisma: PrismaClient,
  dayKey: string,
): Promise<MorningBrief> {
  const [fetchedCount, inboxItems, dailyItems, goalSessions] = await Promise.all([
    prisma.inboxItem.count({ where: { status: "fetched" } }),
    prisma.inboxItem.findMany({
      where: { status: "fetched" },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, title: true, source: true, url: true },
    }),
    prisma.dailyFlowItem.findMany({
      where: { dayKey, status: { in: ["todo", "doing"] } },
      select: { title: true, status: true },
    }),
    prisma.chatSession.findMany({
      where: { status: { notIn: ["deleted", "archived"] } },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: { id: true, title: true, autoName: true, goalState: true },
    }),
  ]);

  const todoCount = dailyItems.filter((d) => d.status === "todo").length;
  const doingCount = dailyItems.filter((d) => d.status === "doing").length;
  const titles = dailyItems.map((d) => d.title);

  const goals: MorningBriefGoal[] = [];
  for (const s of goalSessions) {
    if (!s.goalState) continue;
    const goal = parseGoalState(s.goalState);
    if (!goal) continue;
    if (goal.status !== "active" && goal.status !== "paused") continue;
    goals.push({
      sessionId: s.id,
      sessionTitle: s.autoName?.trim() || s.title || s.id,
      status: goal.status,
      text: goal.text,
      verifiedCount: goal.verifiedProgress?.length ?? 0,
    });
    if (goals.length >= 12) break;
  }

  return {
    dayKey,
    inbox: {
      fetched: fetchedCount,
      items: inboxItems.map((i) => ({
        id: i.id,
        title: i.title,
        source: i.source,
        url: i.url ?? null,
      })),
    },
    daily: { todo: todoCount, doing: doingCount, titles },
    goals,
  };
}
