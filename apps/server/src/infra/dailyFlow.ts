/**
 * 每日看板（学 TriFlow：按日 · 三栏流动 · 日报告）
 * 权威在 SQLite；写后推 daily_flow_updated（推拉结合）。
 */
import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type {
  CreateDailyFlowItemInput,
  DailyFlowStatus,
  MoveDailyFlowItemInput,
  UpdateDailyFlowItemInput,
} from "@knowpilot/shared";
import { notifyDailyFlowUpdated } from "./uiStateNotify.js";

const STATUSES: DailyFlowStatus[] = ["todo", "doing", "done"];

function assertStatus(status: string): asserts status is DailyFlowStatus {
  if (!STATUSES.includes(status as DailyFlowStatus)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `status 须为 todo|doing|done，收到：${status}`,
    });
  }
}

export function buildDailyFlowStats(items: Array<{ status: string }>) {
  const todo = items.filter((i) => i.status === "todo").length;
  const doing = items.filter((i) => i.status === "doing").length;
  const done = items.filter((i) => i.status === "done").length;
  const total = items.length;
  const completionRate = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, todo, doing, done, completionRate };
}

export function formatDailyFlowReport(
  dayKey: string,
  items: Array<{ title: string; note: string; status: string }>,
): string {
  const stats = buildDailyFlowStats(items);
  const by = (s: DailyFlowStatus) => items.filter((i) => i.status === s);
  const lines = (label: string, list: typeof items) => {
    if (list.length === 0) return [`### ${label}`, "（无）", ""];
    return [
      `### ${label}`,
      ...list.map((i) => `- ${i.title}${i.note.trim() ? ` — ${i.note.trim()}` : ""}`),
      "",
    ];
  };
  return [
    `# 每日看板 · ${dayKey}`,
    "",
    `合计 ${stats.total} · 待办 ${stats.todo} · 进行中 ${stats.doing} · 已完成 ${stats.done} · 完成率 ${stats.completionRate}%`,
    "",
    ...lines("待办", by("todo")),
    ...lines("进行中", by("doing")),
    ...lines("已完成", by("done")),
  ].join("\n");
}

async function nextSortOrder(
  prisma: PrismaClient,
  dayKey: string,
  status: DailyFlowStatus,
): Promise<number> {
  const max = await prisma.dailyFlowItem.aggregate({
    where: { dayKey, status },
    _max: { sortOrder: true },
  });
  return (max._max.sortOrder ?? -1) + 1;
}

export async function listDailyFlowByDay(prisma: PrismaClient, dayKey: string) {
  const items = await prisma.dailyFlowItem.findMany({
    where: { dayKey },
    orderBy: [{ status: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return { dayKey, items, stats: buildDailyFlowStats(items) };
}

export async function createDailyFlowItem(
  prisma: PrismaClient,
  input: CreateDailyFlowItemInput,
) {
  const sortOrder = await nextSortOrder(prisma, input.dayKey, "todo");
  const item = await prisma.dailyFlowItem.create({
    data: {
      dayKey: input.dayKey,
      title: input.title.trim(),
      note: input.note ?? "",
      status: "todo",
      sortOrder,
    },
  });
  await notifyDailyFlowUpdated(prisma, input.dayKey);
  return item;
}

export async function updateDailyFlowItem(
  prisma: PrismaClient,
  input: UpdateDailyFlowItemInput,
) {
  const existing = await prisma.dailyFlowItem.findUnique({ where: { id: input.id } });
  if (!existing) {
    throw new TRPCError({ code: "NOT_FOUND", message: `看板条目不存在：${input.id}` });
  }
  const item = await prisma.dailyFlowItem.update({
    where: { id: input.id },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.note !== undefined ? { note: input.note } : {}),
    },
  });
  await notifyDailyFlowUpdated(prisma, item.dayKey);
  return item;
}

export async function moveDailyFlowItem(
  prisma: PrismaClient,
  input: MoveDailyFlowItemInput,
) {
  assertStatus(input.status);
  const existing = await prisma.dailyFlowItem.findUnique({ where: { id: input.id } });
  if (!existing) {
    throw new TRPCError({ code: "NOT_FOUND", message: `看板条目不存在：${input.id}` });
  }
  if (existing.status === input.status) return existing;
  const sortOrder = await nextSortOrder(prisma, existing.dayKey, input.status);
  const item = await prisma.dailyFlowItem.update({
    where: { id: input.id },
    data: { status: input.status, sortOrder },
  });
  await notifyDailyFlowUpdated(prisma, item.dayKey);
  return item;
}

export async function deleteDailyFlowItem(prisma: PrismaClient, id: string) {
  const existing = await prisma.dailyFlowItem.findUnique({ where: { id } });
  if (!existing) {
    throw new TRPCError({ code: "NOT_FOUND", message: `看板条目不存在：${id}` });
  }
  await prisma.dailyFlowItem.delete({ where: { id } });
  await notifyDailyFlowUpdated(prisma, existing.dayKey);
  return { id, dayKey: existing.dayKey };
}

export async function dailyFlowDayReport(prisma: PrismaClient, dayKey: string) {
  const { items, stats } = await listDailyFlowByDay(prisma, dayKey);
  return {
    dayKey,
    stats,
    text: formatDailyFlowReport(dayKey, items),
  };
}
