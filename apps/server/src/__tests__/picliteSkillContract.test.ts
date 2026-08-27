/**
 * Skill piclite-compress：本地压图铁律（场景 D）。文档即契约。
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function findRepoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    if (existsSync(path.join(dir, "config/skills/piclite-compress/SKILL.md"))) return dir;
    dir = path.dirname(dir);
  }
  throw new Error("找不到 piclite-compress/SKILL.md");
}

describe("piclite-compress skill 契约", () => {
  const md = readFileSync(
    path.join(findRepoRoot(), "config/skills/piclite-compress/SKILL.md"),
    "utf8",
  );

  it("启用且禁止第三方压图 SaaS", () => {
    expect(md).toMatch(/^enabled:\s*true/m);
    expect(md).toMatch(/TinyPNG/);
    expect(md).toMatch(/禁止/);
    expect(md).not.toMatch(/api\.tinify\.com/);
    expect(md).not.toMatch(/tinypng\.com\/api/i);
  });

  it("压完进 uploads，成文走 post_*", () => {
    expect(md).toMatch(/content\/uploads/);
    expect(md).toMatch(/post_/);
  });
});
