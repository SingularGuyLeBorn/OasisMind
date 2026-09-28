/**
 * ChannelBinding 键规则：
 * - 私聊：不同 peerId → 不同 session
 * - 群聊：同群不同说话人 → **同一 session**（全群共享）
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { prisma } from "../db.js";
import {
  CHANNEL_GROUP_PEER,
  resolveChannelBindingKeys,
  resolveOrCreateChannelBinding,
  __resetDailyFragmentsAgentCache,
} from "../infra/channelBinding.js";
import { prefixGroupSpeaker } from "../infra/messageGateway.js";
import { createContextInner } from "../trpc/context.js";
import { createTestConfig } from "./helpers/toolTestFixtures.js";

describe("channelBinding peer / 群共享", () => {
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

  it("resolveChannelBindingKeys：群聊归一到 __group__", () => {
    expect(resolveChannelBindingKeys({ peerId: "u1", chatId: "g9" })).toEqual({
      peerId: CHANNEL_GROUP_PEER,
      chatId: "g9",
      speakerPeerId: "u1",
      isGroup: true,
    });
    expect(resolveChannelBindingKeys({ peerId: "u1" })).toEqual({
      peerId: "u1",
      chatId: "",
      speakerPeerId: "u1",
      isGroup: false,
    });
  });

  it("prefixGroupSpeaker 标注说话人且幂等", () => {
    expect(prefixGroupSpeaker("你好", "ABC")).toBe("【群成员 openid=ABC】\n你好");
    expect(prefixGroupSpeaker("你好", "ABC", "张三")).toBe("【群成员 张三 | openid=ABC】\n你好");
    expect(prefixGroupSpeaker("【群成员 张三】\n你好", "ABC", "张三")).toBe(
      "【群成员 张三】\n你好",
    );
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

  it("同群两个不同 QQ → 同一个 sessionId（全群共享）", async () => {
    const config = createTestConfig(process.cwd());
    const groupId = "1098299609";
    const a = await resolveOrCreateChannelBinding(prisma, ctx.services, config, {
      channel: "qq",
      peerId: "2635495642",
      chatId: groupId,
      agentId,
    });
    const b = await resolveOrCreateChannelBinding(prisma, ctx.services, config, {
      channel: "qq",
      peerId: "2251061018",
      chatId: groupId,
      agentId,
    });
    expect(a.sessionId).toBe(b.sessionId);
    expect(a.id).toBe(b.id);
    expect(a.peerId).toBe(CHANNEL_GROUP_PEER);
    expect(b.peerId).toBe(CHANNEL_GROUP_PEER);
    expect(a.chatId).toBe(groupId);
  });

  it("同一 QQ 私聊再发消息复用原 session（不重复建）", async () => {
    const config = createTestConfig(process.cwd());
    const first = await resolveOrCreateChannelBinding(prisma, ctx.services, config, {
      channel: "onebot",
      peerId: "2635495642",
      agentId,
    });
    const second = await resolveOrCreateChannelBinding(prisma, ctx.services, config, {
      channel: "onebot",
      peerId: "2635495642",
      agentId,
    });
    expect(second.sessionId).toBe(first.sessionId);
    expect(second.id).toBe(first.id);
  });

  it("同群再发消息复用共享 session", async () => {
    const config = createTestConfig(process.cwd());
    const groupId = "1098299609";
    const first = await resolveOrCreateChannelBinding(prisma, ctx.services, config, {
      channel: "qq",
      peerId: "2635495642",
      chatId: groupId,
      agentId,
    });
    const second = await resolveOrCreateChannelBinding(prisma, ctx.services, config, {
      channel: "qq",
      peerId: "2251061018",
      chatId: groupId,
      agentId,
    });
    expect(second.sessionId).toBe(first.sessionId);
    expect(second.id).toBe(first.id);
  });
});
