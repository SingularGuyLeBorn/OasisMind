/**
 * 每日看板 — 三栏流动 / 日报告 / 统计
 */
import { afterEach, describe, expect, it } from "vitest";
import { prisma } from "../db.js";
import {
  buildDailyFlowStats,
  createDailyFlowItem,
  dailyFlowDayReport,
  deleteDailyFlowItem,
  formatDailyFlowReport,
  listDailyFlowByDay,
  moveDailyFlowItem,
  updateDailyFlowItem,
} from "../infra/dailyFlow.js";

const DAY = "2099-01-15";

afterEach(async () => {
  await prisma.dailyFlowItem.deleteMany({ where: { dayKey: DAY } });
});

describe("dailyFlow", () => {
  it("buildDailyFlowStats / formatDailyFlowReport", () => {
    const items = [
      { title: "A", note: "", status: "todo" },
      { title: "B", note: "详", status: "doing" },
      { title: "C", note: "", status: "done" },
      { title: "D", note: "", status: "done" },
    ];
    expect(buildDailyFlowStats(items)).toEqual({
      total: 4,
      todo: 1,
      doing: 1,
      done: 2,
      completionRate: 50,
    });
    const text = formatDailyFlowReport(DAY, items);
    expect(text).toContain(`# 每日看板 · ${DAY}`);
    expect(text).toContain("完成率 50%");
    expect(text).toContain("- B — 详");
  });

  it("create → move → update → delete 闭环", async () => {
    const created = await createDailyFlowItem(prisma, {
      dayKey: DAY,
      title: "写日报",
      note: "",
    });
    expect(created.status).toBe("todo");

    const doing = await moveDailyFlowItem(prisma, { id: created.id, status: "doing" });
    expect(doing.status).toBe("doing");

    const noted = await updateDailyFlowItem(prisma, {
      id: created.id,
      note: "先列三点",
    });
    expect(noted.note).toBe("先列三点");

    await moveDailyFlowItem(prisma, { id: created.id, status: "done" });
    const listed = await listDailyFlowByDay(prisma, DAY);
    expect(listed.stats.done).toBe(1);
    expect(listed.stats.completionRate).toBe(100);

    const report = await dailyFlowDayReport(prisma, DAY);
    expect(report.text).toContain("写日报");
    expect(report.text).toContain("先列三点");

    await deleteDailyFlowItem(prisma, created.id);
    const empty = await listDailyFlowByDay(prisma, DAY);
    expect(empty.items).toHaveLength(0);
  });
});
