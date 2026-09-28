import { describe, expect, it } from "vitest";
import { CHAT_COVERAGE } from "./chatCoverage.js";
import {
  listMatchingScenarios,
  listScenarioSummaries,
  mockChatCompletion,
  nonCatchAllOverlaps,
  resolveScenario,
} from "./scenarioDefs.js";

describe("Chat 功能 × 场景金表", () => {
  it("每条夹具赢家稳定，非 catchAll 不得重叠", () => {
    const catchAll = new Set(listScenarioSummaries().filter((s) => s.catchAll).map((s) => s.name));
    for (const row of CHAT_COVERAGE) {
      const winner = resolveScenario(row.opts).name;
      expect(winner, row.feature).toBe(row.winner);
      const overlaps = nonCatchAllOverlaps(listMatchingScenarios(row.opts)).map((m) => m.name);
      if (row.opts.scenario) {
        const all = listMatchingScenarios(row.opts);
        expect(all[0]?.name, `${row.feature} forced 先匹配先赢`).toBe(row.winner);
        continue;
      }
      if (catchAll.has(row.winner)) {
        expect(overlaps, `${row.feature} catchAll 赢家旁不得再有具体场景`).toEqual([]);
      } else {
        expect(overlaps, `${row.feature} 非 catchAll 重叠`).toEqual([row.winner]);
      }
    }
  });

  it("你好 + 工具结果走 tool_followup，正文不是问候", async () => {
    const opts = CHAT_COVERAGE.find((r) => r.feature === "工具后问候粘性")!.opts;
    const r = await mockChatCompletion(opts);
    expect(r.content).toContain("已根据工具结果继续处理");
    expect(r.content).not.toContain("你好！我是 Mock LLM");
  });
});
