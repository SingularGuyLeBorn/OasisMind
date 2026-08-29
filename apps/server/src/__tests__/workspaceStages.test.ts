/**
 * W6 workspace.listStages tRPC：包装 swarmStages list，经 tRPC 出口可读。
 */

import fs from "fs";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import { prisma } from "../db.js";
import { getAppConfig } from "../infra/config.js";
import { writeSwarmStage } from "../infra/swarmStages.js";
import { createContextInner } from "../trpc/context.js";
import { appRouter } from "../router.js";

const RUN = `w6st-${Date.now().toString(36)}`;

describe("W6 workspace.listStages tRPC", () => {
  const cleanup: { workspaceId?: string; dir?: string } = {};

  afterEach(async () => {
    if (cleanup.workspaceId) {
      await prisma.workspace.delete({ where: { id: cleanup.workspaceId } }).catch(() => {});
    }
    if (cleanup.dir) {
      fs.rmSync(cleanup.dir, { recursive: true, force: true });
    }
  });

  it("listStages 返回已写入的阶段工件元信息", async () => {
    const config = getAppConfig();
    const wsDir = path.join(config.projectRoot, "workspaces", `w6-${RUN}`);
    fs.mkdirSync(wsDir, { recursive: true });
    cleanup.dir = wsDir;
    const ws = await prisma.workspace.create({
      data: {
        name: `w6-ws-${RUN}`,
        path: path.relative(config.projectRoot, wsDir).replace(/\\/g, "/"),
        status: "active",
      },
    });
    cleanup.workspaceId = ws.id;

    await writeSwarmStage(prisma, config, {
      workspaceId: ws.id,
      stage: "research",
      title: "调研摘要",
      body: "## 发现\n\n- 点 A\n",
      authorAgentId: "agent_test",
    });

    const ctx = await createContextInner();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.workspace.listStages({ workspaceId: ws.id });
    expect(result.total).toBeGreaterThanOrEqual(1);
    expect(result.items.some((x) => x.stage === "research" && x.title === "调研摘要")).toBe(true);
  });
});
