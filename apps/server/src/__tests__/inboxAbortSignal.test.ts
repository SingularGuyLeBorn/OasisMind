/**
 * WP3b：C 类 inbox 工具必须听 ctx.signal。
 * 旧实现（syncZhihu 不传 shouldAbort）timeout 后仍会写 flag → 本测必红。
 */

import { describe, it, expect, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { listNativeTools, executeNativeTool } from "../infra/nativeTools.js";
import { runCooperative } from "../infra/tools/cooperativeAbort.js";
import { createTempProjectDir, createNativeCtx } from "./helpers/toolTestFixtures.js";

describe("WP3b inbox C 类听 abort signal", () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    dirs.length = 0;
  });

  it("inbox_sync_zhihu timeout 80ms：TIMEOUT 且 settle 后无幽灵写入（旧实现不传 shouldAbort 必红）", async () => {
    listNativeTools();
    const root = createTempProjectDir();
    dirs.push(root);
    const flagPath = path.join(root, "ghost-inbox-sync.txt");
    let ghostWritten = false;

    const ctx = createNativeCtx(root, {
      services: {
        inbox: {
          syncZhihu: async (_input: unknown, _onProgress?: unknown, shouldAbort?: () => boolean) => {
            for (let i = 0; i < 20; i++) {
              if (shouldAbort?.()) throw new Error("aborted");
              await new Promise((r) => setTimeout(r, 50));
            }
            ghostWritten = true;
            fs.writeFileSync(flagPath, "ghost");
            return { ok: true };
          },
        },
      } as never,
    });
    ctx.agentSnapshot = {
      id: "wp3b-inbox",
      model: "m",
      systemPrompt: "",
      tools: ["native:inbox_sync_zhihu"],
      tier: "super",
    };
    ctx.visibleSet = {
      native: ["inbox_sync_zhihu"],
      skills: [],
      mcpServers: [],
      skillWildcard: false,
      nativeAll: false,
      reasonByName: {},
    };

    const result = await runCooperative(
      (signal) =>
        executeNativeTool("inbox_sync_zhihu", { collectionUrl: "https://zhihu.com/collection/1" }, {
          ...ctx,
          signal,
        }),
      { timeoutMs: 80, label: "inbox_sync_zhihu" },
    );

    expect(result.status).toBe("TIMEOUT");
    expect(ghostWritten).toBe(false);
    expect(fs.existsSync(flagPath)).toBe(false);
  });
});
