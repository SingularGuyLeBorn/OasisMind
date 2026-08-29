/**
 * pure 项目闸：本目录测例不得 import prisma/db。
 */
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const DB_IMPORT_RE = /from ["']\.\.\/db(?:\.js)?["']|from ["']\.\.\/\.\.\/db(?:\.js)?["']/;

describe("pure 目录不得 import prisma/db", () => {
  it("同目录 *.test.ts 源码不含 from \"../db\"", () => {
    const files = readdirSync(dir).filter((n) => n.endsWith(".test.ts") && n !== "pureNoPrisma.test.ts");
    const hits: string[] = [];
    for (const name of files) {
      const src = readFileSync(path.join(dir, name), "utf8");
      if (DB_IMPORT_RE.test(src)) hits.push(name);
    }
    expect(hits).toEqual([]);
  });
});
