import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { discoverGardenIds } from "../scripts/sync/discover-gardens.js";

const tempRoots: string[] = [];

function createContentRoot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "oasismind-gardens-"));
  tempRoots.push(root);
  return root;
}

function addGarden(root: string, id: string): void {
  const dir = path.join(root, id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "_garden.md"), `---\ntitle: ${id}\n---\n`, "utf-8");
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

describe("Garden 目录发现", () => {
  it("同时识别小写 slug 与正式英文目录名", () => {
    const root = createContentRoot();
    addGarden(root, "posts");
    addGarden(root, "SparseAttention");
    addGarden(root, "LLMInfrastructure");

    expect(discoverGardenIds(root)).toEqual([
      "LLMInfrastructure",
      "SparseAttention",
      "posts",
    ]);
  });
});
