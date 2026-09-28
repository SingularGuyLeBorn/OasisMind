import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  __resetMessageGatewayForTests,
  handleIncomingMessage,
  initMessageGateway,
  registerChannelAdapter,
  type ChannelAdapter,
  type UnifiedMessage,
} from "../infra/messageGateway.js";
import { wrapEmitForChannelReply } from "../infra/channelStreamBridge.js";
import { prisma } from "../db.js";
import { SessionStreamHub, setStreamHub } from "../infra/sessionStreamHub.js";
import { createContextInner } from "../trpc/context.js";
import { createTestConfig } from "./helpers/toolTestFixtures.js";

describe("channelStreamBridge", () => {
  it("token 节流 + done 终稿", async () => {
    const chunks: Array<{ text: string; finish: boolean; reasoning?: string }> = [];
    const emit = vi.fn();
    const wrapped = wrapEmitForChannelReply(emit, (c) => {
      chunks.push({ text: c.text, finish: c.finish, reasoning: c.reasoning });
    });
    wrapped({ type: "token", delta: "你" });
    wrapped({ type: "token", delta: "好" });
    wrapped({
      type: "done",
      sessionId: "s1",
      agentId: "a1",
      content: "你好",
      toolCalls: [],
      model: "m",
      provider: "p",
      roundsUsed: 1,
    });
    expect(emit).toHaveBeenCalled();
    expect(chunks.at(-1)).toEqual({ text: "你好", finish: true, reasoning: undefined });
  });

  it("thinking 事件被收集并在 finish 时带回 reasoning", async () => {
    const chunks: Array<{ text: string; finish: boolean; reasoning?: string }> = [];
    const emit = vi.fn();
    const wrapped = wrapEmitForChannelReply(emit, (c) => {
      chunks.push({ text: c.text, finish: c.finish, reasoning: c.reasoning });
    });
    wrapped({ type: "thinking", delta: "先分析" });
    wrapped({ type: "thinking", delta: "，再回答" });
    wrapped({ type: "token", delta: "答案" });
    wrapped({
      type: "done",
      sessionId: "s1",
      agentId: "a1",
      content: "答案",
      toolCalls: [],
      model: "m",
      provider: "p",
      roundsUsed: 1,
    });
    expect(chunks.at(-1)).toEqual({
      text: "答案",
      finish: true,
      reasoning: "先分析，再回答",
    });
  });

  it("done.content 为权威终稿（token 缓冲可为空）", async () => {
    const chunks: Array<{ text: string; finish: boolean }> = [];
    const emit = vi.fn();
    const wrapped = wrapEmitForChannelReply(emit, (c) => {
      chunks.push({ text: c.text, finish: c.finish });
    });
    wrapped({
      type: "done",
      sessionId: "s1",
      agentId: "a1",
      content: "仅终稿有正文",
      toolCalls: [],
      model: "m",
      provider: "p",
      roundsUsed: 1,
    });
    await wrapped.waitForChannelReplies?.();
    expect(chunks.at(-1)).toEqual({ text: "仅终稿有正文", finish: true });
  });

  it("fallbackOnly：中间 token 不回发；终稿未由工具发出则兜底且 imQuote=false", async () => {
    const chunks: Array<{ text: string; finish: boolean; imQuote?: boolean; reasoning?: string }> =
      [];
    const emit = vi.fn();
    const wrapped = wrapEmitForChannelReply(
      emit,
      (c) => {
        chunks.push({
          text: c.text,
          finish: c.finish,
          imQuote: c.imQuote,
          reasoning: c.reasoning,
        });
      },
      {
        fallbackOnlyWhenNoAnswer: {
          sessionId: "s-fb",
          shouldSkipFallback: () => false,
        },
      },
    );
    wrapped({ type: "token", delta: "中" });
    wrapped({ type: "token", delta: "间" });
    wrapped({ type: "thinking", delta: "想了想" });
    expect(chunks).toHaveLength(0);

    wrapped({
      type: "done",
      sessionId: "s-fb",
      agentId: "a1",
      content: "兜底终稿",
      toolCalls: [],
      model: "m",
      provider: "p",
      roundsUsed: 1,
    });
    await wrapped.waitForChannelReplies?.();
    expect(chunks).toEqual([
      { text: "兜底终稿", finish: true, imQuote: false, reasoning: undefined },
    ]);
  });

  it("fallbackOnly：中间发过短消息仍兜底；仅终稿已由工具发出才跳过", async () => {
    const chunks: Array<{ text: string }> = [];
    let skip = false;
    const wrapped = wrapEmitForChannelReply(
      vi.fn(),
      (c) => {
        chunks.push({ text: c.text });
      },
      {
        fallbackOnlyWhenNoAnswer: {
          sessionId: "s-skip",
          shouldSkipFallback: (finalText) => {
            // 模拟：中间短句不 skip；终稿相同时 skip
            skip = finalText.includes("完整终稿正文");
            return skip;
          },
        },
      },
    );
    wrapped({
      type: "done",
      sessionId: "s-skip",
      agentId: "a1",
      content: "完整终稿正文应当被跳过",
      toolCalls: [],
      model: "m",
      provider: "p",
      roundsUsed: 1,
    });
    await wrapped.waitForChannelReplies?.();
    expect(chunks).toHaveLength(0);
  });
});

describe("messageGateway 幂等（mock deps）", () => {
  beforeEach(async () => {
    await __resetMessageGatewayForTests();
  });

  it("未 init 时返回错误", async () => {
    const r = await handleIncomingMessage({
      envelope: { channel: "qq", peerId: "u1", timestamp: new Date().toISOString() },
      payload: { text: "hi" },
      meta: { eventId: "e1" },
    });
    expect(r.ok).toBe(false);
  });

  it("空消息拒绝", async () => {
    initMessageGateway({
      prisma: {} as never,
      services: {} as never,
      config: {} as never,
    });
    const r = await handleIncomingMessage({
      envelope: { channel: "qq", peerId: "u1", timestamp: new Date().toISOString() },
      payload: { text: "  " },
      meta: { eventId: "e2" },
    });
    expect(r.ok).toBe(false);
  });

  it("可注册 adapter 并读状态", () => {
    const adapter: ChannelAdapter = {
      channel: "qq",
      name: "mock",
      enabled: false,
      getStatus: () => ({ state: "disconnected" }),
      start: async () => {},
      stop: async () => {},
      reply: async () => {},
    };
    registerChannelAdapter(adapter);
    expect(adapter.getStatus().state).toBe("disconnected");
  });
});

describe("UnifiedMessage 形状", () => {
  it("信封字段齐全", () => {
    const msg: UnifiedMessage = {
      envelope: { channel: "qq", peerId: "u", chatId: "g", timestamp: "t" },
      payload: { text: "x" },
      meta: { eventId: "id", replyTo: "req" },
    };
    expect(msg.envelope.channel).toBe("qq");
  });
});

describe("messageGateway /stop 指令", () => {
  let hub: SessionStreamHub;
  let ctx: Awaited<ReturnType<typeof createContextInner>>;
  const replies: string[] = [];
  let adapter: ChannelAdapter;
  let agentId: string;

  beforeEach(async () => {
    await __resetMessageGatewayForTests();
    replies.length = 0;
    hub = new SessionStreamHub({
      persist: false,
      cleanupIntervalMs: 0,
      eventTtlMs: 1000,
      runTimeoutMs: 300_000,
      runStallTimeoutMs: 120_000,
    });
    setStreamHub(hub);
    ctx = await createContextInner();
    const agent = await prisma.agent.create({
      data: { name: "assistant", sourceSlug: "assistant", model: "test" },
    });
    agentId = agent.id;
    adapter = {
      channel: "qq",
      name: "mock",
      enabled: true,
      getStatus: () => ({ state: "connected" }),
      start: async () => {},
      stop: async () => {},
      reply: async (_msg, chunk) => {
        replies.push(chunk.text);
      },
    };
    registerChannelAdapter(adapter);
    initMessageGateway({
      prisma,
      services: ctx.services,
      config: createTestConfig(process.cwd(), { auth: { mode: "none", password: "", token: "" } }),
    });
  });

  afterEach(async () => {
    await hub.dispose();
    setStreamHub(null);
    await prisma.channelBinding.deleteMany({});
    await prisma.chatSession.deleteMany({});
    await prisma.chatMessage.deleteMany({});
    await prisma.agent.deleteMany({ where: { id: agentId } });
    await prisma.processedWebhookEvent.deleteMany({});
  });

  async function createBinding(peerId: string, sessionId: string) {
    await prisma.channelBinding.create({
      data: {
        channel: "qq",
        peerId,
        chatId: "",
        sessionId,
        agentId,
        title: "test-binding",
      },
    });
  }

  it("运行中发送 /stop 可强制停止并回发确认", async () => {
    const session = await prisma.chatSession.create({
      data: { title: "stop-test", model: "test", status: "running" },
    });
    await createBinding("stop-user-1", session.id);

    await hub.start(
      session.id,
      { message: "hi", sessionId: session.id, clientMessageId: "m1" },
      async () => {
        await new Promise(() => {}); // stuck runner
      },
    );
    expect(hub.isRunning(session.id)).toBe(true);

    const stopMsg: UnifiedMessage = {
      envelope: { channel: "qq", peerId: "stop-user-1", timestamp: new Date().toISOString() },
      payload: { text: "/stop" },
      meta: { eventId: "e-stop-1" },
    };
    const r = await handleIncomingMessage(stopMsg);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.sessionId).toBe(session.id);

    await hub.waitFor(session.id);
    expect(hub.isRunning(session.id)).toBe(false);
    expect(replies).toContain("已强制停止当前回复，可以继续发消息。");
  });

  it("未运行时发送 /stop 回发未运行提示", async () => {
    const session = await prisma.chatSession.create({
      data: { title: "stop-test-idle", model: "test", status: "active" },
    });
    await createBinding("stop-user-2", session.id);

    const stopMsg: UnifiedMessage = {
      envelope: { channel: "qq", peerId: "stop-user-2", timestamp: new Date().toISOString() },
      payload: { text: "/stop" },
      meta: { eventId: "e-stop-2" },
    };
    const r = await handleIncomingMessage(stopMsg);
    expect(r.ok).toBe(true);
    expect(replies).toContain("当前没有正在回复的消息。");
  });
});
