/**
 * prd-chat-stop.md R10/R12/R16：Hub stop 幽灵/双击；persistAborted 落库 finishReason。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { prisma } from "../db.js";
import { SessionStreamHub, setStreamHub } from "../infra/sessionStreamHub.js";
import { handleAgentChatStop } from "../infra/agentStream/index.js";
import { persistAbortedAssistant, shouldPersistAbortedAssistant } from "../infra/agentStream/persist.js";
import { createContextInner } from "../trpc/context.js";
import { createTestConfig } from "./helpers/toolTestFixtures.js";
import type { AgentChatInput } from "@oasismind/shared";

const stopConfig = createTestConfig(process.cwd(), {
  auth: { mode: "none", password: "", token: "" },
});

describe("PRD 流式停止 Hub / persist", () => {
  let hub: SessionStreamHub;
  let sessionId: string;

  beforeEach(async () => {
    hub = new SessionStreamHub({
      ringSize: 50,
      persist: false,
      eventTtlMs: 2000,
      cleanupIntervalMs: 0,
    });
    setStreamHub(hub);
    const sess = await prisma.chatSession.create({
      data: { title: "prd-stop-hub", model: "test" },
    });
    sessionId = sess.id;
  });

  afterEach(async () => {
    await hub.dispose();
    setStreamHub(null);
    await prisma.chatMessage.deleteMany({ where: { sessionId } });
    await prisma.chatSession.deleteMany({ where: { id: sessionId } });
  });

  it("R10 幽灵 session：无 run 时 stop 返回 stopped=false", () => {
    const json = vi.fn();
    handleAgentChatStop(hub, stopConfig)(
      { body: { sessionId: "clghostsessionid0000000001" } } as never,
      { status: vi.fn(), json } as never,
    );
    expect(json).toHaveBeenCalledWith({
      stopped: false,
      partialAssistantMessageId: null,
    });
  });

  it("R16 第一次 stop=true；run 收尾后第三次 stop=false", async () => {
    const runPromise = hub.start(
      sessionId,
      { message: "hi", sessionId } as AgentChatInput,
      async (_emit, signal) => {
        await new Promise<void>((resolve) => {
          if (signal.aborted) return resolve();
          signal.addEventListener("abort", () => resolve(), { once: true });
        });
      },
    );
    await new Promise((r) => setTimeout(r, 20));
    const json1 = vi.fn();
    handleAgentChatStop(hub, stopConfig)({ body: { sessionId } } as never, { status: vi.fn(), json: json1 } as never);
    expect(json1.mock.calls[0]![0].stopped).toBe(true);
    await runPromise;
    await hub.waitFor(sessionId);
    const jsonDone = vi.fn();
    handleAgentChatStop(hub, stopConfig)({ body: { sessionId } } as never, { status: vi.fn(), json: jsonDone } as never);
    expect(jsonDone.mock.calls[0]![0].stopped).toBe(false);
  });

  it("R12 persistAbortedAssistant 写入 finishReason=aborted", async () => {
    const ctx = await createContextInner();
    const pendingId = `c${"b".repeat(24)}`;
    await persistAbortedAssistant({
      services: ctx.services,
      sessionId,
      prepared: undefined,
      pendingAssistantId: pendingId,
      partialContent: "半截停住",
      partialToolCalls: [],
    });
    const msg = await prisma.chatMessage.findUnique({ where: { id: pendingId } });
    expect(msg?.finishReason).toBe("aborted");
    expect(msg?.content).toBe("半截停住");
  });

  it("用户点停即使零 token 也要落 aborted（界面才能画已停止生成）", () => {
    expect(
      shouldPersistAbortedAssistant({
        isUserSoftStop: true,
        partialContent: "",
        partialToolCalls: [],
      }),
    ).toBe(true);
    expect(
      shouldPersistAbortedAssistant({
        isUserSoftStop: false,
        partialContent: "",
        partialToolCalls: [],
      }),
    ).toBe(false);
    expect(
      shouldPersistAbortedAssistant({
        isUserSoftStop: false,
        partialContent: "半截",
        partialToolCalls: [],
      }),
    ).toBe(true);
  });

  it("零 token 中断落库正文是「(已中断)」且 finishReason=aborted", async () => {
    const pendingId = `c${"d".repeat(24)}`;
    const ctx = await createContextInner();
    await persistAbortedAssistant({
      services: ctx.services,
      sessionId,
      prepared: undefined,
      pendingAssistantId: pendingId,
      partialContent: "",
      partialToolCalls: [],
    });
    const msg = await prisma.chatMessage.findUnique({ where: { id: pendingId } });
    expect(msg?.finishReason).toBe("aborted");
    expect(msg?.content).toBe("(已中断)");
  });
});
