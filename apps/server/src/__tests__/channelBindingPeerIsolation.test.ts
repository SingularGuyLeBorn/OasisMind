/**
 * 负向防线：不同 peerId（QQ 号）不得共享 ChannelBinding / ChatSession。
 * 同群不同发送者也必须各自独占 session。
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { prisma } from "../db.js";
import {
  resolveOrCreateChannelBinding,
  __resetDailyFragmentsAgentCache,
} from "../infra/channelBinding.js";
import { createContextInner } from "../trpc/context.js";
import { createTestConfig } from "./helpers/toolTestFixtures.js";

describe("channelBinding peer 隔离", () => {
  let agentId: string;
  let ctx: Awaited<ReturnType<typeof createContextInner>>;

  beforeEach(async () => {
    __resetDailyFragmentsAgentCache();
    ctx = await createContextInner();
    const agent = await prisma.agent.create({
      data: { name: "assistant", sourceSlug: "assistant", model: "test" },
    });
    agentId = agent.id;
  });

  afterEach(async () => {
    await prisma.channelBinding.deleteMany({});
    await prisma.chatSession.deleteMany({});
    await prisma.agent.deleteMany({ where: { id: agentId } });
    __resetDailyFragmentsAgentCache();
  });

  it("空 peerId 硬拒", async () => {
    await expect(
      resolveOrCreateChannelBinding(prisma, ctx.services, createTestConfig(process.cwd()), {
        channel: "onebot",
        peerId: "  ",
        agentId,
      }),
    ).rejects.toThrow(/peerId/);
  });

  it("两个不同 QQ 私聊 → 两个不同 sessionId", async () => {
    const config = createTestConfig(process.cwd());
    const a = await resolveOrCreateChannelBinding(prisma, ctx.services, config, {
      channel: "onebot",
      peerId: "2635495642",
      agentId,
    });
    const b = await resolveOrCreateChannelBinding(prisma, ctx.services, config, {
      channel: "onebot",
      peerId: "2251061018",
      agentId,
    });
    expect(a.sessionId).not.toBe(b.sessionId);
    expect(a.peerId).toBe("2635495642");
    expect(b.peerId).toBe("2251061018");
    expect(a.id).not.toBe(b.id);
  });

  it("同群两个不同 QQ → 两个不同 sessionId（禁止混群会话）", async () => {
    const config = createTestConfig(process.cwd());
    const groupId = "1098299609";
    const a = await resolveOrCreateChannelBinding(prisma, ctx.services, config, {
      channel: "onebot",
      peerId: "2635495642",
      chatId: groupId,
      agentId,
    });
    const b = await resolveOrCreateChannelBinding(prisma, ctx.services, config, {
      channel: "onebot",
      peerId: "2251061018",
      chatId: groupId,
      agentId,
    });
    expect(a.sessionId).not.toBe(b.sessionId);
    expect(a.chatId).toBe(groupId);
    expect(b.chatId).toBe(groupId);
  });

  it("同一 QQ 再发消息复用原 session（不重复建）", async () => {
    const config = createTestConfig(process.cwd());
    const first = await resolveOrCreateChannelBinding(prisma, ctx.services, config, {
      channel: "onebot",
      peerId: "2635495642",
      chatId: "1098299609",
      agentId,
    });
    const second = await resolveOrCreateChannelBinding(prisma, ctx.services, config, {
      channel: "onebot",
      peerId: "2635495642",
      chatId: "1098299609",
      agentId,
    });
    expect(second.sessionId).toBe(first.sessionId);
    expect(second.id).toBe(first.id);
  });
});
