/**
 * notify → 真 SessionStreamHub：先 notify 再 subscribe，证明 externalRing 重放。
 * 禁止 vi.mock(sessionStreamHub)。
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { SessionStreamHub, setStreamHub } from "../infra/sessionStreamHub.js";
import { notifyCronJobUpdated } from "../infra/uiStateNotify.js";
import type { AgentStreamEvent } from "../infra/agentStream/index.js";

function prismaWithSessions(ids: string[]) {
  return {
    chatSession: {
      findFirst: vi.fn().mockResolvedValue(ids[0] ? { id: ids[0] } : null),
      findMany: vi.fn().mockResolvedValue(ids.map((id) => ({ id }))),
    },
  } as never;
}

describe("uiStateNotify 写入真 hub", () => {
  afterEach(() => {
    setStreamHub(null);
  });

  it("先 notifyCronJobUpdated 再 subscribeExternal 能重放到 cron_job_updated", async () => {
    const hub = new SessionStreamHub({
      ringSize: 50,
      persist: false,
      eventTtlMs: 5000,
      cleanupIntervalMs: 0,
    });
    setStreamHub(hub);

    await notifyCronJobUpdated(prismaWithSessions(["sess-1"]), {
      id: "job-1",
      agentId: "ag-1",
      name: "晨间",
      lastRunStatus: "running",
    });

    const received: AgentStreamEvent[] = [];
    const unsub = hub.subscribeExternal("sess-1", (ev) => {
      received.push(ev);
    });
    try {
      expect(received.some((ev) => ev.type === "cron_job_updated")).toBe(true);
    } finally {
      unsub();
    }
  });
});
