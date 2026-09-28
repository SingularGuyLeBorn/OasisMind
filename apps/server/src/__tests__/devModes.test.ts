import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const devScript = path.join(root, "scripts", "dev.mjs");

function runDev(args: string[]) {
  return spawnSync(process.execPath, [devScript, ...args], {
    encoding: "utf8",
    cwd: root,
    timeout: 8000,
  });
}

describe("dev 入口只有完整 / 极简", () => {
  it.each(["--stable", "--qq", "--quick", "--no-sync"])(
    "拒绝已删除旗标 %s",
    (flag) => {
      const r = runDev([flag]);
      expect(r.status).toBe(1);
      expect(`${r.stdout}${r.stderr}`).toMatch(/pnpm dev（完整）/);
      expect(`${r.stdout}${r.stderr}`).toMatch(/pnpm dev:mini（极简）/);
    },
  );
});
