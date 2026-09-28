/**
 * S10 闸：pure 项目不得直接 import prisma 的 db 模块。
 * 正则由片段拼出，避免本文件源码被闸误伤。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dir = path.dirname(fileURLToPath(import.meta.url));
const q = `["']`;
const up = "\\.\\./";
const FORBIDDEN = new RegExp(
  `from\\s+${q}${up}db(?:\\.js)?${q}|from\\s+${q}${up}${up}db(?:\\.js)?${q}`,
);

describe("pure 目录不得 import prisma/db", () => {
  it("同目录测试文件不得写相对 db 模块的 import", () => {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".test.ts"));
    const hits: string[] = [];
    for (const f of files) {
      const text = fs.readFileSync(path.join(dir, f), "utf8");
      if (FORBIDDEN.test(text)) hits.push(f);
    }
    expect(hits).toEqual([]);
  });
});
