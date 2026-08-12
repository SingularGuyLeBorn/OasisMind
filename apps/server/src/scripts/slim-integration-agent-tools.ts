/**
 * Agent.tools / config/agents/*.md：
 * - 多个 github_* → 单一 github_tool
 * - 去掉 INTEGRATION_ADVANCED（语雀 Cookie / 飞书权限·Wiki·画板 / github 细粒度）
 *
 * pnpm --filter @knowpilot/server exec tsx src/scripts/slim-integration-agent-tools.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { INTEGRATION_ADVANCED_OPT_IN_TOOLS } from "@knowpilot/shared";
import { getAppConfig } from "../infra/config.js";

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ADVANCED = new Set(
  INTEGRATION_ADVANCED_OPT_IN_TOOLS.map((t) => t.replace(/^native:/, "")),
);
const GITHUB_FINE = [...ADVANCED].filter((t) => t.startsWith("github_"));

function toBare(t: string): string {
  return t.replace(/^native:/, "").trim();
}

function slimTools(tools: string[]): { next: string[]; changed: boolean } {
  const bare = tools.map(toBare).filter(Boolean);
  const set = new Set(bare);
  let changed = false;
  let hasGithubFine = false;
  for (const g of GITHUB_FINE) {
    if (set.has(g)) {
      set.delete(g);
      hasGithubFine = true;
      changed = true;
    }
  }
  if (hasGithubFine) {
    set.add("github_tool");
    changed = true;
  }
  for (const t of ADVANCED) {
    if (t.startsWith("github_")) continue;
    if (set.has(t)) {
      set.delete(t);
      changed = true;
    }
  }
  const order = new Map(bare.map((t, i) => [t, i]));
  if (hasGithubFine && !order.has("github_tool")) {
    // 插到第一个被删 github 的原位置附近：用最小原 index
    order.set("github_tool", Math.min(...GITHUB_FINE.map((g) => order.get(g) ?? 9999)));
  }
  const nextBare = [...set].sort((a, b) => (order.get(a) ?? 9999) - (order.get(b) ?? 9999));
  const next = nextBare.map((t) =>
    t.startsWith("skill:") || t.startsWith("mcp:") ? t : `native:${t}`,
  );
  return { next, changed };
}

function rewriteAgentMd(filePath: string): boolean {
  const raw = fs.readFileSync(filePath, "utf8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return false;
  const fm = m[1]!;
  const body = m[2]!;
  if (!/^tools:/m.test(fm)) return false;

  const lines = fm.split(/\r?\n/);
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    if (line.startsWith("tools:")) {
      const tools: string[] = [];
      i += 1;
      while (i < lines.length && /^\s+-\s+/.test(lines[i]!)) {
        const tm = lines[i]!.match(/^\s+-\s+["']?([^"']+)["']?\s*$/);
        if (tm) tools.push(tm[1]!);
        i += 1;
      }
      const { next, changed } = slimTools(tools);
      if (!changed) {
        out.push("tools:");
        for (const t of tools) out.push(`  - "${t}"`);
        continue;
      }
      out.push("tools:");
      for (const t of next) out.push(`  - "${t}"`);
      continue;
    }
    out.push(line);
    i += 1;
  }

  const before = raw;
  const after = `---\n${out.join("\n")}\n---\n${body}`;
  if (before === after) return false;
  fs.writeFileSync(filePath, after, "utf8");
  return true;
}

async function main() {
  const agents = await prisma.agent.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, tools: true },
  });
  let dbN = 0;
  for (const a of agents) {
    const prev = a.tools ? a.tools.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const { next, changed } = slimTools(prev);
    if (!changed) continue;
    await prisma.agent.update({
      where: { id: a.id },
      data: { tools: next.join(",") },
    });
    console.log(`DB ${a.name}: ${prev.length} → ${next.length}`);
    dbN += 1;
  }

  const agentsDir = getAppConfig().configPaths.agents;
  const fallback = path.resolve(__dirname, "../../../../config/agents");
  const dir = fs.existsSync(agentsDir) ? agentsDir : fallback;
  let mdN = 0;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith(".md") || name.startsWith("_")) continue;
    if (rewriteAgentMd(path.join(dir, name))) {
      console.log(`md ${name}`);
      mdN += 1;
    }
  }
  console.log(`done: db=${dbN} md=${mdN}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
