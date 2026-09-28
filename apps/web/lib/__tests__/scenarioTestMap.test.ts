/**
 * scenarios.md ↔ scenario-test-map.json 防漂移：
 * 文档新增场景必须登记覆盖；covered 必须靠过程断言，禁止文件存在 / heading / e2e-real 冒充。
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

const LAYERS = ["unit", "e2e-mock", "e2e-real", "eval-mock"] as const;
type Layer = (typeof LAYERS)[number];
type Coverage = "covered" | "partial" | "gap";

interface ScenarioAssert {
  file: string;
  it: string;
  claim: string;
  layer: Layer;
}

interface ScenarioMapEntry {
  id: string;
  title: string;
  coverage: Coverage;
  tests: string[];
  note?: string;
  asserts: ScenarioAssert[];
}

interface ScenarioMapFile {
  version: number;
  scenarios: ScenarioMapEntry[];
}

const HEADING_CLAIM_RE = /^(页面|heading|应正常渲染|正常渲染)/;
const PROCESS_KEYWORD_RE = /无需 F5|气泡|队列|落库|禁止|幂等|续跑|空态|芯片/;
const HAN_RE = /[\u4e00-\u9fff]/g;

function parseScenarioHeadings(markdown: string): Array<{ id: string; title: string }> {
  const out: Array<{ id: string; title: string }> = [];
  const re = /^## 场景 ([0-9]+|[A-E])：(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown))) {
    out.push({ id: m[1], title: m[2].trim() });
  }
  return out;
}

function hanCount(text: string): number {
  return text.match(HAN_RE)?.length ?? 0;
}

function isScoringAssert(a: ScenarioAssert): boolean {
  return a.layer !== "e2e-real";
}

function isProcessClaim(claim: string): boolean {
  if (HEADING_CLAIM_RE.test(claim)) return false;
  return hanCount(claim) >= 8 || PROCESS_KEYWORD_RE.test(claim);
}

function isEvalMockPath(rel: string): boolean {
  const n = rel.replace(/\\/g, "/");
  return (
    n.startsWith("evals/golden/") ||
    n === "evals/harness-bench/cases.json" ||
    n.startsWith("packages/mock-llm-core/")
  );
}

function loadMap(): ScenarioMapFile {
  return JSON.parse(readFileSync(mapPath, "utf8")) as ScenarioMapFile;
}

describe("scenario-test-map 与 scenarios.md 对齐", () => {
  it("每个场景标题都已登记，且 covered/partial 的测试文件存在", () => {
    const markdown = readFileSync(scenariosPath, "utf8");
    const map = loadMap();
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

describe("scenario-test-map 过程断言", () => {
  const map = loadMap();

  it("每条 scenario 有 asserts 数组，layer 合法，file 存在，it 子串落在文件内", () => {
    for (const entry of map.scenarios) {
      expect(Array.isArray(entry.asserts), `场景 ${entry.id} 缺少 asserts[]`).toBe(true);

      if (entry.coverage === "gap") {
        expect(entry.asserts.length, `gap 场景 ${entry.id} 允许 asserts 为空`).toBeGreaterThanOrEqual(0);
        expect(Boolean(entry.note && entry.note.trim()), `gap 场景 ${entry.id} 必须有 note 说明为什么没测`).toBe(
          true,
        );
      }

      if (entry.coverage === "partial") {
        expect(entry.asserts.length, `partial 场景 ${entry.id} 至少一条 assert`).toBeGreaterThanOrEqual(1);
      }

      for (const a of entry.asserts) {
        expect(LAYERS, `场景 ${entry.id} 非法 layer=${String(a.layer)}`).toContain(a.layer);
        expect(a.file, `场景 ${entry.id} assert.file 为空`).toBeTruthy();
        expect(a.it, `场景 ${entry.id} assert.it 为空`).toBeTruthy();
        expect(a.claim, `场景 ${entry.id} assert.claim 为空`).toBeTruthy();

        const abs = path.join(repoRoot, a.file);
        expect(existsSync(abs), `场景 ${entry.id} asserts.file 缺失: ${a.file}`).toBe(true);
        const text = readFileSync(abs, "utf8");
        expect(text.includes(a.it), `场景 ${entry.id} it 子串未出现在 ${a.file}: ${a.it}`).toBe(true);

        if (a.layer === "eval-mock") {
          expect(isEvalMockPath(a.file), `场景 ${entry.id} eval-mock 路径不合法: ${a.file}`).toBe(true);
        }
      }
    }
  });

  it("covered 必须有计分过程断言，禁止仅靠 heading / e2e-real / 单独 eval-mock", () => {
    for (const entry of map.scenarios) {
      if (entry.coverage !== "covered") continue;

      const scoring = entry.asserts.filter(isScoringAssert);
      expect(scoring.length, `场景 ${entry.id} covered 但没有非 e2e-real 计分断言`).toBeGreaterThanOrEqual(1);

      const processScoring = scoring.filter((a) => isProcessClaim(a.claim));
      expect(
        processScoring.length,
        `场景 ${entry.id} covered 但没有过程 claim（禁止 heading 冒充）`,
      ).toBeGreaterThanOrEqual(1);

      const unitOrE2eMock = scoring.filter((a) => a.layer === "unit" || a.layer === "e2e-mock");
      const onlyEvalMock = unitOrE2eMock.length === 0 && scoring.every((a) => a.layer === "eval-mock");
      expect(onlyEvalMock, `场景 ${entry.id} 单独 eval-mock 不足以 covered`).toBe(false);
    }
  });
});
