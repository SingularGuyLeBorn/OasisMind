/**
 * processSafety：安装幂等（不在单测里真扔 unhandledRejection，避免污染 vitest 进程）。
 */
import { spawnSync } from "node:child_process";
import { describe, it, expect, beforeEach } from "vitest";
import {
  installProcessSafetyHandlers,
  __resetProcessSafetyForTests,
} from "../infra/processSafety.js";

describe("processSafety", () => {
  beforeEach(() => {
    __resetProcessSafetyForTests();
  });

  it("install 幂等且不抛", () => {
    expect(() => {
      installProcessSafetyHandlers();
      installProcessSafetyHandlers();
    }).not.toThrow();
  });

  it("M-21：listen 前同步 throw 必须 exit(1)，不得被 uncaughtException 吞掉后继续 listen", () => {
    const script = `
      process.on("uncaughtException", () => {});
      try {
        throw new Error("credential-guard");
      } catch {
        process.exit(1);
      }
      require("http").createServer().listen(0, () => {});
    `;
    const r = spawnSync(process.execPath, ["-e", script], { encoding: "utf8" });
    expect(r.status).toBe(1);
  });
});
