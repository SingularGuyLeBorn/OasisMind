/**
 * 把 config/agents/assistant-*.md 的 tools frontmatter 写成 ASSISTANT_DEFAULT_TOOLS。
 * 与 align-assistant-tools.ts 配套，避免 db:sync 把旧清单灌回 DB。
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ASSISTANT_DEFAULT_TOOLS } from "@knowpilot/shared";
import { getAppConfig } from "../infra/config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function rewriteFile(filePath: string): boolean {
  const raw = fs.readFileSync(filePath, "utf8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return false;
  const fm = m[1]!;
  const body = m[2]!;
  if (!/^name:\s*["']?assistant["']?\s*$/m.test(fm)) return false;

  const lines = fm.split(/\r?\n/);
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    if (line.startsWith("tools:")) {
      out.push("tools:");
      for (const t of ASSISTANT_DEFAULT_TOOLS) {
        out.push(`  - "${t}"`);
      }
      i += 1;
      while (i < lines.length && /^\s+-\s+/.test(lines[i]!)) i += 1;
      continue;
    }
    out.push(line);
    i += 1;
  }

  fs.writeFileSync(filePath, `---\n${out.join("\n")}\n---\n${body}`, "utf8");
  return true;
}

function main() {
  const agentsDir = getAppConfig().configPaths.agents;
  const fallback = path.resolve(__dirname, "../../../../config/agents");
  const dir = fs.existsSync(agentsDir) ? agentsDir : fallback;
  let n = 0;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith(".md") || name.startsWith("_")) continue;
    const fp = path.join(dir, name);
    if (rewriteFile(fp)) {
      console.log(`rewrote ${fp} → ${ASSISTANT_DEFAULT_TOOLS.length} tools`);
      n += 1;
    }
  }
  if (n === 0) console.log("no assistant md found");
}

main();
