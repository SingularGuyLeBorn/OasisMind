/**
 * 场景 6：Chat 页点通过/拒绝。未批准绝不静默成功；点了之后开着的会话自己续跑。
 *
 * drain 用 session.agentId（不是 URL 上的 agentId）。必须先建 super 会话再进页，
 * 禁止 openFreshChat 绑 assistant 后再只改 ?agentId=（树会显示超级 Agent，跑的仍是 manager）。
 */
import { test, expect } from "@playwright/test";
import { SERVER_URL, trpcQuery, trpcMutate } from "./helpers/trpcE2e";
import { sendChatMessage, waitForSessionIdle } from "./helpers/mockChatFixture";

async function openSuperChat(page: import("@playwright/test").Page): Promise<{ agentId: string }> {
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
  if (!tools.includes("native:memory_create")) {
    await trpcMutate("agent.update", {
      id: superAgent.id,
      tools: [...tools, "native:memory_create"],
    });
  }
  const sess = await trpcMutate<{
    success?: boolean;
    data?: { id: string };
    id?: string;
    error?: { message?: string };
  }>("session.create", {
    title: `approval-hitl-${Date.now()}`,
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

test.describe("Chat Mock — 审批 HITL", () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeEach(async ({ request }) => {
    await expect.poll(async () => (await request.get(`${SERVER_URL}/health`)).ok()).toBe(true);
  });

  test("Chat 点批准并执行后才写入，无需刷新", async ({ page }) => {
    const { agentId } = await openSuperChat(page);

    const streamPost = page.waitForRequest(
      (req) => req.method() === "POST" && /\/api\/agent\/chat\/stream/.test(req.url()),
      { timeout: 15_000 },
    );
    await sendChatMessage(page, "审批测试写全局记忆");
    const posted = await streamPost;
    expect(posted.postDataJSON().agentId, "drain 必须用 super 会话的 agentId").toBe(agentId);

    const pill = page.locator('[data-testid="tool-pill"][data-tool="memory_create"]');
    await expect(pill).toBeVisible({ timeout: 40_000 });
    await expect(pill).toHaveAttribute("data-status", "awaiting_human");
    await expect(page.getByText("仅超级 Agent 可写 global")).toHaveCount(0);
    await expect(page.getByTestId("chat-approval-approve")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("已按审批结果写入全局记忆")).toHaveCount(0);

    await page.getByTestId("chat-approval-approve").click();
    await expect(page.getByText("已按审批结果写入全局记忆").first()).toBeVisible({ timeout: 40_000 });
    await waitForSessionIdle(page);
  });

  test("Chat 点拒绝后不静默成功，无需刷新", async ({ page }) => {
    const { agentId } = await openSuperChat(page);

    const streamPost = page.waitForRequest(
      (req) => req.method() === "POST" && /\/api\/agent\/chat\/stream/.test(req.url()),
      { timeout: 15_000 },
    );
    await sendChatMessage(page, "审批测试写全局记忆");
    expect((await streamPost).postDataJSON().agentId).toBe(agentId);

    await expect(page.getByTestId("chat-approval-reject")).toBeVisible({ timeout: 40_000 });
    await expect(page.getByText("已按审批结果写入全局记忆")).toHaveCount(0);

    await page.getByTestId("chat-approval-reject").click();
    await expect(page.getByText("审批被拒绝，全局记忆未写入").first()).toBeVisible({ timeout: 40_000 });
    await expect(page.getByText("已按审批结果写入全局记忆")).toHaveCount(0);
    await waitForSessionIdle(page);
  });
});
