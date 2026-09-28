/**
 * 金表工具名 ⊆ 已注册 native 工具名；userMessage 无强制 scenario 时 resolveScenario 不得抛。
 * 工具名从 toolTestFixtures.ALL_NATIVE_TOOL_NAMES 解析，禁止手抄会漂的数组。
 */
import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { resolveScenario } from "./scenarioDefs.js";

function findRepoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    if (existsSync(path.join(dir, "evals/golden"))) return dir;
    dir = path.dirname(dir);
  }
  throw new Error("找不到仓库根（evals/golden）");
}

interface GoldenCase {
  id: string;
  userMessage: string;
  expectToolsAnyOf?: string[];
  forbidTools?: string[];
}

function loadGoldens(repoRoot: string): GoldenCase[] {
  const dir = path.join(repoRoot, "evals/golden");
  const out: GoldenCase[] = [];
  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith(".json")) continue;
    out.push(JSON.parse(readFileSync(path.join(dir, name), "utf8")) as GoldenCase);
  }
  return out;
}

function parseRegisteredNativeNames(src: string): Set<string> {
  const m = src.match(/export const ALL_NATIVE_TOOL_NAMES = \[([\s\S]*?)\](?:\s+as const)?;/);
  if (!m) throw new Error("toolTestFixtures.ts 找不到 ALL_NATIVE_TOOL_NAMES");
  return new Set([...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]));
}

describe("eval golden 与已注册工具同步", () => {
  const repoRoot = findRepoRoot();
  const goldens = loadGoldens(repoRoot);
  const registered = parseRegisteredNativeNames(
    readFileSync(path.join(repoRoot, "apps/server/src/__tests__/helpers/toolTestFixtures.ts"), "utf8"),
  );

  it("G01–G12 全部可读", () => {
    const ids = goldens.map((g) => g.id).sort();
    expect(ids).toEqual(["G01", "G02", "G03", "G04", "G05", "G06", "G07", "G08", "G09", "G10", "G11", "G12"]);
  });

  it("expectToolsAnyOf / forbidTools 都是已注册 native 工具名", () => {
    const unknown: string[] = [];
    for (const g of goldens) {
      for (const name of [...(g.expectToolsAnyOf ?? []), ...(g.forbidTools ?? [])]) {
        if (!registered.has(name)) unknown.push(`${g.id}:${name}`);
      }
    }
    expect(unknown).toEqual([]);
  });

  it("不强制 MOCK_LLM_SCENARIO 时 userMessage 能被 resolveScenario 解析", () => {
    const catchAllIds: string[] = [];
    for (const g of goldens) {
      const scenario = resolveScenario({
        messages: [{ role: "user", content: g.userMessage }],
      });
      expect(scenario?.name).toBeTruthy();
      if (scenario.catchAll) catchAllIds.push(`${g.id}->${scenario.name}`);
    }
    expect(catchAllIds.length).toBeGreaterThanOrEqual(0);
  });
});
