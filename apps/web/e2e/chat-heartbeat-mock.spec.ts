/**
 * 场景 7 Chat：查询心跳 lastMode / 是否熔断。
 * 只读检查（swarm_brief），按工具结果作答；禁止伪造「刚跑完」。
 * drain 用 session.agentId：先建 super 会话再进页，禁止 openFreshChat。
 */
import { test, expect } from "@playwright/test";
import { SERVER_URL, trpcQuery, trpcMutate } from "./helpers/trpcE2e";
import { sendChatMessage, waitForSessionIdle } from "./helpers/mockChatFixture";

type HeartbeatBlob = {
  enabled?: boolean;
  cron?: string;
  goal?: string;
  decision?: { lastMode?: string | null };
};

async function seedQuietHeartbeat(agentId: string): Promise<void> {
  const full = await trpcQuery<{ heartbeat?: HeartbeatBlob | null }>("agent.getById", { id: agentId });
  const hb = full.heartbeat && typeof full.heartbeat === "object" ? full.heartbeat : {};
  const enabled = hb.enabled === true;
  const cron = typeof hb.cron === "string" ? hb.cron : "0 9 * * *";
  const goal = typeof hb.goal === "string" ? hb.goal : "";
  await trpcMutate("agent.update", { id: agentId, heartbeat: { enabled, cron, goal } });
  const again = await trpcQuery<{ heartbeat?: HeartbeatBlob | null }>("agent.getById", { id: agentId });
  const hb1 = again.heartbeat && typeof again.heartbeat === "object" ? again.heartbeat : {};
  await trpcMutate("agent.update", {
    id: agentId,
    heartbeat: {
      enabled: hb1.enabled === true,
      cron: typeof hb1.cron === "string" ? hb1.cron : cron,
      goal: typeof hb1.goal === "string" ? hb1.goal : goal,
      decision: { lastMode: "quiet" },
    },
  });
  const check = await trpcQuery<{ heartbeat?: HeartbeatBlob | null }>("agent.getById", { id: agentId });
  if (check.heartbeat?.decision?.lastMode !== "quiet") {
    throw new Error(`[e2e] 写入 lastMode=quiet 失败，实际=${String(check.heartbeat?.decision?.lastMode)}`);
  }
}

async function openSuperHeartbeatChat(page: import("@playwright/test").Page): Promise<{ agentId: string }> {
  const list = await trpcQuery<{
    items: { id: string; name: string; tier: string; model?: string; tools?: string[] }[];
  }>("agent.list", { page: 1, pageSize: 50 });
  const superAgent = list.items.find((a) => a.tier === "super");
  if (!superAgent) throw new Error("[e2e] 找不到 super Agent");
  const full = await trpcQuery<{ id: string; tier: string; model: string; tools: string[] }>("agent.getById", {
    id: superAgent.id,
  });
  if (full.tier !== "super") {
    throw new Error(`[e2e] agent.getById(${full.id}) tier=${full.tier}，期望 super`);
  }
  const tools = Array.isArray(full.tools) ? full.tools : [];
  if (!tools.includes("native:swarm_brief")) {
    await trpcMutate("agent.update", {
      id: superAgent.id,
      tools: [...tools, "native:swarm_brief"],
    });
  }
  await seedQuietHeartbeat(superAgent.id);
  await trpcMutate("session.create", {
    title: `heartbeat-paused-${Date.now()}`,
    model: full.model,
    agentId: superAgent.id,
    status: "paused",
  });

  const sess = await trpcMutate<{
    success?: boolean;
    data?: { id: string };
    id?: string;
    error?: { message?: string };
  }>("session.create", {
    title: `heartbeat-query-${Date.now()}`,
    model: full.model,
    agentId: superAgent.id,
  });
  const sessionId = sess.data?.id ?? sess.id;
  if (!sessionId) throw new Error(sess.error?.message ?? "创建 super 会话失败");

  await page.goto(`/chat?sessionId=${sessionId}&agentId=${superAgent.id}`);
  await page.getByTestId("chat-input").waitFor({ state: "visible", timeout: 30_000 });
  await expect(page.getByText(/OasisMind 超级 Agent/).first()).toBeVisible({ timeout: 15_000 });
  await waitForSessionIdle(page);
  return { agentId: superAgent.id };
}

test.describe("Chat Mock — 查询心跳", () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeEach(async ({ request }) => {
    await expect.poll(async () => (await request.get(`${SERVER_URL}/health`)).ok()).toBe(true);
  });

  test("Chat 查询心跳读只读检查，不伪造刚跑完", async ({ page }) => {
    const { agentId } = await openSuperHeartbeatChat(page);

    const streamPost = page.waitForRequest(
      (req) => req.method() === "POST" && /\/api\/agent\/chat\/stream/.test(req.url()),
      { timeout: 15_000 },
    );
    await sendChatMessage(page, "看下心跳最近是不是 quiet / 被熔断了。");
    const posted = await streamPost;
    expect(posted.postDataJSON().agentId, "drain 必须用 super 会话的 agentId").toBe(agentId);

    const pill = page.locator('[data-testid="tool-pill"][data-tool="swarm_brief"]');
    await expect(pill).toBeVisible({ timeout: 40_000 });
    await expect(page.getByText("心跳 lastMode=quiet").first()).toBeVisible({ timeout: 40_000 });
    await expect(page.getByText("未熔断").first()).toBeVisible();
    await expect(page.getByText("刚跑完")).toHaveCount(0);
    await waitForSessionIdle(page);
  });
});
