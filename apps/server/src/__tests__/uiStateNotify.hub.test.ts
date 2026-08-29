/**
 * notify → 真 SessionStreamHub：先推再订阅，锁 externalRing 重放。
 * 禁止 vi.mock(sessionStreamHub)。
 */
import { afterEach, describe, expect, it } from "vitest";
import { SessionStreamHub, setStreamHub } from "../infra/sessionStreamHub.js";
import { notifyCronJobUpdated } from "../infra/uiStateNotify.js";

describe("uiStateNotify 真 hub", () => {
  let hub: SessionStreamHub | undefined;
  let unsub: (() => void) | undefined;

  afterEach(async () => {
    unsub?.();
    unsub = undefined;
    setStreamHub(null);
    if (hub) {
      await hub.dispose();
      hub = undefined;
    }
  });

  it("先 notifyCronJobUpdated 再 subscribeExternal 能重放到 cron_job_updated", async () => {
    hub = new SessionStreamHub({
      ringSize: 50,
      persist: false,
      eventTtlMs: 5000,
      cleanupIntervalMs: 0,
    });
    setStreamHub(hub);
    const prisma = {
      chatSession: {
        findMany: async () => [{ id: "sess-1" }],
        findFirst: async () => ({ id: "sess-1" }),
      },
    } as never;
    await notifyCronJobUpdated(prisma, {
      id: "job-1",
      agentId: "agent-1",
      name: "brief",
    });
    const received: string[] = [];
    unsub = hub.subscribeExternal("sess-1", (ev) => {
      received.push(ev.type);
    });
    expect(received).toContain("cron_job_updated");
  });
});
