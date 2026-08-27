/**
 * scenarios.md ↔ scenario-test-map.json 防漂移：
 * 文档新增场景必须登记覆盖；covered/partial 引用的文件必须存在。
 */
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function findRepoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    if (existsSync(path.join(dir, "docs/development/scenarios.md"))) return dir;
    dir = path.dirname(dir);
  }
  throw new Error("找不到仓库根（docs/development/scenarios.md）");
}

const repoRoot = findRepoRoot();
const scenariosPath = path.join(repoRoot, "docs/development/scenarios.md");
const mapPath = path.join(repoRoot, "docs/development/scenario-test-map.json");

type Coverage = "covered" | "partial" | "gap";

interface ScenarioMapEntry {
  id: string;
  title: string;
  coverage: Coverage;
  tests: string[];
  note?: string;
}

interface ScenarioMapFile {
  version: number;
  scenarios: ScenarioMapEntry[];
}

function parseScenarioHeadings(markdown: string): Array<{ id: string; title: string }> {
  const out: Array<{ id: string; title: string }> = [];
  const re = /^## 场景 ([0-9]+|[A-E])：(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown))) {
    out.push({ id: m[1], title: m[2].trim() });
  }
  return out;
}

describe("scenario-test-map 与 scenarios.md 对齐", () => {
  it("每个场景标题都已登记，且 covered/partial 的测试文件存在", () => {
    const markdown = readFileSync(scenariosPath, "utf8");
    const map = JSON.parse(readFileSync(mapPath, "utf8")) as ScenarioMapFile;
    const headings = parseScenarioHeadings(markdown);

    expect(headings.length).toBeGreaterThan(0);
    expect(map.scenarios.map((s) => `${s.id}:${s.title}`)).toEqual(
      headings.map((h) => `${h.id}:${h.title}`),
    );

    const seen = new Set<string>();
    for (const entry of map.scenarios) {
      expect(seen.has(entry.id), `重复场景 id=${entry.id}`).toBe(false);
      seen.add(entry.id);
      expect(["covered", "partial", "gap"]).toContain(entry.coverage);

      if (entry.coverage === "gap") {
        continue;
      }
      expect(entry.tests.length, `场景 ${entry.id} ${entry.coverage} 但 tests 为空`).toBeGreaterThan(0);
      for (const rel of entry.tests) {
        const abs = path.join(repoRoot, rel);
        expect(existsSync(abs), `场景 ${entry.id} 引用缺失文件: ${rel}`).toBe(true);
      }
    }
  });
});
