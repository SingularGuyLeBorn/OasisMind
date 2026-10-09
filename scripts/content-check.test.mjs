import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("./content-check.mjs", import.meta.url));
const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });

test("不存在的知识库与越界标识不能通过单库验收", () => {
  for (const garden of ["NonexistentKnowledgeBaseForCheck", "../content", "SparseAttention/other"]) {
    const result = run("frontmatter", `--garden=${garden}`);
    assert.equal(result.status, 2);
    assert.ok(result.stderr.length > 0);
    assert.ok(!result.stdout.includes("通过"));
  }
});

test("实际知识库可以执行编号标题验收", () => {
  const result = run("frontmatter", "--garden=SparseAttention");
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.ok(result.stdout.includes("[frontmatter] 通过"));
});
