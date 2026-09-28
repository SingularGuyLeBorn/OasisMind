/**
 * 金表工具名防漂。优先本应放 mock-llm-core（场景解析在那边），
 * 但 shared 默认清单不含 run_shell，完整注册表只有 listNativeTools()。
 * [OM-FREEPLAY] 故放 server；resolveScenario 仍从 mock-llm-core 引用。
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { listScenarioSummaries, resolveScenario } from "@oasismind/mock-llm-core";
import { CHILD_OWN_TOOLS, DEFAULT_AGENT_NATIVE } from "@oasismind/shared";
import { listNativeTools } from "../infra/nativeTools.js";

type GoldenCase = {
  id: string;
  userMessage: string;
  expectToolsAnyOf?: string[];
  forbidTools?: string[];
};

function goldenDir(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "../../../../evals/golden");
}

function loadGoldens(): GoldenCase[] {
  const dir = goldenDir();
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as GoldenCase);
}

function registeredToolNames(): Set<string> {
  const names = new Set<string>(listNativeTools().map((t) => t.name));
  for (const n of CHILD_OWN_TOOLS) names.add(n);
  for (const n of DEFAULT_AGENT_NATIVE) names.add(n);
  return names;
}

describe("evals golden 与 mock-llm 场景防漂", () => {
  const goldens = loadGoldens();
  const catchAllNames = new Set(
    listScenarioSummaries()
      .filter((s) => s.catchAll)
      .map((s) => s.name),
  );

  it("G01–G12 金表文件都在", () => {
    const ids = goldens.map((g) => g.id);
    expect(ids).toEqual(["G01", "G02", "G03", "G04", "G05", "G06", "G07", "G08", "G09", "G10", "G11", "G12"]);
  });

  it("expectToolsAnyOf / forbidTools 都是已注册 native 或 agent 工具名", () => {
    const registered = registeredToolNames();
    const unknown: string[] = [];
    for (const g of goldens) {
      for (const name of [...(g.expectToolsAnyOf ?? []), ...(g.forbidTools ?? [])]) {
        if (!registered.has(name)) unknown.push(`${g.id}:${name}`);
      }
    }
    expect(unknown, `未知工具名 ${unknown.join(", ")}`).toEqual([]);
  });

  it("不强制 MOCK_LLM_SCENARIO 时 resolveScenario 不抛", () => {
    const catchAllIds: string[] = [];
    for (const g of goldens) {
      const resolved = resolveScenario({ messages: [{ role: "user", content: g.userMessage }] });
      expect(resolved.name.length).toBeGreaterThan(0);
      if (catchAllNames.has(resolved.name)) catchAllIds.push(g.id);
      const expectAny = g.expectToolsAnyOf ?? [];
      if (expectAny.length > 0) {
        expect(
          catchAllNames.has(resolved.name),
          `${g.id} 有 expectToolsAnyOf 却落到 catchAll=${resolved.name}，mock 不可能命中工具约束`,
        ).toBe(false);
      }
    }
    expect(catchAllIds.sort()).toEqual(["G06", "G08", "G09", "G10"]);
  });
});
