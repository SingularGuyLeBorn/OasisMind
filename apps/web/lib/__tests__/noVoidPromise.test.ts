/**
 * 源码闸：禁止 `void refetch/invalidate/...` 造成浏览器 unhandled rejection。
 */
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const WEB_ROOT = join(process.cwd());

const SKIP_DIR = new Set(["node_modules", ".next", "e2e"]);
const VOID_PROMISE_RE =
  /void\s+[^;\n]*(refetch|invalidate|mutateAsync|prefetch|writeText)\s*\(|void\s+utils\.|void\s+query\./;

function shouldSkipFile(rel: string): boolean {
  const n = rel.replace(/\\/g, "/");
  if (n.endsWith(".test.ts") || n.endsWith(".test.tsx") || n.endsWith(".spec.ts")) return true;
  return false;
}

function walkTsFiles(dir: string, acc: string[]): void {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIR.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      walkTsFiles(full, acc);
      continue;
    }
    if (!name.endsWith(".ts") && !name.endsWith(".tsx")) continue;
    const rel = relative(WEB_ROOT, full);
    if (shouldSkipFile(rel)) continue;
    acc.push(full);
  }
}

function codeWithoutLineComments(line: string): string {
  const idx = line.indexOf("//");
  if (idx < 0) return line;
  return line.slice(0, idx);
}

describe("禁止 void promise", () => {
  it("apps/web 生产源码不得 void refetch/invalidate/utils./query.", () => {
    const files: string[] = [];
    walkTsFiles(WEB_ROOT, files);
    expect(files.length).toBeGreaterThan(20);
    const hits: string[] = [];
    for (const file of files) {
      const rel = relative(WEB_ROOT, file).replace(/\\/g, "/");
      const lines = readFileSync(file, "utf8").split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const code = codeWithoutLineComments(lines[i]);
        if (VOID_PROMISE_RE.test(code)) {
          hits.push(`${rel}:${i + 1}: ${lines[i].trim()}`);
        }
      }
    }
    expect(hits, hits.join("\n")).toEqual([]);
  });
});
